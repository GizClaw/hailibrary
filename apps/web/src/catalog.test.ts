import assert from "node:assert/strict";
import test from "node:test";

import { bookCardLocaleView, catalogSeriesOptions, filterAndSortCatalogBySeries, flattenSeriesBooks, isMultiVolume, localizeBookCard, READING_LEVEL_ORDER, resolveContentLocale, searchSeries, selectHomeSeriesCards, sortReadingLevels, type BookCard, type CatalogTaxonomy, type LabelCatalog, type SeriesCard, type SeriesManifest } from "./catalog.ts";

test("Reading levels preserve AA, A-Z, Z1, Z2 order", () => {
  assert.equal(READING_LEVEL_ORDER.length, 29);
  assert.deepEqual(sortReadingLevels(["z2", "b", "aa", "z1", "a", "z"]), ["aa", "a", "b", "z", "z1", "z2"]);
});

const card: BookCard = {
  id: "the-acorn-boat",
  path: "the-acorn-boat",
  manifest: "works/the-acorn-boat/index.json",
  level: "a",
  category: "fiction",
  subcategory: "animals",
  locales: ["en-US", "zh-CN"],
  titles: { "en-US": "The Acorn Boat", "zh-CN": "橡果小船" },
  summaries: { "en-US": "An acorn boat carries two friends.", "zh-CN": "橡果小船载着两个朋友。" },
  writers: { "en-US": { id: "mossy-kite", displayName: "Mossy Kite" }, "zh-CN": { id: "溪铃", displayName: "溪铃" } },
  style: { id: "watercolor", displayName: "Watercolor", names: { "en-US": "Watercolor", "zh-CN": "水彩" } },
  concepts: ["sharing"],
  labels: { topics: ["animals", "adventure"], themes: ["cooperation"] },
  pageCount: 6,
  cover: "works/the-acorn-boat/artwork/cover.webp",
  source: { series: "the-acorn-journey", volume: 1, volumes: 2 },
  title: "橡果小船",
  summary: "橡果小船载着两个朋友。",
  writer: { id: "溪铃", displayName: "溪铃" },
};

const taxonomy: CatalogTaxonomy = {
  schemaVersion: 1,
  levels: { a: { names: { "en-US": "Level A", "zh-CN": "A 级" } } },
  categories: { fiction: { names: { "en-US": "Fiction", "zh-CN": "虚构" } } },
  subcategories: { animals: { names: { "en-US": "Animals", "zh-CN": "动物" } } },
};

const labels: LabelCatalog = {
  schemaVersion: 1,
  groups: {
    topics: { names: { "en-US": "Topics", "zh-CN": "题材" }, labels: { animals: { "en-US": "Animals", "zh-CN": "动物" }, adventure: { "en-US": "Adventure", "zh-CN": "冒险" } } },
    themes: { names: { "en-US": "Themes", "zh-CN": "主题" }, labels: { cooperation: { "en-US": "Cooperation", "zh-CN": "合作" } } },
  },
};

test("book cards use the learning locale for content and the interface locale for chrome", () => {
  const view = bookCardLocaleView(card, taxonomy, labels, "zh-CN", "en-US");

  assert.equal(view.contentLocale, "en-US");
  assert.equal(view.card.title, "The Acorn Boat");
  assert.equal(view.card.summary, "An acorn boat carries two friends.");
  assert.equal(view.card.writer.displayName, "Mossy Kite");
  assert.equal(view.category, "Fiction");
  assert.equal(view.subcategory, "Animals");
  assert.deepEqual(view.labels, ["Animals", "Adventure", "Cooperation"]);
  assert.equal(view.level, "A 级");
  assert.equal(view.pageUnit, "页");
  assert.equal(view.writerLabel, "作家");
});

test("book locale selection falls back to an available edition", () => {
  assert.equal(resolveContentLocale("ja-JP", card.locales), "en-US");
  assert.equal(resolveContentLocale("ja-JP", ["zh-CN"]), "zh-CN");
  assert.equal(localizeBookCard(card, "ja-JP").title, "The Acorn Boat");
});

test("book cards preserve their source-series position", () => {
  const localized = localizeBookCard(card, "en-US");
  assert.deepEqual(localized.source, { series: "the-acorn-journey", volume: 1, volumes: 2 });
});

test("volume navigation metadata is shown only for actual multi-volume books", () => {
  assert.equal(isMultiVolume({}), false);
  assert.equal(isMultiVolume({ volumes: 1 }), false);
  assert.equal(isMultiVolume({ volumes: 2 }), true);
});

test("series filter options use interface-localized series titles and include catalog-only series", () => {
  const makeSeries = (id: string, titles: Record<string, string>): SeriesCard => ({ id, titles, manifest: `series/${id}/index.json`, category: "fiction", genre: "adventure", style: "watercolor", labels: {}, availableLocales: Object.keys(titles), writers: {}, cover: `series/${id}/cover.webp`, bookSetCount: 1, bookCount: 1 });
  const series = [makeSeries("the-acorn-journey", { "en-US": "The Acorn Journey", "zh-CN": "橡果之旅" }), makeSeries("a-new-work", { "en-US": "A New Work", "zh-CN": "一个新作品" })];

  assert.deepEqual(catalogSeriesOptions([card], series, "zh-CN"), [
    { id: "the-acorn-journey", title: "橡果之旅" },
    { id: "a-new-work", title: "一个新作品" },
  ]);
});

test("selected series is filtered and sorted by reading level then volume", () => {
  const makeCard = (id: string, level: string, series: string, volume: number): BookCard => ({ ...card, id, level, source: { series, volume, volumes: 3 } });
  const cards = [makeCard("oak-c-2", "c", "oak", 2), makeCard("river-a-1", "a", "river", 1), makeCard("oak-a-3", "a", "oak", 3), makeCard("oak-a-1", "a", "oak", 1)];

  assert.deepEqual(filterAndSortCatalogBySeries(cards, "oak").map((item) => item.id), ["oak-a-1", "oak-a-3", "oak-c-2"]);
  assert.deepEqual(filterAndSortCatalogBySeries(cards, "all").map((item) => item.id), cards.map((item) => item.id));
});

test("home recommendations select the first volume from each series' lowest level set", () => {
  const makeCard = (id: string, level: string, series: string, volume: number): BookCard => ({ ...card, id, level, source: { series, volume, volumes: 2 } });
  const cards = [
    makeCard("oak-d-2", "d", "oak", 2),
    makeCard("river-b-2", "b", "river", 2),
    makeCard("oak-a-2", "a", "oak", 2),
    makeCard("river-b-1", "b", "river", 1),
    makeCard("oak-a-1", "a", "oak", 1),
  ];

  assert.deepEqual(selectHomeSeriesCards(cards).map((item) => item.id), ["oak-a-1", "river-b-1"]);
});

test("home recommendations treat books without a source as separate series", () => {
  const standaloneOne = { ...card, id: "standalone-one", source: undefined };
  const standaloneTwo = { ...card, id: "standalone-two", source: undefined };

  assert.deepEqual(selectHomeSeriesCards([standaloneOne, standaloneTwo]).map((item) => item.id), ["standalone-one", "standalone-two"]);
});

test("series book groups flatten in taxonomy-group and volume order", () => {
  const groups: SeriesManifest["bookGroups"] = [
    { level: "a", books: [{ id: "a-1", level: "a", volume: 1, volumes: 2, titles: {}, cover: "a.webp", manifest: "works/a-1/index.json" }, { id: "a-2", level: "a", volume: 2, volumes: 2, titles: {}, cover: "b.webp", manifest: "works/a-2/index.json" }] },
    { level: "d", books: [{ id: "d-1", level: "d", volume: 1, volumes: 1, titles: {}, cover: "d.webp", manifest: "works/d-1/index.json" }] },
  ];
  assert.deepEqual(flattenSeriesBooks(groups).map(({ id, level, volume }) => ({ id, level, volume })), [{ id: "a-1", level: "a", volume: 1 }, { id: "a-2", level: "a", volume: 2 }, { id: "d-1", level: "d", volume: 1 }]);
});

test("series search includes localized titles, type, and Writers", () => {
  const series = { id: "mountains", manifest: "series/mountains/index.json", category: "fiction", genre: "folktale", style: "woodblock", labels: {}, availableLocales: ["en-US", "zh-CN"], titles: { "en-US": "The Road", "zh-CN": "愚公移山" }, writers: { "en-US": { id: "lantern", displayName: "Manypath Lantern" }, "zh-CN": { id: "百径灯", displayName: "百径灯" } }, cover: "series/mountains/cover.webp", bookSetCount: 2, bookCount: 5 } satisfies SeriesCard;
  assert.equal(searchSeries([series], "愚公").length, 1);
  assert.equal(searchSeries([series], "folktale").length, 1);
  assert.equal(searchSeries([series], "missing").length, 0);
});
