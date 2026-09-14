# HaiLibrary agent contract

HaiLibrary separates ungraded series literature from graded picture books. Codex writes source content and committed prompts directly; repository code never generates stories, literary text, or prompts.

Every content skill ends with the same-author loop: finish the output, perform that skill's concrete self-reflection, fix every issue, and repeat until no issue remains.

## Source of truth

- Series live at `works/series/<series-id>/`. `article.yaml` holds planning metadata; optional `research.yaml` records evidence. Each locale has an independently written native-language `locales/<locale>/article.md` and a faithful `audio_script.yaml` made by `$scriptize-article`.
- Picture books live at `works/<level>/<category>/<subcategory>/<slug>/`, limited to `aa`, `a` through `n`. Each derives from one series through required `book.yaml` `source: {series, volume, volumes}`; every volume has a complete beginning, development, turn, and resolution.
- Schema-2 `book.yaml` contains `id`, `type`, `style`, `status`, `locales`, `labels`, `characters`, `cover`, and `source`. Characters have `id`, `kind`, `description`, and `visual_identity`; picture books have no voice identity or cast.
- Schema-2 `artwork.yaml` declares Style, aspect ratio, prohibited embedded text, shared locale artwork, and cover/page assets. Each asset has an ID, WebP file, concise scene, and complete content/composition prompt; Style treatment stays in the referenced Style prompt.
- Each schema-3 locale `story.yaml` has `language`, `writer`, `title`, `summary`, `chapters`, `questions`, and `article.pages[].paragraphs[]`. Locales share page and illustration IDs. Picture books have no audio script, cast, speaker, research file, or legacy top-level pages.
- Mark target words inline only after prose stabilizes. Vocabulary lives at `vocabulary/<level>/<id>/entry.yaml`; new entries include a complete wordless `card_prompt` and one shared `card.webp`.
- Every locale references a Writer under `prompts/writers/`; every book references a Style under `prompts/styles/`. Use only label IDs from `prompts/labels/index.yaml`. Track publishable media with Git LFS. Quote YAML strings containing commas or colons.

## Workflow

1. `$write-article`: plan the series, research when needed, independently write each locale in its native language, and self-revise strictly.
2. `$scriptize-article`: convert each final locale article into a faithful chaptered multi-speaker audiobook script and compare it back to the source.
3. `$adapt-article`: derive complete `aa`–`n` picture-book volumes, stabilize prose and pagination, invoke `$vocabulary`, author artwork prompts, generate all images with `tools/imagegen`, visually inspect them, and run `check-work`.
4. Use `$writer` or `$style` when creating or materially revising those reusable resources; each includes originality, usability, identity, and IP risk self-checks.

Browse primary or authoritative sources for checkable article claims and live monolingual dictionaries, language standards, and curriculum sources for vocabulary evidence. Tools may validate, compile, render, and generate images only from committed prompts. Preserve image bytes for text-only changes.

## Catalog contract

The TypeScript build emits immutable catalog indexes and shards, localized labels and taxonomy, one manifest and independently loadable locale file per picture book, Writer and Style profiles, and vocabulary entries. The website displays picture books only in this phase; series articles and audiobooks are not catalog content. Store relative URLs without a leading slash. Do not hand-edit generated JSON or commit `dist/`.

## CLI help

Use only repository-installed CLIs with `--no-install`.

```sh
npx --no-install hailibrary-check-work --help
npx --no-install hailibrary-check-work works/series/<id>
npx --no-install hailibrary-check-work works/<level>/<category>/<subcategory>/<slug>
```

The work path must be exactly two segments below `works/` for a series or four for a picture book. Exit status `0` means success/help, `1` validation failure, and `2` invalid usage.

Show image generator help without changing state:

```sh
go run ./tools/imagegen --help
```

Generate picture-book assets or one vocabulary card from committed prompts:

```sh
go run ./tools/imagegen works/<level>/<category>/<subcategory>/<slug>
go run ./tools/imagegen vocabulary/<level>/<id>
go run ./tools/imagegen --only cover,p01 --force --concurrency 2 --size 1536x1024 --quality high works/<level>/<category>/<subcategory>/<slug>
go run ./tools/imagegen --only card --force --dry-run vocabulary/<level>/<id>
```

The tool accepts a schema-2 picture-book directory or a `vocabulary/<level>/<id>` directory. For books it combines each `artwork.yaml` asset prompt with the referenced Style prompt and derives size from `aspect_ratio`. For vocabulary it reads `entry.yaml.card_prompt`, writes the file named by `entry.yaml.card`, appends a fixed concise neutral illustration treatment plus the no-text rule, and defaults to `1024x1024`.

It reads `OPENAI_API_KEY`, optional `OPENAI_IMAGE_MODEL`, and optional `OPENAI_BASE_URL` from the process environment first and repository-root `.env` second. `OPENAI_BASE_URL` defaults to `https://api.openai.com` and may point to a proxy or gateway. By default it skips existing assets, uses two concurrent requests, and requests compressed WebP. `--only <id,...>`, `--force`, `--dry-run`, `--concurrency N`, `--model`, `--size`, and `--quality` apply to both directory types; the vocabulary asset ID is `card`. Exit status `0` means success/help, `1` generation or validation failure, and `2` invalid usage.

## Repository rules

- Never embed provider keys or voice IDs. Keep `.env` ignored.
- Writers express original preferences, not recognizable imitation; artwork prompts must not name living artists or protected characters.
- Preserve all 29 Level files and ordered labels, but create picture books only at `aa` through `n`.
- Generate book images and vocabulary cards only through `tools/imagegen` from committed prompts.
- Do not commit uncompressed generated PNG sources unless explicitly required.
