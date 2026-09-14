---
name: create-work
description: Orchestrate creation or material revision of graded HaiLibrary picture books derived from an existing series article—从已有系列文章创建或重做分级绘本，串联改编、词汇、生图、校验和审核；不创作系列文章或有声书脚本。
---

# Create derived picture books

Use this Skill for books at `works/<level>/<category>/<subcategory>/<slug>/`, limited to `aa` through `n`. The source series must already have reviewed locale articles. Use `$write-article` separately when literature needs creation or repair.

1. Confirm the source series, requested locales, final articles, readers, and visual authorization.
2. Apply `$adapt-article` to choose level, volumes, pages, Style, shared visual plan, and create schema-2 `book.yaml`, schema-2 `artwork.yaml`, and schema-3 locale `story.yaml`.
3. Review prose before vocabulary. Mark only present forms; use `$create-vocabulary` for new entries/cards and `$review-vocabulary` for every used entry.
4. For new or authorized artwork, run `go run ./tools/imagegen <work-dir> [flags]`. It consumes only committed asset and Style prompts.
5. Run `npm run check-work -- <work-directory>` and fix deterministic failures.
6. Run fresh Writer, Style, vocabulary, optional artwork, and full-work reviews. Fix authorized findings and repeat.

Picture books contain no `article.md`, `research.yaml`, `audio_script`, cast, speaker, voice identity, or legacy top-level pages. Source series and volume fields are mandatory. Every volume is complete; chapters cover each page once in order; questions cite sufficient evidence; locales share meanings and art while adapting their own source naturally.

For text-only revisions, preserve image bytes. Do not hand-edit generated catalog JSON or `dist/`. Finish only when validation passes and a fresh review has no findings.
