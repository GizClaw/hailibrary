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

This is the Writer's identity, usability, and IP-risk review. The same author must execute every action, fix every finding, then restart the complete checklist; perform at least two full passes:

1. Compare schema version, ID, directory name, locale, native display name, avatar path, recommended levels, and any index/default reference. Open every recommended exact Level file and remove absent, legacy-compressed, or contradictory levels.
2. Search the proposed name and identity together with terms for author, publisher, book, fictional character, product, and brand. Inspect the results rather than snippets; rename any confusing match. If material identity or IP uncertainty remains, stop with `NEEDS_LEGAL_REVIEW` rather than declaring success.
3. For every consulted reference, confirm disclosure includes the source and only broad interests, values, structures, or decisions extracted from it. Search the prompt for borrowed names, characters, plots, worlds, signature devices, wording, and requests to imitate a recognizable writer; remove them and rewrite the persona from independent choices.
4. Apply `prompt` to two substantially different hypothetical stories. Identify the concrete decisions it changes in viewpoint, values, conflict, structure, and ending; tighten generic guidance, and remove any clause that dictates visual treatment or overrides reading difficulty.
5. Read `language_prompt` aloud in the target locale. Confirm it gives locale-specific, actionable guidance for natural read-aloud prose, character intention, differentiated voices, omission or hesitation, and resistance to exposition, slogans, moral recitation, and learning-goal dialogue. Remove translated boilerplate and any contradiction or duplication of Level rules.
6. Open `avatar.webp` at original pixels and compare it with the persona and `avatar_prompt`. Confirm it is wordless, original, non-branded, and not a real-person likeness or protected character; verify WebP format and Git LFS coverage. Correct the prompt, regenerate, and reopen when needed.

Only deliver after two complete restarted passes find no issue.
