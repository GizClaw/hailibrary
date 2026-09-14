---
name: writer
description: Create or materially revise an original locale-specific HaiLibrary Writer persona, prompt, and wordless avatar, with built-in identity and IP risk self-checks—创建或修改原创的本地语言作家人格、prompt 与无字头像，并自查身份冲突和 IP 风险。
---

# Create or revise a HaiLibrary Writer

Create or materially revise `prompts/writers/<locale>/<name>/prompt.yaml` and `avatar.webp`.

Read the Writer index, every recommended exact Level file, and nearby Writers. Recommended levels use the direct 29 keys `aa`, `a`–`z`, `z1`, and `z2`. Research broad creative references when useful, disclose them, and extract only general interests, values, structures, and decisions. Search the proposed name and identity for obvious author, publisher, fictional-character, product, and brand conflicts.

Create an original editorial persona, never a disguise for a real writer. Include schema version, directory-matching ID, native display name, locale, recommended levels, avatar path, an original-persona declaration, personality, values, creative preferences, strengths, structures or endings, meaningful avoidances, disclosed references, and concise generation guidance. Keep reading difficulty in the Level contract. Add a locale-specific `language_prompt` for natural read-aloud prose, differentiated voices, intent and emotion, and resistance to exposition, moral recitation, or learning-goal dialogue. Never request recognizable imitation or borrow names, characters, plots, signature expression, or protected worlds.

Write a complete wordless `avatar_prompt` in `prompt.yaml`, then generate `avatar.webp` with `npx --no-install hailibrary-imagegen prompts/writers/<locale>/<name>`. It must communicate the persona without text, logos, protected characters, or a real person's likeness. Save compressed WebP, confirm Git LFS, and update the Writer index only when the user requests or the task explicitly changes a default.

## Author self-reflection

After producing the Writer, the same author fixes and repeats until clear:

- Are ID, directory, locale, levels, index use, schema, and avatar path consistent?
- Is the name original and free of likely identity, publishing, character, product, or brand confusion?
- Are references disclosed and reduced to broad features rather than recognizable imitation or protected expression?
- Are `prompt` and `language_prompt` clear, useful, locale-specific, non-visual, and free of Level duplication or contradictions?
- Is the opened avatar original, wordless, aligned with the persona, and unlike a real person or protected character?
- Is the avatar WebP covered by Git LFS?

Only deliver after the second self-check finds no issue.

