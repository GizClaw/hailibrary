# Hai! Library

English | [简体中文](README.zh-CN.md)

Hai! Library is an AI-assisted graded reading library for language learners of all ages and proficiency levels.

```text
works/<level>/<category>/<subcategory>/<title>/
```

Books are authored as YAML. Every locale targets the directory level, shares the same wordless page illustrations, and identifies speakers for future TTS. Codex creates and reviews content by following `AGENTS.md`; this repository contains no model-calling generation harness.

Vocabulary lives under `vocabulary/<level>/<id>/`. Target words are marked inline in story content; one entry contains all localized terms and one shared word-card image.

See `prompts/levels/levels.yaml` for the draft level standard, `prompts/vocabulary/index.yaml` for concrete vocabulary datasets and provenance, `prompts/vocabulary/ranges.yaml` for locale-specific grading criteria, and `docs/catalog.md` for the sharded runtime JSON design.

## Content quality harness

Hai! Library uses a layered review harness rather than trusting a single generation or review pass:

- source rules constrain every work's level, structure, locales, speakers, questions, vocabulary, and shared artwork;
- the local checker validates schemas, cross-locale page alignment, referenced Writers, Styles, vocabulary entries, files, and Git LFS resources;
- native-language review reads each locale independently and consults live monolingual dictionaries, language standards, corpora, and genre-matched native writing when usage is uncertain;
- full-work review checks level fit, narrative coherence, question evidence, vocabulary, artwork, and independently verifies real-world claims with authoritative web sources;
- after any fix, the complete deterministic and editorial reviews run again. A work is ready only when the checker passes and a fresh review reports no findings.

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

## Project Skills

Codex can discover the repository Skills in `.agents/skills/` automatically. They can also be invoked explicitly:

```text
$create-work
$review-native-language
$review-work
$create-vocabulary
$review-vocabulary
$create-writer
$review-writer
$create-style
$review-style
$review-artwork
```
