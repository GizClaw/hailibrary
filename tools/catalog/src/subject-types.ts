export type ReadingLanguage = "en-US" | "zh-CN";
export type Citation = { title: string; url?: string };
export type AlbumSummary = { id: string; title: string; total: number; readable: number };
export type SubjectMenu = { id: string; title: string; en: string; albums: AlbumSummary[] };
export type Subject = { id: string; title: string; en: string; language: ReadingLanguage; menus: SubjectMenu[] };
export type SubjectIndex = { schemaVersion: 1; subjects: Subject[] };

type SourceLocation = { path: string; fragment?: string; id?: string };
type PositionBase = { id: string; title: string; label?: string; originalOrder: string; source: SourceLocation };
export type Bibliography = { edition: string; official?: Citation };
export type Position = PositionBase & (
  | { work: string; unavailable?: never; bibliography?: never }
  | { unavailable: "textbook-edition"; work?: never; bibliography?: Bibliography }
);
export type SubjectAlbum = {
  id: string;
  source: string;
  title: string;
  description?: string;
  bibliography?: Bibliography;
  positions: Position[];
};
export type SubjectWork = {
  id: string;
  language: ReadingLanguage;
  title: string;
  author: string;
  rights: "original" | "public-domain" | "cc0";
  sources: Citation[];
  age?: string;
  markdown: string;
};
