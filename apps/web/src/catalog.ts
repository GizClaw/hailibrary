export type WriterProfile = { id: string; displayName: string; locale: string; recommendedLevels: string[]; avatar: string; traits: string[]; values: string[]; creativePreferences: Record<string, unknown> };
export type StyleProfile = { id: string; displayName: string; names: Record<string, string>; thumbnail: string; visualTreatment: Record<string, unknown>; visualTreatments: Record<string, Record<string, unknown>>; continuity: Record<string, unknown> };
export type WriterSummary = Pick<WriterProfile, "id" | "displayName">;
export type StyleSummary = Pick<StyleProfile, "id" | "displayName" | "names">;
export type LabelCatalog = { schemaVersion: number; groups: Record<string, { names: Record<string, string>; labels: Record<string, Record<string, string>> }> };
export type TaxonomyGroup = Record<string, { names: Record<string, string> }>;
export type CatalogTaxonomy = { schemaVersion: number; levels: TaxonomyGroup; categories: TaxonomyGroup; subcategories: TaxonomyGroup };
export type CatalogShard = { id: string; level: string; category: string; subcategory: string; count: number; url: string };
export type SiteIndex = { schemaVersion: number; generatedAt: string; bookCount: number; localeCount: number; locales: string[]; levels: string[]; categories: string[]; catalogs: CatalogShard[]; shards: string[]; labels: string; taxonomy: CatalogTaxonomy; pages: { home: Record<string, string>; catalog: string; writers: Record<string, string>; styles: string; vocabulary: string } };
export type HomePageData = { schemaVersion: number; bookCount: number; localeCount: number; readableCount: number; taxonomy: CatalogTaxonomy; cards: BookCard[] };
export type CatalogPageIndex = SiteIndex;
export type BookCard = { id: string; path: string; manifest: string; level: string; category: string; subcategory: string; locales: string[]; titles: Record<string, string>; summaries: Record<string, string>; writers: Record<string, WriterSummary>; style: StyleSummary; concepts: string[]; labels: Record<string, string[]>; pageCount: number; cover: string; title: string; summary: string; writer: WriterSummary };
type BookCardSource = Omit<BookCard, "title" | "summary" | "writer">;
export type StoryContentPart = { text?: string; vocabulary?: { id: string; text: string } };
export type StoryQuestion = { id: string; type: string; speaker: string; prompt: string; answer: string; page_refs: string[] };
export type Story = { language: string; writer: string; title: string; summary: string; cast: Record<string, { display_name: string }>; pages: Array<{ id: string; illustration: string; lines: Array<{ speaker: string; text?: string; content?: StoryContentPart[] }> }>; questions?: StoryQuestion[] };
export type Book = { id: string; level: string; category: string; subcategory: string; cover: string; availableLocales: string[]; locales: Record<string, { title: string; summary: string; story: string; writer: WriterSummary & { profile: string } }>; artwork: { cover: string; pages: Record<string, string> }; vocabulary: { level: string; entries: Record<string, string> } };
export type VocabularyEntry = { id: string; card: string; locales: Record<string, { term: string; part_of_speech: string; pronunciation?: string; definition: string }> };
export type VocabularyCatalogCard = { id: string; level: string; card: string; term: string; partOfSpeech: string; pronunciation?: string; definition: string };
export type VocabularyPageIndex = { schemaVersion: number; pageSize: number; levels: TaxonomyGroup; locales: Record<string, Record<string, { count: number; pages: string[] }>> };

export const READING_LEVEL_ORDER = ["aa", ..."abcdefghijklmnopqrstuvwxyz", "z1", "z2"];
const readingLevelRank = new Map(READING_LEVEL_ORDER.map((level, index) => [level, index]));
export const sortReadingLevels = (levels: string[]) => [...levels].sort((left, right) => (readingLevelRank.get(left) ?? Number.MAX_SAFE_INTEGER) - (readingLevelRank.get(right) ?? Number.MAX_SAFE_INTEGER) || left.localeCompare(right));

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
  return getJson<HomePageData>(index.pages.home[locale] ?? index.pages.home["en-US"]);
};
export const loadCatalogPageIndex = () => loadIndex();
export const loadSearch = async (locale: string) => {
  const index = await loadIndex();
  const shards = await Promise.all(index.catalogs.map((catalog) => getJson<BookCardSource[]>(catalog.url)));
  return shards.flat().filter((card) => card.locales.includes(locale)).map((card): BookCard => ({
    ...card,
    title: card.titles[locale] ?? card.titles["en-US"] ?? card.id,
    summary: card.summaries[locale] ?? card.summaries["en-US"] ?? "",
    writer: card.writers[locale] ?? card.writers["en-US"] ?? Object.values(card.writers)[0],
  }));
};
export const loadWriters = async (locale: string) => {
  const index = await loadIndex();
  const profileIndex = await getJson<ProfileIndex>(index.pages.writers[locale] ?? index.pages.writers["en-US"]);
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
export function searchCards(cards: BookCard[], query: string) { const needle = query.trim().normalize("NFKC").toLocaleLowerCase(); if (!needle) return cards; return cards.filter((card) => [card.title, card.summary, card.writer.displayName, card.style.displayName, ...Object.values(card.style.names ?? {}), ...Object.values(card.titles), ...Object.values(card.summaries), ...card.concepts, ...Object.values(card.labels ?? {}).flat()].join(" ").normalize("NFKC").toLocaleLowerCase().includes(needle)) }
