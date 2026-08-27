---
name: create-vocabulary
description: Create or materially revise a HaiLibrary vocabulary entry or word card—新增词汇、词条、词卡、拼音、IPA、释义和课程对齐. Use for standalone vocabulary creation or when create-work needs a new target concept; not for review-only audits.
---

# Create HaiLibrary vocabulary

Create or materially revise one shared concept at `vocabulary/<level>/<id>/entry.yaml` with one wordless `card.webp`. Follow `AGENTS.md`; the entry is level-scoped, and localized terms describe the same concept rather than loosely related translations.

## Establish the concept and usage

Read `prompts/levels/levels.yaml`, every story usage of the intended level-scoped ID, and nearby entries for schema conventions. Resolve:

- one concrete shared concept and stable kebab-case ID;
- the owning level and every required locale;
- the exact story sense and grammatical role;
- the learner-facing definition scope;
- whether a curriculum alignment is actually required and supportable.

Do not create duplicate IDs for the same concept without checking existing entries. Do not force unrelated locale words into one card merely because they appear in the same translated sentence.

## Research before writing

Apply the source hierarchy and live-evidence requirements from `$review-vocabulary`. Open current authoritative monolingual dictionary or normative sources for every locale before choosing terms, pronunciations, parts of speech, forms, writing metadata, or alignments.

An empty alignment list is valid. Never infer curriculum placement from familiarity, a dictionary definition, or another locale's level.

## Write the entry

Create `entry.yaml` with:

- `schema_version: 1`, a directory-matching `id`, and the directory level;
- `card: card.webp`;
- a locale entry for every required edition;
- natural term, correct part of speech, supported pronunciation, level-appropriate definition, valid forms where needed, writing metadata, and evidence-backed alignments.

For `en-US`, use supported American English broad IPA. For `zh-CN`, use standard Putonghua Hanyu Pinyin with tone marks, unmarked neutral tones, and exact simplified characters.

Update inline story vocabulary markers only when the task authorizes changing the affected work. The marked surface form must equal the entry term or a declared form.

## Create the word card

Generate one original `card.webp` that depicts the shared concept without text, letters, numbers, logos, captions, speech bubbles, or watermarks. The image must remain recognizable for every locale term and must not encode a locale-specific spelling or cultural assumption that changes the concept.

Compress to WebP, confirm Git LFS coverage, and visually inspect the card rather than inferring its contents from the filename.

## Validate and review

Apply the complete `$review-vocabulary` procedure as a fresh evidence-backed pass. Run `npm run check-work -- <work-directory>` for every affected work.

Return `PASS` only when the entry, live language evidence, card, story forms, alignments, and affected-work validation have no findings.
