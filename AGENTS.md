# HaiLibrary agent contract

HaiLibrary separates ungraded articles and article series from graded picture books. Codex writes source content and committed prompts directly; repository code never generates stories, literary text, or prompts.

Every content skill ends with the same-author loop: finish the output, execute every item in that skill's concrete self-reflection checklist, fix every issue, and restart the complete checklist until a fresh pass finds no issue, unless the skill declares a single check pass. This same-author self-reflection is the required editorial review; there is no separate review stage.

## Repository layout

```text
works/articles/<article-id>/              standalone ungraded literature and audio scripts
works/series/<series-id>/<article-id>/    collections and chaptered classics, one child article per story or chapter
works/<level>/<category>/<subcategory>/   graded picture books (aa, a–n)
vocabulary/<level>/<id>/                  vocabulary entries and cards
prompts/                                  levels, vocabulary ranges, taxonomy, labels, article types, Writers, Styles
about/                                    site about page content and artwork
.agents/skills/                           content skills ($write-article, $scriptize-article, $adapt-article, ...)
tools/catalog, tools/check-work, tools/imagegen   build, validation, and image generation CLIs
apps/web/                                 reader website
build/, apps/web/public/                  generated catalog output; never commit
```

This file is the only repository documentation besides the READMEs; do not add a separate `docs/` tree.

## Source of truth

- Standalone articles live at `works/articles/<article-id>/`; collections use `works/series/<series-id>/series.yaml` plus child articles at `works/series/<series-id>/<article-id>/`. Article IDs are globally unique across both layouts, and series IDs are unique and do not collide with them. A child may inherit `type`, `category`, `genre`, and `age_range` from its series. Every new standalone article and series requires `age_range: {min, max?}`; `max` omitted means “min and up.”
- `article.yaml` holds article metadata, including a type from `prompts/article-types/` and an optional single `picture_book: {level}` proposal; optional `research.yaml` records evidence. `titles` supplies localized display titles. `type: classic` requires `titles` and public-domain `original` provenance (`title`, `author`, `countries`, `year`, `language`, plus optional localized `author_names` such as `zh-CN`), with series children shallow-merging inherited `original`; its optional content-planning fields may be absent and `locales: {}` is a valid not-yet-imported skeleton. A classic with chapters or separately titled stories is always a series with one child article per chapter or story; only a single unchaptered story is standalone. Present locales exactly match locale directories, require `article.md`, and may omit `audio_script.yaml`. A classic's front and back matter (prefaces, introductions, notices, notes) is imported and translated as its own child but has no audio script. Non-classic article rules are unchanged. Each completed non-classic locale is independently written in its native language; `$scriptize-article` makes its story-faithful, listening-first `audio_script.yaml`. Every audio cast entry is a single voice. Audio blocks contain `id`, either `speaker` or `speakers` with `ensemble: duo` (two voices speaking together) or `ensemble: chorus` (three or more), and `text`, plus an optional `emotion` limited to `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, or `calm`.
- Picture books live at `works/<level>/<category>/<subcategory>/<slug>/`, limited to `aa`, `a` through `n`. Independent books omit `book.yaml.source`; an article-derived book uses `source: {article: <article-id>}`. Optional legacy `volume` and `volumes` default to `1`. The book has a complete beginning, development, turn, and resolution.
- Schema-2 `book.yaml` contains `id`, `type`, `style`, `status`, `locales`, `labels`, `characters`, `cover`, and `source`. Characters have `id`, `kind`, `description`, and `visual_identity`; picture books have no voice identity or cast.
- Schema-2 `artwork.yaml` declares Style, aspect ratio, prohibited embedded text, shared locale artwork, and cover/page assets. Each asset has an ID, WebP file, concise scene, and complete content/composition prompt; Style treatment stays in the referenced Style prompt.
- Each schema-3 locale `story.yaml` has `language`, `writer`, `title`, `summary`, `chapters`, `questions`, and `article.pages[].paragraphs[]`. Locales share page and illustration IDs. Picture books have no audio script, cast, speaker, research file, or legacy top-level pages.
- Mark target words inline only after prose stabilizes. Vocabulary lives at `vocabulary/<level>/<id>/entry.yaml`; new entries include a complete wordless `card_prompt` and one shared `card.webp`.
- Every locale references a Writer under `prompts/writers/`; every book references a Style under `prompts/styles/`. Use only label IDs from `prompts/labels/index.yaml`. Track publishable media with Git LFS. Quote YAML strings containing commas or colons.

## Workflow

1. `$write-article`: create or import an article, research when needed, independently write each non-classic locale or faithfully import a public-domain classic, and self-revise strictly. For an imported classic, `$translate-classic` renders the complete faithful, natively literary zh-CN locale from the imported source.
2. `$scriptize-article`: adapt each final locale article into a natural chaptered multi-speaker audiobook script, then check complete story fidelity and read-aloud quality against the source.
3. `$adapt-article`: summarize each locale article, compress the shared story into one `aa`–`n` picture book at a chosen target page count, stabilize prose and pagination, invoke `$vocabulary`, author artwork prompts, generate all images with `tools/imagegen`, and visually inspect them.
4. Use `$writer` or `$style` when creating or materially revising those reusable resources; each includes originality, usability, identity, and IP risk self-checks.

After every skill finishes creating or changing content, execute its self-reflection checklist item by item. Do not replace the concrete actions with a general quality judgment, check only edited lines, or hand off after fixes without restarting the full checklist, except in a skill that declares a single check pass.

Before opening a content pull request, create or identify a natively linked Issue. The Issue must state the source article path and derived book path; exact level; category and subcategory; Chinese and English Writer IDs; Style ID; learning goals; page count and illustration count; and measurable acceptance criteria covering successful `hailibrary-check-work`, complete generated images and matching `imagegen-state.yaml`, Git LFS coverage, and page-level evidence for every question.

Browse primary or authoritative sources for checkable article claims and live monolingual dictionaries, language standards, and curriculum sources for vocabulary evidence. Tools may validate, compile, render, and generate images only from committed prompts. Preserve image bytes for text-only changes.

## Catalog contract

The TypeScript build emits immutable catalog indexes and shards, localized labels and taxonomy, one manifest and independently loadable locale file per picture book, one index plus manifest and independently loadable article/audio files per publishable article, Writer and Style profiles, and vocabulary entries. Article cards and manifests expose `ageRange` and, for series children, `seriesId`; classic skeletons with `locales: {}` are skipped. Article manifests group derived picture books in taxonomy level order and source-volume order. Store relative URLs without a leading slash. Do not hand-edit generated JSON or commit `dist/`.

## CLI help

Use only repository-installed CLIs with `--no-install`.

```sh
npx --no-install hailibrary-check-work --help
npx --no-install hailibrary-check-work works/articles/<article-id>
npx --no-install hailibrary-check-work works/series/<series-id>
npx --no-install hailibrary-check-work works/series/<series-id>/<article-id>
npx --no-install hailibrary-check-work works/<level>/<category>/<subcategory>/<slug>
```

The work path must be a standalone article, a series, a child article, or a four-segment picture book as shown above. Exit status `0` means success/help, `1` validation failure, and `2` invalid usage.

Show image generator help without changing state:

```sh
npx --no-install hailibrary-imagegen --help
```

Generate every pending repository image, or limit generation to one or more target directories:

```sh
npx --no-install hailibrary-imagegen
npx --no-install hailibrary-imagegen works/<level>/<category>/<subcategory>/<slug>
npx --no-install hailibrary-imagegen works/articles/<article-id> works/series/<series-id>/<article-id> prompts/writers/<locale>/<id>
npx --no-install hailibrary-imagegen vocabulary/<level>/<id>
npx --no-install hailibrary-imagegen --only cover,p01 --force --concurrency 2 --size 1536x1024 --quality high works/<level>/<category>/<subcategory>/<slug>
npx --no-install hailibrary-imagegen --only card --force --dry-run vocabulary/<level>/<id>
```

With no directory arguments, the tool scans the repository. It recognizes schema-2 picture books, series covers from `series.yaml.cover_prompt`, standalone and series-child article covers when `cover_prompt` exists, vocabulary cards, Writer avatars, and Style thumbnails. Picture books use `artwork.yaml` plus the referenced Style and derive size from `aspect_ratio`; article covers use `article.yaml.cover_prompt` and their effective Style; vocabulary cards use `entry.yaml.card_prompt` plus the built-in neutral treatment; Writer avatars use `avatar_prompt`; and Style thumbnails use `thumbnail_prompt` plus that Style's own prompt. Defaults are `1536x1024` for books with `3:2`, article covers, and Style thumbnails, and `1024x1024` for vocabulary cards and Writer avatars. Every final prompt prohibits embedded text. A missing optional prompt is reported and skipped for compatibility with older content.

Each target stores committed progress in `imagegen-state.yaml`: schema version, effective Style ID or `null`, model, and per-image status, timestamp, and optional error. A missing state or any status other than `done` is generated; each success or failure is persisted immediately so the next run resumes unfinished work. A changed Style ID regenerates the complete target. Prompt text changes, including edits to a Style prompt, do not regenerate completed images; use `--force` and optionally `--only` when that is intended. `--dry-run` prints planned images and a total without API calls or file writes.

The tool reads `OPENAI_API_KEY`, optional `OPENAI_IMAGE_MODEL`, and optional `OPENAI_BASE_URL` from the process environment first and repository-root `.env` second. It uses two concurrent requests by default and requests compressed WebP. `--only <id,...>`, `--force`, `--dry-run`, `--concurrency N`, `--model`, `--size`, and `--quality` apply to every target. Exit status `0` means success/help, `1` generation or validation failure, and `2` invalid usage.

## Repository rules

- Never embed provider keys or voice IDs. Keep `.env` ignored.
- Writers express original preferences, not recognizable imitation; artwork prompts must not name living artists or protected characters.
- Preserve all 29 Level files and ordered labels, but create picture books only at `aa` through `n`.
- Generate book images, article covers, vocabulary cards, Writer avatars, and Style thumbnails only through `tools/imagegen` from committed prompts; commit each target's `imagegen-state.yaml` with its media.
- Do not commit uncompressed generated PNG sources unless explicitly required.
