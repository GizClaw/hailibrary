---
name: write-article
description: Plan, research, write or faithfully import, and rigorously self-revise a complete typed multilingual HaiLibrary article—规划、研究、创作或忠实导入并严格修改带文章类型的完整多语言文章；不做绘本改编、词汇或有声书脚本。
---

# Write an article

Create or materially revise a standalone article at `works/articles/<article-id>/` or a series child at `works/series/<series-id>/<article-id>/`, including `article.yaml`, optional `research.yaml`, and every requested `locales/<locale>/article.md`. Follow `AGENTS.md`. Article IDs are globally unique across both layouts; series IDs are unique and do not collide with article IDs. Finish this source before `$scriptize-article` or `$adapt-article`. Once the article and its Style are final, add a complete wordless `cover_prompt` to `article.yaml` when the effective contract calls for one and generate `cover.webp` with `npx --no-install hailibrary-imagegen <article-dir>`.

## Select and obey the article type

Choose one type ID from `prompts/article-types/index.yaml`, record it as `article.yaml.type`, and read the complete `prompts/article-types/<type>/prompt.yaml` before planning. Treat its taxonomy, `research`, `research_guidance`, locale-specific `length`, main `prompt`, and `exclusions` as the writing contract. If proposing a derivative, use the type's `picture_book.level_range` and write one `picture_book: {level: <aa-n>}` entry; never write the legacy `picture_books` list or propose multiple levels or volumes.

## Plan

Read the label and Writer indexes, every selected Writer prompt, and relevant standalone or series-child examples. Plan the stable article ID, containing series when applicable, type, category, genre, `age_range`, Style, controlled labels, research need, shared premise, factual boundaries, conflict, causality, viewpoint, ending, characters, locale Writers, working titles and type-compliant lengths, and optional single-picture-book level. Every new standalone article and every new series requires `age_range: {min, max?}`; a child inherits it from `series.yaml` and may override it, and an omitted `max` means “min and up.”

The plan coordinates events and meaning, not sentences. Do not prewrite pages, questions, vocabulary, illustration beats, or audio blocks.

## Research when needed

Apply the selected type's `research` and `research_guidance`. For science, nature, geography, history, culture, health, safety, real people, or other checkable claims, read [references/fact-checking.md](references/fact-checking.md), browse primary or authoritative sources, and record every story-relevant source and supported claim in `research.yaml`. For wholly invented work with no material real-world claims, use `research: none` only when the type permits it and omit `research.yaml`.

## Write each locale independently

Apply each Writer's creative and native-language guidance, the selected type prompt, its locale length range, and all exclusions. Write directly in the locale's native language from shared events and evidence; do not translate or sentence-match another locale.

Use a title, continuous prose, and optional natural chapters. Add no IDs, page markers, vocabulary markup, speaker metadata, image directions, or production notes. Build concrete scenes around desire, resistance, choice, consequence, sensory specificity, differentiated speakable dialogue, and an earned ending when appropriate to the type. Do not plant details merely for downstream derivatives.

For `type: classic`, do not independently write, modernize, abridge, or otherwise rewrite the prose. Faithfully import a public-domain original or public-domain translation, preserving its chapter structure and wording; make only mechanical cleanup such as removing transcriber notes or page numbers. Record the required effective `original` provenance and localized `titles`, and record the exact imported public-domain edition or translation in that locale's `article.yaml.locales.<locale>.source_url` and, when applicable, `translator`. A classic series child may inherit and shallow-merge its series `original`. A classic with chapters or with separately titled stories is always a series, never one standalone file: create `works/series/<book-id>/series.yaml` carrying the book's type, taxonomy, `age_range`, `titles`, and `original`, plus one child per source chapter or story, in source order, with `titles.en-US` set to that chapter heading, the locale's `source_url` and applicable `translator`, and that chapter's text alone in `article.md`. Use `<book-id>-NN` child IDs for numbered chapters of one narrative and descriptive IDs for separately titled tales. Only a single unchaptered story is a standalone article. Its optional planning fields may remain absent, and `locales: {}` is valid until a text is actually imported. Render a Chinese locale of an imported classic with `$translate-classic`, not by independent writing.

## Author self-reflection

The same author must execute every action below, record or retain enough notes to know each item was checked, fix every finding, then restart the complete checklist from item 1.

1. Re-read the complete selected type file. Verify taxonomy, research mode and guidance, every applicable locale length, prompt requirement, exclusion, and proposed picture-book level; verify every new standalone article or series has a valid `age_range` and every child correctly inherits or overrides it; repair every mismatch. For a classic, also verify localized titles, effective original provenance, public-domain status, exact locale `source_url` and applicable `translator`, faithful chapter structure and wording, and that edits were limited to mechanical cleanup rather than rewriting.
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
