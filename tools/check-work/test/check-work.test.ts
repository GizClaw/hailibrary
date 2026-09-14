import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const exec = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const cli = join(repositoryRoot, "tools/check-work/src/cli.js");
const levels = ["aa", ..."abcdefghijklmnopqrstuvwxyz", "z1", "z2"];
const media = Buffer.from("RIFF\x04\x00\x00\x00WEBPtest", "binary");
const write = async (path: string, contents: string | Uint8Array) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
};

type Fixture = { root: string; first: string; second: string };
type SeriesFixture = { root: string; series: string; script: string };

function story(locale: "en-US" | "zh-CN", prompt: string) {
  const texts = locale === "en-US" ? ["Red cat.", "Blue cat.", "Big cat.", "Small cat."] : ["红猫走。", "蓝猫走。", "大猫走。", "小猫走。"];
  return `schema_version: 3
language: ${locale}
writer: test-writer
title: Test title
summary: Test summary
chapters:
  - id: ch01
    title: One
    page_refs: [p01, p02]
  - id: ch02
    title: Two
    page_refs: [p03, p04]
questions:
  - id: q01
    type: picture
    prompt: ${JSON.stringify(prompt)}
    answer: Cat
    page_refs: [p01]
article:
  pages:
${texts.map((text, index) => `    - id: p0${index + 1}\n      illustration: p0${index + 1}\n      paragraphs:\n        - text: ${text}`).join("\n")}
`;
}

async function writeBook(root: string, slug: string, volume: number, prompts: Record<string, string>) {
  const book = join(root, "works/aa/fiction/animals", slug);
  await write(join(book, "book.yaml"), `schema_version: 2
id: ${slug}
type: [fiction, animals]
style: test-style
status: draft
locales: [en-US, zh-CN]
labels:
  topics: [animals]
  themes: [friendship]
  moods: [warm]
characters:
  - id: cat
    kind: animal
    description: A cat
    visual_identity: A red cat
cover: artwork/cover.webp
source: {series: test-series, volume: ${volume}, volumes: 2}
`);
  await write(join(book, "artwork.yaml"), `schema_version: 2
style: test-style
aspect_ratio: "3:2"
embedded_text: prohibited
shared_by_all_locales: true
assets:
  - id: cover
    file: artwork/cover.webp
    scene: "Cat, near tree"
    prompt: Cover prompt
${[1, 2, 3, 4].map((number) => `  - id: p0${number}\n    file: artwork/p0${number}.webp\n    scene: Page ${number}\n    prompt: Page ${number} prompt`).join("\n")}
`);
  for (const id of ["cover", "p01", "p02", "p03", "p04"]) await write(join(book, `artwork/${id}.webp`), media);
  for (const locale of ["en-US", "zh-CN"] as const) await write(join(book, `locales/${locale}/story.yaml`), story(locale, prompts[locale]));
  return book;
}

async function fixture(): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), "check-work-test-"));
  await exec("git", ["init", "-q", root]);
  await write(join(root, ".gitattributes"), "*.webp filter=lfs\n");
  for (const path of ["levels", "vocabulary"]) await cp(join(repositoryRoot, "prompts", path), join(root, "prompts", path), { recursive: true });
  for (const path of ["labels/index.yaml", "taxonomy/index.yaml", "writers/index.yaml"]) await cp(join(repositoryRoot, "prompts", path), join(root, "prompts", path));
  await write(join(root, "prompts/styles/test-style/prompt.yaml"), "schema_version: 1\nid: test-style\nprompt: Test style\nthumbnail: thumbnail.webp\n");
  await write(join(root, "prompts/styles/test-style/thumbnail.webp"), media);
  for (const locale of ["en-US", "zh-CN"]) {
    await write(join(root, `prompts/writers/${locale}/test-writer/prompt.yaml`), `schema_version: 1\nid: test-writer\nlocale: ${locale}\nrecommended_levels: [aa]\nprompt: Test writer\nlanguage_prompt: Test language\navatar: avatar.webp\n`);
    await write(join(root, `prompts/writers/${locale}/test-writer/avatar.webp`), media);
  }
  await write(join(root, "works/series/test-series/article.yaml"), "schema_version: 1\nid: test-series\n");
  const first = await writeBook(root, "volume-one", 1, { "en-US": "What is the cat doing?", "zh-CN": "小猫在做什么？" });
  const second = await writeBook(root, "volume-two", 2, { "en-US": "Where is the cat?", "zh-CN": "小猫在哪里？" });
  return { root, first, second };
}

async function check(fixture: Fixture, book = fixture.second) {
  try {
    const result = await exec(process.execPath, [cli, relative(fixture.root, book)], { cwd: fixture.root });
    return { code: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const result = error as Error & { code: number; stdout: string; stderr: string };
    return { code: result.code, stdout: result.stdout, stderr: result.stderr };
  }
}

async function seriesFixture(emotion?: string): Promise<SeriesFixture> {
  const root = await mkdtemp(join(tmpdir(), "check-work-series-test-"));
  await exec("git", ["init", "-q", root]);
  await cp(join(repositoryRoot, "prompts/labels/index.yaml"), join(root, "prompts/labels/index.yaml"));
  await write(join(root, "prompts/styles/test-style/prompt.yaml"), "schema_version: 1\nid: test-style\nprompt: Test style\n");
  await write(join(root, "prompts/writers/en-US/test-writer/prompt.yaml"), "schema_version: 1\nid: test-writer\nlocale: en-US\n");
  const series = join(root, "works/series/test-series");
  await write(join(series, "article.yaml"), `schema_version: 1
id: test-series
category: fiction
genre: adventure
style: test-style
labels: {topics: [], themes: [], moods: []}
research: none
premise: A test premise
characters:
  - {id: child, description: A child}
locales:
  en-US: {writer: test-writer, working_title: Test Series, length: 100 words}
cover_prompt: A wordless test cover
`);
  await write(join(series, "locales/en-US/article.md"), "# Test Series\n\n## One\n\nThe child shouted, “Wait!”\n");
  const script = join(series, "locales/en-US/audio_script.yaml");
  await write(script, `audio_script:
  language: en-US
  cast:
    narrator:
      display_name: Narrator
      tts: {delivery: neutral, timbre: clear, pace: measured, pitch: medium}
    child:
      display_name: Child
      tts: {delivery: direct, timbre: young, pace: natural, pitch: high}
  chapters:
    - id: ch01
      title: One
      blocks:
        - id: ch01-b01
          speaker: narrator
          text: The child shouted,
        - id: ch01-b02
          speaker: child
          text: Wait!
${emotion === undefined ? "" : `          emotion: ${emotion}\n`}`);
  return { root, series, script };
}

async function checkSeriesFixture(fixture: SeriesFixture) {
  try {
    const result = await exec(process.execPath, [cli, relative(fixture.root, fixture.series)], { cwd: fixture.root });
    return { code: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const result = error as Error & { code: number; stdout: string; stderr: string };
    return { code: result.code, stdout: result.stdout, stderr: result.stderr };
  }
}

async function replace(path: string, from: string, to: string) {
  const contents = await readFile(path, "utf8");
  assert.ok(contents.includes(from), `fixture mutation source not found: ${from}`);
  await writeFile(path, contents.replace(from, to));
}

test("accepts distinct questions in different volumes of one series", async () => {
  const f = await fixture();
  assert.equal((await check(f)).code, 0);
});

test("accepts a supported emotion on an audio-script block", async () => {
  const f = await seriesFixture("angry");
  assert.equal((await checkSeriesFixture(f)).code, 0);
});

test("rejects an unsupported emotion on an audio-script block", async () => {
  const f = await seriesFixture("excited");
  const result = await checkSeriesFixture(f);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /emotion must be one of happy, sad, angry, fearful, disgusted, surprised, calm/);
});

test("rejects volume 2 copying volume 1 question after whitespace and punctuation normalization", async () => {
  const f = await fixture();
  await replace(join(f.second, "locales/en-US/story.yaml"), '"Where is the cat?"', '"What, is the cat doing !"');
  const result = await check(f);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /question prompt duplicates another volume.*removing whitespace and punctuation/);
});

test("accepts matching locale page IDs, illustrations, and chapter coverage", async () => {
  const f = await fixture();
  assert.equal((await check(f)).code, 0);
});

test("rejects locale mismatches in page IDs, illustrations, or chapter coverage", async (t) => {
  const cases = [
    ["page IDs", "    - id: p04\n      illustration: p04", "    - id: p05\n      illustration: p04", /page order differs from other locales/],
    ["illustrations", "    - id: p04\n      illustration: p04", "    - id: p04\n      illustration: p03", /page IDs and illustrations must exactly match other locales/],
    ["chapter coverage", "    page_refs: [p03, p04]", "    page_refs: [p04, p03]", /chapter IDs and page coverage must exactly match other locales/],
  ] as const;
  for (const [name, from, to, message] of cases) await t.test(name, async () => {
    const f = await fixture();
    await replace(join(f.second, "locales/zh-CN/story.yaml"), from, to);
    const result = await check(f);
    assert.equal(result.code, 1);
    assert.match(result.stderr, message);
  });
});

test("accepts question page_refs inside the current volume", async () => {
  const f = await fixture();
  assert.equal((await check(f)).code, 0);
});

test("rejects question.page_refs outside the current volume", async () => {
  const f = await fixture();
  await replace(join(f.second, "locales/en-US/story.yaml"), "    page_refs: [p01]\narticle:", "    page_refs: [volume-one-p01]\narticle:");
  const result = await check(f);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /q01: unknown page_ref volume-one-p01/);
});

test("accepts quoted YAML values containing commas", async () => {
  const f = await fixture();
  assert.equal((await check(f)).code, 0);
});

test("rejects unknown and empty YAML keys caused by an unquoted flow-mapping comma", async () => {
  const f = await fixture();
  await replace(join(f.second, "artwork.yaml"), '  - id: cover\n    file: artwork/cover.webp\n    scene: "Cat, near tree"\n    prompt: Cover prompt', "  - {id: cover, file: artwork/cover.webp, scene: Cat, near tree, prompt: Cover prompt}");
  const result = await check(f);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /flow mapping key has no value.*near tree/);
  assert.match(result.stderr, /artwork cover contains an unknown field/);
  assert.match(result.stderr, /YAML key has an empty value.*assets\.0\.near tree/);
});
