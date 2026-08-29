import type { Story } from "./catalog";

export function storyPlainText(story: Story) {
  return story.pages.flatMap((page) => page.lines).map((line) => line.text ?? line.content?.map((part) => part.vocabulary?.text ?? part.text ?? "").join("") ?? "").join(" ");
}

export function storyTextUnits(story: Story) {
  const text = storyPlainText(story);
  if (story.language.startsWith("zh")) return text.match(/\p{Script=Han}/gu)?.length ?? 0;
  return text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function usesArticleLayout(story: Story) {
  const units = storyTextUnits(story);
  return story.language.startsWith("zh") ? units >= 1_800 : units >= 1_200;
}
