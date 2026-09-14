---
name: adapt-article
description: Turn a final multilingual HaiLibrary series article into complete aa-n picture-book volumes, vocabulary, prompts, images, and validated files—把最终版多语言系列文章完整制作成 aa-n 分级绘本，包括分册分页、词汇、prompt、生图和确定性校验。
---

# Adapt a series into picture books

Own the complete derivative workflow for `works/<level>/<category>/<subcategory>/<slug>/`: adaptation, vocabulary, artwork generation, and deterministic validation. Do not write or repair the source series here. Read [references/level-and-vocabulary-contract.md](references/level-and-vocabulary-contract.md) before choosing levels or vocabulary.

## Load source and contracts

Read the complete series plan, optional research, every requested locale article, selected Writers, exact `aa`–`n` Level files and locale references, labels, vocabulary ranges/index, and candidate Styles. Each locale adapts its own article; all locales share volumes, page IDs, meanings, visual events, and artwork.

## Design and write the volumes

For each selected level, choose coherent volumes and page counts. Every volume needs its own beginning, development, meaningful turn, and resolution. Condense, simplify, omit subplots, and re-sentence while preserving facts, causality, characters, viewpoint, tone, and ending; do not invent lessons, motivations, solutions, dialogue, or facts.

Create schema-2 `book.yaml`, schema-2 `artwork.yaml`, and schema-3 `locales/<locale>/story.yaml`. Use required `source: {series, volume, volumes}`. Chapters cover every page once in order; questions are supported by stable `page_refs`. Picture books contain no `article.md`, `research.yaml`, audio script, cast, speaker, voice identity, or legacy top-level `pages`.

Adapt each locale naturally at the exact Level while keeping page meanings and illustration IDs aligned. Stabilize prose and pagination before selecting target words. Then invoke `$vocabulary` for every new or changed entry and add only surface forms already present in the prose.

## Author artwork prompts and generate images

Choose a reusable Style and stable character `visual_identity` values. Every cover/page asset needs a concise scene and a complete prompt describing visible action, setting, exact character appearance, continuity, camera, composition, focus, and exclusions. Leave medium and treatment to the Style. Never request visible text, letters, numbers, logos, captions, speech bubbles, signatures, or watermarks.

After prompts are committed, run `go run ./tools/imagegen <work-dir> [flags]`. Preserve existing image bytes for text-only changes. Run `npx --no-install hailibrary-check-work <work-dir>` and fix every deterministic error.

## Author self-reflection

After the complete output exists, the same author checks, fixes, and repeats until no issue remains:

- Does every volume have complete beginning, development, turn, and resolution and remain faithful to its locale source?
- Does prose stay inside the exact Level's lower and upper bounds, sound natural in each locale, and remain continuous from page to page?
- Are cross-locale page meanings, chapters, questions, evidence, vocabulary markers, and illustration IDs aligned?
- Is every artwork prompt compatible with its page text, and are character appearance, props, locations, and action continuous across pages?
- After generation, has every cover, page, and vocabulary card been opened and inspected for visible text, scene accuracy, concept clarity, continuity, and declared treatment?
- Does the deterministic checker pass after all fixes?

Only deliver the corrected, generated, validated books.

