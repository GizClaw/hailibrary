import assert from "node:assert/strict";
import { mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import test from "node:test";
import YAML from "yaml";
import { helpText, run } from "../src/main.ts";

const webp = Buffer.from("RIFF\x04\x00\x00\x00WEBPtest", "binary");
const write = async (path: string, contents: string) => { await mkdir(join(path, ".."), { recursive: true }); await writeFile(path, contents) };
type Fixture = { root: string; book: string; series: string; vocab: string; writer: string; style: string };
async function fixture(): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), "imagegen-test-"));
  const value = { root, book: join(root, "works/a/x/y/book"), series: join(root, "works/series/story"), vocab: join(root, "vocabulary/a/jump"), writer: join(root, "prompts/writers/en-US/writer"), style: join(root, "prompts/styles/ink") };
  await write(join(value.style, "prompt.yaml"), "id: ink\nprompt: STYLE\nthumbnail_prompt: STYLE THUMB\n");
  await write(join(value.book, "book.yaml"), "style: ink\n");
  await write(join(value.book, "artwork.yaml"), "style: ink\naspect_ratio: '3:2'\nassets:\n  - {id: cover, file: cover.webp, prompt: BOOK COVER}\n  - {id: p01, file: p01.webp, prompt: BOOK PAGE}\n");
  await write(join(value.series, "article.yaml"), "style: ink\ncover_prompt: SERIES COVER\n");
  await write(join(value.vocab, "entry.yaml"), "card: card.webp\ncard_prompt: JUMP CARD\n");
  await write(join(value.writer, "prompt.yaml"), "id: writer\navatar_prompt: WRITER AVATAR\n");
  return value;
}
function capture() {
  let stdout = "", stderr = "";
  return { streams: { stdout: { write: (value: string | Uint8Array) => { stdout += value.toString(); return true } }, stderr: { write: (value: string | Uint8Array) => { stderr += value.toString(); return true } } } as never, out: () => stdout, err: () => stderr };
}
async function fakeServer(handler?: (request: Record<string, unknown>, headers: Headers) => { status?: number; body?: unknown }) {
  const requests: Array<Record<string, unknown>> = []; const auth: string[] = [];
  const respond = (body: Record<string, unknown>, headers: Headers, url: string) => {
    body.__url = url; requests.push(body); auth.push(headers.get("authorization") ?? "");
    return handler?.(body, headers) ?? { body: { data: [{ b64_json: webp.toString("base64") }] } };
  };
  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString()); const result = respond(body, new Headers(req.headers as Record<string, string>), `http://127.0.0.1:${(server.address() as { port: number }).port}${req.url ?? ""}`);
    res.writeHead(result.status ?? 200, { "content-type": "application/json" }); res.end(JSON.stringify(result.body));
  });
  let listening = true;
  try { await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve) }) } catch (error) { if ((error as NodeJS.ErrnoException).code !== "EPERM") throw error; listening = false }
  const address = server.address(); const url = listening && address && typeof address !== "string" ? `http://127.0.0.1:${address.port}` : "http://local-imagegen.test";
  const fetchImpl: typeof fetch = listening ? fetch : async (input, init) => {
    const headers = new Headers(init?.headers); const body = JSON.parse(String(init?.body)); const result = respond(body, headers, String(input));
    return new Response(JSON.stringify(result.body), { status: result.status ?? 200, headers: { "content-type": "application/json" } });
  };
  return { url, requests, auth, fetchImpl, close: () => listening ? new Promise<void>((resolve) => server.close(() => resolve())) : Promise.resolve() };
}
const env = (url: string): NodeJS.ProcessEnv => ({ OPENAI_API_KEY: "secret", OPENAI_BASE_URL: url, OPENAI_IMAGE_MODEL: "test-model" });

test("help is side-effect free", async () => { const output = capture(); assert.equal(await run(["--help"], { ...output, cwd: "/" }), 0); assert.equal(output.out().trim(), helpText) });

test("generates all five target kinds with sizes, WebP options, prompts, and states", async () => {
  const f = await fixture(); const server = await fakeServer(); const output = capture();
  try { assert.equal(await run([f.book, f.series, f.vocab, f.writer, f.style], { ...output, env: env(server.url), fetchImpl: server.fetchImpl }), 0) } finally { await server.close() }
  assert.equal(server.requests.length, 6);
  for (const request of server.requests) { assert.equal(request.model, "test-model"); assert.equal(request.output_format, "webp"); assert.equal(request.output_compression, 85); assert.match(String(request.prompt), /must contain no text/) }
  const byPrompt = new Map(server.requests.map((request) => [String(request.prompt).split(" ")[0], request.size]));
  for (const key of ["BOOK", "SERIES", "STYLE"]) assert.equal(byPrompt.get(key), "1536x1024");
  for (const key of ["JUMP", "WRITER"]) assert.equal(byPrompt.get(key), "1024x1024");
  for (const dir of [f.book, f.series, f.vocab, f.writer, f.style]) assert.equal(YAML.parse(await readFile(join(dir, "imagegen-state.yaml"), "utf8")).schema_version, 1);
});

test("persists failures and resumes only unfinished images", async () => {
  const f = await fixture(); let pageAttempts = 0, coverAttempts = 0;
  const server = await fakeServer((body) => { const page = String(body.prompt).includes("PAGE"); page ? pageAttempts++ : coverAttempts++; return page && pageAttempts === 1 ? { status: 500, body: { error: { message: "temporary" } } } : { body: { data: [{ b64_json: webp.toString("base64") }] } } });
  try { assert.equal(await run(["--concurrency", "1", f.book], { env: env(server.url), fetchImpl: server.fetchImpl, ...capture() }), 1); assert.equal(await run(["--concurrency", "1", f.book], { env: env(server.url), fetchImpl: server.fetchImpl, ...capture() }), 0) } finally { await server.close() }
  assert.equal(coverAttempts, 1); assert.equal(pageAttempts, 2);
});

test("Style ID change rebuilds entire target despite --only", async () => {
  const f = await fixture(); const server = await fakeServer();
  try {
    assert.equal(await run([f.book], { env: env(server.url), fetchImpl: server.fetchImpl, ...capture() }), 0);
    await write(join(f.root, "prompts/styles/wash/prompt.yaml"), "id: wash\nprompt: WASH\n");
    await write(join(f.book, "book.yaml"), "style: wash\n");
    await write(join(f.book, "artwork.yaml"), (await readFile(join(f.book, "artwork.yaml"), "utf8")).replace("style: ink", "style: wash"));
    server.requests.length = 0; assert.equal(await run(["--only", "cover", f.book], { env: env(server.url), fetchImpl: server.fetchImpl, ...capture() }), 0); assert.equal(server.requests.length, 2);
  } finally { await server.close() }
});

test("prompt changes do not rebuild completed images", async () => {
  const f = await fixture(); const server = await fakeServer();
  try { assert.equal(await run([f.series], { env: env(server.url), fetchImpl: server.fetchImpl, ...capture() }), 0); await write(join(f.series, "article.yaml"), "style: ink\ncover_prompt: CHANGED\n"); server.requests.length = 0; assert.equal(await run([f.series], { env: env(server.url), fetchImpl: server.fetchImpl, ...capture() }), 0); assert.equal(server.requests.length, 0) } finally { await server.close() }
});

test("no-argument dry-run scans repository, counts work, skips missing optional prompts, and writes nothing", async () => {
  const f = await fixture(); await write(join(f.writer, "prompt.yaml"), "id: writer\n"); const output = capture();
  assert.equal(await run(["--dry-run"], { cwd: f.root, env: {}, ...output }), 0); assert.match(output.out(), /avatar_prompt is missing/); assert.match(output.out(), /total: 5 image\(s\)/);
  await assert.rejects(readFile(join(f.book, "imagegen-state.yaml")), { code: "ENOENT" });
});

test("rejects invalid state schema and unsafe output paths", async () => {
  const f = await fixture(); await write(join(f.vocab, "imagegen-state.yaml"), "schema_version: 9\n"); assert.equal(await run(["--dry-run", f.vocab], { env: {}, ...capture() }), 1);
  await write(join(f.book, "artwork.yaml"), "style: ink\naspect_ratio: '3:2'\nassets:\n  - {id: cover, file: ../cover.webp, prompt: BAD}\n"); assert.equal(await run(["--dry-run", f.book], { env: {}, ...capture() }), 1);
});

test("refuses symlink directory and file outputs before making API requests", async (t) => {
  const f = await fixture(); const outside = await mkdtemp(join(tmpdir(), "imagegen-outside-")); const server = await fakeServer();
  try {
    await mkdir(join(f.book, "nested")); await symlink(outside, join(f.book, "nested", "link"));
    await write(join(f.book, "artwork.yaml"), "style: ink\naspect_ratio: '3:2'\nassets:\n  - {id: cover, file: nested/link/cover.webp, prompt: BAD}\n");
    assert.equal(await run([f.book], { env: env(server.url), fetchImpl: server.fetchImpl, ...capture() }), 1); assert.equal(server.requests.length, 0);
    if (process.platform === "win32") t.skip("file symlink permissions are platform dependent");
    await write(join(f.book, "artwork.yaml"), "style: ink\naspect_ratio: '3:2'\nassets:\n  - {id: cover, file: cover.webp, prompt: BAD}\n"); await symlink(join(outside, "cover.webp"), join(f.book, "cover.webp"));
    assert.equal(await run([f.book], { env: env(server.url), fetchImpl: server.fetchImpl, ...capture() }), 1); assert.equal(server.requests.length, 0);
  } finally { await server.close() }
});

test("environment overrides .env base URL, model, and key; .env is fallback", async () => {
  const f = await fixture(); const fileServer = await fakeServer(); const envServer = await fakeServer();
  await write(join(f.root, ".env"), `OPENAI_API_KEY=file-key\nOPENAI_IMAGE_MODEL='file-model'\nOPENAI_BASE_URL=${fileServer.url}/\n`);
  try {
    assert.equal(await run([f.vocab], { env: {}, fetchImpl: fileServer.fetchImpl, ...capture() }), 0); assert.equal(fileServer.requests[0].model, "file-model"); assert.equal(fileServer.auth[0], "Bearer file-key"); assert.match(String(fileServer.requests[0].__url), new RegExp(`^${fileServer.url}`));
    assert.equal(await run(["--force", f.vocab], { env: { OPENAI_API_KEY: "env-key", OPENAI_IMAGE_MODEL: "env-model", OPENAI_BASE_URL: envServer.url }, fetchImpl: envServer.fetchImpl, ...capture() }), 0);
    assert.equal(envServer.requests[0].model, "env-model"); assert.equal(envServer.auth[0], "Bearer env-key"); assert.equal(fileServer.requests.length, 1);
  } finally { await fileServer.close(); await envServer.close() }
});
