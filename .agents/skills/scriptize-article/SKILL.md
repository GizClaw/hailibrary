---
name: scriptize-article
description: Convert a complete, ungraded HaiLibrary series article into a chaptered multi-speaker audiobook script without rewriting it—把系列文章的完整文学原文转换为分章、多角色的有声书脚本；不用于分级绘本、文学创作或内容改写。
---

# Scriptize a series article

Convert one complete `works/series/<id>/locales/<locale>/article.md` into `audio_script.yaml` in the same directory. This is faithful audiobook markup, not a rewrite, adaptation, radio drama, or story-generation step.

Read [references/annotated-article-contract.md](references/annotated-article-contract.md) before writing the script.

## Inputs

- Read the complete locale `article.md` as the authoritative literary work.
- Read `works/series/<id>/article.yaml` for canonical character IDs. Prefer those IDs for matching speakers.
- Add any other person with quoted dialogue to `cast` using a stable, descriptive ID.
- Use `narrator` for all narration and include it in `cast`.

Do not use this Skill for graded picture books under `works/<level>/...`; their page text is sent directly to TTS and needs no `audio_script`.

## Preserve the work

- Cover the entire article in source order. Preserve its facts, events, causality, viewpoint, tone, and ending.
- Narration is the default. Do not invent dialogue, facts, scenes, actions, or explanations.
- Keep exactly one speaker in each block and keep IDs stable when updating an existing script.
- Scriptization may add only the minimal attribution allowed below when otherwise necessary for audio comprehension.

## Audiobook block rules

This is an audiobook script, not a film or radio-drama script. The listener cannot see the text, so narration must make clear who is speaking and what is happening.

1. The narrator reads verbatim all prose outside quotation marks, including speech tags such as `爷爷说`, `小满问`, `he said`, and `she asked`, plus actions and expressions. Do not delete, rewrite, or move it.
2. Assign words inside quotation marks to their speaker; do not read the quotation marks. When a speech tag interrupts one person's utterance, preserve source order as character, narrator, character blocks. For example, `“先别急着砸山，”身后有人说，“我有个更省力的办法。”` becomes three blocks.
3. If consecutive dialogue omits speech tags and would be ambiguous by ear, the narrator may add the shortest possible attribution, such as `小满问。`, `爷爷说。`, or `Grandpa said.` Place it where natural for the language. Add only who spoke or asked—never action, delivery, or thought—and add nothing where the audio is already clear.
4. Start a new block when the speaker changes. Merge consecutive content by the same speaker. Merge consecutive narration, preserving original paragraph breaks with newlines. Split a narrator block only when it exceeds about 400 Chinese characters or 250 English words, and only at an original paragraph boundary.
5. A narrator block may end with a dialogue lead-in such as `说：`, `问：`, or `said,`.
6. Cover the full text without reordering it. Do not invent dialogue or facts, and do not put action or delivery labels inside dialogue.

## Chapters and IDs

- Preserve every `## ` chapter heading from `article.md` as a chapter and use its title.
- If the source has no `## ` headings, divide it at natural scene transitions into 3–7 chapters and give each a concise title grounded in the text.
- Assign chapter IDs sequentially as `ch01`, `ch02`, and so on.
- Assign block IDs within each chapter as `<chapter-id>-b<two-digit-index>`, for example `ch01-b01`. IDs are stable join keys; do not reuse an existing ID for different spoken content after publication.

## Output

Write this shape to the locale's `audio_script.yaml`:

```yaml
audio_script:
  language: zh-CN
  cast:
    narrator:
      display_name: 旁白
      tts:
        delivery: calm and attentive
        timbre: warm and clear
        pace: measured
        pitch: medium
  chapters:
    - id: ch01
      title: 山脚的声音
      blocks:
        - id: ch01-b01
          speaker: narrator
          text: 小满停下脚步。爷爷说：
        - id: ch01-b02
          speaker: grandpa
          text: 先听一听山里的回声。
```

Every cast member must have a localized `display_name` and complete abstract TTS direction: `delivery`, `timbre`, `pace`, and `pitch`. Do not include provider voice IDs, SSML, audio filenames, synthesis parameters, stage directions, or parenthetical performance labels.

After conversion, read the blocks continuously chapter by chapter. Fix missing or duplicated prose, changed order, incorrect speakers, unstable IDs, incomplete cast entries, and unnecessary added attributions before delivering the file.
