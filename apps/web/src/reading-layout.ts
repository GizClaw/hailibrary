import { storyArticlePages, type Story } from "./catalog.ts";

const ARTICLE_LAYOUT_LEVELS = new Set(["t", "u", "v", "w", "x", "y", "z", "z1", "z2"]);

export function storyPlainText(story: Story) {
  return storyArticlePages(story).flatMap((page) => page.paragraphs).map((paragraph) => paragraph.text ?? paragraph.content?.map((part) => part.vocabulary?.text ?? part.text ?? "").join("") ?? "").join(" ");
}

export function storyTextUnits(story: Story) {
  const text = storyPlainText(story);
  if (story.language.startsWith("zh")) return text.match(/\p{Script=Han}/gu)?.length ?? 0;
  return text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function usesArticleLayout(level: string) {
  return ARTICLE_LAYOUT_LEVELS.has(level.toLowerCase());
}
