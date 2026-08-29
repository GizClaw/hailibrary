---
name: review-style
description: Review or fix a HaiLibrary visual Style or 画风—检查 Style prompt、可复用性、连续性、生成清晰度、IP 风险和缩略图. Use for 风格审核 or authorized Style corrections; not for reviewing a book's page artwork.
---

# Review a HaiLibrary Style

Review `prompts/styles/<name>/prompt.yaml` and `thumbnail.webp` under the Style rules in `AGENTS.md`.

For review-only requests, report findings without editing. Apply fixes only when explicitly authorized, then restart the complete review.

## Inspect

Read the complete prompt and enough neighboring Styles to identify duplication or schema drift. Open and visually inspect `thumbnail.webp`; do not infer its contents from the prompt or filename.

Check that:

- schema version, ID, directory, display name, and thumbnail path agree;
- the treatment is reusable and does not encode a particular work's plot, characters, or page action;
- medium, texture, shapes, palette, lighting, and composition are concrete and mutually consistent;
- continuity rules preserve the identities of recurring characters, props, clothing, locations, and visual motifs;
- exclusions explicitly prevent embedded text, letters, numbers, logos, captions, speech bubbles, and watermarks;
- neither the name nor prompt requests a living artist's recognizable style or a studio, franchise, protected character, or branded visual identity;
- the generation prompt is concise, actionable, and consistent with the structured fields;
- the prompt controls only visual treatment and does not prescribe prose, dialogue, vocabulary, reading difficulty, or locale adaptation;
- the thumbnail visibly represents the declared treatment, remains wordless and original, exists as WebP, and is covered by Git LFS.

Return actionable findings first with exact paths and fields or visible regions. Return `PASS` only when there are no findings, with a short summary of the treatment, continuity controls, exclusions, thumbnail inspection, and LFS result. Return `NEEDS_LEGAL_REVIEW` when material imitation or identity risk cannot be resolved editorially.
