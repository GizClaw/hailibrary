---
name: adapt-article
description: Adapt one persisted HaiLibrary locale novel into level-bound paginated story.yaml article.pages—把每种语言的 article.md 文学源稿忠实改编为符合精确分级、共享分页和插画约束的可见正文；不改写源稿、不生成语音脚本。
---

# Adapt a literary article

Turn one locale's reviewed `article.md` into the level-bound visible reading text at `story.yaml` `article.pages[].paragraphs[]`. Follow `AGENTS.md`. The novel remains authoritative for the story; this Skill never edits it.

## Load the source and contracts

Read the complete locale `article.md`, `book.yaml`, the shared page plan, and `artwork.yaml` when it exists. Read `prompts/levels/index.yaml`, the exact `prompts/levels/<level>.yaml` record and prompt, `prompts/levels/locale-references.yaml`, `prompts/vocabulary/index.yaml`, `prompts/vocabulary/ranges.yaml`, and the locale Writer's complete `prompt.yaml`. The Writer governs voice; the level records govern adaptation difficulty.

Confirm that the novel is coherent, audience-safe, factually supported by `research.yaml`, native in its locale, and consistent with the shared events. If the source needs repair, return `ARTICLE_FIX_REQUIRED`; fix and review the novel first, then re-adapt.

## Build a faithful level adaptation

Meet every exact-level ceiling and complexity floor for page count, total units, sentence and page length, vocabulary, cohesion, knowledge demand, inference, illustration reliance, and reading task. A rare novel already within the limits may remain nearly verbatim, but it must still be paginated and meet the complexity floor.

Preserve the novel's events, causal links, facts, characters, point of view, tone, and ending. You may condense, cut subplots, simplify wording or syntax, and re-sentence. Do not add events, facts, lessons, motivations, solutions, or dialogue unsupported by the novel. Do not turn pages into isolated summaries.

Keep visible dialogue natural, with locale-correct quotation and attribution. Paginate at real scene, action, or paragraph transitions using the shared page IDs and illustration IDs identically across locales. Adapt each locale from its own novel, never another locale's wording.

Mark target vocabulary inline only on words already present in the adapted prose. Create or change entries only through `$create-vocabulary`, and review every used entry through `$review-vocabulary`.

## Validate the result

Read the adapted pages continuously and compare them with `article.md`. Fail if transitions break, the adaptation becomes checklist-shaped, difficulty falls below the floor or exceeds a ceiling, or any story invariant changes. Do not create `audio_script`; after this adaptation passes, `$scriptize-article` owns that step.

Inside an authorized `$create-work` task, write only the adapted `article.pages[].paragraphs[]` and required inline markers in `story.yaml`. Preserve unrelated YAML and all images. Run `npm run check-work -- <work-directory>` after the complete work is assembled.
