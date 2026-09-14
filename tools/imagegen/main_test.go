package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
)

var testWebP = []byte("RIFF\x04\x00\x00\x00WEBPtest")

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func testClient(handler http.Handler) *http.Client {
	return &http.Client{Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, req)
		return recorder.Result(), nil
	})}
}

type fixture struct {
	root string
	work string
}

func newFixture(t *testing.T) fixture {
	t.Helper()
	root := t.TempDir()
	work := filepath.Join(root, "works", "a", "fiction", "adventure", "test-book")
	mustWrite(t, filepath.Join(root, "prompts", "styles", "test-style", "prompt.yaml"), "prompt: |-\n  STYLE PROMPT\n")
	mustWrite(t, filepath.Join(work, "book.yaml"), "style: test-style\ncharacters:\n  - id: fox\n    visual_identity: red fox in a blue scarf\n")
	mustWrite(t, filepath.Join(work, "artwork.yaml"), `style: test-style
aspect_ratio: "3:2"
assets:
  - id: cover
    file: artwork/cover.webp
    prompt: COVER PROMPT
  - id: p01
    file: artwork/p01.webp
    prompt: PAGE PROMPT
`)
	return fixture{root: root, work: work}
}

func newVocabularyFixture(t *testing.T) fixture {
	t.Helper()
	root := t.TempDir()
	work := filepath.Join(root, "vocabulary", "a", "jump")
	mustWrite(t, filepath.Join(root, "prompts", "levels", "a.yaml"), "id: a\n")
	mustWrite(t, filepath.Join(work, "entry.yaml"), "card: card.webp\ncard_prompt: A child jumping over a small puddle.\n")
	return fixture{root: root, work: work}
}

func mustWrite(t *testing.T, path, content string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func cleanEnv(t *testing.T) {
	t.Helper()
	for _, key := range []string{"OPENAI_API_KEY", "OPENAI_IMAGE_MODEL", "OPENAI_BASE_URL"} {
		t.Setenv(key, "")
	}
}

func TestGenerationRequestAndWebP(t *testing.T) {
	f := newFixture(t)
	var mu sync.Mutex
	requests := map[string]generationRequest{}
	client := testClient(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.String() != defaultBaseURL+"/v1/images/generations" {
			t.Errorf("URL = %s", r.URL)
		}
		if r.URL.Path != "/v1/images/generations" {
			t.Errorf("path = %s", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer secret" {
			t.Errorf("authorization = %q", got)
		}
		var body generationRequest
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Error(err)
		}
		mu.Lock()
		requests[body.Prompt] = body
		mu.Unlock()
		fmt.Fprintf(w, `{"data":[{"b64_json":%q}]}`, base64.StdEncoding.EncodeToString(testWebP))
	}))
	t.Setenv("OPENAI_API_KEY", "secret")
	var out, errOut bytes.Buffer
	if code := run(context.Background(), []string{"--model", "model-x", "--quality", "high", f.work}, &out, &errOut, client); code != 0 {
		t.Fatalf("code %d, stderr %s", code, errOut.String())
	}
	if len(requests) != 2 {
		t.Fatalf("requests = %d", len(requests))
	}
	for prompt, request := range requests {
		if request.Model != "model-x" || request.Size != "1536x1024" || request.OutputFormat != "webp" || request.OutputCompression != 85 || request.Quality != "high" {
			t.Errorf("request = %+v", request)
		}
		if !strings.Contains(prompt, "STYLE PROMPT") || !strings.HasSuffix(prompt, noTextRule) {
			t.Errorf("prompt = %q", prompt)
		}
	}
	got, err := os.ReadFile(filepath.Join(f.work, "artwork", "cover.webp"))
	if err != nil || !bytes.Equal(got, testWebP) {
		t.Fatalf("webp = %q, err = %v", got, err)
	}
}

func TestOnlyAndSizeOverride(t *testing.T) {
	f := newFixture(t)
	count := 0
	client := testClient(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		count++
		var body generationRequest
		_ = json.NewDecoder(r.Body).Decode(&body)
		if body.Size != "1024x1024" || !strings.Contains(body.Prompt, "PAGE PROMPT") {
			t.Errorf("body = %+v", body)
		}
		fmt.Fprintf(w, `{"data":[{"b64_json":%q}]}`, base64.StdEncoding.EncodeToString(testWebP))
	}))
	t.Setenv("OPENAI_API_KEY", "secret")
	if code := run(context.Background(), []string{"--only", "p01", "--size", "1024x1024", f.work}, &bytes.Buffer{}, &bytes.Buffer{}, client); code != 0 {
		t.Fatalf("code = %d", code)
	}
	if count != 1 {
		t.Fatalf("requests = %d", count)
	}
	if _, err := os.Stat(filepath.Join(f.work, "artwork", "cover.webp")); !os.IsNotExist(err) {
		t.Fatalf("cover unexpectedly exists: %v", err)
	}
}

func TestVocabularyGeneration(t *testing.T) {
	f := newVocabularyFixture(t)
	var request generationRequest
	client := testClient(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			t.Error(err)
		}
		fmt.Fprintf(w, `{"data":[{"b64_json":%q}]}`, base64.StdEncoding.EncodeToString(testWebP))
	}))
	t.Setenv("OPENAI_API_KEY", "secret")
	var out, errOut bytes.Buffer
	if code := run(context.Background(), []string{"--only", "card", f.work}, &out, &errOut, client); code != 0 {
		t.Fatalf("code %d, stderr %s", code, errOut.String())
	}
	if request.Size != "1024x1024" || !strings.Contains(request.Prompt, "child jumping") || !strings.Contains(request.Prompt, vocabularyTreatment) || !strings.HasSuffix(request.Prompt, noTextRule) {
		t.Fatalf("request = %+v", request)
	}
	got, err := os.ReadFile(filepath.Join(f.work, "card.webp"))
	if err != nil || !bytes.Equal(got, testWebP) {
		t.Fatalf("webp = %q, err = %v", got, err)
	}
}

func TestVocabularyDryRunAndValidation(t *testing.T) {
	f := newVocabularyFixture(t)
	cleanEnv(t)
	_ = os.Unsetenv("OPENAI_API_KEY")
	var stdout, stderr bytes.Buffer
	if code := run(context.Background(), []string{"--dry-run", "--only", "card", f.work}, &stdout, &stderr, http.DefaultClient); code != 0 {
		t.Fatalf("code=%d stderr=%q", code, stderr.String())
	}
	if !strings.Contains(stdout.String(), "[card]") || !strings.Contains(stdout.String(), vocabularyTreatment) || !strings.Contains(stdout.String(), noTextRule) {
		t.Fatalf("stdout=%q", stdout.String())
	}
	mustWrite(t, filepath.Join(f.work, "entry.yaml"), "card: card.webp\ncard_prompt: '   '\n")
	stderr.Reset()
	if code := run(context.Background(), []string{"--dry-run", f.work}, &bytes.Buffer{}, &stderr, http.DefaultClient); code != 1 || !strings.Contains(stderr.String(), "card_prompt must be a non-empty string") {
		t.Fatalf("code=%d stderr=%q", code, stderr.String())
	}
}

func TestVocabularyOnlyRejectsUnknownAsset(t *testing.T) {
	f := newVocabularyFixture(t)
	var stderr bytes.Buffer
	if code := run(context.Background(), []string{"--dry-run", "--only", "cover", f.work}, &bytes.Buffer{}, &stderr, http.DefaultClient); code != 2 || !strings.Contains(stderr.String(), "unknown asset IDs") {
		t.Fatalf("code=%d stderr=%q", code, stderr.String())
	}
}

func TestSkipExistingAndForce(t *testing.T) {
	f := newFixture(t)
	existing := filepath.Join(f.work, "artwork", "cover.webp")
	mustWrite(t, existing, "old")
	count := 0
	client := testClient(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		count++
		fmt.Fprintf(w, `{"data":[{"b64_json":%q}]}`, base64.StdEncoding.EncodeToString(testWebP))
	}))
	t.Setenv("OPENAI_API_KEY", "secret")
	if code := run(context.Background(), []string{"--only", "cover", f.work}, &bytes.Buffer{}, &bytes.Buffer{}, client); code != 0 {
		t.Fatal(code)
	}
	if count != 0 {
		t.Fatalf("skip made %d requests", count)
	}
	got, _ := os.ReadFile(existing)
	if string(got) != "old" {
		t.Fatalf("skip overwrote file")
	}
	if code := run(context.Background(), []string{"--force", "--only", "cover", f.work}, &bytes.Buffer{}, &bytes.Buffer{}, client); code != 0 {
		t.Fatal(code)
	}
	if count != 1 {
		t.Fatalf("force made %d requests", count)
	}
	got, _ = os.ReadFile(existing)
	if !bytes.Equal(got, testWebP) {
		t.Fatalf("force did not overwrite")
	}
}

func TestDotEnvAndEnvironmentPrecedence(t *testing.T) {
	f := newFixture(t)
	mustWrite(t, filepath.Join(f.root, ".env"), "# local config\nOPENAI_API_KEY=file-key\nOPENAI_IMAGE_MODEL='file-model'\n")
	cleanEnv(t)
	seenAuth, seenModel := "", ""
	client := testClient(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		seenAuth = r.Header.Get("Authorization")
		var body generationRequest
		_ = json.NewDecoder(r.Body).Decode(&body)
		seenModel = body.Model
		fmt.Fprintf(w, `{"data":[{"b64_json":%q}]}`, base64.StdEncoding.EncodeToString(testWebP))
	}))
	// An explicitly empty environment variable has precedence, so restore the two
	// variables to an absent state for the .env portion of this test.
	_ = os.Unsetenv("OPENAI_API_KEY")
	_ = os.Unsetenv("OPENAI_IMAGE_MODEL")
	if code := run(context.Background(), []string{"--only", "cover", f.work}, &bytes.Buffer{}, &bytes.Buffer{}, client); code != 0 {
		t.Fatal(code)
	}
	if seenAuth != "Bearer file-key" || seenModel != "file-model" {
		t.Fatalf("env file values: auth=%q model=%q", seenAuth, seenModel)
	}
	if err := os.Remove(filepath.Join(f.work, "artwork", "cover.webp")); err != nil {
		t.Fatal(err)
	}
	t.Setenv("OPENAI_API_KEY", "process-key")
	t.Setenv("OPENAI_IMAGE_MODEL", "process-model")
	if code := run(context.Background(), []string{"--only", "cover", f.work}, &bytes.Buffer{}, &bytes.Buffer{}, client); code != 0 {
		t.Fatal(code)
	}
	if seenAuth != "Bearer process-key" || seenModel != "process-model" {
		t.Fatalf("process values: auth=%q model=%q", seenAuth, seenModel)
	}
}

func TestBaseURLFromDotEnvAndEnvironmentPrecedence(t *testing.T) {
	f := newFixture(t)
	var requestURLs []string
	client := testClient(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestURLs = append(requestURLs, r.URL.String())
		fmt.Fprintf(w, `{"data":[{"b64_json":%q}]}`, base64.StdEncoding.EncodeToString(testWebP))
	}))
	mustWrite(t, filepath.Join(f.root, ".env"), "OPENAI_API_KEY=file-key\nOPENAI_BASE_URL=https://dotenv-gateway.test/proxy/\n")
	cleanEnv(t)
	_ = os.Unsetenv("OPENAI_API_KEY")
	_ = os.Unsetenv("OPENAI_BASE_URL")
	if code := run(context.Background(), []string{"--only", "cover", f.work}, &bytes.Buffer{}, &bytes.Buffer{}, client); code != 0 {
		t.Fatalf(".env base URL code = %d", code)
	}
	if got := requestURLs[len(requestURLs)-1]; got != "https://dotenv-gateway.test/proxy/v1/images/generations" {
		t.Fatalf(".env request URL = %q", got)
	}
	if err := os.Remove(filepath.Join(f.work, "artwork", "cover.webp")); err != nil {
		t.Fatal(err)
	}
	t.Setenv("OPENAI_API_KEY", "process-key")
	t.Setenv("OPENAI_BASE_URL", "https://environment-gateway.test/api")
	if code := run(context.Background(), []string{"--only", "cover", f.work}, &bytes.Buffer{}, &bytes.Buffer{}, client); code != 0 {
		t.Fatalf("environment base URL code = %d", code)
	}
	if got := requestURLs[len(requestURLs)-1]; got != "https://environment-gateway.test/api/v1/images/generations" {
		t.Fatalf("environment request URL = %q", got)
	}
}

func TestRejectsSymlinkArtworkDirectory(t *testing.T) {
	f := newFixture(t)
	external := t.TempDir()
	if err := os.Symlink(external, filepath.Join(f.work, "artwork")); err != nil {
		t.Fatal(err)
	}
	t.Setenv("OPENAI_API_KEY", "secret")
	var stderr bytes.Buffer
	if code := run(context.Background(), []string{"--only", "cover", f.work}, &bytes.Buffer{}, &stderr, testClient(http.NotFoundHandler())); code != 1 {
		t.Fatalf("code=%d stderr=%q", code, stderr.String())
	}
	if !strings.Contains(stderr.String(), "symbolic link") {
		t.Fatalf("stderr=%q", stderr.String())
	}
	if _, err := os.Stat(filepath.Join(external, "cover.webp")); !os.IsNotExist(err) {
		t.Fatalf("external output unexpectedly exists: %v", err)
	}
}

func TestRejectsSymlinkIntermediateDirectory(t *testing.T) {
	f := newFixture(t)
	external := t.TempDir()
	if err := os.Mkdir(filepath.Join(f.work, "artwork"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Symlink(external, filepath.Join(f.work, "artwork", "nested")); err != nil {
		t.Fatal(err)
	}
	mustWrite(t, filepath.Join(f.work, "artwork.yaml"), `style: test-style
aspect_ratio: "3:2"
assets:
  - id: cover
    file: artwork/nested/cover.webp
    prompt: COVER PROMPT
`)
	t.Setenv("OPENAI_API_KEY", "secret")
	var stderr bytes.Buffer
	if code := run(context.Background(), []string{"--only", "cover", f.work}, &bytes.Buffer{}, &stderr, testClient(http.NotFoundHandler())); code != 1 {
		t.Fatalf("code=%d stderr=%q", code, stderr.String())
	}
	if !strings.Contains(stderr.String(), "symbolic link") {
		t.Fatalf("stderr=%q", stderr.String())
	}
	if _, err := os.Stat(filepath.Join(external, "cover.webp")); !os.IsNotExist(err) {
		t.Fatalf("external output unexpectedly exists: %v", err)
	}
}

func TestMissingKeyAndDryRun(t *testing.T) {
	f := newFixture(t)
	cleanEnv(t)
	_ = os.Unsetenv("OPENAI_API_KEY")
	var stderr bytes.Buffer
	if code := run(context.Background(), []string{f.work}, &bytes.Buffer{}, &stderr, http.DefaultClient); code != 1 || !strings.Contains(stderr.String(), "OPENAI_API_KEY is required") {
		t.Fatalf("code=%d stderr=%q", code, stderr.String())
	}
	var stdout bytes.Buffer
	if code := run(context.Background(), []string{"--dry-run", "--only", "cover", f.work}, &stdout, &bytes.Buffer{}, http.DefaultClient); code != 0 {
		t.Fatalf("dry-run code=%d", code)
	}
	if !strings.Contains(stdout.String(), "COVER PROMPT") || !strings.Contains(stdout.String(), "STYLE PROMPT") || !strings.Contains(stdout.String(), noTextRule) {
		t.Fatalf("dry-run output=%q", stdout.String())
	}
	if _, err := os.Stat(filepath.Join(f.work, "artwork", "cover.webp")); !os.IsNotExist(err) {
		t.Fatalf("dry-run wrote output: %v", err)
	}
}

func TestUsageErrors(t *testing.T) {
	if code := run(context.Background(), []string{"--concurrency", "0", "work"}, &bytes.Buffer{}, &bytes.Buffer{}, http.DefaultClient); code != 2 {
		t.Fatalf("code=%d", code)
	}
	var help bytes.Buffer
	if code := run(context.Background(), []string{"--help"}, &bytes.Buffer{}, &help, http.DefaultClient); code != 0 {
		t.Fatalf("help code=%d", code)
	}
	if !strings.Contains(help.String(), "OPENAI_BASE_URL") || !strings.Contains(help.String(), defaultBaseURL) {
		t.Fatalf("help does not document OPENAI_BASE_URL and its default: %q", help.String())
	}
}
