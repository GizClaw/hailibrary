import assert from "node:assert/strict";
import test from "node:test";
import { parseProgress } from "./progress.ts";

const validProgress = {
  version: 1,
  settings: { interfaceLocale: "zh-CN", learningLocale: "en-US" },
  books: {
    "the-lost-kite::en-US": {
      page: 2,
      completed: false,
      updatedAt: "2026-08-28T00:00:00.000Z",
      quiz: { answers: { q01: "wind" }, reviewed: ["q01"], completed: true },
    },
  },
} as const;

test("parseProgress accepts a complete progress backup", () => {
  assert.deepEqual(parseProgress(validProgress), validProgress);
});

test("parseProgress rejects invalid top-level data", () => {
  for (const value of [null, [], { version: 1 }, { version: 2, settings: {}, books: {} }]) {
    assert.throws(() => parseProgress(value));
  }
});

test("parseProgress rejects malformed book and quiz records", () => {
  assert.throws(() => parseProgress({ ...validProgress, books: [] }));
  assert.throws(() => parseProgress({ ...validProgress, books: { broken: { page: -1, completed: false, updatedAt: "now" } } }));
  assert.throws(() => parseProgress({ ...validProgress, books: { broken: { page: 0, completed: false, updatedAt: "now", quiz: { answers: [], reviewed: [], completed: false } } } }));
});
