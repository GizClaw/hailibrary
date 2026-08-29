---
name: scriptize-article
description: Convert one complete HaiLibrary locale article into a continuous multi-speaker TTS script—把完整文章标记为 narrator/characters 的自然对白脚本，并保留内联 vocabulary；用于 Writer 完稿后、分页前，不负责从零创作文章或生成插画。
---

# Scriptize a complete article

Turn an already coherent article into a speaker-marked version suitable for HaiLibrary narration and character voices. Scriptization is adaptation, not a second story-generation pass.

Read [references/annotated-article-contract.md](references/annotated-article-contract.md) before converting content.

## Require a real source article

The input must be one complete locale draft with a beginning, development, and resolution or an appropriate complete nonfiction structure. It must already satisfy the selected Writer and exact Level in substance and language.

If the input is only an outline, page plan, event list, isolated lines, or incomplete fragments, return `ARTICLE_REQUIRED` and identify what is missing. Do not fill the gaps by inventing a story inside this Skill.

Read the source article without assigning speakers first. Confirm its event order, causal links, viewpoint, recurring details, conclusion, and paragraph flow. These are the preservation baseline.

When used inside `$create-work`, also read:

- the locale Writer's `prompt` and `language_prompt`;
- the exact Level prompt and complete level record;
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

Inside an authorized `$create-work` task, write the ordered blocks to `audio_script.pages[].blocks[]` with page IDs and illustrations aligned to `article.pages[]`. Pagination must preserve order and must not rewrite each page as an independent mini-story. This applies to both short and long articles; length does not decide whether an article can be scriptized. `speaker` remains TTS metadata and never supplies visible quotation marks or attribution in article mode. Voice direction belongs once in `audio_script.cast`, never in repeated blocks. The web reader may expose a separate script mode for editorial, subtitle, and audio alignment, but article mode must render only the Writer-authored `article`.

This Skill does not create artwork, questions, chapters, vocabulary entries, or a new article. Those remain separate responsibilities.
