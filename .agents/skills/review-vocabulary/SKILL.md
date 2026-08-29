---
name: review-vocabulary
description: Review, research, or correct HaiLibrary vocabulary entries—词汇审核、词义、词性、拼音、IPA、词形、汉字和课程等级对齐. Use for dictionary-backed vocabulary audits or authorized corrections; use create-vocabulary to add a new entry or card.
---

# Review HaiLibrary vocabulary

Verify one entry, a level, a locale, or the complete `vocabulary/` tree. This is a lexical research task, not only a YAML schema check.

Resolve and apply the exact ordered level key (`aa`, `a` through `z`, `z1`, `z2`) from `prompts/levels/locale-references.yaml` and `prompts/vocabulary/ranges.yaml`; do not reuse the former compressed A-K bands or assign a neighboring level from intuition. English Lexile evidence must not be presented as a Chinese curriculum alignment, and HaiLibrary's Z1/Z2 higher-education meanings must not be described as official Reading A-Z correlations.

For review-only requests, report findings without editing. Apply corrections only when explicitly authorized, then research and review the affected entries again.

For a text-only authorized fix, preserve every `card.webp` byte-for-byte. Report visual problems without regenerating or editing the card unless visual work is explicitly authorized.

## Establish the intended sense

Read each `vocabulary/<level>/<id>/entry.yaml` and search all `works/` usages of the same level-scoped vocabulary ID. Determine the exact meaning, grammatical role, locale-specific surface forms, and learner context before consulting a dictionary. Do not validate an unrelated sense of a homograph.

Read [references/source-policy.md](references/source-policy.md) for every locale being reviewed. Browse the live sources on each run; do not rely on memory, search snippets, or an AI-generated dictionary answer. Open the supporting entry or official document.

## Verify each locale

For every locale, check:

- `term`: standard spelling and the correct lexical equivalent for the shared concept;
- `part_of_speech`: correct for the story usage and expressed naturally in the locale;
- `pronunciation`: the correct standard pronunciation for that sense and locale;
- `definition`: accurate, learner-friendly, self-contained, and narrow enough for the actual sense;
- `forms`: every marked surface form is valid for that same lexeme and sense;
- writing metadata: characters, script, variants, or other locale-specific fields are exact;
- `alignments`: the cited curriculum or word list actually contains the term at the declared level.

For `en-US`, use American English pronunciation and broad IPA between slashes unless the schema later declares another convention. Preserve stress marks and distinguish homographs such as noun `wind` /wɪnd/ and verb `wind` /waɪnd/.

For `zh-CN`, use standard Putonghua Hanyu Pinyin with tone marks. Write neutral-tone syllables without a tone mark, keep normal word spacing, check polyphonic characters in context, and ensure `writing.characters` exactly matches the simplified term. Treat the user's “zdict” reference as Han Dian at `zdic.net`.

Definitions must be paraphrased for the selected level. Do not copy substantial dictionary wording. A correct dictionary definition may still be too circular, abstract, broad, or difficult for a learner.

## Evidence rules

Use at least one authoritative lexical source for ordinary entries. Use two independent sources when pronunciation, sense, regional usage, polyphony, simplification, or part of speech is ambiguous. Prefer official standards for normative spelling, script, pronunciation, and curriculum claims.

Do not invent an alignment from general familiarity. If the exact term cannot be found in the cited framework, remove or correct the claim when fixes are authorized; otherwise report it. An empty `alignments` list is better than an unsupported level.

Record in the review output the exact source links and what each source establishes. Clearly separate dictionary evidence, normative language rules, and curriculum alignment evidence.

## Repository checks

Confirm the entry ID and level match its directory, all referenced locales exist, every story surface form is declared, and `card.webp` exists, is wordless, depicts the shared concept across locales, and is covered by Git LFS. Visually inspect the card when image access is available.

After authorized corrections, run `npm run check-work -- <work-directory>` for every affected work.

## Result

Return findings first, grouped by vocabulary path and locale. Include the field, current value, supported value, source links, and learner-facing impact. Distinguish errors from regional variants and editorial improvements.

Return `PASS` only when all requested entries have adequate live evidence and no findings. Summarize entries, locales, story usages, dictionary sources, official standards, alignments, cards, and affected-work validation.
