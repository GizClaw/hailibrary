export type WriterProfile = { id: string; kind?: "persona" | "author"; author?: { name: string; born?: number | string; died?: number | string; countries?: string[] }; bio?: string; displayName: string; locale: string; recommendedLevels: string[]; avatar: string | null; traits: string[]; values: string[]; creativePreferences: Record<string, unknown> };
export type StyleProfile = { id: string; displayName: string; names: Record<string, string>; thumbnail: string; visualTreatment: Record<string, unknown>; visualTreatments: Record<string, Record<string, unknown>>; continuity: Record<string, unknown> };
export type WriterSummary = Pick<WriterProfile, "id" | "displayName">;
export type StyleSummary = Pick<StyleProfile, "id" | "displayName" | "names">;
export type LabelCatalog = { schemaVersion: number; groups: Record<string, { names: Record<string, string>; labels: Record<string, Record<string, string>> }> };
export type TaxonomyGroup = Record<string, { names: Record<string, string> }>;
export type CatalogTaxonomy = { schemaVersion: number; levels: TaxonomyGroup; categories: TaxonomyGroup; subcategories: TaxonomyGroup };
export type CatalogShard = { id: string; level: string; category: string; subcategory: string; count: number; url: string };
export type SiteIndex = { schemaVersion: number; generatedAt: string; bookCount: number; localeCount: number; locales: string[]; levels: string[]; categories: string[]; catalogs: CatalogShard[]; shards: string[]; labels: string; taxonomy: CatalogTaxonomy; pages: { home: Record<string, string>; catalog: string; writers: Record<string, string>; styles: string; vocabulary: string; series: string } };
export type HomePageData = { schemaVersion: number; bookCount: number; localeCount: number; readableCount: number; taxonomy: CatalogTaxonomy; cards: BookCard[] };
export type CatalogPageIndex = SiteIndex;
export type BookSource = { article: string; volume: number; volumes: number; titles?: Record<string, string> };
export type BookCard = { id: string; path: string; manifest: string; level: string; category: string; subcategory: string; locales: string[]; titles: Record<string, string>; summaries: Record<string, string>; writers: Record<string, WriterSummary>; style: StyleSummary; concepts: string[]; labels: Record<string, string[]>; pageCount: number; cover: string; source?: BookSource; title: string; summary: string; writer: WriterSummary; contentLocale?: string };
type BookCardSource = Omit<BookCard, "title" | "summary" | "writer" | "contentLocale">;
export type StoryContentPart = { text?: string; vocabulary?: { id: string; text: string } };
export type StoryBlock = { id?: string; speaker: string; text?: string; content?: StoryContentPart[] };
export type StoryPage = { id: string; illustration: string; lines?: StoryBlock[]; blocks?: StoryBlock[] };
export type ArticleParagraph = { text?: string; content?: StoryContentPart[] };
export type ArticlePage = { id: string; illustration: string; paragraphs: ArticleParagraph[] };
export type StoryQuestion = { id: string; type: string; speaker: string; prompt: string; answer: string; page_refs: string[] };
export type Story = {
  language: string;
  writer: string;
  title: string;
  summary: string;
  article?: { pages: ArticlePage[] };
  audio_script?: { cast: Record<string, { display_name: string }>; pages: StoryPage[] };
  cast?: Record<string, { display_name: string }>;
  pages?: StoryPage[];
  questions?: StoryQuestion[];
};
export const storyPageBlocks = (page: StoryPage) => page.blocks ?? page.lines ?? [];
export const storyArticlePages = (story: Story): ArticlePage[] => story.article?.pages ?? (story.pages ?? []).map((page) => ({
  id: page.id,
  illustration: page.illustration,
  paragraphs: [{ content: storyPageBlocks(page).flatMap((block, index) => [
    ...(index > 0 ? [{ text: story.language.startsWith("zh") ? "" : " " }] : []),
    ...(block.text ? [{ text: block.text }] : block.content ?? []),
  ]) }],
}));
export const storyAudioPages = (story: Story) => story.audio_script?.pages ?? story.pages ?? [];
export const storyCast = (story: Story) => story.audio_script?.cast ?? story.cast ?? {};
export type Book = { id: string; level: string; category: string; subcategory: string; cover: string; source?: BookSource; availableLocales: string[]; locales: Record<string, { title: string; summary: string; story: string; writer: WriterSummary & { profile: string } }>; artwork: { cover: string; pages: Record<string, string> }; vocabulary: { level: string; entries: Record<string, string> } };
export type SeriesBook = { id: string; level: string; volume: number; volumes: number; titles: Record<string, string>; cover: string; manifest: string };
export type AgeRange = { min: number; max?: number };
export type OriginalWork = { title?: string; author?: string; author_names?: Record<string, string>; countries?: string[]; year?: number; language?: string };
export type SeriesCard = { kind?: "article" | "collection"; original?: OriginalWork; chapterCount?: number; localeCounts?: Record<string, number>; audioCounts?: Record<string, number>; id: string; seriesId?: string; manifest: string; type?: string; typeNames?: Record<string, string>; category: string; genre: string; ageRange: AgeRange; style: string; labels: Record<string, string[]>; levels: string[]; availableLocales: string[]; titles: Record<string, string>; writers: Record<string, WriterSummary>; cover: string | null; bookSetCount: number; bookCount: number };
export type SeriesIndex = { schemaVersion: number; count: number; articleTypes: Record<string, { names: Record<string, string> }>; series: SeriesCard[] };
export type ArticleFilters = { query?: string; type?: string; classification?: string; age?: string; writer?: string; style?: string; topic?: string; theme?: string; mood?: string; level?: string };
export type SeriesArticle = { schemaVersion: number; language: string; title: string; chapters: Array<{ title: string; paragraphs: string[] }> };
export type SeriesManifest = SeriesCard & { schemaVersion: number; characters: Array<{ id: string; description: string }>; locales: Record<string, { title: string; writer?: WriterSummary & { profile: string }; translator?: string; sourceUrl?: string; article: string; audioScript?: string }>; bookGroups: Array<{ level: string; books: SeriesBook[] }> };
export type CollectionChapter = { id: string; titles: Record<string, string>; availableLocales: string[]; audioLocales: string[]; manifest: string };
export type CollectionManifest = SeriesCard & { schemaVersion: number; chapters: CollectionChapter[] };
export type VocabularyEntry = { id: string; card: string; locales: Record<string, { term: string; part_of_speech: string; pronunciation?: string; definition: string }> };
export type VocabularyCatalogCard = { id: string; level: string; card: string; term: string; partOfSpeech: string; pronunciation?: string; definition: string };
export type VocabularyPageIndex = { schemaVersion: number; pageSize: number; levels: TaxonomyGroup; locales: Record<string, Record<string, { count: number; pages: string[] }>> };

export const READING_LEVEL_ORDER = ["aa", ..."abcdefghijklmnopqrstuvwxyz", "z1", "z2"];
const readingLevelRank = new Map(READING_LEVEL_ORDER.map((level, index) => [level, index]));
export const sortReadingLevels = (levels: string[]) => [...levels].sort((left, right) => (readingLevelRank.get(left) ?? Number.MAX_SAFE_INTEGER) - (readingLevelRank.get(right) ?? Number.MAX_SAFE_INTEGER) || left.localeCompare(right));

export const isMultiVolume = (source: { volumes?: number }) => (source.volumes ?? 1) > 1;

export type SeriesFilterOption = { id: string; title: string };

export function catalogSeriesOptions(cards: Array<Pick<BookCard, "source">>, series: SeriesCard[], locale: string): SeriesFilterOption[] {
  const seriesById = new Map(series.map((item) => [item.id, item]));
  const sourcedCards = cards.filter((card): card is { source: BookSource } => Boolean(card.source));
  const sourceTitles = new Map(sourcedCards.map((card) => [card.source.article, card.source.titles ?? {}]));
  return [...new Set([...series.map((item) => item.id), ...sourcedCards.map((card) => card.source.article)])]
    .map((id) => ({ id, title: localizedValue(seriesById.get(id)?.titles ?? sourceTitles.get(id) ?? {}, locale, id) }))
    .sort((left, right) => left.title.localeCompare(right.title, locale) || left.id.localeCompare(right.id));
}

export function filterAndSortCatalogBySeries<T extends { id: string; level: string; source?: BookSource }>(cards: T[], seriesId: string) {
  if (seriesId === "all") return [...cards];
  return cards
    .filter((card): card is T & { source: BookSource } => card.source?.article === seriesId)
    .sort((left, right) => (readingLevelRank.get(left.level) ?? Number.MAX_SAFE_INTEGER) - (readingLevelRank.get(right.level) ?? Number.MAX_SAFE_INTEGER)
      || left.level.localeCompare(right.level)
      || left.source.volume - right.source.volume
      || left.id.localeCompare(right.id));
}

export function selectHomeSeriesCards<T extends { id: string; level: string; source?: BookSource }>(cards: T[]) {
  const selected = new Map<string, T>();
  for (const card of cards) {
    const seriesKey = card.source ? `article:${card.source.article}` : `book:${card.id}`;
    const current = selected.get(seriesKey);
    if (!current) {
      selected.set(seriesKey, card);
      continue;
    }
    const levelDifference = (readingLevelRank.get(card.level) ?? Number.MAX_SAFE_INTEGER) - (readingLevelRank.get(current.level) ?? Number.MAX_SAFE_INTEGER)
      || card.level.localeCompare(current.level);
    if (levelDifference < 0 || (levelDifference === 0 && (card.source?.volume ?? Number.MAX_SAFE_INTEGER) < (current.source?.volume ?? Number.MAX_SAFE_INTEGER))) {
      selected.set(seriesKey, card);
    }
  }
  return [...selected.values()];
}

export function resolveContentLocale(requestedLocale: string, availableLocales: string[]) {
  return availableLocales.includes(requestedLocale)
    ? requestedLocale
    : availableLocales.includes("en-US")
      ? "en-US"
      : availableLocales[0] ?? requestedLocale;
}

export function localizedValue(values: Record<string, string>, locale: string, fallback = "") {
  return values[locale] ?? values["en-US"] ?? Object.values(values)[0] ?? fallback;
}

export function localizeBookCard(card: BookCardSource | BookCard, requestedLocale: string): BookCard {
  const contentLocale = resolveContentLocale(requestedLocale, card.locales);
  const writer = card.writers[contentLocale] ?? card.writers["en-US"] ?? Object.values(card.writers)[0] ?? { id: "unknown", displayName: "" };
  return {
    ...card,
    contentLocale,
    title: localizedValue(card.titles, contentLocale, card.id),
    summary: localizedValue(card.summaries, contentLocale),
    writer,
  };
}

export function bookCardLocaleView(card: BookCardSource | BookCard, taxonomy: CatalogTaxonomy | undefined, labels: LabelCatalog | null | undefined, interfaceLocale: string, learningLocale: string) {
  const localizedCard = localizeBookCard(card, learningLocale);
  const contentLocale = localizedCard.contentLocale ?? learningLocale;
  const taxonomyName = (group: TaxonomyGroup | undefined, id: string, locale: string) => localizedValue(group?.[id]?.names ?? {}, locale, id);
  const labelName = (groupId: string, id: string) => localizedValue(labels?.groups[groupId]?.labels[id] ?? {}, contentLocale, id);
  return {
    card: localizedCard,
    contentLocale,
    category: taxonomyName(taxonomy?.categories, localizedCard.category, contentLocale),
    subcategory: taxonomyName(taxonomy?.subcategories, localizedCard.subcategory, contentLocale),
    labels: Object.entries(localizedCard.labels ?? {}).flatMap(([groupId, ids]) => ids.map((id) => labelName(groupId, id))).slice(0, 3),
    level: taxonomyName(taxonomy?.levels, localizedCard.level, interfaceLocale),
    pageUnit: interfaceLocale === "zh-CN" ? "页" : "pages",
    writerLabel: interfaceLocale === "zh-CN" ? "作家" : "Writer",
  };
}

type ProfileIndex = { schemaVersion: number; profiles: Array<{ id: string; url: string }> };
const jsonCache = new Map<string, Promise<unknown>>();
const apiUrl = (url: string) => url.startsWith("./") || url.startsWith("../") || /^https?:/.test(url) ? url : `./${url}`;
const getJson = async <T>(url: string): Promise<T> => {
  const resolved = apiUrl(url);
  const cached = jsonCache.get(resolved);
  if (cached) return cached as Promise<T>;
  const request = fetch(resolved).then((response) => {
    if (!response.ok) throw new Error(`Unable to load ${resolved}`);
    return response.json() as Promise<T>;
  });
  jsonCache.set(resolved, request);
  return request;
};

export const loadIndex = () => getJson<SiteIndex>("catalog.json");
export const loadHome = async (locale: string) => {
  const index = await loadIndex();
  const url = index.pages.home[locale] ?? index.pages.home["en-US"] ?? Object.values(index.pages.home)[0];
  const data = await getJson<HomePageData>(url);
  return { ...data, cards: data.cards.map((card) => localizeBookCard(card, locale)) };
};
export const loadCatalogPageIndex = () => loadIndex();
export const loadSearch = async (locale: string) => {
  const index = await loadIndex();
  const shards = await Promise.all(index.catalogs.map((catalog) => getJson<BookCardSource[]>(catalog.url)));
  return shards.flat().map((card) => localizeBookCard(card, locale));
};
export const loadWriters = async (locale: string) => {
  const index = await loadIndex();
  const url = index.pages.writers[locale] ?? index.pages.writers["en-US"] ?? Object.values(index.pages.writers)[0];
  const profileIndex = await getJson<ProfileIndex>(url);
  return Promise.all(profileIndex.profiles.map((profile) => getJson<WriterProfile>(profile.url)));
};
export const loadStyles = async () => {
  const index = await loadIndex();
  const profileIndex = await getJson<ProfileIndex>(index.pages.styles);
  return Promise.all(profileIndex.profiles.map((profile) => getJson<StyleProfile>(profile.url)));
};
export const loadLabels = async () => getJson<LabelCatalog>((await loadIndex()).labels);
export const loadBook = (id: string) => getJson<Book>(`works/${id}/index.json`);
export const loadStory = (id: string, locale: string) => getJson<Story>(`works/${id}/${locale}.json`);
export const loadVocabulary = (level: string, id: string) => getJson<VocabularyEntry>(`vocabulary/${level}/${id}.json`);
export const loadVocabularyPageIndex = async () => getJson<VocabularyPageIndex>((await loadIndex()).pages.vocabulary);
export const loadVocabularyCatalogPage = (url: string) => getJson<VocabularyCatalogCard[]>(url);
export const loadSeriesIndex = async () => getJson<SeriesIndex>((await loadIndex()).pages.series);
export const loadSeries = (id: string) => getJson<SeriesManifest>(`series/${id}/index.json`);
export const loadCollection = (id: string) => getJson<CollectionManifest>(`collections/${id}/index.json`);
export const loadSeriesArticle = (id: string, locale: string) => getJson<SeriesArticle>(`series/${id}/${locale}.json`);
export function searchSeries(cards: SeriesCard[], query: string) { const needle = query.trim().normalize("NFKC").toLocaleLowerCase(); if (!needle) return cards; return cards.filter((card) => [card.id, card.type, card.original?.author ?? "", ...Object.values(card.original?.author_names ?? {}), card.original?.title ?? "", ...Object.values(card.typeNames ?? {}), card.category, card.genre, card.style, ...Object.values(card.titles), ...Object.values(card.writers).flatMap((writer) => [writer.id, writer.displayName]), ...Object.values(card.labels ?? {}).flat()].join(" ").normalize("NFKC").toLocaleLowerCase().includes(needle)) }
export function filterArticles(cards: SeriesCard[], filters: ArticleFilters, readingLocale: string) {
  const selected = (value: string | undefined) => value && value !== "all" ? value : undefined;
  const type = selected(filters.type);
  const classification = selected(filters.classification);
  const writer = selected(filters.writer);
  const style = selected(filters.style);
  const age = selected(filters.age);
  const level = selected(filters.level);
  const labels = [["topics", selected(filters.topic)], ["themes", selected(filters.theme)], ["moods", selected(filters.mood)]] as const;
  return searchSeries(cards, filters.query ?? "").filter((card) => {
    const locale = resolveContentLocale(readingLocale, card.availableLocales);
    return (!type || card.type === type)
      && (!classification || classification === `category:${card.category}` || classification === `genre:${card.genre}`)
      && (!writer || card.writers[locale]?.id === writer)
      && (!style || card.style === style)
      && (!age || `${card.ageRange.min}-${card.ageRange.max ?? "plus"}` === age)
      && (!level || (card.levels ?? []).includes(level))
      && labels.every(([group, value]) => !value || (card.labels[group] ?? []).includes(value));
  });
}
export function flattenSeriesBooks(groups: SeriesManifest["bookGroups"]) { return groups.flatMap((group) => group.books.map((book) => ({ ...book, level: group.level }))) }
export function searchCards(cards: BookCard[], query: string) { const needle = query.trim().normalize("NFKC").toLocaleLowerCase(); if (!needle) return cards; return cards.filter((card) => [card.title, card.summary, card.writer.displayName, card.style.displayName, ...Object.values(card.style.names ?? {}), ...Object.values(card.titles), ...Object.values(card.summaries), ...card.concepts, ...Object.values(card.labels ?? {}).flat()].join(" ").normalize("NFKC").toLocaleLowerCase().includes(needle)) }
export type LiteratureAuthor = { name: string; names: Record<string, string>; countries: string[]; years: number[]; works: SeriesCard[] };
export function literatureAuthors(cards: SeriesCard[]): LiteratureAuthor[] {
  const authors = new Map<string, LiteratureAuthor>();
  for (const card of cards) {
    const name = card.original?.author?.trim();
    if (!name) continue;
    const author = authors.get(name) ?? { name, names: {}, countries: [], years: [], works: [] };
    Object.assign(author.names, card.original?.author_names ?? {});
    author.works.push(card);
    for (const country of card.original?.countries ?? []) if (!author.countries.includes(country)) author.countries.push(country);
    if (card.original?.year) author.years.push(card.original.year);
    authors.set(name, author);
  }
  return [...authors.values()].sort((left, right) => right.works.length - left.works.length || left.name.localeCompare(right.name));
}
