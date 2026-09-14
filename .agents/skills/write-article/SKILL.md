---
name: write-article
description: Write or materially revise a complete ungraded HaiLibrary series article and its planning and research sources—创作或重写完整、不分级的 HaiLibrary 系列文章，并维护规划与研究文件；不做绘本改编、词汇或有声书脚本。
---

# Write a series article

Create or revise `works/series/<series-id>/article.yaml`, optional `research.yaml`, and every requested `locales/<locale>/article.md`. Follow `AGENTS.md`. Finish and review literature before `$scriptize-article`, `$adapt-article`, picture books, or vocabulary work.

## Plan the series source

Read `prompts/labels/index.yaml`, `prompts/writers/index.yaml`, every selected Writer's complete `prompt.yaml`, and nearby series examples. Plan the schema version, stable ID, category, genre, default Style, controlled labels, research need, shared premise, factual limits, conflict, causality, viewpoint, ending, stable characters, locale Writers, working titles and lengths, and optional picture-book proposals. Proposed picture-book levels are only `aa` through `n`, and volume counts start at one.

The plan coordinates meaning, not sentences. Do not prewrite pages, questions, vocabulary targets, illustration beats, audiobook blocks, or downstream teaching details.

## Research when needed

Browse primary or authoritative sources for science, nature, geography, history, culture, health, safety, real people, and other checkable claims. Write series-level `research.yaml` with every story-relevant source, exact supported claim, scope, uncertainty, and access details. Use multiple strong sources for contested, sensitive, or safety-critical claims.

For a wholly invented work without material real-world claims, declare `research: none` in `article.yaml` and omit `research.yaml`. Never turn uncertainty, folklore, or speculation into settled fact.

## Write every locale independently

Read each Writer's creative `prompt` and native `language_prompt`. Apply its interests, voice, structure, and language craft, but ignore every grading, target-level, page-length, vocabulary, or sentence-limit clause. Write directly in that locale's native language from shared events and evidence; never translate, sentence-match, or use another locale as a template.

Use `# <title>`, a blank line, continuous prose paragraphs, and optional natural `## ` chapters. Add no front matter, YAML, IDs, page markers, vocabulary markup, speaker metadata, image directions, or production notes.

Write professional literature: stage concrete scenes where a character wants something, meets resistance, chooses, acts, and changes the situation; make stakes and causality emerge through action, sensory detail, rhythm, and selective interiority; make dialogue speakable, purposeful, and distinct; earn the ending from prior choices. Nonfiction needs discovery or argument through scenes and evidence. Avoid sermons, slogan dialogue, canned wonder, report-shaped prose, exposition disguised as speech, and convenient coincidence. Do not plant details merely for later pages, pictures, quizzes, vocabulary, or audio.

## Revise before handoff

Perform structural and line-level passes. Re-read the whole article aloud and fix weak openings, stalled middles, unearned turns, missing causal links, inconsistent characterization, viewpoint drift, redundancy, generic description, cliché, unnatural dialogue, tonal breaks, factual overstatement, and soft endings. Compare locales with the shared premise for equivalent events and factual boundaries while preserving independent literary decisions.

Return `ARTICLE_FIX_REQUIRED` while research or source quality is unresolved. Only after every article passes literary and factual review may `$scriptize-article` create its audiobook and `$adapt-article` derive picture books.
