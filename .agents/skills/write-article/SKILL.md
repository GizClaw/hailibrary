---
name: write-article
description: Plan, research, write, and rigorously self-revise a complete typed multilingual HaiLibrary series article—规划、研究、创作并严格修改带文章类型的完整多语言系列文章；不做绘本改编、词汇或有声书脚本。
---

# Write a series article

Create or materially revise `works/series/<series-id>/article.yaml`, optional `research.yaml`, and every requested `locales/<locale>/article.md`. Follow `AGENTS.md`. Finish this source before `$scriptize-article` or `$adapt-article`. Once the article and its Style are final, add a complete wordless `cover_prompt` to `article.yaml` and generate `cover.webp` with `npx --no-install hailibrary-imagegen works/series/<series-id>`.

## Select and obey the article type

Choose one type ID from `prompts/article-types/index.yaml`, record it as `article.yaml.type`, and read the complete `prompts/article-types/<type>/prompt.yaml` before planning. Treat its taxonomy, `research`, `research_guidance`, locale-specific `length`, main `prompt`, and `exclusions` as the writing contract. If proposing a derivative, use the type's `picture_book.level_range` and write one `picture_book: {level: <aa-n>}` entry; never write the legacy `picture_books` list or propose multiple levels or volumes.

## Plan

Read the label and Writer indexes, every selected Writer prompt, and relevant series examples. Plan the stable ID, type, category, genre, Style, controlled labels, research need, shared premise, factual boundaries, conflict, causality, viewpoint, ending, characters, locale Writers, working titles and type-compliant lengths, and optional single-picture-book level.

The plan coordinates events and meaning, not sentences. Do not prewrite pages, questions, vocabulary, illustration beats, or audio blocks.

## Research when needed

Apply the selected type's `research` and `research_guidance`. For science, nature, geography, history, culture, health, safety, real people, or other checkable claims, read [references/fact-checking.md](references/fact-checking.md), browse primary or authoritative sources, and record every story-relevant source and supported claim in `research.yaml`. For wholly invented work with no material real-world claims, use `research: none` only when the type permits it and omit `research.yaml`.

## Write each locale independently

Apply each Writer's creative and native-language guidance, the selected type prompt, its locale length range, and all exclusions. Write directly in the locale's native language from shared events and evidence; do not translate or sentence-match another locale.

Use a title, continuous prose, and optional natural chapters. Add no IDs, page markers, vocabulary markup, speaker metadata, image directions, or production notes. Build concrete scenes around desire, resistance, choice, consequence, sensory specificity, differentiated speakable dialogue, and an earned ending when appropriate to the type. Do not plant details merely for downstream derivatives.

## Author self-reflection

The same author must execute every action below, record or retain enough notes to know each item was checked, fix every finding, then restart the complete checklist from item 1.

1. Re-read the complete selected type file. Verify taxonomy, research mode and guidance, every locale length, prompt requirement, exclusion, and proposed picture-book level; repair every mismatch.
2. Outline the opening, each section or scene's purpose and pressure, resistance, choice or reasoning, immediate consequence, turn, and ending. Repair inert sections, unsupported leaps, coincidence that solves the central problem, and unearned turns or endings.
3. For narrative dialogue, read each character's lines alone. Confirm voices remain distinguishable and speakable, every line serves an immediate intention, and no line recites exposition, a learning goal, slogan, or moral.
4. Read the ending against the opening question or conflict and every planted promise. Confirm the central consequence or answer is faced and the causal arc closes without merely stopping, preaching, or introducing an unprepared solution.
5. Make a continuity table for time, location, character position and knowledge, objects, clothing, injuries, weather, reporting cutoff, and other persistent state relevant to the type. Repair contradictions, impossible transitions, and unavailable knowledge.
6. Build a claim inventory for each locale using `references/fact-checking.md`. Open the cited authoritative evidence for material claims and use a second independent authority where the type or fact-checking contract requires it.
7. Classify each claim as supported, misleadingly simplified, unsupported, outdated, culturally overgeneralized, common-sense or causal error, internally inconsistent, declared fiction, or acceptable learner simplification. Correct prose or evidence and rerun the complete inventory after factual edits.
8. Compare every locale with the shared-event and factual-boundary list. Then read each locale independently and remove translation-shaped syntax, matched scaffolding, unnatural idiom, and non-native dialogue while preserving shared meaning.
9. Inspect the complete work for age-appropriate safety, privacy, dignity, stereotyping, exclusion, and dangerous imitation. Apply any stricter type exclusions.
10. Read each locale aloud from beginning to end. Remove cliché, redundancy, report-shaped exposition where inappropriate, generic description, pacing stalls, and ambiguity; confirm the final unit count remains inside that locale's type range.

Only hand off the corrected final source after the restarted checklist passes.
