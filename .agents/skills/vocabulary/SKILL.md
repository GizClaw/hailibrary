---
name: vocabulary
description: Create or revise a HaiLibrary picture-book vocabulary entry, verify it with live lexical and curriculum evidence, generate its wordless card, and self-check the result—创建或修改绘本词条，用实时词典与课程证据核实，生成无字词卡并完成自省。
---

# Create verified picture-book vocabulary

Create or materially revise `vocabulary/<level>/<id>/entry.yaml` and its shared wordless card after adapted prose is stable. New picture-book entries are limited to `aa` through `n`. Read [references/source-policy.md](references/source-policy.md), the exact Level and locale contracts, vocabulary ranges/index, every inline usage, and nearby entries.

Determine one shared concept, its exact story sense and grammatical role, stable ID, required locales, learner definitions, declared forms, writing metadata, and only evidence-backed alignments. Browse current authoritative monolingual or normative sources on every run. Use two independent sources for ambiguous sense, pronunciation, region, polyphony, simplification, part of speech, or curriculum claims. English evidence never establishes Chinese placement; familiar Chinese characters do not establish whole-word placement. An empty alignment is better than an unsupported one.

Write schema-1 `entry.yaml` with matching ID and level, `card: card.webp`, and a non-empty `card_prompt` that completely depicts the shared concept without visible text. Each locale needs a natural term, part of speech, supported pronunciation, level-appropriate definition, forms, writing metadata, and alignments. Inline surfaces must already occur in final prose and equal the term or a declared form.

For a new or changed card, run `npx --no-install hailibrary-imagegen vocabulary/<level>/<id> [flags]`. The tool adds a fixed neutral illustration treatment and no-text constraint; do not add a Style. Preserve existing card bytes for text-only changes. Open the generated WebP and confirm Git LFS coverage.

## Author self-reflection

This is the entry's lexical and visual review. The same author must execute every action, fix every finding, and restart the complete checklist until a fresh pass finds nothing:

1. Open every inline occurrence in every affected book. For each locale, write down the exact surface, sentence context, intended sense, and grammatical role; confirm all locales express the same shared concept rather than merely dictionary translations.
2. Open the current authoritative monolingual dictionary or normative source for each locale and locate the exact sense. Verify term, part of speech, pronunciation, region, register, learner definition, forms, and writing metadata field by field. Use a second independent source for ambiguous sense, pronunciation, region, polyphony, simplification, or part of speech, and record source URLs and access details in the entry's evidence structure.
3. For every pronunciation, compare the stored value symbol by symbol with the source: broad American English IPA where declared; standard Putonghua pinyin, tone marks, neutral tone, syllable spelling, and exact polyphonic reading for `zh-CN`. Do not combine transcription systems or infer a word's reading from one character.
4. For every alignment, open the declared curriculum or assessment document and locate the exact edition, list, headword or whole Chinese word, grade/level, recognition-versus-writing scope, and page or appendix. Delete unsupported alignments; never infer them from familiarity, another locale, English Lexile, frequency rank alone, or familiarity of component Chinese characters.
5. Compare every inline surface literally with `term` and `forms`; add only evidence-supported forms and fix stale or mismatched markers. Confirm directory ID, entry ID, level, schema, required locale coverage, card path, and index usage agree.
6. Read `card_prompt` against the shared sense. Confirm it shows one concrete, culturally appropriate concept without relying on spelling, typography, flags, locale-specific wordplay, or a scene that supports only one locale.
7. Open `card.webp` at original pixels. Confirm the intended concept is immediately recognizable, no text or symbol acts as a label, no locale is contradicted, and the image is original, safe, WebP, and covered by Git LFS. Correct the prompt, regenerate, and reopen when needed.
8. Run the deterministic checker for every affected book, fix all findings, and restart this full checklist.

Only deliver the corrected entry and inspected card after the restarted checklist passes.
