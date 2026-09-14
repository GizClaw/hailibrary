---
name: write-article
description: Plan, research, write, and rigorously self-revise a complete ungraded multilingual HaiLibrary series article—规划、研究、创作并严格自我修改完整的不分级多语言系列文章；不做绘本改编、词汇或有声书脚本。
---

# Write a series article

Create or materially revise `works/series/<series-id>/article.yaml`, optional `research.yaml`, and every requested `locales/<locale>/article.md`. Follow `AGENTS.md`. Finish this source before `$scriptize-article` or `$adapt-article`. Once the article and its Style are final, add a complete wordless `cover_prompt` to `article.yaml` and generate `cover.webp` with `npx --no-install hailibrary-imagegen works/series/<series-id>`.

## Plan

Read the label and Writer indexes, every selected Writer prompt, and relevant series examples. Plan the stable ID, category, genre, Style, controlled labels, research need, shared premise, factual boundaries, conflict, causality, viewpoint, ending, characters, locale Writers, working titles and lengths, and optional picture-book proposals. Picture-book proposals may target only `aa` through `n`.

The plan coordinates events and meaning, not sentences. Do not prewrite pages, questions, vocabulary, illustration beats, or audio blocks.

## Research when needed

For science, nature, geography, history, culture, health, safety, real people, or other checkable claims, read [references/fact-checking.md](references/fact-checking.md), browse primary or authoritative sources, and record every story-relevant source and supported claim in `research.yaml`. For wholly invented work with no material real-world claims, declare `research: none` and omit `research.yaml`.

## Write each locale independently

Apply each Writer's creative and native-language guidance, but ignore grading or page constraints. Write directly in the locale's native language from shared events and evidence; do not translate or sentence-match another locale.

Use a title, continuous prose, and optional natural chapters. Add no IDs, page markers, vocabulary markup, speaker metadata, image directions, or production notes. Build concrete scenes around desire, resistance, choice, consequence, sensory specificity, differentiated speakable dialogue, and an earned ending. Avoid lectures, slogan dialogue, report-shaped prose, exposition disguised as speech, convenient coincidence, and details planted for downstream derivatives.

## Author self-reflection

After writing, the same author performs a strict literary-editor pass, fixes every problem found, and repeats the pass until none remain:

- Does every scene advance desire, conflict, choice, and consequence, with a strong opening, causal middle, earned turn, and satisfying ending?
- Are character voice, viewpoint, dialogue, time, place, and object continuity consistent?
- Is the prose specific, speakable, well paced, and free of cliché, redundancy, preaching, slogan dialogue, and generic description?
- Does every factual claim match `research.yaml` without overstating uncertainty, folklore, or inference?
- Are Chinese and English each natural, idiomatic native-language works that share events and factual boundaries without reading like translations?

Only hand off the corrected final source.

