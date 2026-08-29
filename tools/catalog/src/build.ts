import { access, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const appDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(appDir, "../../..");
const worksDir = join(rootDir, "works");
const vocabularyDir = join(rootDir, "vocabulary");
const writersDir = join(rootDir, "prompts", "writers");
const stylesDir = join(rootDir, "prompts", "styles");
const publicDir = join(rootDir, "apps/web/public");

type BookSource = {
  id: string;
  type?: string[];
  style: string;
  status: string;
  locales: string[];
  cover: string;
  learning?: { goals?: string[]; concepts?: string[] };
  labels: Record<string, string[]>;
};

type StorySource = {
  language: string;
  writer: string;
  title: string;
  summary: string;
  cast: Record<string, unknown>;
  chapters?: Array<{ id: string; title?: string; pages: string[] }>;
  pages: Array<{ id: string; illustration: string; lines: unknown[] }>;
  questions?: unknown[];
};

type WriterSource = {
  id: string;
  display_name: string;
  locale: string;
  recommended_levels?: string[];
  avatar: string;
  personality?: { traits?: string[]; values?: string[] };
  creative_preferences?: Record<string, unknown>;
};
type WriterProfile = {
  id: string;
  displayName: string;
  locale: string;
  recommendedLevels: string[];
  avatar: string;
  traits: string[];
  values: string[];
  creativePreferences: Record<string, unknown>;
};
type StyleSource = {
  id: string;
  display_name: string;
  thumbnail: string;
  visual_treatment?: Record<string, unknown>;
  continuity?: Record<string, unknown>;
  localizations?: Record<string, { display_name?: string; visual_treatment?: Record<string, unknown> }>;
};
type StyleProfile = {
  id: string;
  displayName: string;
  names: Record<string, string>;
  thumbnail: string;
  visualTreatment: Record<string, unknown>;
  visualTreatments: Record<string, Record<string, unknown>>;
  continuity: Record<string, unknown>;
};
type LabelSource = {
  schema_version: number;
  groups: Record<string, { names: Record<string, string>; labels: Record<string, Record<string, string>> }>;
};
type LabelCatalog = {
  schemaVersion: number;
  groups: Record<string, { names: Record<string, string>; labels: Record<string, Record<string, string>> }>;
};
type TaxonomySource = {
  schema_version: number;
  levels: Record<string, { names: Record<string, string> }>;
  categories: Record<string, { names: Record<string, string> }>;
  subcategories: Record<string, { names: Record<string, string> }>;
};
type TaxonomyCatalog = {
  schemaVersion: number;
  levels: TaxonomySource["levels"];
  categories: TaxonomySource["categories"];
  subcategories: TaxonomySource["subcategories"];
};
type VocabularySource = {
  schema_version: number;
  id: string;
  level: string;
  card: string;
  locales: Record<string, {
    term: string;
    part_of_speech: string;
    pronunciation?: string;
    definition: string;
  }>;
};
type VocabularyCatalogCard = {
  id: string;
  level: string;
  card: string;
  term: string;
  partOfSpeech: string;
  pronunciation?: string;
  definition: string;
};

const readYaml = async <T>(path: string) => YAML.parse(await readFile(path, "utf8")) as T;
const exists = async (path: string) => { try { await access(path); return true } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error } };
const writeJson = async (path: string, value: unknown) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
};
const collectVocabularyIds = (value: unknown, ids = new Set<string>()): Set<string> => {
  if (Array.isArray(value)) {
    for (const item of value) collectVocabularyIds(item, ids);
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const vocabulary = record.vocabulary;
    if (vocabulary && typeof vocabulary === "object" && typeof (vocabulary as Record<string, unknown>).id === "string") {
      ids.add((vocabulary as Record<string, string>).id);
    }
    for (const nested of Object.values(record)) collectVocabularyIds(nested, ids);
  }
  return ids;
};

async function findBookDirs(base: string, depth = 0): Promise<string[]> {
  const entries = await readdir(base, { withFileTypes: true });
  if (entries.some((entry) => entry.isFile() && entry.name === "book.yaml")) return [base];
  if (depth >= 4) return [];
  const nested = await Promise.all(
    entries.filter((entry) => entry.isDirectory()).map((entry) => findBookDirs(join(base, entry.name), depth + 1)),
  );
  return nested.flat();
}

await rm(publicDir, { recursive: true, force: true });
await mkdir(publicDir, { recursive: true });
await cp(join(rootDir, "about"), join(publicDir, "about"), { recursive: true });

const labelSource = await readYaml<LabelSource>(join(rootDir, "prompts", "labels", "index.yaml"));
const labelCatalog: LabelCatalog = { schemaVersion: labelSource.schema_version, groups: labelSource.groups };
await writeJson(join(publicDir, "labels.json"), labelCatalog);
const taxonomySource = await readYaml<TaxonomySource>(join(rootDir, "prompts", "taxonomy", "index.yaml"));
const levelOrder = Object.keys(taxonomySource.levels);
const levelRank = new Map(levelOrder.map((level, index) => [level, index]));
const compareLevels = (left: string, right: string) => (levelRank.get(left) ?? Number.MAX_SAFE_INTEGER) - (levelRank.get(right) ?? Number.MAX_SAFE_INTEGER) || left.localeCompare(right);
const taxonomyCatalog: TaxonomyCatalog = {
  schemaVersion: taxonomySource.schema_version,
  levels: taxonomySource.levels,
  categories: taxonomySource.categories,
  subcategories: taxonomySource.subcategories,
};
await writeJson(join(publicDir, "taxonomy.json"), taxonomyCatalog);

const vocabularyCatalogs = new Map<string, Map<string, VocabularyCatalogCard[]>>();
for (const levelEntry of await readdir(vocabularyDir, { withFileTypes: true })) {
  if (!levelEntry.isDirectory()) continue;
  const levelDir = join(vocabularyDir, levelEntry.name);
  for (const vocabularyEntry of await readdir(levelDir, { withFileTypes: true })) {
    if (!vocabularyEntry.isDirectory()) continue;
    const sourceDir = join(levelDir, vocabularyEntry.name);
    const entryPath = join(sourceDir, "entry.yaml");
    if (!(await exists(entryPath))) {
      console.warn(`Skipping incomplete vocabulary: ${relative(vocabularyDir, sourceDir)}`);
      continue;
    }
    const entry = await readYaml<VocabularySource>(entryPath);
    const runtimeDir = join(publicDir, "vocabulary", levelEntry.name, vocabularyEntry.name);
    await writeJson(join(publicDir, "vocabulary", levelEntry.name, `${entry.id}.json`), {
      ...entry,
      card: `vocabulary/${levelEntry.name}/${entry.id}/card.webp`,
    });
    for (const [locale, localized] of Object.entries(entry.locales)) {
      const levels = vocabularyCatalogs.get(locale) ?? new Map<string, VocabularyCatalogCard[]>();
      const entries = levels.get(levelEntry.name) ?? [];
      entries.push({
        id: entry.id,
        level: levelEntry.name,
        card: `vocabulary/${levelEntry.name}/${entry.id}/card.webp`,
        term: localized.term,
        partOfSpeech: localized.part_of_speech,
        pronunciation: localized.pronunciation,
        definition: localized.definition,
      });
      levels.set(levelEntry.name, entries);
      vocabularyCatalogs.set(locale, levels);
    }
    try {
      await cp(join(sourceDir, "card.webp"), join(runtimeDir, "card.webp"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}

const vocabularyPageSize = 48;
const vocabularyPages: Record<string, Record<string, { count: number; pages: string[] }>> = {};
for (const [locale, levels] of vocabularyCatalogs) {
  vocabularyPages[locale] = {};
  for (const [level, entries] of levels) {
    entries.sort((left, right) => left.term.localeCompare(right.term, locale));
    const pageUrls: string[] = [];
    for (let offset = 0; offset < entries.length; offset += vocabularyPageSize) {
      const pageNumber = Math.floor(offset / vocabularyPageSize) + 1;
      const pageUrl = `vocabulary/catalog/${locale}/${level}/${pageNumber}.json`;
      await writeJson(join(publicDir, "vocabulary", "catalog", locale, level, `${pageNumber}.json`), entries.slice(offset, offset + vocabularyPageSize));
      pageUrls.push(pageUrl);
    }
    vocabularyPages[locale][level] = { count: entries.length, pages: pageUrls };
  }
}
await writeJson(join(publicDir, "vocabulary", "index.json"), {
  schemaVersion: 1,
  pageSize: vocabularyPageSize,
  levels: taxonomyCatalog.levels,
  locales: vocabularyPages,
});

const writerProfiles = new Map<string, WriterProfile>();
const writerCatalogs = new Map<string, WriterProfile[]>();
for (const localeEntry of await readdir(writersDir, { withFileTypes: true })) {
  if (!localeEntry.isDirectory()) continue;
  const locale = localeEntry.name;
  const profiles: WriterProfile[] = [];
  for (const writerEntry of await readdir(join(writersDir, locale), { withFileTypes: true })) {
    if (!writerEntry.isDirectory()) continue;
    const sourceDir = join(writersDir, locale, writerEntry.name);
    const source = await readYaml<WriterSource>(join(sourceDir, "prompt.yaml"));
    const runtimeDir = join(publicDir, "writers", locale, source.id);
    const profile: WriterProfile = {
      id: source.id,
      displayName: source.display_name,
      locale: source.locale,
      recommendedLevels: source.recommended_levels ?? [],
      avatar: `writers/${locale}/${source.id}/avatar.webp`,
      traits: source.personality?.traits ?? [],
      values: source.personality?.values ?? [],
      creativePreferences: source.creative_preferences ?? {},
    };
    writerProfiles.set(`${locale}/${source.id}`, profile);
    profiles.push(profile);
    await writeJson(join(publicDir, "writers", locale, `${source.id}.json`), profile);
    await cp(join(sourceDir, source.avatar), join(runtimeDir, "avatar.webp"));
  }
  profiles.sort((left, right) => left.displayName.localeCompare(right.displayName, locale));
  writerCatalogs.set(locale, profiles);
  await writeJson(join(publicDir, "writers", locale, "index.json"), {
    schemaVersion: 1,
    locale,
    profiles: profiles.map((profile) => ({ id: profile.id, url: `writers/${locale}/${profile.id}.json` })),
  });
}
await writeJson(join(publicDir, "writers", "index.json"), {
  schemaVersion: 1,
  locales: Object.fromEntries([...writerCatalogs.keys()].sort().map((locale) => [locale, `writers/${locale}/index.json`])),
});

const styleProfiles = new Map<string, StyleProfile>();
for (const styleEntry of await readdir(stylesDir, { withFileTypes: true })) {
  if (!styleEntry.isDirectory()) continue;
  const sourceDir = join(stylesDir, styleEntry.name);
  const source = await readYaml<StyleSource>(join(sourceDir, "prompt.yaml"));
  const runtimeDir = join(publicDir, "styles", source.id);
  const names = Object.fromEntries(Object.entries(source.localizations ?? {}).map(([locale, localized]) => [locale, localized.display_name ?? source.display_name]));
  const visualTreatments = Object.fromEntries(Object.entries(source.localizations ?? {}).map(([locale, localized]) => [locale, localized.visual_treatment ?? source.visual_treatment ?? {}]));
  const profile: StyleProfile = {
    id: source.id,
    displayName: source.display_name,
    names: { "en-US": source.display_name, ...names },
    thumbnail: `styles/${source.id}/thumbnail.webp`,
    visualTreatment: source.visual_treatment ?? {},
    visualTreatments: { "en-US": source.visual_treatment ?? {}, ...visualTreatments },
    continuity: source.continuity ?? {},
  };
  styleProfiles.set(source.id, profile);
  await writeJson(join(publicDir, "styles", `${source.id}.json`), profile);
  await cp(join(sourceDir, source.thumbnail), join(runtimeDir, "thumbnail.webp"));
}
await writeJson(join(publicDir, "styles", "index.json"), {
  schemaVersion: 1,
  profiles: [...styleProfiles.values()].sort((left, right) => left.displayName.localeCompare(right.displayName)).map((profile) => ({ id: profile.id, url: `styles/${profile.id}.json` })),
});

const cards: Array<Record<string, unknown>> = [];
const searchByLocale = new Map<string, Array<Record<string, unknown>>>();
const compiledBookIds = new Set<string>();

for (const bookDir of await findBookDirs(worksDir)) {
  const pathParts = relative(worksDir, bookDir).split("/");
  const [level, category, subcategory, slug] = pathParts;
  const book = await readYaml<BookSource>(join(bookDir, "book.yaml"));
  if (compiledBookIds.has(book.id)) throw new Error(`Duplicate book id ${book.id}`);
  const requiredSources = [join(bookDir, book.cover), ...book.locales.map((locale) => join(bookDir, "locales", locale, "story.yaml"))];
  if (!(await Promise.all(requiredSources.map(exists))).every(Boolean)) {
    console.warn(`Skipping incomplete work: ${relative(worksDir, bookDir)}`);
    continue;
  }
  const stories: StorySource[] = [];
  for (const locale of book.locales) {
    stories.push(await readYaml<StorySource>(join(bookDir, "locales", locale, "story.yaml")));
  }
  const illustrationPaths = [...new Set(stories.flatMap((story) => story.pages.map((page) => join(bookDir, "artwork", `${page.illustration}.webp`))))];
  const missingIllustrations = (await Promise.all(illustrationPaths.map(async (illustrationPath) => await exists(illustrationPath) ? null : illustrationPath))).filter((illustrationPath): illustrationPath is string => illustrationPath !== null);
  if (missingIllustrations.length > 0) {
    console.warn(`Skipping incomplete work artwork: ${relative(worksDir, bookDir)} (${missingIllustrations.length} missing page image(s))`);
    continue;
  }
  const titles = Object.fromEntries(stories.map((story) => [story.language, story.title]));
  const summaries = Object.fromEntries(stories.map((story) => [story.language, story.summary]));
  const writers = Object.fromEntries(stories.map((story) => {
    const writer = writerProfiles.get(`${story.language}/${story.writer}`);
    if (!writer) throw new Error(`Unknown writer ${story.language}/${story.writer} in ${relative(worksDir, bookDir)}`);
    return [story.language, writer];
  }));
  const style = styleProfiles.get(book.style);
  if (!style) throw new Error(`Unknown style ${book.style} in ${relative(worksDir, bookDir)}`);
  const cardWriters = Object.fromEntries(Object.entries(writers).map(([locale, writer]) => [locale, { id: writer.id, displayName: writer.displayName }]));
  const cardStyle = { id: style.id, displayName: style.displayName, names: style.names };
  const sourcePath = `${level}/${category}/${subcategory}/${slug}`;
  const runtimePath = book.id;
  compiledBookIds.add(book.id);
  const card = {
    id: book.id,
    path: runtimePath,
    manifest: `works/${runtimePath}/index.json`,
    level,
    category,
    subcategory,
    type: book.type ?? [],
    style: cardStyle,
    status: book.status,
    locales: book.locales,
    titles,
    summaries,
    writers: cardWriters,
    concepts: book.learning?.concepts ?? [],
    labels: book.labels,
    pageCount: stories[0]?.pages.length ?? 0,
    cover: `works/${runtimePath}/${book.cover}`,
  };
  cards.push(card);

  const illustrationIds = [...new Set(stories.flatMap((story) => story.pages.map((page) => page.illustration)))];
  const vocabularyIds = [...collectVocabularyIds(stories)].sort();
  const localeManifests = Object.fromEntries(stories.map((story) => [story.language, {
    title: story.title,
    summary: story.summary,
    story: `works/${runtimePath}/${story.language}.json`,
    writer: {
      id: writers[story.language].id,
      displayName: writers[story.language].displayName,
      profile: `writers/${story.language}/${writers[story.language].id}.json`,
    },
  }]));
  await writeJson(join(publicDir, "works", runtimePath, "index.json"), {
    ...book,
    schemaVersion: 2,
    sourcePath,
    level,
    category,
    subcategory,
    availableLocales: book.locales,
    locales: localeManifests,
    cover: `works/${runtimePath}/${book.cover}`,
    artwork: {
      cover: `works/${runtimePath}/${book.cover}`,
      pages: Object.fromEntries(illustrationIds.map((id) => [id, `works/${runtimePath}/artwork/${id}.webp`])),
    },
    style: { ...cardStyle, profile: `styles/${style.id}.json` },
    writers: Object.fromEntries(Object.entries(writers).map(([locale, writer]) => [locale, {
      id: writer.id,
      displayName: writer.displayName,
      profile: `writers/${locale}/${writer.id}.json`,
    }])),
    vocabulary: {
      level,
      entries: Object.fromEntries(vocabularyIds.map((id) => [id, `vocabulary/${level}/${id}.json`])),
    },
  });
  for (const story of stories) {
    await writeJson(join(publicDir, "works", runtimePath, `${story.language}.json`), story);
    const entries = searchByLocale.get(story.language) ?? [];
    entries.push({ ...card, title: story.title, summary: story.summary, writer: cardWriters[story.language] });
    searchByLocale.set(story.language, entries);
  }
  await cp(join(bookDir, "artwork"), join(publicDir, "works", runtimePath, "artwork"), { recursive: true });
}

for (const [locale, entries] of searchByLocale) {
  await writeJson(join(publicDir, "catalog", `home-${locale}.json`), {
    schemaVersion: 1,
    bookCount: cards.length,
    localeCount: searchByLocale.size,
    readableCount: entries.length,
    taxonomy: taxonomyCatalog,
    cards: entries.slice(0, 12),
  });
}

const shardGroups = new Map<string, typeof cards>();
for (const card of cards) {
  const key = `${card.level}/${card.category}/${card.subcategory}`;
  const group = shardGroups.get(key) ?? [];
  group.push(card);
  shardGroups.set(key, group);
}
const catalogs = [...shardGroups.entries()].map(([key, entries]) => {
  const [level, category, subcategory] = key.split("/");
  const id = `${level}-${category}-${subcategory}`;
  return { id, level, category, subcategory, count: entries.length, url: `catalog/${id}.json` };
});
for (const catalog of catalogs) {
  await writeJson(join(publicDir, "catalog", `${catalog.id}.json`), shardGroups.get(`${catalog.level}/${catalog.category}/${catalog.subcategory}`));
}

await writeJson(join(publicDir, "catalog.json"), {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  bookCount: cards.length,
  localeCount: searchByLocale.size,
  locales: [...searchByLocale.keys()].sort(),
  levels: [...new Set(cards.map((card) => card.level))].sort(compareLevels),
  categories: [...new Set(cards.map((card) => card.category))].sort(),
  catalogs,
  shards: catalogs.map((catalog) => catalog.url),
  labels: "labels.json",
  taxonomy: taxonomyCatalog,
  pages: {
    home: Object.fromEntries([...searchByLocale.keys()].map((locale) => [locale, `catalog/home-${locale}.json`])),
    catalog: "catalog.json",
    writers: Object.fromEntries([...writerCatalogs.keys()].map((locale) => [locale, `writers/${locale}/index.json`])),
    styles: "styles/index.json",
    vocabulary: "vocabulary/index.json",
  },
});

console.log(`Compiled ${cards.length} book(s) in ${searchByLocale.size} locale(s).`);
