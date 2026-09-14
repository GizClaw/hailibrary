---
name: review-work
description: Review a complete HaiLibrary series article or derived picture-book set—审核完整系列文章或衍生分级绘本，覆盖文学、事实、有声书忠实度、改编忠实度、级别、分页、多语言、问题、词汇与插画契约。
---

# Review HaiLibrary source and derivatives

Review the whole requested series, picture-book set, or both. For review-only requests, report without editing. With fix authorization, preserve unrelated work and rerun fresh complete reviews after changes. Text-only scope preserves every image byte-for-byte.

## Review a series article

Read `works/series/<id>/article.yaml`, optional `research.yaml`, every locale `article.md` and `audio_script.yaml`, all locale Writer prompts, and controlled labels. Check:

- each locale is independently written native-language literature, not translation-shaped, and ignores Writer grading clauses;
- premise, characters, events, factual boundaries, causality, viewpoint, tone, and ending are coherent across locales without requiring matching sentences;
- scenes, conflict, choices, sensory detail, pacing, dialogue, and ending meet a professional literary bar; prose is not preachy, report-shaped, or engineered for derivatives;
- every material real-world claim and uncertainty is accurately covered by series `research.yaml`;
- each audiobook covers its own article completely and in order, preserves narration verbatim, assigns quotation correctly, adds only necessary minimal attribution, and has valid stable IDs and complete abstract TTS cast data.

Series plans may propose picture books only at `aa` through `n`.

## Review derived picture books

Read the source series, every volume file, exact level records, locale references, Writers, Style, labels, vocabulary entries, and `artwork.yaml`. Run:

```sh
npm run check-work -- works/<level>/<category>/<subcategory>/<slug>
```

For every volume check:

- the directory level is `aa` through `n`; `book.yaml` schema 2 has correct source series and 1-based volume metadata;
- the volume has a complete beginning, development, turn, and resolution, not an arbitrary source slice;
- every locale adapts its own series article faithfully without inventing or changing essential events, facts, causality, characters, viewpoint, tone, or ending;
- schema-3 `story.yaml` has no audiobook, cast, speaker, or top-level pages; visible prose is continuous, naturally attributed, and meets the exact level's ceilings and complexity floor;
- locales share page IDs, meanings, illustration IDs, and visual events while remaining independently natural at equivalent difficulty;
- chapters cover every page once in order and every question is supported by declared page evidence;
- inline vocabulary resolves to correct level-scoped entries, locale forms, definitions, and wordless cards;
- every artwork asset has a matching page/cover, one-sentence scene, complete content/composition prompt consistent with `visual_identity`, and no embedded Style prose or requested text.

Apply `$review-writer`, `$review-style`, and `$review-vocabulary` to all referenced resources.

## Independent fact-check and visuals

Read `references/fact-checking.md`. Build a claim inventory from series articles, derived prose, questions, vocabulary, scenes, and visible artwork when inspected. Browse current primary or authoritative sources; open evidence pages rather than relying on snippets. Use at least two independent authoritative sources for contested, sensitive, historical, medical, or safety-critical claims. Compare the source series `research.yaml` with exact claims and flag missing, overstated, or contradictory support.

Visual review is out of scope by default. When explicitly in scope, run `$review-artwork` on every cover and page. Otherwise check only presence, WebP format, Git LFS, and manifest contracts, and state that pixels were not reviewed.

## Result

Return actionable findings first, ordered by severity, with exact paths and stable series, volume, page, question, artwork, vocabulary, chapter, or block IDs. Cite factual evidence near each finding.

Return `PASS` only after a fresh review has no findings and the independent fact-check is complete. Summarize reviewed series/locales/Writers, audiobook chapters and speakers when applicable, picture-book levels/volumes/pages/Style/artwork, vocabulary, question evidence, visual scope, and validator results.
