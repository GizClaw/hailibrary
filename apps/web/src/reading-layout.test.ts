import assert from "node:assert/strict";
import test from "node:test";
import type { Story } from "./catalog.ts";
import { storyTextUnits, usesArticleLayout } from "./reading-layout.ts";

function story(language: string, text: string): Story {
  return { language, writer: "Writer", title: "Title", summary: "Summary", cast: { narrator: { display_name: "Narrator" } }, pages: [{ id: "p01", illustration: "p01", lines: [{ speaker: "narrator", text }] }] };
}

test("long English works use article layout", () => {
  const work = story("en-US", Array.from({ length: 1_200 }, (_, index) => `word${index}`).join(" "));
  assert.equal(storyTextUnits(work), 1_200);
  assert.equal(usesArticleLayout(work), true);
});

test("long Chinese works use article layout while picture books do not", () => {
  assert.equal(usesArticleLayout(story("zh-CN", "字".repeat(1_800))), true);
  assert.equal(usesArticleLayout(story("zh-CN", "字".repeat(1_799))), false);
});
