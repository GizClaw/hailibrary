export type ReadingLanguage = "en-US" | "zh-CN";
export type Citation = { title: string; url?: string };
export type AlbumSummary = { id: string; title: string; englishTitle?: string; total: number; readable: number };
export type SubjectMenu = { id: string; title: string; en: string; albums: AlbumSummary[] };
export type Subject = {
  id: string;
  title: string;
  en: string;
  language: ReadingLanguage;
  availableLocales?: ["zh-CN", "en-US"];
  menus: SubjectMenu[];
};
export type SubjectIndex = { schemaVersion: 1; subjects: Subject[] };

type SourceLocation = { path: string; fragment?: string; id?: string };
type PositionBase = { id: string; title: string; englishTitle?: string; label?: string; originalOrder: string; source: SourceLocation };
export type EditionLink = { title: string; url: string };
export type Bibliography = { edition: string; official?: Citation; catalog?: EditionLink };
export type ReadingEdition = "matching-text" | "classical-source" | "original-excerpt";
export type Position = PositionBase & (
  | { work: string; unavailable?: never; bibliography?: Bibliography; readingEdition?: ReadingEdition; relatedReading?: never }
  | { unavailable: "textbook-edition"; work?: never; bibliography?: Bibliography; readingEdition?: never; relatedReading?: EditionLink }
);
export type SubjectAlbum = {
  id: string;
  source: string;
  title: string;
  englishTitle?: string;
  description?: string;
  bibliography?: Bibliography;
  positions: Position[];
};
export type ReadingText = { title: string; markdown: string };
export type SubjectWork = ReadingText & {
  id: string;
  language: ReadingLanguage;
  author: string;
  rights: "original" | "public-domain" | "cc0";
  sources: Citation[];
  age?: string;
};
