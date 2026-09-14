import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import YAML from "yaml";

const publicDir = join(import.meta.dirname, "../../../apps/web/public");
const repositoryRoot = join(import.meta.dirname, "../../..");
const readJson = async (path: string) => JSON.parse(await readFile(join(publicDir, path), "utf8"));

test("series output has independently loadable locale articles and optional audio", async () => {
  const index = await readJson("series.json");
  assert.equal(index.schemaVersion, 1);
  assert.equal(index.count, index.series.length);
  assert.ok(index.series.length > 0);
  for (const card of index.series) {
    const manifest = await readJson(card.manifest);
    assert.equal(manifest.id, card.id);
    assert.equal(manifest.cover.startsWith("/"), false);
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
        const source = YAML.parse(await readFile(join(repositoryRoot, "works/series", card.id, "locales", locale, "audio_script.yaml"), "utf8"));
        assert.deepEqual(await readJson(localeManifest.audioScript), source);
      }
    }
  }
});

test("series books are grouped by taxonomy level and sorted by source volume", async () => {
  const [index, taxonomy, catalog] = await Promise.all([readJson("series.json"), readJson("taxonomy.json"), readJson("catalog.json")]);
  const rank = new Map(Object.keys(taxonomy.levels).map((level, position) => [level, position]));
  let bookCount = 0;
  for (const card of index.series) {
    const manifest = await readJson(card.manifest);
    const ranks = manifest.bookGroups.map((group: { level: string }) => rank.get(group.level));
    assert.deepEqual(ranks, [...ranks].sort((left, right) => left - right));
    for (const group of manifest.bookGroups) {
      assert.deepEqual(group.books.map((book: { volume: number }) => book.volume), [...group.books.map((book: { volume: number }) => book.volume)].sort((left, right) => left - right));
      bookCount += group.books.length;
    }
  }
  assert.equal(bookCount, catalog.bookCount);
});

test("book cards and manifests expose localized source metadata", async () => {
  const catalog = await readJson("catalog.json");
  const shards = await Promise.all(catalog.shards.map(readJson));
  for (const card of shards.flat()) {
    assert.deepEqual(Object.keys(card.source).sort(), ["series", "titles", "volume", "volumes"]);
    assert.ok(card.source.series);
    assert.ok(card.source.volume >= 1 && card.source.volume <= card.source.volumes);
    assert.ok(Object.keys(card.source.titles).length > 0);
    const manifest = await readJson(card.manifest);
    assert.deepEqual(manifest.source, card.source);
  }
});
