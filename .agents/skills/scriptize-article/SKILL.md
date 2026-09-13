---
name: scriptize-article
description: Convert adapted HaiLibrary article.pages into a continuous multi-speaker TTS script—把分级改编后的 article.pages 标记为 narrator/characters 的自然语音脚本并保留内联 vocabulary；不负责创作小说、分级改编或生成插画。
---

# Scriptize an adapted article

Turn coherent, level-adapted `story.yaml` `article.pages` into `audio_script` for narration and character voices. Scriptization assigns and lightly adapts speech; it is not story generation or level adaptation.

Read [references/annotated-article-contract.md](references/annotated-article-contract.md) before converting content.

## Require a completed adaptation

The input must be one complete locale `article.pages` produced from `article.md` by `$adapt-article`. It must already have a beginning, development, and resolution or an appropriate complete nonfiction structure, and satisfy the Writer and exact Level.

If the input is only `article.md`, an outline, page plan, event list, isolated lines, or incomplete fragments, return `ADAPTED_ARTICLE_REQUIRED` and identify what is missing. Do not fill gaps or perform adaptation inside this Skill.

Read the adapted pages continuously without assigning speakers first. Confirm their event order, causal links, viewpoint, recurring details, conclusion, and paragraph flow against `article.md`. The adapted visible text is the scriptization baseline.

When used inside `$create-work`, also read:

- the locale Writer's `prompt` and `language_prompt`;
- the exact Level prompt and complete level record;
- the locale `article.md` for story-authority context, without editing it;
- `book.yaml` character IDs and the locale cast/TTS directions when they already exist;
- every vocabulary marker already selected for the locale.

## Convert, do not replace

Build one ordered annotated article:

1. Keep narration for setting, action, transitions, explanation, internal context, and information no person would naturally say aloud.
2. Assign existing quoted speech to the actual speaker.
3. Convert narration into dialogue only when a present character has an immediate reason to say it to a particular listener in that moment.
4. Give each speaker partial knowledge, intent, emotion, relationship, vocabulary, and rhythm. People may interrupt, hesitate, misunderstand, answer indirectly, or remain silent.
5. Preserve every source event, claim, causal link, uncertainty, and conclusion. Do not add facts, lessons, characters, conflicts, solutions, or interview questions merely to create more voices.
6. Keep one speaker per block. Put visible action in narrator blocks instead of parenthetical stage directions that TTS might read aloud.
7. Give every block a stable locale-local ID in `<page-id>-b<two-digit-index>` form, such as `p07-b03`. The ID is the durable join key for one TTS clip and its subtitle; do not recycle an ID for different spoken content after publication.
8. Preserve existing inline vocabulary markers exactly. New vocabulary work remains owned by `$create-vocabulary` and `$review-vocabulary`.

Multi-speaker does not mean dialogue-heavy. A narrator-only passage is correct when conversation would be artificial. Never turn an article into a staged interview, classroom recitation, policy meeting, or sequence of characters explaining the text to one another.

## Optimize for speech

- Use natural punctuation and breath-length turns appropriate to the locale and Level.
- Split an overlong turn at a semantic boundary, but do not create choppy one-sentence fragments merely to alternate speakers.
- Do not put delivery labels such as `angrily`, `温柔地`, or bracketed stage directions in spoken text; abstract delivery belongs in the cast TTS fields.
- Do not include provider voice IDs, SSML, audio filenames, or synthesis parameters.
- Keep narrator and character IDs stable and valid for the work cast.

After conversion, read only the speaker-marked article continuously from beginning to end. Fail the conversion if removing speaker labels reveals broken transitions, repeated explanations, lost evidence, changed causality, or a conclusion that now depends on dialogue invented by this Skill.

## Deliver the result

For a standalone request, output the proposed `audio_script` directly plus a short conversion note naming retained narration, dramatized passages, and any `ARTICLE_REQUIRED` or cast blocker. Do not write repository files without explicit authorization.

Inside an authorized `$create-work` task, write the ordered blocks to `audio_script.pages[].blocks[]` with page IDs and illustrations aligned to `article.pages[]`. Preserve existing pagination and order; do not rewrite each page as an independent mini-story. `speaker` remains TTS metadata and never supplies visible quotation marks or attribution in article mode. Voice direction belongs once in `audio_script.cast`, never in repeated blocks. The web reader may expose a separate script mode for editorial, subtitle, and audio alignment, but article mode renders the adapted `article.pages`.

This Skill does not create artwork, questions, chapters, vocabulary entries, `article.md`, or the level adaptation. Those remain separate responsibilities.
