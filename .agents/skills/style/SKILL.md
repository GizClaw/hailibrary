---
name: style
description: Create or materially revise a reusable original HaiLibrary visual Style, prompt, and wordless thumbnail, with built-in usability and IP risk self-checks—创建或修改可复用的原创画风、prompt 与无字缩略图，并自查可用性和 IP 风险。
---

# Create or revise a HaiLibrary Style

Create or materially revise `prompts/styles/<name>/prompt.yaml` and `thumbnail.webp`. Read nearby Styles for schema conventions and duplication.

Choose an original kebab-case ID and display name based on broad media and visual treatments, not a living artist, studio, franchise, protected character, or branded identity. Define schema version, matching ID, thumbnail, localized names and visual-treatment descriptions, medium, material, texture, shapes, palette, lighting, composition, continuity controls, exclusions, one concise generation prompt, and a complete wordless `thumbnail_prompt` for a representative scene. Generate `thumbnail.webp` with `npx --no-install hailibrary-imagegen prompts/styles/<name>`; the tool appends the Style's own prompt. Keep it reusable across unrelated books: story content, characters, setting, action, prose, vocabulary, level, and locale adaptation do not belong in a Style. Explicitly exclude visible text, logos, captions, speech bubbles, signatures, watermarks, clutter, unsafe material, and recognizable protected designs.

Generate a representative original wordless `thumbnail.webp` that demonstrates the treatment without depending on a book. Save compressed WebP and confirm Git LFS.

## Author self-reflection

This is the Style's usability, visual, and IP-risk review. The same author must execute every action, fix every finding, then restart the complete checklist; perform at least two full passes:

1. Compare schema version, kebab-case ID, directory, localized display names and descriptions, and thumbnail path. Read neighboring Styles and repair schema drift or confusing duplication.
2. Trace medium, material, texture, shape language, palette, lighting, composition, and continuity controls into the concise generation prompt. Replace vague or mutually incompatible directions and confirm each structured choice has an operational visual effect.
3. Apply the Style mentally to three unrelated settings and casts. Remove any embedded plot, character, prop, setting, page action, prose, vocabulary, reading Level, or locale assumption that prevents reuse.
4. Check continuity rules one category at a time: recurring face and body, clothing, props, object construction, locations, scale, palette roles, and motifs. Add concrete controls where repeated pages could drift without turning the Style into book-specific content.
5. Search the name and prompt for living artists, studios, franchises, protected characters, and branded visual identities. Remove direct or euphemistic recognizable imitation and protected-design requests. If material IP uncertainty remains, stop with `NEEDS_LEGAL_REVIEW`.
6. Verify exclusions explicitly prohibit visible text, letters, numbers, logos, captions, speech bubbles, signatures, watermarks, unsafe material, clutter, identity confusion, and protected designs.
7. Open `thumbnail.webp` at original pixels. Confirm it visibly demonstrates the declared medium, texture, shapes, palette, lighting, and composition; remains a representative book-independent, wordless, original scene; and does not resemble a protected character, franchise, studio, or artist. Verify WebP and Git LFS, correcting the prompt, regenerating, and reopening when needed.

Only deliver after two complete restarted passes find no issue.
