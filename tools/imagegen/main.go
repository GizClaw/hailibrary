package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"gopkg.in/yaml.v3"
)

const (
	defaultModel = "gpt-image-2.5-flare"
	defaultBase  = "https://api.openai.com"
	noTextRule   = "The image must contain no text, letters, numbers, logos, captions, speech bubbles, signatures, or watermarks."
)

type options struct {
	only        string
	force       bool
	dryRun      bool
	concurrency int
	model       string
	size        string
	quality     string
}

type bookFile struct {
	Style      string `yaml:"style"`
	Characters []struct {
		ID             string `yaml:"id"`
		VisualIdentity string `yaml:"visual_identity"`
	} `yaml:"characters"`
}

type artworkFile struct {
	Style       string  `yaml:"style"`
	AspectRatio string  `yaml:"aspect_ratio"`
	Assets      []asset `yaml:"assets"`
}

type asset struct {
	ID     string `yaml:"id"`
	File   string `yaml:"file"`
	Prompt string `yaml:"prompt"`
}

type styleFile struct {
	Prompt string `yaml:"prompt"`
}

type generationRequest struct {
	Model             string `json:"model"`
	Prompt            string `json:"prompt"`
	Size              string `json:"size"`
	OutputFormat      string `json:"output_format"`
	OutputCompression int    `json:"output_compression"`
	Quality           string `json:"quality,omitempty"`
}

type generationResponse struct {
	Data []struct {
		B64JSON string `json:"b64_json"`
	} `json:"data"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

type usageError struct{ message string }

func (e usageError) Error() string { return e.message }

func main() {
	os.Exit(run(context.Background(), os.Args[1:], os.Stdout, os.Stderr, http.DefaultClient))
}

func run(ctx context.Context, args []string, stdout, stderr io.Writer, client *http.Client) int {
	opts, workArg, err := parseArgs(args, stderr)
	if errors.Is(err, flag.ErrHelp) {
		return 0
	}
	if err != nil {
		fmt.Fprintln(stderr, "imagegen:", err)
		return 2
	}
	if err := execute(ctx, opts, workArg, stdout, client); err != nil {
		fmt.Fprintln(stderr, "imagegen:", err)
		var u usageError
		if errors.As(err, &u) {
			return 2
		}
		return 1
	}
	return 0
}

func parseArgs(args []string, stderr io.Writer) (options, string, error) {
	var o options
	fs := flag.NewFlagSet("imagegen", flag.ContinueOnError)
	fs.SetOutput(stderr)
	fs.StringVar(&o.only, "only", "", "comma-separated asset IDs to generate")
	fs.BoolVar(&o.force, "force", false, "overwrite existing image files")
	fs.BoolVar(&o.dryRun, "dry-run", false, "print final prompts without calling the API or writing files")
	fs.IntVar(&o.concurrency, "concurrency", 2, "maximum concurrent API requests")
	fs.StringVar(&o.model, "model", "", "override OPENAI_IMAGE_MODEL")
	fs.StringVar(&o.size, "size", "", "override image size (for example 1536x1024)")
	fs.StringVar(&o.quality, "quality", "", "optional OpenAI image quality")
	fs.Usage = func() { printUsage(fs.Output()) }
	if err := fs.Parse(args); err != nil {
		return o, "", err
	}
	if fs.NArg() != 1 {
		fs.Usage()
		return o, "", fmt.Errorf("expected exactly one <work-dir>")
	}
	if o.concurrency < 1 {
		return o, "", fmt.Errorf("--concurrency must be at least 1")
	}
	return o, fs.Arg(0), nil
}

func printUsage(w io.Writer) {
	fmt.Fprintln(w, `Usage: imagegen [flags] <work-dir>

Generate committed artwork.yaml assets with the work's committed prompts.

Flags:
  --only <id,...>     generate only the listed asset IDs
  --force             overwrite existing files (default: skip them)
  --dry-run           print final prompts; do not call the API or write files
  --concurrency N     maximum concurrent requests (default 2)
  --model MODEL       override OPENAI_IMAGE_MODEL (default gpt-image-2.5-flare)
  --size SIZE         override the size derived from aspect_ratio
  --quality QUALITY   optional image quality sent to the API
  -h, --help          show this help without changing repository state

Environment:
  OPENAI_API_KEY      required except with --dry-run
  OPENAI_IMAGE_MODEL  image model (default gpt-image-2.5-flare)
  OPENAI_BASE_URL     API base URL (default https://api.openai.com)

Exit status: 0 success, 1 generation or validation failure, 2 usage error.`)
}

func execute(ctx context.Context, o options, workArg string, stdout io.Writer, client *http.Client) error {
	repoRoot, workDir, err := resolvePaths(workArg)
	if err != nil {
		return err
	}
	fileEnv, err := readDotEnv(filepath.Join(repoRoot, ".env"))
	if err != nil {
		return err
	}
	getenv := func(key string) string {
		if value, ok := os.LookupEnv(key); ok {
			return value
		}
		return fileEnv[key]
	}
	if o.model == "" {
		o.model = getenv("OPENAI_IMAGE_MODEL")
	}
	if o.model == "" {
		o.model = defaultModel
	}
	baseURL := strings.TrimRight(getenv("OPENAI_BASE_URL"), "/")
	if baseURL == "" {
		baseURL = defaultBase
	}
	apiKey := getenv("OPENAI_API_KEY")
	if !o.dryRun && apiKey == "" {
		return fmt.Errorf("OPENAI_API_KEY is required (set it in the environment or repository .env)")
	}

	var book bookFile
	if err := readYAML(filepath.Join(workDir, "book.yaml"), &book); err != nil {
		return err
	}
	var artwork artworkFile
	if err := readYAML(filepath.Join(workDir, "artwork.yaml"), &artwork); err != nil {
		return err
	}
	if book.Style == "" || artwork.Style == "" || book.Style != artwork.Style {
		return fmt.Errorf("book.yaml and artwork.yaml must declare the same non-empty style")
	}
	var style styleFile
	if err := readYAML(filepath.Join(repoRoot, "prompts", "styles", book.Style, "prompt.yaml"), &style); err != nil {
		return err
	}
	if strings.TrimSpace(style.Prompt) == "" {
		return fmt.Errorf("style %q has an empty prompt", book.Style)
	}
	if o.size == "" {
		o.size, err = sizeForRatio(artwork.AspectRatio)
		if err != nil {
			return err
		}
	}

	selected, err := selectAssets(artwork.Assets, o.only)
	if err != nil {
		return err
	}
	type job struct {
		asset
		path   string
		prompt string
	}
	jobs := make([]job, 0, len(selected))
	for _, a := range selected {
		outPath, err := safeAssetPath(workDir, a)
		if err != nil {
			return err
		}
		prompt := joinPrompt(a.Prompt, style.Prompt)
		if o.dryRun {
			fmt.Fprintf(stdout, "[%s]\n%s\n", a.ID, prompt)
			continue
		}
		if !o.force {
			if _, err := os.Stat(outPath); err == nil {
				fmt.Fprintf(stdout, "skip %s: %s already exists\n", a.ID, a.File)
				continue
			} else if !errors.Is(err, os.ErrNotExist) {
				return fmt.Errorf("inspect %s: %w", a.File, err)
			}
		}
		jobs = append(jobs, job{asset: a, path: outPath, prompt: prompt})
	}
	if o.dryRun || len(jobs) == 0 {
		return nil
	}

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	jobCh := make(chan job)
	errCh := make(chan error, 1)
	var wg sync.WaitGroup
	var outputMu sync.Mutex
	workers := min(o.concurrency, len(jobs))
	for range workers {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := range jobCh {
				if err := generate(ctx, client, baseURL, apiKey, o, j.prompt, j.path); err != nil {
					select {
					case errCh <- fmt.Errorf("generate %s: %w", j.ID, err):
						cancel()
					default:
					}
					return
				}
				outputMu.Lock()
				fmt.Fprintf(stdout, "generated %s: %s\n", j.ID, j.asset.File)
				outputMu.Unlock()
			}
		}()
	}
	for _, j := range jobs {
		select {
		case jobCh <- j:
		case <-ctx.Done():
			break
		}
	}
	close(jobCh)
	wg.Wait()
	select {
	case err := <-errCh:
		return err
	default:
		return nil
	}
}

func generate(ctx context.Context, client *http.Client, baseURL, apiKey string, o options, prompt, outputPath string) error {
	payload, err := json.Marshal(generationRequest{Model: o.model, Prompt: prompt, Size: o.size, OutputFormat: "webp", OutputCompression: 85, Quality: o.quality})
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/v1/images/generations", strings.NewReader(string(payload)))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 64<<20))
	if err != nil {
		return err
	}
	var decoded generationResponse
	if err := json.Unmarshal(body, &decoded); err != nil {
		return fmt.Errorf("decode API response (HTTP %d): %w", resp.StatusCode, err)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		message := strings.TrimSpace(string(body))
		if decoded.Error != nil && decoded.Error.Message != "" {
			message = decoded.Error.Message
		}
		return fmt.Errorf("API returned HTTP %d: %s", resp.StatusCode, message)
	}
	if len(decoded.Data) == 0 || decoded.Data[0].B64JSON == "" {
		return fmt.Errorf("API response contains no b64_json image")
	}
	image, err := base64.StdEncoding.DecodeString(decoded.Data[0].B64JSON)
	if err != nil {
		return fmt.Errorf("decode image: %w", err)
	}
	if len(image) < 12 || string(image[:4]) != "RIFF" || string(image[8:12]) != "WEBP" {
		return fmt.Errorf("API response is not a WebP image")
	}
	if err := os.MkdirAll(filepath.Dir(outputPath), 0o755); err != nil {
		return err
	}
	tmp, err := os.CreateTemp(filepath.Dir(outputPath), ".imagegen-*.webp")
	if err != nil {
		return err
	}
	tmpName := tmp.Name()
	ok := false
	defer func() {
		if !ok {
			_ = os.Remove(tmpName)
		}
	}()
	if _, err = tmp.Write(image); err == nil {
		err = tmp.Sync()
	}
	if closeErr := tmp.Close(); err == nil {
		err = closeErr
	}
	if err != nil {
		return err
	}
	if err := os.Rename(tmpName, outputPath); err != nil {
		return err
	}
	ok = true
	return nil
}

func resolvePaths(workArg string) (string, string, error) {
	workDir, err := filepath.Abs(workArg)
	if err != nil {
		return "", "", err
	}
	workDir = filepath.Clean(workDir)
	root := workDir
	for {
		if filepath.Base(root) == "works" {
			repoRoot := filepath.Dir(root)
			rel, err := filepath.Rel(root, workDir)
			if err != nil {
				return "", "", err
			}
			parts := strings.Split(filepath.ToSlash(rel), "/")
			if len(parts) != 4 || !validPictureLevel(parts[0]) {
				return "", "", usageError{"work-dir must be works/<level>/<category>/<subcategory>/<slug> with level aa or a-n"}
			}
			if _, err := os.Stat(filepath.Join(repoRoot, "prompts", "styles")); err != nil {
				return "", "", fmt.Errorf("locate repository root: %w", err)
			}
			return repoRoot, workDir, nil
		}
		parent := filepath.Dir(root)
		if parent == root {
			break
		}
		root = parent
	}
	return "", "", usageError{"work-dir must be inside the repository works directory"}
}

func validPictureLevel(level string) bool {
	return level == "aa" || (len(level) == 1 && level[0] >= 'a' && level[0] <= 'n')
}

func readYAML(path string, out any) error {
	b, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read %s: %w", path, err)
	}
	if err := yaml.Unmarshal(b, out); err != nil {
		return fmt.Errorf("parse %s: %w", path, err)
	}
	return nil
}

func readDotEnv(path string) (map[string]string, error) {
	values := map[string]string{}
	b, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return values, nil
	}
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", path, err)
	}
	for number, raw := range strings.Split(string(b), "\n") {
		line := strings.TrimSpace(raw)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		key = strings.TrimSpace(key)
		if !ok || key == "" {
			return nil, fmt.Errorf("parse %s line %d: expected KEY=VALUE", path, number+1)
		}
		value = strings.TrimSpace(value)
		if len(value) >= 2 && ((value[0] == '\'' && value[len(value)-1] == '\'') || (value[0] == '"' && value[len(value)-1] == '"')) {
			value = value[1 : len(value)-1]
		}
		values[key] = value
	}
	return values, nil
}

func sizeForRatio(ratio string) (string, error) {
	switch strings.TrimSpace(ratio) {
	case "3:2":
		return "1536x1024", nil
	case "2:3":
		return "1024x1536", nil
	case "1:1":
		return "1024x1024", nil
	default:
		return "", fmt.Errorf("unsupported artwork aspect_ratio %q; use --size to override", ratio)
	}
}

func selectAssets(assets []asset, only string) ([]asset, error) {
	seen := map[string]bool{}
	byID := map[string]asset{}
	for _, a := range assets {
		if a.ID == "" || a.File == "" || strings.TrimSpace(a.Prompt) == "" {
			return nil, fmt.Errorf("every artwork asset must have non-empty id, file, and prompt")
		}
		if seen[a.ID] {
			return nil, fmt.Errorf("duplicate artwork asset id %q", a.ID)
		}
		seen[a.ID], byID[a.ID] = true, a
	}
	if only == "" {
		return assets, nil
	}
	wanted := map[string]bool{}
	for _, id := range strings.Split(only, ",") {
		id = strings.TrimSpace(id)
		if id == "" {
			return nil, usageError{"--only contains an empty asset ID"}
		}
		wanted[id] = true
	}
	unknown := []string{}
	for id := range wanted {
		if _, ok := byID[id]; !ok {
			unknown = append(unknown, id)
		}
	}
	if len(unknown) > 0 {
		sort.Strings(unknown)
		return nil, usageError{fmt.Sprintf("--only names unknown asset IDs: %s", strings.Join(unknown, ", "))}
	}
	selected := []asset{}
	for _, a := range assets {
		if wanted[a.ID] {
			selected = append(selected, a)
		}
	}
	return selected, nil
}

func safeAssetPath(workDir string, a asset) (string, error) {
	if strings.ToLower(filepath.Ext(a.File)) != ".webp" {
		return "", fmt.Errorf("asset %q file must end in .webp", a.ID)
	}
	p := filepath.Clean(filepath.Join(workDir, filepath.FromSlash(a.File)))
	rel, err := filepath.Rel(workDir, p)
	if err != nil || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) || filepath.IsAbs(a.File) {
		return "", fmt.Errorf("asset %q file escapes work-dir", a.ID)
	}
	return p, nil
}

func joinPrompt(assetPrompt, stylePrompt string) string {
	return strings.TrimSpace(assetPrompt) + "\n\n" + strings.TrimSpace(stylePrompt) + "\n\n" + noTextRule
}
