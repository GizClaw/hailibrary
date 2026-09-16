---
name: adapt-article
description: Turn one final multilingual HaiLibrary article into one complete aa-n picture book by summarizing first, compressing to a target page count, then creating vocabulary, prompts, images, and validated files—把一篇最终版多语言文章先概括、再压缩成一本 aa-n 分级绘本，并完成词汇、prompt、生图和校验。
---

# Adapt one article into one picture book

Own the complete derivative workflow for one `works/<level>/<category>/<subcategory>/<slug>/`. One standalone article at `works/articles/<article-id>/` or series child at `works/series/<series-id>/<article-id>/` produces exactly one picture book at one level; do not split it into sets or volumes. Prefer `slug: <article-id>` so the book and source article share an ID. Because book slugs are global, use `<article-id>-<level>` only when the preferred slug is already occupied or unsuitable. Read [references/level-and-vocabulary-contract.md](references/level-and-vocabulary-contract.md) before choosing the level or vocabulary.

## Read the source and choose the target

Read the complete `article.yaml` and every requested locale's complete `article.md`. Read `article.yaml.type`, then read `prompts/article-types/<type>/prompt.yaml`, especially `picture_book.level_range` and `picture_book.adaptation_notes`. Also read the source research when present, selected Writers, labels, candidate Styles, and the Level and vocabulary references required by the linked contract.

Choose one exact level within both the article type's allowed range and `aa`–`n`. Read the complete exact Level file and locale references before deciding the page count. Select one target page count inside that Level's page range that can carry the essential causal arc without padding or crowding. Use the source's `picture_book.level` when already decided; do not write the legacy `picture_books` list.

## Summarize, then compress

Before writing pages, make a concise story synopsis for each locale from that locale's own `article.md`. Each synopsis must state the beginning, development, meaningful turn, and resolution, plus the characters, events, causal links, and facts that must survive adaptation. Compare the locale synopses only to align their shared events and factual boundary; do not translate one synopsis into the other.

Create one shared target-page map. For every page ID, identify which synopsis beat it carries and what happens visibly on that page. Fit the map to the chosen page count by removing side plots, repetition, secondary detail, and excess explanation while preserving the main line and ending. Do not add an event, clue, motivation, solution, dialogue, fact, or lesson absent from the source. If the complete arc cannot fit the selected Level honestly, choose a more suitable allowed level rather than splitting the work.

Only after the synopsis and page map are stable, write each locale's page text independently under the exact Level language requirements. Compose from the shared page meaning, never word-for-word from another locale. Apply the linked reference's complete language contract sentence by sentence. Low-level simplification shortens and simplifies grammar; it never breaks it. If a natural sentence cannot fit the Level's unit limit, re-plan the page meaning instead of emitting an ungrammatical sentence.

The locales share page count, page IDs, page meanings, visible events, and illustration IDs, while retaining native wording, information order, sentence structure, and idiom. Then write questions with stable page-level evidence and author the illustration scenes and prompts from the shared visual event map.

Create schema-2 `book.yaml`, schema-2 `artwork.yaml`, and schema-3 `locales/<locale>/story.yaml`. Use `source: {article: <article-id>}` for a derived book regardless of which article layout contains the globally unique ID; never use `source.series`. `volume` and `volumes` are legacy optional fields and default to `1/1`. Chapters cover every page once in order. Picture books contain no `article.md`, `research.yaml`, audio script, cast, speaker, voice identity, or legacy top-level `pages`.

Stabilize prose and pagination before selecting target words. Then invoke `$vocabulary` for every new or changed entry and add only surface forms already present in the prose.

## Author artwork and generate images

Choose a reusable Style and stable character `visual_identity` values. Every cover/page asset needs a concise scene and a complete prompt describing visible action, setting, exact character appearance, continuity, camera, composition, focus, and exclusions. Leave medium and treatment to the Style. Never request visible text, letters, numbers, logos, captions, speech bubbles, signatures, or watermarks.

After prompts are committed, run `npx --no-install hailibrary-imagegen <work-dir> [flags]`. Preserve existing image bytes for text-only changes.

## Author self-reflection

The same author must execute every item for the complete book and every locale, fix every finding, then restart the entire checklist from item 1. Checking only edited lines is insufficient.

1. Re-read the complete source article and type prompt. Write the book's beginning, development, meaningful turn, and resolution with actual page references; reject an arbitrary slice, unresolved problem, changed factual boundary, or ending that merely stops.
2. Compare each locale's synopsis with its own complete source. Account for every must-preserve character, event, causal link, fact, viewpoint, tone, turn, and ending; remove invented material and repair omissions that change the main line.
3. Compare the shared page map with every synopsis. Confirm every page advances a named beat, all essential beats fit the target count, removed material is genuinely secondary, and no page is padding or an unsupported bridge.
4. Read the exact Level file and locale reference, then measure page count, total units, per-page units, sentence units, sentence count, and new words. Separately test the qualitative floor: reading goal, structure, cohesion, knowledge demand, illustration reliance, inference, and required question types.
5. Apply the linked reference's complete language diagnostics to every page sentence in each locale. Fix every accidental omission, telegraphic calque, register break, or line that a native adult reading aloud to a child would not say; preserve licensed native constructions and intended meaning.
6. Read pages in order without the source beside them. At every turn state what changed and how the next page follows; repair jumps in time, place, position, knowledge, object state, action, reference, or causality.
7. Build one row per page ID with every locale's event and illustration ID. Confirm page order, visible participants, action, setting, object state, and narrative function align, while each locale remains independently natural.
8. For each page, compare all locale text with its artwork scene and prompt. List every visible action, character, prop, location, and state required by the text; repair contradiction, omission, or a moment borrowed from another page.
9. For every cover/page prompt, copy the complete fixed appearance of each present character from `book.yaml.visual_identity`; verify recurring clothing, body, props, location, object construction, composition, and exclusions across the asset set.
10. For every question, open all `page_refs` and record the exact sentence or sentences establishing the answer. Confirm its declared type matches the Level contract and the answer requires only this book. If legacy data leaves multiple books for the same source article, also remove copied or near-identical question prompts across those books.
11. Inspect every YAML scalar containing a comma or colon, quote it, parse every YAML file, and repair unintended keys or null values.
12. Open the original pixels of every generated cover, page image, and new vocabulary card. Check text artifacts, wrong scene, missing or altered characters, identity drift, unsafe or impossible action, anatomy or object errors, crop, aspect ratio, Style, and cross-page continuity; correct prompts, regenerate, and reinspect the complete set.

Only deliver the corrected, generated, visually inspected single book after a full restarted pass has no finding.
