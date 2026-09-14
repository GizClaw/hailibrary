# HaiLibrary content roadmap

Status: series-first content architecture in progress.

## Content layers

1. `works/series/<id>/` stores complete, ungraded literature. Shared planning lives in `article.yaml`, factual evidence in optional `research.yaml`, and each locale independently owns `article.md` plus its faithful `audio_script.yaml`.
2. `works/<level>/<category>/<subcategory>/<slug>/` stores picture books derived from one series. Picture-book levels are limited to `aa`, `a` through `n`; higher reading is served by the complete series articles.
3. The current website and catalog continue to publish picture books only.

## Production order

1. `$write-article`: plan, research, independently write each locale, and complete strict literary revision.
2. `$scriptize-article`: convert each final locale article into a complete chaptered audiobook script.
3. `$adapt-article`: choose one or more `aa`–`n` levels, divide each set into narratively complete volumes, create shared page plans, select Style, and write schema-2 book/artwork plus schema-3 locale stories.
4. `$create-vocabulary` and `$review-vocabulary`: select targets only after prose stabilizes.
5. `go run ./tools/imagegen <work-dir> [flags]`: generate cover and page WebP assets from committed artwork and Style prompts.
6. Validate, run fresh specialized reviews and `$review-work`, fix, and repeat.

## Quality gates

- Locale articles share events and factual boundaries but are independently written in their native languages.
- Every volume has its own beginning, development, turn, and resolution; it is not an arbitrary article slice.
- Derived prose remains faithful to its own locale source, meets the exact level, and shares page meanings and artwork IDs across locales.
- Series `research.yaml` covers story-relevant claims; fresh review independently verifies facts, causality, safety, and ordinary assumptions.
- Picture books have no audio script, cast, speaker, local research file, or legacy top-level pages.
- Every artwork asset has a committed scene and content/composition prompt; book images are generated only through `tools/imagegen`.

The detailed and authoritative workflow is `AGENTS.md`; concrete series plans live in `works/series/`.
