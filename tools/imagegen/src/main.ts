import { constants as fsConstants } from "node:fs";
import { access, lstat, mkdir, mkdtemp, open, readFile, readdir, realpath, rename, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import YAML from "yaml";

const DEFAULT_MODEL = "gpt-image-2.5-flare";
const DEFAULT_BASE = "https://api.openai.com";
const STATE_SCHEMA_VERSION = 1;
const NO_TEXT_RULE = "The image must contain no text, letters, numbers, logos, captions, speech bubbles, signatures, or watermarks.";
const VOCABULARY_TREATMENT = "Create a simple, original, neutral educational illustration centered on one clearly recognizable concept. Use a clean uncluttered square composition, accessible shapes, balanced natural color, and no culture-specific decoration unless essential to the concept.";

type Options = { only: string; force: boolean; dryRun: boolean; concurrency: number; model: string; size: string; quality: string };
type Asset = { id: string; file: string; prompt: string };
type ImageState = { id: string; file: string; status: string; generated_at?: string; error?: string };
type StateFile = { schema_version: number; style: string | null; model?: string; images?: ImageState[] };
type Target = { dir: string; kind: string; style: string; hasStyle: boolean; size: string; assets: Asset[]; state: StateFile; styleChanged: boolean; stateQueue: Promise<void> };
type Job = { target: Target; asset: Asset; path: string; prompt: string; size: string };
type Streams = { stdout: Pick<NodeJS.WriteStream, "write">; stderr: Pick<NodeJS.WriteStream, "write"> };
export type RunConfig = { cwd?: string; env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch; streams?: Streams };

class UsageError extends Error {}
const posix = (value: string) => value.split(sep).join("/");
const message = (error: unknown) => error instanceof Error ? error.message : String(error);
const existsDir = async (path: string) => { try { return (await stat(path)).isDirectory() } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error } };
const writeLine = (stream: Pick<NodeJS.WriteStream, "write">, text: string) => { stream.write(`${text}\n`) };

export const helpText = `Usage: hailibrary-imagegen [flags] [target-dir ...]

Generate repository artwork from committed prompts. With no target directories,
scan the repository rooted at the current directory and process every target.

Targets:
  works/<level>/<category>/<subcategory>/<slug>  picture-book artwork, 3:2 -> 1536x1024
  works/articles/<id>                            article cover, 1536x1024
  works/series/<series-id>/<article-id>          series article cover, 1536x1024
  vocabulary/<level>/<id>                       vocabulary card, 1024x1024
  prompts/writers/<locale>/<id>                 Writer avatar, 1024x1024
  prompts/styles/<id>                           Style thumbnail, 1536x1024

Each target keeps imagegen-state.yaml. Images not marked done resume automatically;
a changed Style ID regenerates the complete target. Prompt text changes do not.

Flags:
  --only <id,...>     process only listed asset IDs
  --force             regenerate selected images even when state says done
  --dry-run           list planned images and total; make no API calls or writes
  --concurrency N     maximum concurrent requests (default 2)
  --model MODEL       override OPENAI_IMAGE_MODEL (default gpt-image-2.5-flare)
  --size SIZE         override target-derived image size
  --quality QUALITY   optional image quality sent to the API
  -h, --help          show this help without changing repository state

Environment:
  OPENAI_API_KEY      required when generation is needed
  OPENAI_IMAGE_MODEL  image model (default gpt-image-2.5-flare)
  OPENAI_BASE_URL     API base URL (default https://api.openai.com)

Exit status: 0 success, 1 generation or validation failure, 2 usage error.`;

function parseArgs(args: string[]): { options: Options; paths: string[]; help: boolean } {
  const options: Options = { only: "", force: false, dryRun: false, concurrency: 2, model: "", size: "", quality: "" };
  const paths: string[] = [];
  const values: Record<string, keyof Options> = { "--only": "only", "--concurrency": "concurrency", "--model": "model", "--size": "size", "--quality": "quality" };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "-h" || arg === "--help") return { options, paths, help: true };
    if (arg === "--force") options.force = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg in values) {
      const value = args[++index];
      if (value === undefined) throw new UsageError(`${arg} requires a value`);
      const key = values[arg];
      if (key === "concurrency") options.concurrency = Number(value);
      else options[key] = value as never;
    } else if (arg.startsWith("-")) throw new UsageError(`unknown flag: ${arg}`);
    else paths.push(arg);
  }
  if (!Number.isInteger(options.concurrency) || options.concurrency < 1) throw new UsageError("--concurrency must be at least 1");
  return { options, paths, help: false };
}

async function findRepoRoot(start: string): Promise<string> {
  let path = resolve(start);
  try { if (!(await stat(path)).isDirectory()) path = dirname(path) } catch {}
  while (true) {
    if (await existsDir(join(path, "prompts")) && (await existsDir(join(path, "works")) || await existsDir(join(path, "vocabulary")))) return path;
    const parent = dirname(path);
    if (parent === path) throw new UsageError("could not locate repository root (requires prompts and works or vocabulary)");
    path = parent;
  }
}

const validLevel = (value: string) => value === "aa" || /^[a-n]$/.test(value);
function targetKind(root: string, dir: string): string {
  const parts = posix(relative(root, dir)).split("/");
  if (parts.length === 5 && parts[0] === "works" && validLevel(parts[1])) return "book";
  if (parts.length === 3 && parts[0] === "works" && parts[1] === "articles") return "article";
  if (parts.length === 4 && parts[0] === "works" && parts[1] === "series") return "article";
  if (parts.length === 3 && parts[0] === "vocabulary" && validLevel(parts[1])) return "vocabulary";
  if (parts.length === 4 && parts[0] === "prompts" && parts[1] === "writers") return "writer";
  if (parts.length === 3 && parts[0] === "prompts" && parts[1] === "styles") return "style";
  throw new UsageError(`unsupported target directory: ${posix(relative(root, dir))}`);
}

async function walkMatches(base: string, file: string, depth: number): Promise<string[]> {
  let entries; try { entries = await readdir(base, { withFileTypes: true }) } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error }
  const found = entries.some((entry) => entry.isFile() && entry.name === file) ? [base] : [];
  if (depth === 0) return found;
  const nested = await Promise.all(entries.filter((entry) => entry.isDirectory()).map((entry) => walkMatches(join(base, entry.name), file, depth - 1)));
  return found.concat(nested.flat());
}
async function scanTargets(root: string): Promise<string[]> {
  const candidates = (await Promise.all([
    walkMatches(join(root, "works", "articles"), "article.yaml", 1),
    walkMatches(join(root, "works", "series"), "article.yaml", 2),
    walkMatches(join(root, "works"), "artwork.yaml", 4),
    walkMatches(join(root, "vocabulary"), "entry.yaml", 2),
    walkMatches(join(root, "prompts", "writers"), "prompt.yaml", 2),
    walkMatches(join(root, "prompts", "styles"), "prompt.yaml", 1),
  ])).flat();
  return [...new Set(candidates.filter((dir) => { try { targetKind(root, dir); return true } catch { return false } }))].sort();
}
async function resolveTargets(args: string[], cwd: string): Promise<{ root: string; dirs: string[] }> {
  if (args.length === 0) { const root = await findRepoRoot(cwd); return { root, dirs: await scanTargets(root) } }
  let root = "";
  const dirs: string[] = [];
  for (const arg of args) {
    const dir = resolve(cwd, arg);
    const candidate = await findRepoRoot(dir);
    if (root && candidate !== root) throw new UsageError("all targets must belong to the same repository");
    root = candidate; targetKind(root, dir); dirs.push(dir);
  }
  return { root, dirs: dirs.sort() };
}

async function readYaml<T>(path: string): Promise<T> {
  try { return YAML.parse(await readFile(path, "utf8")) as T } catch (error) { throw new Error(`${(error as NodeJS.ErrnoException).code === "ENOENT" ? "read" : "parse"} ${path}: ${message(error)}`) }
}
async function readDotEnv(path: string): Promise<Record<string, string>> {
  let contents: string; try { contents = await readFile(path, "utf8") } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return {}; throw error }
  const result: Record<string, string> = {};
  for (const [index, raw] of contents.split("\n").entries()) {
    const line = raw.trim(); if (!line || line.startsWith("#")) continue;
    const split = line.indexOf("="); if (split < 1) throw new Error(`parse ${path} line ${index + 1}: expected KEY=VALUE`);
    const key = line.slice(0, split).trim(); let value = line.slice(split + 1).trim();
    if (value.length >= 2 && ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"')))) value = value.slice(1, -1);
    result[key] = value;
  }
  return result;
}
const joinPrompt = (prompt: string, style = "") => [prompt.trim(), style.trim(), NO_TEXT_RULE].filter(Boolean).join("\n\n");
function sizeForRatio(value: string): string {
  const sizes: Record<string, string> = { "3:2": "1536x1024", "2:3": "1024x1536", "1:1": "1024x1024" };
  if (!sizes[value?.trim()]) throw new Error(`unsupported artwork aspect_ratio ${JSON.stringify(value)}; use --size to override`);
  return sizes[value.trim()];
}
async function readState(dir: string): Promise<StateFile> {
  const path = join(dir, "imagegen-state.yaml");
  try {
    const state = YAML.parse(await readFile(path, "utf8")) as StateFile;
    if (state.schema_version !== STATE_SCHEMA_VERSION) throw new Error(`${path} schema_version must be ${STATE_SCHEMA_VERSION}`);
    state.images ??= []; return state;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { schema_version: STATE_SCHEMA_VERSION, style: null, images: [] };
    throw error;
  }
}
function validateAssets(assets: Asset[]): void {
  const ids = new Set<string>();
  for (const asset of assets) {
    if (!asset?.id || !asset.file || !asset.prompt?.trim()) throw new Error("every asset must have non-empty id, file, and prompt");
    if (ids.has(asset.id)) throw new Error(`duplicate asset id ${JSON.stringify(asset.id)}`); ids.add(asset.id);
  }
}
async function loadStylePrompt(root: string, id: string): Promise<string> {
  const prompt = await readYaml<{ prompt?: string }>(join(root, "prompts", "styles", id, "prompt.yaml"));
  if (!prompt.prompt?.trim()) throw new Error(`style ${JSON.stringify(id)} has an empty prompt`); return prompt.prompt;
}
async function loadTarget(root: string, dir: string, model: string, stdout: Streams["stdout"]): Promise<Target | null> {
  const kind = targetKind(root, dir); let style = ""; let hasStyle = false; let size = "1536x1024"; let assets: Asset[] = [];
  if (kind === "book") {
    const book = await readYaml<{ style?: string }>(join(dir, "book.yaml"));
    const artwork = await readYaml<{ style?: string; aspect_ratio: string; assets: Asset[] }>(join(dir, "artwork.yaml"));
    if (!book.style || !artwork.style || book.style !== artwork.style) throw new Error(`${posix(relative(root, dir))}: book.yaml and artwork.yaml must declare the same non-empty style`);
    style = book.style; hasStyle = true; size = sizeForRatio(artwork.aspect_ratio); const stylePrompt = await loadStylePrompt(root, style);
    assets = (artwork.assets ?? []).map((asset) => ({ ...asset, prompt: joinPrompt(asset.prompt, stylePrompt) }));
  } else if (kind === "article") {
    const article = await readYaml<{ style?: string; cover_prompt?: string }>(join(dir, "article.yaml"));
    if (!article.cover_prompt?.trim()) { writeLine(stdout, `skip ${posix(relative(root, dir))}: cover_prompt is missing`); return null }
    style = article.style ?? ""; hasStyle = Boolean(style); assets = [{ id: "cover", file: "cover.webp", prompt: joinPrompt(article.cover_prompt, hasStyle ? await loadStylePrompt(root, style) : "") }];
  } else if (kind === "vocabulary") {
    const entry = await readYaml<{ card?: string; card_prompt?: string }>(join(dir, "entry.yaml"));
    if (!entry.card_prompt?.trim()) { writeLine(stdout, `skip ${posix(relative(root, dir))}: card_prompt is missing`); return null }
    size = "1024x1024"; assets = [{ id: "card", file: entry.card || "card.webp", prompt: joinPrompt(entry.card_prompt, VOCABULARY_TREATMENT) }];
  } else {
    const prompt = await readYaml<{ id?: string; prompt?: string; avatar?: string; avatar_prompt?: string; thumbnail?: string; thumbnail_prompt?: string }>(join(dir, "prompt.yaml"));
    if (kind === "writer") {
      if (!prompt.avatar_prompt?.trim()) { writeLine(stdout, `skip ${posix(relative(root, dir))}: avatar_prompt is missing`); return null }
      size = "1024x1024"; assets = [{ id: "avatar", file: prompt.avatar || "avatar.webp", prompt: joinPrompt(prompt.avatar_prompt) }];
    } else {
      if (!prompt.thumbnail_prompt?.trim()) { writeLine(stdout, `skip ${posix(relative(root, dir))}: thumbnail_prompt is missing`); return null }
      style = prompt.id ?? ""; hasStyle = true; assets = [{ id: "thumbnail", file: prompt.thumbnail || "thumbnail.webp", prompt: joinPrompt(prompt.thumbnail_prompt, prompt.prompt ?? "") }];
    }
  }
  validateAssets(assets); const state = await readState(dir); const styleChanged = hasStyle && state.style !== null && state.style !== undefined && state.style !== style;
  return { dir, kind, style, hasStyle, size, assets, state, styleChanged, stateQueue: Promise.resolve() };
}

function selectAssets(assets: Asset[], only: string): Asset[] {
  if (!only) return assets;
  const wanted = new Set<string>();
  for (const value of only.split(",")) { const id = value.trim(); if (!id) throw new UsageError("--only contains an empty asset ID"); wanted.add(id) }
  const known = new Set(assets.map(({ id }) => id)); const unknown = [...wanted].filter((id) => !known.has(id)).sort();
  if (unknown.length) throw new UsageError(`--only names unknown asset IDs: ${unknown.join(", ")}`);
  return assets.filter(({ id }) => wanted.has(id));
}
function assetPath(dir: string, asset: Asset): string {
  if (extname(asset.file).toLowerCase() !== ".webp") throw new Error(`asset ${JSON.stringify(asset.id)} file must end in .webp`);
  const path = resolve(dir, asset.file); const rel = relative(dir, path);
  if (isAbsolute(asset.file) || rel === ".." || rel.startsWith(`..${sep}`)) throw new Error(`asset ${JSON.stringify(asset.id)} file escapes target directory`);
  return path;
}
async function assertSafeOutput(targetDir: string, output: string): Promise<void> {
  const root = await realpath(targetDir); const rel = relative(targetDir, output); let cursor = targetDir;
  for (const component of rel.split(sep).slice(0, -1)) {
    cursor = join(cursor, component);
    try { if ((await lstat(cursor)).isSymbolicLink()) throw new Error(`refusing symlink output component: ${cursor}`) } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; break }
  }
  try { if ((await lstat(output)).isSymbolicLink()) throw new Error(`refusing symlink output file: ${output}`) } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error }
  await mkdir(dirname(output), { recursive: true }); const parent = await realpath(dirname(output)); const within = relative(root, parent);
  if (within === ".." || within.startsWith(`..${sep}`) || isAbsolute(within)) throw new Error(`output parent escapes target directory: ${output}`);
}
async function atomicWrite(path: string, bytes: Uint8Array, prefix: string): Promise<void> {
  const tempDir = await mkdtemp(join(dirname(path), prefix)); const temp = join(tempDir, basename(path));
  try { const handle = await open(temp, fsConstants.O_CREAT | fsConstants.O_EXCL | fsConstants.O_WRONLY, 0o644); try { await handle.writeFile(bytes); await handle.sync() } finally { await handle.close() }; await rename(temp, path) } finally { await rm(tempDir, { recursive: true, force: true }) }
}
async function writeState(target: Target, model: string, asset: Asset, error?: unknown): Promise<void> {
  target.state.schema_version = STATE_SCHEMA_VERSION; target.state.style = target.hasStyle ? target.style : null; target.state.model = model; target.state.images ??= [];
  const item: ImageState = { id: asset.id, file: asset.file, status: error ? "failed" : "done", generated_at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z") };
  if (error) item.error = message(error); const index = target.state.images.findIndex(({ id }) => id === asset.id);
  if (index >= 0) target.state.images[index] = item; else target.state.images.push(item); target.state.images.sort((a, b) => a.id.localeCompare(b.id));
  const path = join(target.dir, "imagegen-state.yaml"); await assertSafeOutput(target.dir, path); await atomicWrite(path, Buffer.from(YAML.stringify(target.state)), ".imagegen-state-");
}
async function generate(fetchImpl: typeof fetch, base: string, key: string, model: string, size: string, quality: string, prompt: string, output: string, targetDir: string): Promise<void> {
  const body: Record<string, unknown> = { model, prompt, size, output_format: "webp", output_compression: 85 }; if (quality) body.quality = quality;
  const response = await fetchImpl(`${base}/v1/images/generations`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await response.text(); let decoded: { data?: Array<{ b64_json?: string }>; error?: { message?: string } };
  try { decoded = JSON.parse(text) } catch (error) { throw new Error(`decode API response (HTTP ${response.status}): ${message(error)}`) }
  if (!response.ok) throw new Error(`API returned HTTP ${response.status}: ${decoded.error?.message?.trim() || text.trim()}`);
  if (!decoded.data?.[0]?.b64_json) throw new Error("API response contains no b64_json image");
  const image = Buffer.from(decoded.data[0].b64_json, "base64");
  if (image.length < 12 || image.subarray(0, 4).toString() !== "RIFF" || image.subarray(8, 12).toString() !== "WEBP") throw new Error("API response is not a WebP image");
  await assertSafeOutput(targetDir, output); await atomicWrite(output, image, ".imagegen-");
}

export async function run(args: string[], config: RunConfig = {}): Promise<number> {
  const streams = config.streams ?? { stdout: process.stdout, stderr: process.stderr };
  try {
    const parsed = parseArgs(args); if (parsed.help) { writeLine(streams.stdout, helpText); return 0 }
    const cwd = config.cwd ?? process.cwd(); const env = config.env ?? process.env; const { root, dirs } = await resolveTargets(parsed.paths, cwd); const fileEnv = await readDotEnv(join(root, ".env"));
    const value = (key: string) => Object.prototype.hasOwnProperty.call(env, key) ? env[key] ?? "" : fileEnv[key] ?? "";
    const model = parsed.options.model || value("OPENAI_IMAGE_MODEL") || DEFAULT_MODEL; const base = (value("OPENAI_BASE_URL") || DEFAULT_BASE).replace(/\/+$/, "");
    const targets: Target[] = [];
    for (const dir of dirs) { const target = await loadTarget(root, dir, model, streams.stdout); if (target) targets.push(target) }
    const jobs: Job[] = [];
    for (const target of targets) {
      const selected = target.styleChanged ? target.assets : selectAssets(target.assets, parsed.options.only);
      for (const asset of selected) {
        const path = assetPath(target.dir, asset); const done = target.state.images?.some((item) => item.id === asset.id && item.file === asset.file && item.status === "done");
        if (!parsed.options.force && !target.styleChanged && done) { writeLine(streams.stdout, `skip ${posix(relative(root, target.dir))}/${asset.id}: state is done`); continue }
        const size = parsed.options.size || target.size; jobs.push({ target, asset, path, prompt: asset.prompt, size });
        if (parsed.options.dryRun) writeLine(streams.stdout, `generate ${posix(relative(root, target.dir))}/${asset.id} -> ${asset.file} (${size})`);
      }
    }
    if (parsed.options.dryRun) { writeLine(streams.stdout, `total: ${jobs.length} image(s)`); return 0 }
    if (!jobs.length) return 0;
    for (const job of jobs) { await assertSafeOutput(job.target.dir, job.path); await assertSafeOutput(job.target.dir, join(job.target.dir, "imagegen-state.yaml")) }
    const key = value("OPENAI_API_KEY"); if (!key) throw new Error("OPENAI_API_KEY is required (set it in the environment or repository .env)");
    const failures: string[] = []; let next = 0;
    await Promise.all(Array.from({ length: Math.min(parsed.options.concurrency, jobs.length) }, async () => {
      while (next < jobs.length) {
        const job = jobs[next++]; let failure: unknown;
        try { await generate(config.fetchImpl ?? fetch, base, key, model, job.size, parsed.options.quality, job.prompt, job.path, job.target.dir) } catch (error) { failure = error }
        job.target.stateQueue = job.target.stateQueue.then(() => writeState(job.target, model, job.asset, failure));
        try { await job.target.stateQueue } catch (error) { failures.push(message(error)); continue }
        if (failure) { writeLine(streams.stdout, `failed ${posix(relative(root, job.target.dir))}/${job.asset.id}: ${message(failure)}`); failures.push(`generate ${posix(relative(root, job.target.dir))}/${job.asset.id}: ${message(failure)}`) }
        else writeLine(streams.stdout, `generated ${posix(relative(root, job.target.dir))}/${job.asset.id}: ${job.asset.file}`);
      }
    }));
    if (failures.length) throw new Error(`${failures.length} image(s) failed: ${failures.sort().join("; ")}`); return 0;
  } catch (error) {
    writeLine(streams.stderr, `imagegen: ${message(error)}`); return error instanceof UsageError ? 2 : 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await run(process.argv.slice(2));
