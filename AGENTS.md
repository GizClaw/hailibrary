# HaiLibrary agent contract

This repository is a multilingual graded-reading library. Codex creates the source books directly; repository code must not call a model to generate stories or illustrations.

## Source of truth

- Store books at `works/<level>/<category>/<subcategory>/<slug>/`.
- The directory is the only source of `level`, `category`, and `subcategory`. Do not repeat or override them in book or locale YAML.
- Author source files in YAML plus one persisted `locales/<locale>/article.md` literary source per locale. JSON is generated only for the released web catalog.
- Every locale references exactly one original Writer directory at `prompts/writers/<locale>/<name>/`, containing `prompt.yaml` and `avatar.webp`.
- Every book references exactly one visual Style directory at `prompts/styles/<name>/`, containing `prompt.yaml` and `thumbnail.webp`. All locale editions share that artwork.
- Every locale Writer independently authors `article.md` from the shared events. It is the authoritative literary source for events, facts, characters, point of view, voice, and ending; it is not a translation of another locale and is not constrained by the directory level.
- Every locale targets the directory level by adapting its own novel with `$adapt-article`, not by translating another locale. `story.yaml` schema version 2 persists the level-bound visible text in `article.pages[].paragraphs[]`; `audio_script.cast` plus `audio_script.pages[].blocks[]` is the TTS adaptation shown in script mode. Every script block has a stable ID joining one future audio clip to one subtitle cue. Visible prose must use natural quotation and attribution; speaker IDs never repair or replace readable prose.
- Every page has exactly one shared, wordless illustration. All locales use the same page IDs and artwork.
- Mark target words inline in visible `article` paragraph content and preserve them in the corresponding `audio_script` block content; do not maintain a separate page vocabulary list.
- Store each referenced concept at `vocabulary/<level>/<id>/entry.yaml` with one shared wordless `card.webp`; keep all localized terms inside that entry. External curriculum alignments are references, not substitutes for the HaiLibrary level review.
- Use only controlled discovery labels from `prompts/labels/index.yaml`. Store stable label IDs in `book.labels`; localized display names belong in the central label index, not in individual books.
- Track publishable images, audio, music, and video with Git LFS.

## `create-work` workflow

When asked to create or revise a book:

1. Choose the level, category, subcategory, slug, Writer, locales, learning goals, and factual scope.
2. Read `prompts/levels/index.yaml`, the selected exact-level file at `prompts/levels/<level>.yaml`, `prompts/levels/locale-references.yaml`, `prompts/vocabulary/index.yaml`, `prompts/vocabulary/ranges.yaml`, `prompts/labels/index.yaml`, `prompts/writers/index.yaml`, every selected locale Writer's `prompt.yaml`, and the selected Style's `prompt.yaml`. The Writer's `prompt` and `language_prompt` govern the `article.md` novel; the exact level file's `prompt` governs only the `$adapt-article` adaptation, where level requirements override Writer preferences. Use the Style `prompt` only for artwork.
3. Browse the web before writing when the story depends on science, nature, geography, history, culture, health, safety, a real person, or another checkable real-world claim. Prefer primary and authoritative sources.
4. Record every story-relevant source and supported claim in `research.yaml`. If research is unnecessary for a purely invented story, record `required: false` and a short reason.
5. Design shared events, learning goals, factual boundaries, characters, and a shared page plan. A level measures the later reading adaptation, not the literary ambition of the source novel.
6. From those shared events, let each locale Writer independently draft `locales/<locale>/article.md` as continuous natural prose using its `prompt` and `language_prompt`. Do not apply level ceilings, paginate, plan questions, or add IDs, metadata, or vocabulary markers. Review and fix each novel as literature and native-language writing before adaptation.
7. Run `$adapt-article` for every locale. Apply the exact level and vocabulary contracts while faithfully adapting the locale's own novel into `story.yaml` `article.pages[].paragraphs[]` on the shared page and illustration IDs.
8. Define every narrator and character in `book.yaml`; define localized display names and complete abstract TTS direction (`delivery`, `timbre`, `pace`, and `pitch`) once in `audio_script.cast`.
9. Run `$scriptize-article` on each adapted `article.pages`. Preserve order, facts, causality, vocabulary markers, and speaker intent in `audio_script.pages[].blocks[]`; assign stable `<page-id>-b<two-digit-index>` IDs.
10. Keep article and audio-script page IDs and illustration IDs exactly aligned. `article.md` is authoritative for the story, `article.pages` for visible level-bound wording, and `audio_script` for voice assignment. The web app reads only `story.yaml` and compiled JSON.
11. Mark target words already present in adapted text and run `$create-vocabulary` for every new entry or card and `$review-vocabulary` for every new, reused, or changed entry.
12. Define chapters that cover every page exactly once and in reading order; add questions only after the adaptation is stable, with answers supported by declared page evidence.
13. Keep page IDs, meaning, characters, and illustration IDs aligned across locales; never use another locale's novel, adaptation, or script as the sentence template.
14. For a new work, generate the cover and every page illustration directly with Codex image generation using the selected Style. For an existing work under a text-only revision, preserve every image byte-for-byte unless the user explicitly authorizes visual changes. Images must contain no words, letters, numbers, logos, captions, speech bubbles, or watermarks.
15. For new artwork, save compressed `.webp` images under the book's `artwork/` directory and describe each scene in `artwork.yaml`. Do not recompress, rename, or rewrite existing visual resources during a text-only task.
16. Visual artwork review is optional and out of scope by default: run `$review-artwork` only when visual review is in scope as defined under "Visual review scope" below. During a text-only review-fix loop, treat visuals as fixed scene constraints and solve compatibility issues in the text; do not regenerate images.
17. Run `npm run check-work -- <work-directory>` and fix every deterministic resource error.
18. Run `$review-native-language` for every locale, then run the `review-fix-loop` before marking the work ready for PR review.

Existing works received deterministic placeholder `article.md` files backfilled from their picture-book text. These are not rewritten novels and may later be replaced by a real locale novel followed by re-adaptation.

## `adapt-article` workflow

Use `$adapt-article` after the locale novel passes literary and native-language review. It reads `article.md`, the exact level and locale contracts, the Writer, `book.yaml`, the shared page plan, and `artwork.yaml` when present. It may condense, cut subplots, simplify, and re-sentence to meet every level ceiling and complexity floor, but must preserve the novel's events, causality, facts, characters, point of view, tone, and ending. It writes only `story.yaml` `article.pages[].paragraphs[]`, paginates at real transitions on shared page and illustration IDs, and marks only vocabulary already present in the adapted prose. If the novel is defective, fix `article.md` first and re-adapt; never repair the source indirectly in YAML.

## `scriptize-article` workflow

Use `$scriptize-article` only after `$adapt-article` has completed `story.yaml` `article.pages`. It writes `audio_script` with stable block IDs for clip/subtitle alignment and stable `speaker` IDs for TTS, preserves inline vocabulary markers, retains narration where exposition belongs, and converts material into dialogue only when a character has an immediate reason to speak. It must not return to or rewrite `article.md`, replace the visible adaptation, invent story, generate artwork, or create vocabulary entries.

## `create-writer` workflow

1. Select one locale and one recommended level.
2. Research useful reference reading and extract only high-level interests, values, structures, and creative decisions.
3. Create an original Writer name appropriate to the locale. Search for obvious publishing, character, and brand conflicts before accepting it.
4. Create `prompts/writers/<locale>/<name>/prompt.yaml`; disclose reference reading, define both the creative `prompt` and native-language `language_prompt`, and explicitly prohibit copied names, characters, plots, wording, and recognizable style imitation. The language prompt must make dialogue speakable, distinguish character voices, and reject explanatory or slogan-like speech.
5. Generate an original `avatar.webp` with Codex. It must contain no text and must not reproduce or closely resemble a real person or protected character.
6. Run `$review-writer`. If material legal uncertainty remains, return `NEEDS_LEGAL_REVIEW` rather than `PASS`.

## `review-writer` workflow

Review the Writer's name, prompt, references, extracted features, avatar, locale, and recommended level. Fail when it copies protected expression, invites recognizable style imitation, uses a confusing real-person or brand identity, reproduces a real person's likeness, borrows protected characters or plots, or lacks source disclosure. This is an editorial risk screen, not a legal opinion.

## `create-style` workflow

Create a reusable visual treatment at `prompts/styles/<name>/` with `prompt.yaml` and a representative `thumbnail.webp`. Define medium, palette, shapes, composition, continuity rules, and exclusions. Describe broad treatments such as realistic, comic, crayon, watercolor, collage, or clay; do not name a living artist or request recognizable style imitation. Run `$review-style` before returning `PASS`.

## Vocabulary and artwork workflows

- Use `$create-vocabulary` to add or materially revise a level-scoped vocabulary entry and its shared wordless card; use `$review-vocabulary` for every lexical, pronunciation, writing, form, or alignment verdict. Consult the concrete datasets in `prompts/vocabulary/index.yaml`, then apply the locale-specific criteria in `prompts/vocabulary/ranges.yaml`. For Chinese textbook evidence, record the exact edition, grade, semester, recognition or writing scope, appendix or page location, and source instead of inferring word familiarity from character familiarity.
- Use `prompts/levels/locale-references.yaml` to interpret the exact level separately for English and Chinese. English uses age/grade plus English-only Lexile references; Chinese uses its own curriculum checkpoint and must never inherit an English Lexile claim. Reading A-Z names are retained labels, not proof of official later-grade alignment.
- Use `$review-artwork` for a focused visual audit or authorized fix of one work's cover and page illustrations. It does not replace `$review-style` for the reusable Style, `$review-vocabulary` for word cards, or `$review-writer` for avatars.

## `review-fix-loop` workflow

Use a fresh reviewer pass independent from the creation pass:

1. Run `$review-native-language` as an independent, evidence-backed pass for every locale before cross-locale comparison. Another locale's prose must not be used as the wording template; `PASS` requires representative evidence from the beginning, middle, and end.
2. Run `$review-writer` for every referenced Writer, `$review-style` for the referenced Style, and `$review-vocabulary` for every referenced entry. Run `$review-artwork` when visual review is in scope; for an explicitly text-only loop, preserve images byte-for-byte and use their declared scenes as fixed constraints.
3. Review the complete work against its directory level, research evidence, book YAML, every locale, questions, and all specialized-review verdicts. Independently browse authoritative sources to discover and verify explicit facts and implicit knowledge, causality, safety, and common-sense assumptions; do not rely only on `research.yaml`.
4. Report concrete findings with file and page IDs.
5. Fix every actionable finding when the task authorizes fixes.
6. Start fresh specialized and full-work reviews; do not merely check the edited lines.
7. Repeat review and fix until every fresh pass produces no findings.

For review-only requests and GitHub PR review, report findings and do not modify the work.

Review the complete changed book, not only isolated lines. Fail the review when any of these are true:

- the story is incoherent, unsafe, misleading, or lacks a clear beginning, event, and resolution appropriate to its level;
- `article.md` is missing, empty, malformed, incoherent, unsafe, or reads like a checklist or report rather than literature;
- the adaptation adds, drops, or changes events, causality, facts, characters, point of view, tone, or ending relative to `article.md`;
- the visible `article` is not continuous, dialogue lacks natural quotation or attribution, or scriptization introduces repetition, missing transitions, changed causality, or explanatory dialogue absent from the article;
- vocabulary, sentence structure, page length, inference, or questions exceed the level standard;
- locales change the story meaning or do not reach an equivalent learning difficulty;
- a page is missing, reordered, or mapped to different artwork across locales;
- a page or cover lacks an illustration;
- when visual review is in scope, an image contains visible text or does not match its declared scene;
- a `speaker` is missing from the cast, or TTS direction is insufficient to distinguish speakers;
- chapters omit, duplicate, or reorder pages;
- an inline vocabulary ID has no locale entry or word card;
- a question cannot be answered from its declared page evidence;
- an explicit or implicit real-world claim, causal assumption, safety implication, or common-sense detail fails independent web verification, is unsupported by `research.yaml`, contradicts a cited source, or misrepresents uncertainty;
- a Writer is missing or the prose clearly violates that Writer's constraints.
- a Style is missing, its prompt creates an IP risk, or the artwork violates its continuity constraints.

Visual review scope: visual inspection of artwork pixels, including `$review-artwork`, is optional and is out of scope by default. It is in scope only when the maintainer's task request or the linked Issue explicitly says so, for example with a line such as `Visual review: in scope` or an explicit request to run `$review-artwork`. Silence, a Non-goal, or `Visual review: out of scope` all mean it is out of scope. When it is out of scope, a review checks artwork presence, format, Git LFS coverage, and `artwork.yaml` scene contracts, does not block on pixel-level findings, and must not claim visual proof it does not have. GitHub PR review cannot infer pixels from a binary diff, so it always reviews only artwork presence and `artwork.yaml` scene contracts.

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

Validate one complete source work, each locale's persisted `article.md` format, and every referenced Writer, Style, vocabulary entry, artwork file, locale, chapter, question, and Git LFS resource:

```sh
npx --no-install hailibrary-check-work works/<level>/<category>/<subcategory>/<slug>
```

The work path may be absolute or relative to the repository root, but it must resolve to exactly four segments below `works/`. Exit status `0` means the deterministic checks passed, `1` means validation failed, and `2` means command usage was invalid. This command does not replace the editorial, visual, vocabulary, or independent web fact-check performed by the review Skills.

Whenever a repository package adds another `bin` command, add its `--help` invocation, arguments, examples, effects, and exit statuses to this section in the same change. Every CLI must implement `-h` and `--help` without changing repository state.

## Repository rules

- Repository tooling must never generate stories, prompts, or artwork.
- Do not embed provider API keys or voice IDs in book content.
- Writer profiles encode personality, interests, values, and creative decisions, not imitation. Historical references may be declared, but wording and plots must remain original. Never instruct Codex to imitate any real writer's recognizable style.
- Preserve the 29 ordered labels `aa`, `a` through `z`, `z1`, and `z2`, but apply HaiLibrary's age-aligned meanings from `prompts/levels/locale-references.yaml`: W-Z cover secondary school, Z1 is undergraduate, and Z2 is advanced undergraduate, graduate, or professional reading. These later meanings are HaiLibrary extensions, not official Reading A-Z grade correlations.
- Do not commit uncompressed generated PNG sources unless explicitly required.
