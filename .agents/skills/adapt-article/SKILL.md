---
name: adapt-article
description: Turn a final multilingual HaiLibrary series article into complete aa-n picture-book volumes, vocabulary, prompts, images, and validated files—把最终版多语言系列文章完整制作成 aa-n 分级绘本，包括分册分页、词汇、prompt、生图和确定性校验。
---

# Adapt a series into picture books

Own the complete derivative workflow for `works/<level>/<category>/<subcategory>/<slug>/`: adaptation, vocabulary, artwork generation, and deterministic validation. Do not write or repair the source series here. Book slugs are global IDs: name each volume `<series-id>-<level>-<volume>` (for example `the-helper-we-built-j-1`) so no two books share a slug across levels. Read [references/level-and-vocabulary-contract.md](references/level-and-vocabulary-contract.md) before choosing levels or vocabulary.

## Load source and contracts

Read the complete series plan, optional research, every requested locale article, selected Writers, exact `aa`–`n` Level files and locale references, labels, vocabulary ranges/index, and candidate Styles. Each locale adapts its own article; all locales share volumes, page IDs, meanings, visual events, and artwork.

## Design and write the volumes

For each selected level, choose coherent volumes and page counts. Every volume needs its own beginning, development, meaningful turn, and resolution. Condense, simplify, omit subplots, and re-sentence while preserving facts, causality, characters, viewpoint, tone, and ending; do not invent lessons, motivations, solutions, dialogue, or facts.

Create schema-2 `book.yaml`, schema-2 `artwork.yaml`, and schema-3 `locales/<locale>/story.yaml`. Use required `source: {series, volume, volumes}`. Chapters cover every page once in order; questions are supported by stable `page_refs`. Picture books contain no `article.md`, `research.yaml`, audio script, cast, speaker, voice identity, or legacy top-level `pages`.

Adapt each locale naturally at the exact Level while keeping page meanings and illustration IDs aligned. Stabilize prose and pagination before selecting target words. Then invoke `$vocabulary` for every new or changed entry and add only surface forms already present in the prose.

## Author artwork prompts and generate images

Choose a reusable Style and stable character `visual_identity` values. Every cover/page asset needs a concise scene and a complete prompt describing visible action, setting, exact character appearance, continuity, camera, composition, focus, and exclusions. Leave medium and treatment to the Style. Never request visible text, letters, numbers, logos, captions, speech bubbles, signatures, or watermarks.

After prompts are committed, run `npx --no-install hailibrary-imagegen <work-dir> [flags]`. Preserve existing image bytes for text-only changes. Run `npx --no-install hailibrary-check-work <work-dir>` and fix every deterministic error.

## Author self-reflection

This is the complete editorial and visual review. The same author must execute every action for every volume and locale, fix every finding, then restart the entire checklist from item 1. Checking only edited lines is not sufficient.

1. Write a four-part beat line for each volume: beginning, development, meaningful turn, and resolution. Point each beat to actual pages. Even at `aa` and other low levels, reject an arbitrary source slice, a final page that merely stops, or a problem left unresolved; repaginate or redraw the volume boundary until it has a complete arc.
2. Compare every page and question with that locale's source article. Mark the source event supporting it and delete any added event, fact, motivation, solution, moral, explanatory lesson, or dialogue. Confirm omissions and simplifications do not change causality, viewpoint, tone, character, factual boundary, turn, or ending.
3. Read the exact Level file and locale reference, then measure page count, total units, per-page units, sentence units, sentence count, and new words. Separately test the qualitative lower bound: reading goal, structure, cohesion, knowledge demand, illustration reliance, inference, and required question types. Fix both material that exceeds the ceiling and material simplified below the floor.
4. Read pages in order without the source beside them. At every page turn, state what changed and how the next page follows. Repair unexplained jumps in time, place, character position or knowledge, object state, action, pronoun reference, and causality.
5. Build a row for every page ID with each locale's event and illustration ID. Confirm the page-ID sequence, illustration ID, visible participants, action, setting, object state, and narrative function match across locales; confirm chapter IDs and page coverage match exactly. Rewrite each locale independently so alignment does not produce translated or unnatural wording.
6. For each page, read all locale text, then its `artwork.yaml` `scene` and `prompt`. List every visible action, character, prop, location, and state required by the text; confirm scene and prompt depict the same moment without contradiction, omission, or an event borrowed from another page.
7. For each cover and page prompt, list every fixed character said to appear. Copy that character's complete appearance from `book.yaml.visual_identity`, then verify the prompt explicitly describes all of those traits and does not substitute another locale's name or appearance. Check recurring clothing, body, props, location, and object construction across the complete asset set.
8. For every question, open every page named by `page_refs`, quote in working notes the exact sentence or sentences that establish the answer, and add every evidence page needed for the answer. Remove wrong or irrelevant refs. Confirm the prompt and answer require only this volume, not another volume or the source article.
9. For every question, demonstrate that its declared type matches the cited evidence: sequence asks for order, cause-effect contains an actual cause and result, evidence asks the reader to locate support, main-idea spans the volume, and other types meet the exact Level contract. Rewrite mislabeled or unsupported questions.
10. Normalize each question prompt by removing whitespace and punctuation and compare it with every question in every other volume of the same series, in every locale. Replace copied or near-identical prompts, and also compare meanings so translated or lightly reworded duplicates do not survive the mechanical check.
11. Inspect `book.yaml`, `artwork.yaml`, and every `story.yaml` scalar containing a comma or colon and quote it. Parse every YAML file, inspect the resulting keys and null values, and repair flow mappings truncated into unintended extra keys.
12. Open the original pixels of every generated cover, page image, and new vocabulary card; do not infer quality from filenames, prompts, or generation success. Check for visible text, letters, numbers, logos, captions, bubbles, signatures, watermarks, wrong scene, missing or altered characters, visual-identity drift, unsafe or impossible action, broken anatomy or objects, bad crop, aspect ratio, Style mismatch, and cross-page continuity. Correct the committed prompt when needed, regenerate, and reinspect the complete set.
13. Run `npx --no-install hailibrary-check-work <work-dir>` for every volume. Fix every error, rerun it, then restart this entire editorial checklist because deterministic success does not prove narrative, evidence, or visual correctness.

Only deliver corrected, generated, visually inspected books after a full restarted pass has no finding.
