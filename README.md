# Hai! Library

English | [简体中文](README.zh-CN.md)

Hai! Library is an AI-assisted graded reading library for language learners of all ages and proficiency levels.

```text
works/<level>/<category>/<subcategory>/<title>/
```

Ungraded literature lives as standalone articles under `works/articles/<article-id>/` or as ordered collections with `works/series/<series-id>/series.yaml` and child article directories. Every article has a reader `age_range`; localized `titles` provide display names. The `classic` type records public-domain `original` provenance and may begin as a YAML-only skeleton with `locales: {}` until editions are imported. For authored multilingual articles, each locale Writer independently writes a native-language `article.md`, and `$scriptize-article` creates its audiobook script. Graded picture books are derivatives under `works/<level>/...`, limited to `aa` through `n`; `book.yaml` links them with `source: {article: <article-id>}`. They share wordless artwork, use schema-version-3 page text, and have no audio script.

Codex writes articles and committed artwork prompts by following `AGENTS.md`. Repository code never generates stories or prompts. Cover, page, and vocabulary-card images are generated only by `tools/imagegen` from committed prompts.

Vocabulary lives under `vocabulary/<level>/<id>/`. Target words are marked inline in story content; one entry contains all localized terms and one shared word-card image.

See `prompts/levels/index.yaml` and the exact files in `prompts/levels/<level>.yaml` for the draft level standard, `prompts/vocabulary/index.yaml` for concrete vocabulary datasets and provenance, and `prompts/vocabulary/ranges.yaml` for locale-specific grading criteria.

## Content quality

Hai! Library combines explicit source contracts, same-author self-reflection, and deterministic validation:

- source rules separate articles, article collections, and audiobooks from graded picture-book structure, questions, vocabulary, and shared artwork;
- the local checker validates schemas, cross-locale page alignment, referenced Writers, Styles, vocabulary entries, files, and Git LFS resources;
- each of the six content Skills finishes its output, performs a task-specific self-reflection, fixes every issue, and repeats until clear;
- article research uses authoritative sources, while vocabulary creation verifies live dictionaries, language standards, and curriculum evidence;
- `$adapt-article` generates and inspects artwork, then fixes deterministic checker failures.

This process cannot make machine-authored content infallible, but it makes the evidence, failure conditions, and required human escalation explicit and repeatable. The detailed contract lives in `AGENTS.md` and `.agents/skills/`.

## Web app

The static reader lives in `apps/web`; repository tooling lives in `tools/`. The build-time catalog compiler is in `tools/catalog`, and the work validator is in `tools/check-work`.

```sh
pnpm install
pnpm dev
pnpm build
```

The production-ready static site is written to `build/`.

Check one complete work and its referenced resources with:

```sh
npm run check-work -- works/a/fiction/animals/the-lost-kite
```

The same local CLI can also be invoked directly with:

```sh
npx --no-install hailibrary-check-work works/a/fiction/animals/the-lost-kite
```

Generate committed artwork for any supported target, or scan all pending targets with no path:

```sh
npx --no-install hailibrary-imagegen works/a/fiction/animals/the-lost-kite
npx --no-install hailibrary-imagegen vocabulary/a/jump
npx --no-install hailibrary-imagegen --dry-run
```

The command supports picture-book artwork, article covers, vocabulary cards, Writer avatars, and Style thumbnails. It records resumable progress in each target's `imagegen-state.yaml`; a Style ID change rebuilds that complete target, while prompt-only changes require `--force`. It reads `OPENAI_API_KEY`, optional `OPENAI_IMAGE_MODEL`, and optional `OPENAI_BASE_URL` from the environment or repository-root `.env`; environment variables take precedence. Use `--help` for all options and exit statuses.

## Project Skills

Codex can discover the repository Skills in `.agents/skills/` automatically. They can also be invoked explicitly:

```text
$write-article
$scriptize-article
$adapt-article
$vocabulary
$writer
$style
```
