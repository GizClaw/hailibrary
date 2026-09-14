---
name: style
description: Create or materially revise a reusable original HaiLibrary visual Style, prompt, and wordless thumbnail, with built-in usability and IP risk self-checks—创建或修改可复用的原创画风、prompt 与无字缩略图，并自查可用性和 IP 风险。
---

# Create or revise a HaiLibrary Style

Create or materially revise `prompts/styles/<name>/prompt.yaml` and `thumbnail.webp`. Read nearby Styles for schema conventions and duplication.

Choose an original kebab-case ID and display name based on broad media and visual treatments, not a living artist, studio, franchise, protected character, or branded identity. Define schema version, matching ID, thumbnail, localized names and visual-treatment descriptions, medium, material, texture, shapes, palette, lighting, composition, continuity controls, exclusions, and one concise generation prompt. Keep it reusable across unrelated books: story content, characters, setting, action, prose, vocabulary, level, and locale adaptation do not belong in a Style. Explicitly exclude visible text, logos, captions, speech bubbles, signatures, watermarks, clutter, unsafe material, and recognizable protected designs.

Generate a representative original wordless `thumbnail.webp` that demonstrates the treatment without depending on a book. Save compressed WebP and confirm Git LFS.

## Author self-reflection

After producing the Style, the same author fixes and repeats until clear:

- Are ID, directory, display names, schema, localizations, and thumbnail path consistent?
- Are medium, texture, shapes, palette, lighting, composition, and continuity rules concrete, compatible, and reusable?
- Is the prompt concise and operational, without story, language, Level, artist-imitation, franchise, or brand leakage?
- Do exclusions adequately cover text, logos, unsafe material, identity confusion, and protected designs?
- Does the opened thumbnail visibly demonstrate the declared treatment, remain wordless and original, and avoid recognizable artists, studios, franchises, or characters?
- Is the thumbnail WebP covered by Git LFS?

Only deliver after the second self-check finds no issue.

