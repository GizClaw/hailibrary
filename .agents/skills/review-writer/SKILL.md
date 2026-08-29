---
name: review-writer
description: Review or fix a HaiLibrary Writer or 作家 persona—检查原创性、locale、等级、参考披露、身份冲突、prompt 和头像风险. Use for 作家审核 or authorized Writer corrections; not for reviewing a complete book's prose.
---

# Review a HaiLibrary Writer

Review `prompts/writers/<locale>/<name>/prompt.yaml` and `avatar.webp` under the Writer rules in `AGENTS.md`.

For review-only requests, report findings without editing. Apply fixes only when explicitly authorized, then restart the full review.

## Inspect

Read the Writer prompt, `prompts/writers/index.yaml`, its recommended entries in `prompts/levels/levels.yaml`, and enough neighboring Writers to identify collisions or schema drift. Browse for obvious publishing, author, fictional-character, product, and brand conflicts involving the proposed name or identity.

Validate `recommended_levels` against the direct 29-level keys `aa`, `a` through `z`, `z1`, and `z2`; reject legacy compressed meanings or a default mapping whose exact level is absent from the Writer's recommendations.

Open and visually inspect `avatar.webp`; do not infer its contents from metadata.

Check that:

- schema version, ID, directory, locale, avatar path, and recommended levels agree;
- the display name is natural for the locale and not confusingly close to a real person, publisher, brand, or protected character;
- references and extracted high-level features are disclosed when used;
- the prompt creates an original viewpoint, values, structures, and decisions without copying protected expression;
- no instruction invites recognizable style imitation, borrowed characters, plots, names, or fictional worlds;
- the creative guidance is concrete enough to influence writing but cannot override the selected language level;
- the avatar is original, wordless, appropriate, and neither a real-person likeness nor a protected-character imitation;
- the avatar exists as WebP and is covered by Git LFS.

Return actionable findings first with exact paths and fields. Return `PASS` only when there are no findings, with a short summary of name, locale, recommended levels, references, prompt constraints, avatar inspection, and index usage. Return `NEEDS_LEGAL_REVIEW` when material identity or IP uncertainty cannot be resolved editorially.
