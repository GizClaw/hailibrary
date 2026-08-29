---
name: create-work
description: Create, rewrite, or materially revise a HaiLibrary book or locale—写书、改书、重写中文/英文、修改页面、问题、研究、词汇或整本插画. Use for content changes under works/; do not use for review-only requests.
---

# Create a HaiLibrary work

Produce a complete source work under `works/<level>/<category>/<subcategory>/<slug>/`. Follow the repository contract in `AGENTS.md`; YAML is authoritative and generated catalog JSON must not be edited.

## Establish the work

Before writing, resolve the level, type path, slug, locales, locale-specific Writers, visual Style, learning goals, characters, and whether the subject contains checkable real-world claims. Ask only when a missing choice would materially change the requested work; otherwise use repository defaults and state the choice.

Read:

- `prompts/levels/index.yaml` and the selected `prompts/levels/<level>.yaml`, including its exact `prompt`;
- `prompts/levels/locale-references.yaml` for the exact level's separate English and Chinese reference checkpoints;
- `prompts/vocabulary/index.yaml` and `prompts/vocabulary/ranges.yaml` for locale-specific running-text and target-vocabulary limits;
- `prompts/labels/index.yaml` for controlled discovery labels;
- `prompts/writers/index.yaml` and every selected `prompts/writers/<locale>/<writer>/prompt.yaml`, including both `prompt` and `language_prompt`;
- `prompts/styles/<style>/prompt.yaml`, whose `prompt` applies only to artwork;
- one nearby complete work as a schema example, without copying its story.

The directory is the only source of level, category, and subcategory. Do not repeat those fields in YAML.

## Compose the authoritative prompts

For each locale, compose instructions from configuration rather than restating or inventing substitute rules in this Skill:

1. Apply the selected `prompts/levels/<level>.yaml` `prompt`, the complete exact-level record, and the locale vocabulary/reference records as the authoritative difficulty contract.
2. Apply the selected Writer's `prompt` for creative viewpoint and its `language_prompt` for narration, character voice, dialogue, and read-aloud naturalness.
3. Apply the selected Style's `prompt` only when generating or reviewing artwork. Never let a visual treatment determine prose wording, sentence shape, dialogue, or locale adaptation.

Level requirements override Writer preferences when they conflict. The Writer controls how compliant prose sounds, not how difficult it is. Do not proceed if any selected configuration lacks its required prompt field.

## Set the difficulty contract

Before drafting prose, read [references/level-and-vocabulary-contract.md](references/level-and-vocabulary-contract.md) and write a short working brief for **each locale**. The brief must state:

- the selected level and band;
- the locale-specific age/grade reference: English-only Lexile cross-reference or the internal Chinese curriculum checkpoint;
- page, total-unit, sentence, per-page, and new-word limits from the selected `prompts/levels/<level>.yaml`;
- the reading goal, complexity floor, plot, cohesion, knowledge demand, illustration reliance, inference, and required question types;
- the running-text baseline and target-word range for that locale from `prompts/vocabulary/ranges.yaml`;
- the concrete vocabulary datasets or curriculum evidence to consult through `prompts/vocabulary/index.yaml`;
- any indispensable term that may exceed the ordinary range, its support strategy, and why it is necessary.

Treat the YAML files as authoritative. The reference is an operational map, not a substitute for reading the selected level's complete record. Do not begin a locale draft until its brief shows both the mechanical ceiling and the complexity floor. A longer text, one difficult word, or one difficult question does not raise an otherwise simpler work to a higher level.

Use the same shared events and learning goal across locales, but create a separate difficulty brief and lexical plan for each locale. Equivalent difficulty does not require matching sentence boundaries, word order, idiom, or target terms.

## Research

Browse primary or authoritative sources before writing about science, nature, geography, history, culture, health, safety, real people, or other checkable claims. Record each story-relevant source and the claim it supports in `research.yaml`. For a wholly invented story with no material factual claims, set `required: false` and explain why.

Do not turn uncertain or fictional details into facts.

## Write the article before the script

For each locale, let the selected Writer draft one complete continuous article from the shared events, learning goal, research, and locale difficulty brief. Do this before assigning speakers, page boundaries, illustration IDs, vocabulary markup, chapters, or questions.

The first draft must read coherently when no page structure or voice metadata is visible. Review its beginning, development, resolution, causal links, transitions, recurring details, evidence distribution, and conclusion. Fix article-level problems here; do not expect dialogue, pagination, or illustrations to hide them.

Draft every locale article independently. Preserve shared events and learning difficulty, but do not use another locale's article as a sentence, paragraph, information-order, or dialogue template.

For any short or long work that needs a separately addressable TTS/subtitle script, set `schema_version: 2` and persist the coherent Writer draft in `article.pages[].paragraphs[]`. Visible dialogue must include locale-correct quotation and natural attribution in the prose itself. Then define `audio_script.cast` and apply `$scriptize-article` to create `audio_script.pages[].blocks[]`; every block needs a stable ID for its future audio clip and subtitle cue. Speaker metadata must not be used to manufacture visible punctuation or attribution in article mode. Legacy picture-book locales may remain schema version 1 until they are deliberately migrated.

## Author the shared work

Create `book.yaml`, `research.yaml`, `artwork.yaml`, every `locales/<locale>/story.yaml`, shared artwork, and any required vocabulary entries.

- Preserve the direct AA-Z2 label sequence, but use HaiLibrary's age-aligned grade meanings: W-Z are secondary, Z1 is undergraduate, and Z2 is advanced undergraduate, graduate, or professional reading. Do not present those extensions as official Reading A-Z correlations.
- Keep unmarked running text mostly at or below the prior level; make marked target terms the intentional learning load.
- Sustain the selected level across vocabulary, syntax, cohesion, knowledge, inference, and reader task. Do not satisfy the level with an isolated hard sentence or question.
- Meet the selected level's complexity floor as well as every mechanical ceiling. From Level G onward, prose must preserve every essential causal link and conclusion without illustration support.
- Build one coherent narrative or nonfiction arc appropriate to the declared type and level.
- Define every narrator and character in `book.yaml` with stable IDs and usable visual/voice identities.
- Give every locale exactly the same page IDs, meaning, speakers, and illustration IDs.
- Partition each locale's already-scripted article into pages at real scene, paragraph, or action transitions. Copy contiguous speaker blocks without reordering or rewriting them into page summaries.
- Adapt prose naturally to each locale at the same difficulty; sentence boundaries, information order, idiom, emphasis, and rhythm may differ. Do not translate mechanically.
- For schema-version-2 works of any length, store visible prose in `article.pages[].paragraphs[]` and ordered TTS dialogue/narration in `audio_script.pages[].blocks[]`, with a stable block `id` and valid `speaker` ID on every block. Keep top-level `pages[].lines[]` only for legacy or picture-book presentation.
- Preserve the `$scriptize-article` speaker assignments and continuous order. Do not add page-local dialogue after scriptization merely to make a page feel complete.
- Give every `audio_script.cast` member localized `display_name` plus abstract TTS `delivery`, `timbre`, `pace`, and `pitch`. Never store provider voice IDs.
- Define chapters that cover every page exactly once and in reading order.
- Keep questions within the level's permitted count/types and make every answer provable from `page_refs`.
- Assign relevant `topics`, `themes`, and `moods` from the central label index. Do not invent per-book labels or place localized label names in `book.yaml`.

Mark target terms inline in the visible article paragraph content, then preserve those segments in the corresponding audio-script block content. Reuse or create `vocabulary/<level>/<id>/entry.yaml`; include all selected locales and one shared, wordless `card.webp`. The marked surface form must equal the locale term or one of its declared forms.

Apply `$create-vocabulary` whenever a new entry or card is required. Apply the `$review-vocabulary` evidence procedure to every new, reused, or changed entry. Confirm live dictionary evidence for terms, senses, parts of speech, pronunciation, IPA or pinyin, forms, writing metadata, and every claimed curriculum alignment.

For English, use frequency only as evidence: NGSL guidance does not determine a HaiLibrary level, and U-Z2 especially require sense, register, abstraction, rhetoric, and domain judgment. For Chinese, verify the complete word as well as its characters; never infer word familiarity from character familiarity. A textbook claim must name the exact edition, publisher, grade, semester, scope, appendix or page location, source, and verification date.

## Artwork scope

For an existing work, preserve all cover, page, Style, Writer-avatar, and vocabulary-card images unless the user explicitly authorizes visual changes. A text-only revision must not regenerate, edit, recompress, rename, or otherwise touch images. It may verify that the unchanged illustrations remain compatible with revised page events, but any visual mismatch must be solved in the text or reported as blocked.

For a genuinely new work, create the required artwork as follows.

Generate the cover and one illustration per page directly with Codex image generation using the selected Style. All locales share the images.

- Preserve character, prop, clothing, location, and palette continuity.
- Match every `artwork.yaml` scene to its page action.
- Include no visible words, letters, numbers, captions, speech bubbles, logos, or watermarks.
- Save compressed `.webp` files under the work's `artwork/` directory.
- Generate wordless vocabulary cards where needed.
- Do not retain uncompressed generation sources unless the user explicitly requests them.

Visually inspect every generated image, including vocabulary cards. Do not infer image quality from filenames or YAML.

Apply `$review-artwork` after creating or materially changing the cover, page illustrations, or artwork manifest. Fix authorized findings before proceeding.

## Validate and finish

Run:

```sh
npm run check-work -- works/<level>/<category>/<subcategory>/<slug>
```

Fix every deterministic error. Then apply `$review-native-language` independently to every locale and preserve its evidence-backed verdicts. After every locale passes, apply the full `$review-work` procedure, including its independent web fact-check of explicit claims, implicit common-sense assumptions, questions, vocabulary, and artwork. Repeat validation and both complete reviews after fixes.

Finish only when the command passes and the full review has no findings. Summarize the path, level, Writers, Style, locales, page/artwork counts, vocabulary, research status, and validation result.
