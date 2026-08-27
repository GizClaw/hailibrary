---
name: review-artwork
description: Review or fix a HaiLibrary book's cover and page illustrations—插画审核、画面文字、场景匹配、角色连续性、Style、一致性和 Git LFS. Use for artwork-only audits or authorized illustration corrections; not for reusable Style prompts or full editorial review.
---

# Review HaiLibrary artwork

Review one complete work's `artwork.yaml`, cover, and every page illustration. Follow `AGENTS.md`. For review-only requests, report findings without editing or regenerating images. Apply corrections only when explicitly authorized, then repeat the complete visual review.

## Load the visual contract

Read:

- `book.yaml`, `artwork.yaml`, and every locale page event relevant to each illustration;
- the referenced `prompts/styles/<style>/prompt.yaml`;
- character, clothing, prop, location, palette, and continuity declarations;
- the complete asset inventory and Git LFS rules.

Use locale prose only to understand the shared page event. Do not require an image to depict language-specific wording that is absent from the shared scene.

## Inspect every image

Open the original local pixels for the cover and every page image. A filename, YAML scene, generated-image prompt, Git diff, or prior `visual_review.status` is not visual evidence.

For every asset, check:

- the declared page action, characters, setting, objects, direction, and emotional state are visibly correct;
- recurring characters, clothing, scale, props, locations, palette, and physical layout remain continuous;
- the image follows the referenced Style's medium, texture, shapes, lighting, palette, composition, and exclusions;
- no visible words, letters, numbers, logos, captions, speech bubbles, signatures, or watermarks appear;
- anatomy, object use, spatial causality, audience safety, and ordinary physical details are plausible unless clearly established as fantasy;
- cropping, aspect ratio, compression, and resolution are usable for publication;
- the cover represents the work without contradicting later pages or exposing a false event;
- every declared asset exists once, every required page has one illustration, files are WebP, and publishable images are covered by Git LFS.

Inspect vocabulary cards with `$review-vocabulary`, Style thumbnails with `$review-style`, and Writer avatars with `$review-writer`; this skill owns only the work cover and page artwork.

## Result

Return actionable findings first with exact artwork ID, file path, visible region, declared scene, and learner-facing or continuity impact. Distinguish a pixel-level defect from an incorrect `artwork.yaml` scene contract.

Return `PASS` only after visually inspecting the cover and every page image and finding no defects. Summarize asset count, scene coverage, character and prop continuity, Style compliance, text exclusion, safety, dimensions/format, and Git LFS status.
