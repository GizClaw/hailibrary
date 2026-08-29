import assert from "node:assert/strict";
import test from "node:test";
import type { Story } from "./catalog.ts";
import { storyTextUnits, usesArticleLayout } from "./reading-layout.ts";

function story(language: string, text: string): Story {
  return { language, writer: "Writer", title: "Title", summary: "Summary", cast: { narrator: { display_name: "Narrator" } }, pages: [{ id: "p01", illustration: "p01", lines: [{ speaker: "narrator", text }] }] };
}

test("levels T through Z2 use article layout", () => {
  for (const level of ["t", "u", "v", "w", "x", "y", "z", "z1", "z2"]) {
    assert.equal(usesArticleLayout(level), true, level);
  }
});

test("levels AA through S use picture-book layout", () => {
  for (const level of ["aa", ..."abcdefghijklmnopqrs"]) {
    assert.equal(usesArticleLayout(level), false, level);
  }
});

test("article text is measured independently from its audio script", () => {
  const work = story("en-US", "ignored");
  work.article = { pages: [{ id: "p01", illustration: "p01", paragraphs: [{ text: "Yuan said, “The article owns this quotation.”" }] }] };
  work.audio_script = { cast: { narrator: { display_name: "Narrator" } }, pages: [{ id: "p01", illustration: "p01", blocks: [{ speaker: "narrator", text: "Different TTS wording." }] }] };
  assert.equal(storyTextUnits(work), 7);
});

test("layout ignores text length and article data", () => {
  const longWork = story("en-US", Array.from({ length: 2_000 }, (_, index) => `word${index}`).join(" "));
  const shortWork = story("en-US", "short");
  shortWork.article = { pages: [{ id: "p01", illustration: "p01", paragraphs: [{ text: "short" }] }] };
  assert.equal(usesArticleLayout("s"), false);
  assert.equal(usesArticleLayout("t"), true);
  assert.equal(storyTextUnits(longWork), 2_000);
  assert.equal(storyTextUnits(shortWork), 1);
});

test("legacy blocks still contribute to continuous text units", () => {
  const work = story("en-US", "ignored");
  work.pages![0] = { id: "p01", illustration: "p01", blocks: [{ speaker: "narrator", text: Array.from({ length: 1_200 }, (_, index) => `word${index}`).join(" ") }] };
  assert.equal(storyTextUnits(work), 1_200);
});
