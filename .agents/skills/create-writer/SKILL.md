---
name: create-writer
description: Create or materially revise a locale-specific HaiLibrary Writer or 作家 persona, including its prompt and wordless avatar. Use for 新建作家、修改 Writer、作者人格或头像创作; do not use for review-only requests.
---

# Create a HaiLibrary Writer

Create one Writer at `prompts/writers/<locale>/<name>/` with `prompt.yaml` and `avatar.webp`. Follow the Writer and repository rules in `AGENTS.md`.

## Define the persona

Resolve one locale and one or more recommended levels. Read `prompts/levels/index.yaml`, each recommended `prompts/levels/<level>.yaml`, `prompts/writers/index.yaml`, and nearby Writers for schema conventions.

Recommended levels must use the direct 29-level keys `aa`, `a` through `z`, `z1`, and `z2`. Read every exact level record selected; never carry forward a legacy compressed A-K meaning.

Research useful reference reading and extract only broad interests, values, structures, and creative decisions. Create an original name appropriate to the locale, then search for obvious publishing, character, product, and brand conflicts before accepting it.

The Writer must be an original editorial persona, not a disguise for a real writer. Never request recognizable imitation or copy names, characters, plots, wording, signature devices, or protected fictional worlds.

## Write `prompt.yaml`

Include:

- `schema_version: 1`;
- a directory-matching `id`, native `display_name`, locale, and recommended levels;
- `avatar: avatar.webp`;
- a clear original-persona declaration;
- personality traits, values, creative preferences, strengths, endings or structures, and meaningful avoidances;
- disclosed reference reading, extracted high-level features, and an explicit non-copying rule when references were used;
- a concise prompt that makes useful creative decisions while placing the HaiLibrary level above stylistic preferences.
- a locale-specific `language_prompt` that requires natural read-aloud prose, distinguishes speakers by age, relationship, experience, intent, and emotion, and rejects dialogue used to explain the plot, state the moral, recite policy, or summarize the learning goal.

Keep difficulty constraints out of the Writer. They belong to the exact record in `prompts/levels/<level>.yaml`; the Writer controls voice and creative decisions while the Level controls language demand.

Do not include provider keys, voice IDs, or instructions to reproduce a living or historical person's recognizable style.

Update `prompts/writers/index.yaml` only when the user requests a default assignment or the task explicitly replaces a default Writer.

## Create the avatar

Generate an original, wordless `avatar.webp` with Codex image generation. It must communicate the persona without text, logos, protected characters, or a real person's likeness. Compress to WebP and confirm Git LFS coverage.

Open and visually inspect the avatar. Check that it matches the prompt and does not resemble the researched creators or an obvious brand/character.

## Review and report

Apply the complete `$review-writer` procedure as a fresh pass over the name, prompt, references, extracted features, locale, level fit, and avatar. If material legal uncertainty remains, return `NEEDS_LEGAL_REVIEW`; otherwise report the created path, display name, locale, recommended levels, reference disclosure, avatar result, and `PASS`.
