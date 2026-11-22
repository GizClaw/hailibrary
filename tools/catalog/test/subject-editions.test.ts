import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { compileSubjects } from "../src/subjects.ts";

test("a bilingual subject shares the canonical work, credits and ordered references", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "hailibrary-subject-edition-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const source = join(dir, "source");
  const output = join(dir, "output");
  await mkdir(join(source, "albums"), { recursive: true });
  await mkdir(join(source, "readings"));
  const writeJson = (path: string, value: unknown) => writeFile(join(source, path), JSON.stringify(value));
  const read = async (path: string) => JSON.parse(await readFile(join(output, path), "utf8"));
  const subject = {
    id: "science", title: "科学", en: "Science", language: "zh-CN",
    menus: [{ id: "earth", title: "地球", en: "Earth", albums: ["skies"] }],
  };
  const album = {
    id: "skies", title: "天空", source: "catalog.md",
    positions: [
      { id: "moon", work: "moon", title: "月亮", originalOrder: "01", source: { path: "canonical.md" } },
      { id: "revisit", work: "moon", title: "再读月亮", originalOrder: "02", source: { path: "canonical.md" } },
    ],
  };
  const original = `<!-- reading: moon -->\n---\nlanguage: zh-CN\ntitle: 月亮\nauthor: HaiLibrary 原创编辑\nrights: original\nage: 6–8 岁\nsources: [{title: NASA Moon, url: 'https://science.nasa.gov/moon/'}]\n---\n月亮反射太阳光。\n`;
  const en = { title: "The Moon", markdown: "The Moon reflects sunlight." };
  await writeJson("index.json", { subjects: [subject] });
  await writeJson("albums/skies.json", album);
  await writeFile(join(source, "readings/skies.md"), original);
  await compileSubjects(source, output);
  const originalPayload = await readFile(join(output, "readings/moon.json"));

  await writeJson("index.json", { subjects: [{ ...subject, availableLocales: ["zh-CN", "en-US"] }] });
  await writeJson("science.en-US.json", { albums: { skies: "The Sky" }, works: { moon: en } });
  const index = await compileSubjects(source, output);
  assert.deepEqual(index.subjects[0].availableLocales, ["zh-CN", "en-US"]);
  assert.equal(index.subjects[0].menus[0].albums[0].englishTitle, "The Sky");
  assert.deepEqual(await readFile(join(output, "readings/moon.json")), originalPayload);
  assert.deepEqual(await read("readings/en-US/moon.json"), en);
  assert.deepEqual(await read("albums/skies.json"), {
    ...album, englishTitle: "The Sky",
    positions: album.positions.map((position) => ({ ...position, englishTitle: "The Moon" })),
  });

  await writeJson("science.en-US.json", { albums: { skies: "The Sky" }, works: {} });
  await assert.rejects(compileSubjects(source, output), /missing English reading for skies\/moon/);
  await writeJson("science.en-US.json", { albums: { skies: "The Sky" }, works: { moon: en, stray: en } });
  await assert.rejects(compileSubjects(source, output), /unreferenced English edition entries/);
});
