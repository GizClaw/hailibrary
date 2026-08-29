---
name: create-style
description: Create or materially revise a reusable HaiLibrary visual Style or 画风, including its prompt and wordless thumbnail. Use for 新建风格、修改 Style、画风 prompt 或缩略图创作; do not use for review-only requests.
---

# Create a HaiLibrary Style

Create `prompts/styles/<name>/prompt.yaml` and `thumbnail.webp` under the Style rules in `AGENTS.md`. The Style must be reusable across unrelated works and safe for shared multilingual, wordless artwork.

## Design the treatment

Read nearby Style prompts to follow the schema and avoid a duplicate. Choose an original kebab-case ID and clear display name based on broad visual media or treatments, not a living artist, studio, franchise, or protected property.

Define:

- `schema_version: 1`, directory-matching `id`, default English `display_name`, and `thumbnail`;
- `localizations.<locale>.display_name` plus localized `visual_treatment` values for every supported interface locale; keep these translations in the shared Style rather than creating locale-specific Style directories;
- medium and material treatment;
- texture, shapes, palette, lighting, and composition;
- continuity elements that must remain stable across cover and pages;
- exclusions for embedded text, logos, watermarks, visual clutter, unsafe material, recognizable franchises, and other treatment-specific risks;
- one concise generation prompt that preserves declared character/object invariants.

Describe controllable visual decisions. Do not hide story content, characters, setting, or page-specific actions inside a reusable Style.

The Style `prompt` is authoritative only for artwork. It must not prescribe narration, dialogue, sentence structure, vocabulary, reading difficulty, or locale adaptation; those belong to the selected Writer and exact Level configurations.

## Create the thumbnail

Generate a representative, original `thumbnail.webp` directly with Codex image generation. It should demonstrate the medium, palette, shapes, lighting, and composition without depending on a particular existing book.

The thumbnail must contain no visible words, letters, numbers, logos, captions, speech bubbles, or watermarks. Avoid recognizable artist, studio, game, film, comic, or franchise designs. Save compressed WebP and confirm Git LFS coverage.

Open and visually inspect the thumbnail against every declared treatment and exclusion.

## Finish

Apply the complete `$review-style` procedure as a fresh pass over the ID, prompt, reusability, continuity rules, exclusions, IP risk, image contents, WebP format, and Git LFS coverage. Report the created path and design summary. Return `PASS` only when `$review-style` has no findings; return `NEEDS_LEGAL_REVIEW` for unresolved imitation or identity risk.
