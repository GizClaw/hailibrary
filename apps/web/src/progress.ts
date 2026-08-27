export type BookProgress = { page: number; completed: boolean; updatedAt: string; quiz?: { answers: Record<string, string>; reviewed: string[]; completed: boolean } };
export type ReadingProgress = { version: 1; settings: { interfaceLocale: string; learningLocale: string }; books: Record<string, BookProgress> };
const key = "hailibrary.progress.v1";
const emptyProgress = (): ReadingProgress => ({ version: 1, settings: { interfaceLocale: "zh-CN", learningLocale: "en-US" }, books: {} });
const invalidProgressMessage = "这不是有效的“嗨！图书馆”进度文件。";
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const isStringRecord = (value: unknown) => isRecord(value) && Object.values(value).every((item) => typeof item === "string");

export function parseProgress(value: unknown): ReadingProgress {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.settings) || !isRecord(value.books)) throw new Error(invalidProgressMessage);
  if (typeof value.settings.interfaceLocale !== "string" || typeof value.settings.learningLocale !== "string") throw new Error(invalidProgressMessage);
  for (const book of Object.values(value.books)) {
    if (!isRecord(book) || typeof book.page !== "number" || !Number.isInteger(book.page) || book.page < 0 || typeof book.completed !== "boolean" || typeof book.updatedAt !== "string") throw new Error(invalidProgressMessage);
    if (book.quiz !== undefined) {
      const quiz = book.quiz;
      if (!isRecord(quiz) || !isStringRecord(quiz.answers) || !Array.isArray(quiz.reviewed) || !quiz.reviewed.every((item) => typeof item === "string") || typeof quiz.completed !== "boolean") throw new Error(invalidProgressMessage);
    }
  }
  return value as ReadingProgress;
}

export function readProgress(): ReadingProgress { try { const stored = localStorage.getItem(key); return stored ? parseProgress(JSON.parse(stored)) : emptyProgress() } catch { return emptyProgress() } }
export function writeProgress(progress: ReadingProgress) { localStorage.setItem(key, JSON.stringify(progress)); window.dispatchEvent(new Event("hailibrary-progress")) }
export function updateSettings(patch: Partial<ReadingProgress["settings"]>) { const progress = readProgress(); progress.settings = { ...progress.settings, ...patch }; writeProgress(progress) }
export function savePage(path: string, locale: string, page: number, pageCount: number) { const progress = readProgress(); const bookKey = `${path}::${locale}`; progress.books[bookKey] = { ...progress.books[bookKey], page, completed: page >= pageCount - 1, updatedAt: new Date().toISOString() }; writeProgress(progress) }
export function saveQuizAnswer(path: string, locale: string, questionId: string, answer: string, questionCount: number) { const progress = readProgress(); const bookKey = `${path}::${locale}`; const book = progress.books[bookKey] ?? { page: 0, completed: false, updatedAt: new Date().toISOString() }; const quiz = book.quiz ?? { answers: {}, reviewed: [], completed: false }; quiz.answers[questionId] = answer; if (!quiz.reviewed.includes(questionId)) quiz.reviewed.push(questionId); quiz.completed = quiz.reviewed.length >= questionCount; progress.books[bookKey] = { ...book, quiz, updatedAt: new Date().toISOString() }; writeProgress(progress) }
export function exportProgress() { const blob = new Blob([`${JSON.stringify(readProgress(), null, 2)}\n`], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `hailibrary-progress-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url) }
export async function importProgress(file: File) { writeProgress(parseProgress(JSON.parse(await file.text()))) }
