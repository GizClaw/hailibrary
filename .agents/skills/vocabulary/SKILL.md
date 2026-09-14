---
name: vocabulary
description: Create or revise a HaiLibrary picture-book vocabulary entry, verify it with live lexical and curriculum evidence, generate its wordless card, and self-check the result—创建或修改绘本词条，用实时词典与课程证据核实，生成无字词卡并完成自省。
---

# Create verified picture-book vocabulary

Create or materially revise `vocabulary/<level>/<id>/entry.yaml` and its shared wordless card after adapted prose is stable. New picture-book entries are limited to `aa` through `n`. Read [references/source-policy.md](references/source-policy.md), the exact Level and locale contracts, vocabulary ranges/index, every inline usage, and nearby entries.

Determine one shared concept, its exact story sense and grammatical role, stable ID, required locales, learner definitions, declared forms, writing metadata, and only evidence-backed alignments. Browse current authoritative monolingual or normative sources on every run. Use two independent sources for ambiguous sense, pronunciation, region, polyphony, simplification, part of speech, or curriculum claims. English evidence never establishes Chinese placement; familiar Chinese characters do not establish whole-word placement. An empty alignment is better than an unsupported one.

Write schema-1 `entry.yaml` with matching ID and level, `card: card.webp`, and a non-empty `card_prompt` that completely depicts the shared concept without visible text. Each locale needs a natural term, part of speech, supported pronunciation, level-appropriate definition, forms, writing metadata, and alignments. Inline surfaces must already occur in final prose and equal the term or a declared form.

For a new or changed card, run `go run ./tools/imagegen vocabulary/<level>/<id> [flags]`. The tool adds a fixed neutral illustration treatment and no-text constraint; do not add a Style. Preserve existing card bytes for text-only changes. Open the generated WebP and confirm Git LFS coverage.

## Author self-reflection

After producing the entry and card, the same author fixes every issue found and repeats this check until none remain:

- Does each term express the same story sense and grammatical role across locales?
- Do definitions, part of speech, pronunciation, pinyin or IPA, forms, writing data, and alignments exactly match the cited live evidence?
- Are inline surfaces present forms, and is the selected level supported rather than inferred from familiarity or another locale?
- Is `card_prompt` concrete, wordless, culturally neutral where appropriate, and centered on the shared concept?
- Does the generated card contain no text and clearly express that concept without contradicting a locale?
- Do affected books pass the deterministic checker?

Only deliver the corrected entry and inspected card.

