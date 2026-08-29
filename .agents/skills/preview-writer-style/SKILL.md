---
name: preview-writer-style
description: Generate a disposable HaiLibrary prompt preview from one locale Writer, one exact Level, and one visual Style—直接输出短例文、对应画面描述和简短诊断，用于调试 Writer/Level/Style prompt；不创建或修改正式作品。
---

# Preview a Writer and Style

Produce a small, disposable preview that makes prompt behavior easy to judge. Output the generated material directly in the conversation. Do not create a work directory, edit source YAML, generate catalog JSON, or treat the preview as publishable content.

## Resolve the configuration

Resolve one locale-specific Writer and one Style from the repository:

- read `prompts/writers/index.yaml` and `prompts/writers/<locale>/<writer>/prompt.yaml` completely;
- read the selected Writer's creative `prompt`, native-language `language_prompt`, personality, values, and creative preferences;
- resolve an exact Level through `prompts/levels/index.yaml` and read its complete `prompts/levels/<level>.yaml` record, including `prompt`;
- read `prompts/levels/locale-references.yaml` and the selected locale vocabulary range only far enough to keep the sample appropriate;
- read `prompts/styles/<style>/prompt.yaml` completely, including its visual treatment, continuity, exclusions, and generation `prompt`.

Use a user-specified Level when it is recommended by the Writer. If the user omits the Level, choose the middle entry in `recommended_levels` and state the choice. If an explicitly requested Level is outside the Writer's recommendations, flag the mismatch and continue only when the user clearly wants an off-range stress test.

If the Writer, locale, or Style cannot be resolved unambiguously, ask one concise question instead of silently substituting another profile.

## Generate the preview

Invent one low-stakes scene with no material real-world factual claim. Keep it independent of existing HaiLibrary works and reference reading.

Compose the prompts with strict ownership:

1. The exact Level controls language and reading difficulty.
2. The Writer creative prompt controls viewpoint, values, subject choices, and narrative decisions.
3. The Writer language prompt controls native phrasing, narrative flow, and read-aloud naturalness.
4. The Style controls only the matching visual treatment. It must not alter prose wording or difficulty.

The prose sample is deliberately smaller than a complete book, so do not force full-work page counts, total-unit minimums, chapters, questions, vocabulary cards, research, or artwork manifests into it. Preserve the Level's sentence, vocabulary, inference, and natural-language expectations.

Write the preview first as one continuous article excerpt without speaker markup or page divisions. Do not use this preview Skill to force multiple voices. If the user also wants to inspect the TTS adaptation, apply `$scriptize-article` to the completed excerpt as a separate displayed result.

Scale the sample enough to reveal prompt behavior:

- `aa`-`c`: four to six short lines or beats;
- `d`-`p`: six to twelve lines or a few compact paragraphs;
- `q`-`z2`: three to five coherent paragraphs, with dialogue only when natural for the form.

## Output directly

Return, in this order:

1. one compact configuration line naming locale, exact Level, Writer, and Style;
2. `例文` / `Sample`, containing the finished prose as reader-facing text rather than YAML, JSON, a prompt, or an explanation;
3. `画面描述` / `Visual preview`, containing one concise, ready-to-use scene description composed from the sample event and the Style prompt, with no visible text requested in the image;
4. `调试观察` / `Prompt observations`, with concise evidence of whether the Writer voice, continuous article flow, exact Level, and Style are actually visible in the output, plus any prompt weakness revealed by the sample. Explicitly ask whether the same sample could plausibly have been produced by a neighboring Writer; if so, flag weak Writer differentiation instead of praising generic naturalness.

Do not claim the Style prompt has been visually proven when only a written scene description was produced. If the user explicitly asks to see the Style rendered, generate one disposable preview image, show it in the conversation, and still do not write it into `works/`.

Do not run the full `create-work` or review-fix workflow for this disposable preview. If the user later approves the direction and asks to create or revise a real book, switch to `$create-work` and treat that as separate authorization.
