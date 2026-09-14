---
name: review-artwork
description: Review or fix a derived HaiLibrary picture book's generated cover and page illustrations—审核或修复衍生绘本封面与页面插图的文字、场景、角色连续性、Style、prompt 契约和 Git LFS；不审核系列文章。
---

# Review picture-book artwork

Review one complete picture book's `book.yaml`, schema-2 `artwork.yaml`, cover, and every page image. Report only unless corrections are explicitly authorized.

Read all locale page events, character `visual_identity`, the referenced Style prompt, and the asset inventory. Confirm each asset has a one-sentence `scene` and a complete content/composition `prompt`; prompts must match visual identities, omit Style treatment, and never request visible text. Use locale prose only to resolve the shared event.

Open original pixels for every asset. Check scene action, character and prop continuity, Style compliance, wordlessness, anatomy and object use, safety, composition, crop, aspect ratio, resolution, WebP compression, exact one-to-one page coverage, and Git LFS. A filename, prompt, scene, diff, or generation success is not visual evidence.

When an authorized fix needs regeneration, first correct the committed prompt if its contract is wrong, then run `go run ./tools/imagegen <work-dir> [flags]`. Do not call image generation by another path. Reinspect the complete set after any change.

Return findings with artwork ID, path, visible region or prompt field, declared scene, and impact. Return `PASS` only after every cover/page pixel and contract passes; summarize asset count, continuity, Style, text exclusion, safety, format, and LFS.
