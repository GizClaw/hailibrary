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

This is the work's editorial review. The same author must execute every action below, record or retain enough notes to know each item was actually checked, fix every finding, then restart the complete checklist from the first item. Do not hand off until a full fresh pass finds nothing:

1. Outline the opening, each scene's desire or pressure, resistance, character choice, immediate consequence, turn, and ending. Repair any scene that changes nothing, any coincidence that solves the conflict, and any turn or ending that has not been earned by prior action.
2. Read each character's dialogue alone from beginning to end. Confirm the voices remain distinguishable and speakable, every line serves an immediate character intention, and no character recites exposition, a learning goal, a slogan, or the story's moral. Rewrite preachy or interchangeable dialogue.
3. Read the ending against the opening conflict and every planted promise. Confirm that the central consequence is faced, the emotional and causal arcs close, and the ending does not merely stop, summarize a lesson, or introduce an unprepared solution.
4. Make a scene-by-scene continuity table for time, location, character position and knowledge, carried or moved objects, clothing, injuries, weather, and other persistent state. Trace every change forward and repair contradictions, impossible travel, missing objects, or knowledge a character could not yet have.
5. Build a claim inventory for each locale using `references/fact-checking.md`. Include explicit facts and implicit ordinary assumptions about scale, timing, physical causality, character capability and knowledge, culture, health, and safety. For each item, open the cited authoritative source, locate the supporting passage, and match it to a claim in `research.yaml`; use a second independent authority for contested, surprising, culturally sensitive, medical, historical, or safety-critical claims.
6. Classify each claim as supported, misleadingly simplified, unsupported, outdated, culturally overgeneralized, common-sense or causal error, internally inconsistent, declared fiction, or acceptable learner simplification. Correct the article or evidence, preserve stated uncertainty and scope, and rerun the complete claim inventory after any factual edit. A fantasy label does not excuse an accidental real-world error.
7. Create a shared-event list and compare every locale against it from beginning to end. Confirm premise, characters, events, causality, viewpoint, factual boundaries, turn, and ending agree; then read each locale without looking at the other and remove translation-shaped syntax, matched sentence scaffolding, unnatural idiom, and non-native dialogue while preserving those shared events.
8. Inspect the complete work for age-appropriate audience safety. Repair normalized dangerous imitation, missing consequences, frightening or humiliating treatment unsupported by the audience and story, stereotypes, exclusion, or illustrations implied by the prose that would make an unsafe action look ordinary.
9. Read each locale aloud from beginning to end. Remove cliché, redundancy, report-shaped exposition, generic description, pacing stalls, and unintentional ambiguity; confirm sensory detail and scene transitions remain concrete and clear.

Only hand off the corrected final source after the restarted checklist passes.
