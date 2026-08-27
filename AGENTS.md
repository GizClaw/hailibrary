# HaiLibrary agent contract

This repository is a multilingual graded-reading library. Codex creates the source books directly; repository code must not call a model to generate stories or illustrations.

## Source of truth

- Store books at `works/<level>/<category>/<subcategory>/<slug>/`.
- The directory is the only source of `level`, `category`, and `subcategory`. Do not repeat or override them in book or locale YAML.
- Author source files in YAML. JSON is generated only for the released web catalog.
- Every locale references exactly one original Writer directory at `prompts/writers/<locale>/<name>/`, containing `prompt.yaml` and `avatar.webp`.
- Every book references exactly one visual Style directory at `prompts/styles/<name>/`, containing `prompt.yaml` and `thumbnail.webp`. All locale editions share that artwork.
- Every locale targets the same directory level by adapting its vocabulary and syntax, not by translating literally.
- Every page has exactly one shared, wordless illustration. All locales use the same page IDs and artwork.
- Mark target words inline in `line.content` with a locale-scoped vocabulary `id`; do not maintain a separate page vocabulary list.
- Store each referenced concept at `vocabulary/<level>/<id>/entry.yaml` with one shared wordless `card.webp`; keep all localized terms inside that entry. External curriculum alignments are references, not substitutes for the HaiLibrary level review.
- Use only controlled discovery labels from `prompts/labels/index.yaml`. Store stable label IDs in `book.labels`; localized display names belong in the central label index, not in individual books.
- Track publishable images, audio, music, and video with Git LFS.

## `create-work` workflow

When asked to create or revise a book:

1. Choose the level, category, subcategory, slug, Writer, locales, learning goals, and factual scope.
2. Read `prompts/levels/levels.yaml`, `prompts/vocabulary/index.yaml`, `prompts/vocabulary/ranges.yaml`, `prompts/labels/index.yaml`, `prompts/writers/index.yaml`, every selected locale Writer's `prompt.yaml`, and the selected Style's `prompt.yaml`.
3. Browse the web before writing when the story depends on science, nature, geography, history, culture, health, safety, a real person, or another checkable real-world claim. Prefer primary and authoritative sources.
4. Record every story-relevant source and supported claim in `research.yaml`. If research is unnecessary for a purely invented story, record `required: false` and a short reason.
5. Design one coherent, audience-safe work whose vocabulary, syntax, questions, and narrative structure satisfy the directory level. A level measures language difficulty, not reader age, genre, format, or narrative ambition. A Writer supplies a locale-specific creative viewpoint and values, never copied prose or an instruction to imitate a person's style.
6. Define every narrator and character in `book.yaml`; define localized display names and complete abstract TTS direction (`delivery`, `timbre`, `pace`, and `pitch`) in each `story.yaml` cast.
7. Write speech as ordered lines with a valid `speaker` ID. Never store an undifferentiated page transcript.
8. Mark target words directly inside structured `line.content`; run `$create-vocabulary` for every new entry or card and `$review-vocabulary` for every new, reused, or changed entry.
9. Define chapters that cover every page exactly once and in reading order.
10. Keep page IDs, meaning, characters, and illustration IDs aligned across locales.
11. Draft each locale independently from shared page events, speaker intent, learning goals, and illustrations; never use another locale's prose as the sentence template.
12. Generate the cover and every page illustration directly with Codex image generation using the selected Style. Images must contain no words, letters, numbers, logos, captions, speech bubbles, or watermarks.
13. Save compressed `.webp` images under the book's `artwork/` directory and describe each scene in `artwork.yaml`.
14. Run `$review-artwork` over the cover and every page illustration.
15. Run `npm run check-work -- <work-directory>` and fix every deterministic resource error.
16. Run `$review-native-language` for every locale, then run the `review-fix-loop` before marking the work ready for PR review.

## `create-writer` workflow

1. Select one locale and one recommended level.
2. Research useful reference reading and extract only high-level interests, values, structures, and creative decisions.
3. Create an original Writer name appropriate to the locale. Search for obvious publishing, character, and brand conflicts before accepting it.
4. Create `prompts/writers/<locale>/<name>/prompt.yaml`; disclose reference reading and explicitly prohibit copied names, characters, plots, wording, and recognizable style imitation.
5. Generate an original `avatar.webp` with Codex. It must contain no text and must not reproduce or closely resemble a real person or protected character.
6. Run `$review-writer`. If material legal uncertainty remains, return `NEEDS_LEGAL_REVIEW` rather than `PASS`.

## `review-writer` workflow

Review the Writer's name, prompt, references, extracted features, avatar, locale, and recommended level. Fail when it copies protected expression, invites recognizable style imitation, uses a confusing real-person or brand identity, reproduces a real person's likeness, borrows protected characters or plots, or lacks source disclosure. This is an editorial risk screen, not a legal opinion.

## `create-style` workflow

Create a reusable visual treatment at `prompts/styles/<name>/` with `prompt.yaml` and a representative `thumbnail.webp`. Define medium, palette, shapes, composition, continuity rules, and exclusions. Describe broad treatments such as realistic, comic, crayon, watercolor, collage, or clay; do not name a living artist or request recognizable style imitation. Run `$review-style` before returning `PASS`.

## Vocabulary and artwork workflows

- Use `$create-vocabulary` to add or materially revise a level-scoped vocabulary entry and its shared wordless card; use `$review-vocabulary` for every lexical, pronunciation, writing, form, or alignment verdict. Consult the concrete datasets in `prompts/vocabulary/index.yaml`, then apply the locale-specific criteria in `prompts/vocabulary/ranges.yaml`. For Chinese textbook evidence, record the exact edition, grade, semester, recognition or writing scope, appendix or page location, and source instead of inferring word familiarity from character familiarity.
- Use `$review-artwork` for a focused visual audit or authorized fix of one work's cover and page illustrations. It does not replace `$review-style` for the reusable Style, `$review-vocabulary` for word cards, or `$review-writer` for avatars.

## `review-fix-loop` workflow

Use a fresh reviewer pass independent from the creation pass:

1. Run `$review-native-language` as an independent, evidence-backed pass for every locale before cross-locale comparison. Another locale's prose must not be used as the wording template; `PASS` requires representative evidence from the beginning, middle, and end.
2. Run `$review-writer` for every referenced Writer, `$review-style` for the referenced Style, `$review-vocabulary` for every referenced entry, and `$review-artwork` for the work cover and every page image.
3. Review the complete work against its directory level, research evidence, book YAML, every locale, questions, and all specialized-review verdicts. Independently browse authoritative sources to discover and verify explicit facts and implicit knowledge, causality, safety, and common-sense assumptions; do not rely only on `research.yaml`.
4. Report concrete findings with file and page IDs.
5. Fix every actionable finding when the task authorizes fixes.
6. Start fresh specialized and full-work reviews; do not merely check the edited lines.
7. Repeat review and fix until every fresh pass produces no findings.

For review-only requests and GitHub PR review, report findings and do not modify the work.

Review the complete changed book, not only isolated lines. Fail the review when any of these are true:

- the story is incoherent, unsafe, misleading, or lacks a clear beginning, event, and resolution appropriate to its level;
- vocabulary, sentence structure, page length, inference, or questions exceed the level standard;
- locales change the story meaning or do not reach an equivalent learning difficulty;
- a page is missing, reordered, or mapped to different artwork across locales;
- a page or cover lacks an illustration;
- an image contains visible text or does not match its declared scene;
- a `speaker` is missing from the cast, or TTS direction is insufficient to distinguish speakers;
- chapters omit, duplicate, or reorder pages;
- an inline vocabulary ID has no locale entry or word card;
- a question cannot be answered from its declared page evidence;
- an explicit or implicit real-world claim, causal assumption, safety implication, or common-sense detail fails independent web verification, is unsupported by `research.yaml`, contradicts a cited source, or misrepresents uncertainty;
- a Writer is missing or the prose clearly violates that Writer's constraints.
- a Style is missing, its prompt creates an IP risk, or the artwork violates its continuity constraints.

A local Codex review with image access must visually inspect artwork. GitHub PR review cannot infer pixels from a binary diff, so it reviews artwork presence and `artwork.yaml` scene contracts and must not claim visual proof it does not have.

Return actionable findings first. Return `PASS` only when there are no findings, then summarize the level, Writer, locales, page count, artwork count, speakers, and question evidence checked.

## Catalog contract

The TypeScript build reads YAML and emits an immutable, independently loadable static API:

- `catalog.json`: available levels, categories, languages, page indexes, and catalog-shard URLs;
- `catalog/<level>-<category>-<subcategory>.json`: lightweight book cards;
- `labels.json` and `taxonomy.json`: localized discovery labels and taxonomy;
- `works/<work-id>/index.json`: one self-describing compiled book manifest;
- `works/<work-id>/<locale>.json`: one locale loaded only when selected;
- `writers/<locale>/<writer-id>.json` and `styles/<style-id>.json`: independently loadable profiles;
- `vocabulary/<level>/<entry-id>.json`: independently loadable vocabulary entries.

The web app loads the root index, then only route-specific shards, one book and locale, visible artwork, and referenced word cards. Store relative URLs without a leading slash so releases continue to work under a deployment subpath. Do not hand-edit generated JSON or commit `dist/`.

## npx command help

Use only the repository-installed CLI with `--no-install`; do not let `npx` download an unreviewed package with a similar name.

### `hailibrary-check-work`

Show its current built-in help:

```sh
npx --no-install hailibrary-check-work --help
```

Validate one complete source work and every referenced Writer, Style, vocabulary entry, artwork file, locale, chapter, question, and Git LFS resource:

```sh
npx --no-install hailibrary-check-work works/<level>/<category>/<subcategory>/<slug>
```

The work path may be absolute or relative to the repository root, but it must resolve to exactly four segments below `works/`. Exit status `0` means the deterministic checks passed, `1` means validation failed, and `2` means command usage was invalid. This command does not replace the editorial, visual, vocabulary, or independent web fact-check performed by the review Skills.

Whenever a repository package adds another `bin` command, add its `--help` invocation, arguments, examples, effects, and exit statuses to this section in the same change. Every CLI must implement `-h` and `--help` without changing repository state.

## Repository rules

- Repository tooling must never generate stories, prompts, or artwork.
- Do not embed provider API keys or voice IDs in book content.
- Writer profiles encode personality, interests, values, and creative decisions, not imitation. Historical references may be declared, but wording and plots must remain original. Never instruct Codex to imitate any real writer's recognizable style.
- Treat A-K strictly as language proficiency. Advanced works may be long-form novels, epic fantasy, speculative fiction, mystery, romance, history, or technical nonfiction when their `type` and structure declare that form.
- Do not commit uncompressed generated PNG sources unless explicitly required.
