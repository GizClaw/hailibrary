# HaiLibrary agent contract

HaiLibrary separates ungraded series literature from graded picture books. Codex writes source content directly; repository code must never generate stories, literary text, or prompts.

## Source of truth

- Series live at `works/series/<series-id>/`. `article.yaml` holds planning metadata (`schema_version`, `id`, `category`, `genre`, `style`, `labels`, `research`, `premise`, `characters`, `locales`, and planned `picture_books`); optional `research.yaml` records evidence. Each locale has an independently written `locales/<locale>/article.md` and a faithful `audio_script.yaml` made by `$scriptize-article`.
- Each locale Writer independently writes its native-language article from shared events. It is not a translation, is not graded, and ignores level clauses in the Writer prompt. `article.md` is authoritative for events, facts, characters, viewpoint, voice, and ending.
- Picture books live at `works/<level>/<category>/<subcategory>/<slug>/`, where `level` is only `aa`, `a` through `n`. Levels `o` and above remain in `prompts/levels/` but are not picture-book targets.
- Every picture book derives from one series through required `book.yaml` `source: {series, volume, volumes}`. Every volume needs its own complete beginning, development, turn, and resolution; it cannot be an arbitrary excerpt.
- `book.yaml` schema version 2 contains `id`, `type`, `style`, `status`, `locales`, `labels`, `characters`, `cover`, and `source`. Characters use `id`, `kind`, `description`, and `visual_identity`; picture books have no voice identity or cast.
- `artwork.yaml` schema version 2 contains `style`, `aspect_ratio`, `embedded_text: prohibited`, `shared_by_all_locales: true`, and assets for `cover` and every page. Each asset has `id`, `file`, a concise human-facing `scene`, and a complete model-facing `prompt`. Prompts specify content, character appearance consistent with `visual_identity`, and composition, but omit Style treatment and any request for visible text.
- Each locale `story.yaml` schema version 3 contains `language`, `writer`, `title`, `summary`, `chapters`, `questions`, and `article.pages[].paragraphs[]`. Pages share IDs and illustration IDs. Questions contain `id`, `type`, `prompt`, `answer`, and `page_refs`. There is no picture-book `audio_script`, `cast`, `speaker`, or legacy top-level `pages`.
- Mark target words inline in visible paragraphs. Vocabulary remains at `vocabulary/<level>/<id>/entry.yaml` with one shared wordless `card.webp`.
- Every locale references one Writer under `prompts/writers/`; every book references one Style under `prompts/styles/`. All locales share page plans and artwork.
- Use only label IDs from `prompts/labels/index.yaml`. Track publishable media with Git LFS. Quote every YAML string containing a comma or colon, especially in flow mappings.

## End-to-end workflow

1. `$write-article`: plan `article.yaml`, research when needed, and independently write and rigorously revise each locale `article.md`.
2. `$scriptize-article`: only after an article is final, create each locale's faithful audiobook script.
3. `$adapt-article`: design one or more picture-book sets at levels `aa` through `n`, including volumes, pages, Style, complete YAML, and committed artwork prompts.
4. After adapted prose is stable, run `$create-vocabulary` for new entries and `$review-vocabulary` for every used entry.
5. Generate cover and page images only with `go run ./tools/imagegen <work-dir> [flags]` from committed artwork and Style prompts.
6. Run `npm run check-work -- <work-directory>`, then fresh specialized reviews and `$review-work`; fix and repeat until clear.

## `write-article` workflow

Read the series plan, Writer index and locale Writer prompts, label index, and relevant series examples. Plan shared premise, factual boundary, characters, locale Writers and lengths, and proposed picture-book levels/volume counts in `article.yaml`; picture-book plans may target only `aa` through `n`.

Browse primary or authoritative sources before writing science, nature, geography, history, culture, health, safety, real people, or other checkable claims. Record each story-relevant source and supported claim in series `research.yaml`; omit it for a purely invented work when `article.yaml` declares no research.

Each Writer writes its locale article independently in its native language. Apply creative and language guidance but ignore Writer level constraints. Write publication-quality literature with concrete scenes, desire and conflict, causal choices, sensory specificity, speakable differentiated dialogue, and an earned ending. Avoid lectures, slogan dialogue, report-shaped prose, and details planted for questions, pages, vocabulary, audio, or illustrations. Revise strictly for structure, voice, pace, coherence, fact, cliché, redundancy, and sentence-level finish before derivatives begin.

## `scriptize-article` workflow

Use `$scriptize-article` only for `works/series/<id>/locales/<locale>/article.md`. It writes `audio_script.yaml` beside the source as faithful chaptered multi-speaker audiobook markup. Preserve every word and source order except the smallest attribution needed for audio clarity. Prefer series character IDs, define abstract TTS direction, and never add provider IDs, SSML, filenames, events, or explanations. Picture books never use this Skill.

## `adapt-article` and `create-work` workflow

`$create-work` orchestrates derivation from an already reviewed series; it does not write the source article or audiobook. `$adapt-article` reads the series plan, research, every locale article, exact level contracts, Writers, labels, vocabulary references, and candidate Styles.

Choose levels no higher than `n`. For each level choose coherent volumes; for each volume design a complete arc, page count, shared transitions, and visual scenes. Adapt every locale from its own `article.md`, never another locale's wording. Locales share page IDs, meanings, illustrations, and visual events while remaining naturally phrased at equivalent difficulty.

Create each volume's schema-2 `book.yaml`, schema-2 `artwork.yaml`, and schema-3 locale `story.yaml`. Adaptation may condense, omit subplots, simplify, and re-sentence, but preserves facts, causality, characters, viewpoint, tone, and ending. Chapters cover every page once in order; questions follow stable pagination and must be answered by `page_refs`.

Write complete cover and page prompts before image generation. Asset prompts own content, continuity, visual identity, and composition; the Style prompt owns medium and treatment. The Skill writes prompts but never images. Picture books contain no `research.yaml`; evidence remains in the series.

## Vocabulary and artwork workflows

- Select target words only after adapted prose is stable. Mark only present forms, create entries through `$create-vocabulary`, and review every referenced entry through `$review-vocabulary`. Apply locale rules separately.
- Run `go run ./tools/imagegen <work-dir> [flags]` for new book artwork. It reads repository-root `.env` (`OPENAI_API_KEY` required; `OPENAI_IMAGE_MODEL` defaults to `gpt-image-2.5-flare`), with environment variables taking precedence. `.env` must remain ignored.
- Tools may validate, compile, and render committed content, but never generate stories or prompts. Image generation is allowed only through `tools/imagegen` and only from committed asset and Style prompts.
- Preserve all image bytes for text-only changes. Run `$review-artwork` only when pixel review is explicitly in scope.

## Review-fix loop

Review a series for literary quality, independent native-language voice, audiobook fidelity, and research accuracy. Review derived books for source fidelity, exact-level fit, complete volume arcs, pagination, locale alignment, questions, vocabulary, artwork contracts, and schemas. Independently browse authoritative sources for explicit and implicit factual, causal, safety, and common-sense claims; `research.yaml` is evidence, not a substitute for review.

Run `$review-writer`, `$review-style`, and `$review-vocabulary` for referenced resources. Run `$review-artwork` only when visual review is in scope. Report findings with file and stable IDs; after authorized fixes, start fresh specialized and full reviews. Return `PASS` only after a fresh pass has no findings.

Visual review is out of scope unless the request or linked Issue explicitly says `Visual review: in scope` or requests `$review-artwork`. Otherwise check only presence, format, Git LFS, and `artwork.yaml` contracts; never infer pixels from binary diffs.

## Catalog contract

The TypeScript build emits immutable catalog indexes and shards, localized labels and taxonomy, one manifest and independently loadable locale file per picture book, Writer and Style profiles, and vocabulary entries. The website continues to display picture books only; series articles and audiobooks are not catalog content this phase. Store relative URLs without a leading slash. Do not hand-edit generated JSON or commit `dist/`.

## npx command help

Use only the repository-installed CLI with `--no-install`.

```sh
npx --no-install hailibrary-check-work --help
```

Validate either one complete ungraded series article (including locale source articles and optional audiobook scripts) or one schema-v2/schema-v3 graded picture book and all of its referenced Writer, Style, vocabulary, artwork, locale, chapter, question, source-series, and Git LFS resources:

```sh
npx --no-install hailibrary-check-work works/series/<id>
npx --no-install hailibrary-check-work works/<level>/<category>/<subcategory>/<slug>
```

The work path may be absolute or relative to the repository root. It must resolve to exactly two segments below `works/` for `works/series/<id>`, or exactly four segments for a picture book at level `aa` or `a` through `n`. Exit status `0` means the deterministic checks passed or help was shown, `1` means validation failed, and `2` means command usage was invalid. This command does not replace the editorial, visual, vocabulary, or independent web fact-check performed by the review Skills.

Whenever a repository package adds another `bin` command, add its `--help` invocation, arguments, examples, effects, and exit statuses to this section in the same change. Every CLI must implement `-h` and `--help` without changing repository state.

### `imagegen`

Show the image generator's built-in help without changing repository state:

```sh
go run ./tools/imagegen --help
```

Generate the missing WebP cover and page illustrations declared by one picture book, or select assets and override generation settings:

```sh
go run ./tools/imagegen works/<level>/<category>/<subcategory>/<slug>
go run ./tools/imagegen --only cover,p01 --force --concurrency 2 --size 1536x1024 --quality high works/<level>/<category>/<subcategory>/<slug>
go run ./tools/imagegen --dry-run works/<level>/<category>/<subcategory>/<slug>
```

The tool reads `OPENAI_API_KEY`, optional `OPENAI_IMAGE_MODEL`, and optional `OPENAI_BASE_URL` from the process environment first and the repository-root `.env` second. It reads only the committed prompts in the work's `artwork.yaml` and referenced Style `prompt.yaml`; repository tooling must not generate stories or prompts. By default it skips existing assets, uses two concurrent requests, derives the image size from `aspect_ratio`, and asks the API for compressed WebP output. Use `--only <id,...>` to select assets, `--force` to overwrite them, `--dry-run` to print final prompts without an API call or file writes, `--concurrency N` to set parallelism, `--model` to override the model, `--size` to override dimensions, and `--quality` to set image quality. Exit status `0` means success, `1` means generation or validation failed, and `2` means command usage was invalid.

## Repository rules

- Never embed provider keys or voice IDs. Keep `.env` ignored.
- Writers encode original preferences, not recognizable imitation; artwork prompts must not name living artists or protected characters.
- Preserve all 29 level files and ordered labels, but create picture books only at `aa` through `n`. Higher reading belongs to series articles.
- Do not commit uncompressed generated PNG sources unless explicitly required.
