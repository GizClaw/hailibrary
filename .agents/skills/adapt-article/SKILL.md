---
name: adapt-article
description: Derive one or more aa-n graded picture-book sets from a complete multilingual HaiLibrary series article—把完整多语言系列文章忠实改编为一套或多套 aa-n 分级绘本，规划册数、分页、共享画面、Style 和生图 prompt；不写源文章、不生成图片。
---

# Adapt a series article into picture books

Derive complete picture-book volumes from `works/series/<series-id>/`. Each locale adapts its own `article.md`; locales share volume structure, page IDs, visual events, and artwork. Follow `AGENTS.md`.

## Load source and contracts

Read complete `article.yaml`, optional `research.yaml`, every requested locale `article.md`, and each Writer prompt. Confirm articles are final, native, mutually consistent in shared events, and factually supported. Return `ARTICLE_FIX_REQUIRED` instead of repairing a defective source indirectly.

Read `prompts/levels/index.yaml`, every candidate exact level file, `prompts/levels/locale-references.yaml`, `prompts/vocabulary/index.yaml`, `prompts/vocabulary/ranges.yaml`, `prompts/labels/index.yaml`, and candidate Style prompts. Target only `aa`, `a` through `n`.

## Design sets and volumes

For each selected level decide total volumes, page count per volume, and a shared page plan. Every volume needs a complete beginning, development, meaningful turn, and satisfying resolution or complete nonfiction movement. Do not slice at a page-count boundary or leave a volume as mere setup.

Condense and select source material while preserving essential events, facts, causality, characters, viewpoint, tone, and ending. You may omit subplots and re-sentence, but may not invent lessons, motivations, solutions, dialogue, or facts. Choose an existing Style and define stable character `visual_identity` descriptions sufficient for asset continuity.

## Write each book

For every volume create schema-2 `book.yaml` with required `source: {series, volume, volumes}`; schema-2 `artwork.yaml`; and schema-3 `locales/<locale>/story.yaml` with `language`, `writer`, `title`, `summary`, ordered `chapters`, `questions`, and `article.pages`.

Adapt each locale independently from its own article using exact level and locale contracts. Keep shared page events and illustration IDs aligned while allowing natural sentence order, emphasis, idiom, and rhythm. Dialogue uses native quotation and attribution. Pages remain continuous prose, not isolated summaries.

Paragraphs use `{text}` or `content` segments containing `{text}` and later `{vocabulary: {id, text}}`. Do not select vocabulary until prose and pagination are stable. Do not create picture-book `article.md`, `research.yaml`, `audio_script`, `cast`, `speaker`, or top-level `pages`.

Chapters cover every page exactly once and in order. Questions follow stable pagination; every answer is supported by `page_refs` and fits the exact level.

## Author artwork prompts

Each asset uses `id: cover` or its page ID, `file: artwork/<id>.webp`, a one-sentence `scene`, and a complete `prompt`. Describe visible action, setting, characters using exact `visual_identity`, continuity, camera, composition, focus, and exclusions. Do not repeat Style medium or aesthetics; the image tool appends the committed Style prompt. Do not request text, letters, numbers, logos, captions, speech bubbles, signatures, or watermarks.

Quote every YAML string containing a comma or colon, especially flow values. This Skill writes prompts only and never generates images.

## Validate and hand off

Read each volume and the whole set continuously. Check exact-level ceilings and floors, complete arcs, source fidelity, locale equivalence, shared page alignment, question evidence, prompt-to-page compatibility, and schemas. Then use `$create-vocabulary` and `$review-vocabulary`; later generate images with `go run ./tools/imagegen <work-dir> [flags]`, validate, and run `$review-work`.
