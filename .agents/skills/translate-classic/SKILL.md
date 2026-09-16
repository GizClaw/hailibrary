---
name: translate-classic
description: Render an imported public-domain classic into a complete, faithful, natively literary zh-CN article—以地道中文文学语言忠实意译已导入的公版经典，保留全部情节、章节与意境，不缩写、不改写成新故事；不做绘本、词汇或有声书脚本。
---

# Translate a classic into Chinese

Create `locales/zh-CN/article.md` for one existing `type: classic` standalone article at `works/articles/<article-id>/` or series child at `works/series/<series-id>/<article-id>/`. Follow `AGENTS.md`. The source is that article's imported public-domain `locales/en-US/article.md`; do not edit the source, and do not consult, paraphrase, or reproduce any modern published Chinese translation. Read [references/chinese-literary-rendering.md](references/chinese-literary-rendering.md) completely before writing.

## Contract

This is 意译 with 意境, not word-for-word translation and not free retelling. A Chinese reader should feel the book was written in Chinese by a fine literary stylist, while a bilingual reader comparing paragraph by paragraph finds every event, image, joke, feeling, and line of dialogue carried over.

- **Keep:** every chapter, scene, paragraph's content, event, causal link, speaker, what each character says and means, narrator's attitude and humor, signature images, verse and songs, open or unsettling moments, period and place, and the ending.
- **Free to change:** sentence boundaries, clause order, syntax, voice, pronoun use, rhythm, and word choice; recast English idiom, pun, wordplay, and verse into Chinese that performs the same function and effect; merge or split sentences inside a paragraph.
- **Never:** abridge, summarize, skip "boring" description, add plot, character, explanation, moral, or modern attitude; soften or sanitize the source; sinicize the setting (no Chinese names, places, foods, or customs replacing foreign ones); add translator's notes, brackets, or footnotes to the prose.

## Metadata and format

- Add `zh-CN: {translator: "HaiLibrary"}` to `article.yaml.locales`, keeping `en-US` unchanged; use the existing `titles.zh-CN`.
- Mirror the source Markdown structure: `# <titles.zh-CN>`, then one `## ` heading per source chapter in the same order and count, rendered as natural Chinese headings (for example `## 第一章　上山去找阿尔姆大叔`). A source with no chapter headings stays without them.
- Keep paragraph breaks aligned with the source; a paragraph may be split only when a very long English paragraph contains several speakers, and never merged away.
- Use Chinese full-width punctuation: “” and ‘’ for quotations, ——, ……, 、, and 《》 for titles.

## Long works

Work chapter by chapter. Before starting, write a private name and term glossary (people, animals, places, recurring objects, forms of address, invented words) and keep it consistent through the book. After finishing each chapter, append it to `article.md` immediately and run the per-chapter checks (items 1–4 below) before moving on. If `article.md` already exists, verify its completed chapters against the source, then resume from the first missing or incomplete chapter. Never shorten later chapters to finish faster.

## Author self-reflection

The same author executes every action below, fixes every finding, and restarts the complete checklist from item 1 until a fresh pass finds nothing.

1. **Structure:** compare heading count, order, and each chapter's paragraph count with the source; explain or fix every difference.
2. **Completeness:** walk each source paragraph against its Chinese paragraph; list any omitted clause, image, aside, joke, detail, or line, and restore it. List anything added that the source does not say, and remove it.
3. **Dialogue:** for every quotation confirm speaker, listener, intent, and tone match; read each character's lines alone and confirm the voice is distinct, speakable Chinese suited to their age, class, and temperament.
4. **Translationese scan:** search the chapter for the patterns in the reference's 翻译腔清单 and rewrite each hit that reads as English syntax.
5. **Verse, wordplay, and names:** confirm every poem, song, and pun works in Chinese and serves the same function; confirm glossary consistency and conventional Chinese renderings for well-known names.
6. **意境 read-aloud:** read the whole work aloud in order. Repair flat or report-like prose, monotone sentence length, 成语 or 四字格 stuffing, 文言 or 网络腔, modern slang, and passages where the source's mood (wonder, menace, comedy, grief, tenderness) did not survive.
7. **Fidelity of tone:** confirm nothing was sanitized, moralized, modernized, or sinicized, and no published Chinese translation was echoed.

Only hand off after the restarted checklist passes.
