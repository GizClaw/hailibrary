import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import YAML from "yaml";

const publicDir = join(import.meta.dirname, "../../../apps/web/public");
const repositoryRoot = join(import.meta.dirname, "../../..");
const readJson = async (path: string) => JSON.parse(await readFile(join(publicDir, path), "utf8"));
// Standalone article cards plus every chapter article listed by a collection card.
const articleEntries = async () => {
  const index = await readJson("series.json");
  const entries: Array<{ card: any; manifest: any }> = [];
  for (const card of index.series) {
    const manifest = await readJson(card.manifest);
    if (card.kind === "collection") {
      for (const chapter of manifest.chapters) {
        const chapterManifest = await readJson(chapter.manifest);
        entries.push({ card: { ...chapterManifest, manifest: chapter.manifest }, manifest: chapterManifest });
      }
    } else entries.push({ card, manifest });
  }
  return entries;
};

test("series output has independently loadable locale articles and optional audio", async () => {
  const index = await readJson("series.json");
  assert.equal(index.schemaVersion, 1);
  assert.equal(index.count, index.series.length);
  assert.ok(index.series.length > 0);
  for (const card of index.series) {
    const manifest = await readJson(card.manifest);
    assert.equal(manifest.id, card.id);
    assert.ok(Number.isInteger(card.ageRange.min));
    if (card.kind === "collection") {
      assert.equal(manifest.chapters.length, card.chapterCount);
      assert.ok(manifest.chapters.every((chapter: { manifest: string }) => !chapter.manifest.startsWith("/")));
    }
  }
  for (const { card, manifest } of await articleEntries()) {
    assert.deepEqual(card.ageRange, manifest.ageRange);
    assert.equal(manifest.id, card.id);
    assert.ok(manifest.cover === null || !manifest.cover.startsWith("/"));
    for (const locale of manifest.availableLocales) {
      const localeManifest = manifest.locales[locale];
      assert.equal(localeManifest.article.startsWith("/"), false);
      const article = await readJson(localeManifest.article);
      assert.equal(article.language, locale);
      assert.ok(article.title);
      assert.ok(article.chapters.length > 0);
      assert.ok(article.chapters.every((chapter: { title: string; paragraphs: string[] }) => chapter.paragraphs.length > 0));
      if (localeManifest.audioScript) {
        assert.equal(localeManifest.audioScript.startsWith("/"), false);
        const sourceDir = card.seriesId
          ? join(repositoryRoot, "works/series", card.seriesId, card.id)
          : join(repositoryRoot, "works/articles", card.id);
        const source = YAML.parse(await readFile(join(sourceDir, "locales", locale, "audio_script.yaml"), "utf8"));
        assert.deepEqual(await readJson(localeManifest.audioScript), source);
      }
    }
  }
});

test("series books are grouped by taxonomy level and sorted by source volume", async () => {
  const [index, taxonomy, catalog] = await Promise.all([readJson("series.json"), readJson("taxonomy.json"), readJson("catalog.json")]);
  const shards = await Promise.all(catalog.shards.map(readJson));
  const seriesBookCount = shards.flat().filter((card: { source?: unknown }) => card.source).length;
  const rank = new Map(Object.keys(taxonomy.levels).map((level, position) => [level, position]));
  let bookCount = 0;
  for (const { manifest } of await articleEntries()) {
    const ranks = manifest.bookGroups.map((group: { level: string }) => rank.get(group.level));
    assert.deepEqual(ranks, [...ranks].sort((left, right) => left - right));
    for (const group of manifest.bookGroups) {
      assert.deepEqual(group.books.map((book: { volume: number }) => book.volume), [...group.books.map((book: { volume: number }) => book.volume)].sort((left, right) => left - right));
      bookCount += group.books.length;
    }
  }
  assert.equal(bookCount, seriesBookCount);
});

test("article cards expose localized types and derived picture-book levels", async () => {
  const index = await readJson("series.json");
  assert.equal(index.articleTypes.fiction.names["en-US"], "Fiction");
  assert.equal(index.articleTypes.fiction.names["zh-CN"], "小说");
  for (const card of index.series.filter((item: { kind?: string }) => item.kind !== "collection")) {
    const manifest = await readJson(card.manifest);
    assert.deepEqual(card.levels, manifest.bookGroups.map((group: { level: string }) => group.level));
    assert.deepEqual(manifest.levels, card.levels);
    if (card.type) {
      assert.deepEqual(card.typeNames, index.articleTypes[card.type].names);
      assert.deepEqual(manifest.typeNames, card.typeNames);
    } else {
      assert.equal(Object.hasOwn(card, "typeNames"), false);
    }
  }
});

test("series-derived book cards and manifests expose localized source metadata while independent books omit it", async () => {
  const catalog = await readJson("catalog.json");
  const shards = await Promise.all(catalog.shards.map(readJson));
  for (const card of shards.flat()) {
    const manifest = await readJson(card.manifest);
    if (!card.source) {
      assert.equal(Object.hasOwn(manifest, "source"), false);
      continue;
    }
    assert.deepEqual(Object.keys(card.source).sort(), ["article", "titles", "volume", "volumes"]);
    assert.ok(card.source.article);
    assert.ok(card.source.volume >= 1 && card.source.volume <= card.source.volumes);
    assert.ok(Object.keys(card.source.titles).length > 0);
    assert.deepEqual(manifest.source, card.source);
  }
});
