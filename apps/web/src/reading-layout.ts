import { storyArticlePages, type Story } from "./catalog.ts";

export function storyPlainText(story: Story) {
  return storyArticlePages(story).flatMap((page) => page.paragraphs).map((paragraph) => paragraph.text ?? paragraph.content?.map((part) => part.vocabulary?.text ?? part.text ?? "").join("") ?? "").join(" ");
}

export function storyTextUnits(story: Story) {
  const text = storyPlainText(story);
  if (story.language.startsWith("zh")) return text.match(/\p{Script=Han}/gu)?.length ?? 0;
  return text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function usesArticleLayout(story: Story) {
  if (story.article) return true;
  const units = storyTextUnits(story);
  return story.language.startsWith("zh") ? units >= 1_800 : units >= 1_200;
}
