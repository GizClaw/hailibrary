---
name: review-native-language
description: Review or fix HaiLibrary locale language quality—中文/英文母语审校、翻译腔、自然表达、标题、对话和问题措辞. Use for one or more locale editions or alongside create-work/review-work; not for factual, schema, or artwork review.
---

# Review native-language writing

Judge whether each locale reads as writing composed by a fluent native-language editor for that locale and proficiency level. Grammatical correctness and semantic fidelity are necessary but not sufficient.

Follow `AGENTS.md`. For review-only work, report findings without editing. Apply corrections only when explicitly authorized, then review the complete locale again rather than only the changed sentences.

Read the exact `aa`/`a`-`z`/`z1`/`z2` level record, `prompts/levels/locale-references.yaml`, and its locale vocabulary range. Native wording must satisfy that exact level's age band, sentence, page, lexical, inference, and task limits. Use Lexile only as an English cross-reference; use the declared Chinese curriculum checkpoint for Chinese and never transfer an English Lexile measure. Treat Z1 and Z2 as HaiLibrary higher-education extensions, not official Reading A-Z grade correlations.

## Review one locale before comparing locales

For each locale:

1. Read its complete `story.yaml`, referenced Writer prompt, level definition, and relevant vocabulary definitions without opening another locale's prose as a wording template.
2. Reconstruct a source-neutral scene brief from the shared page event, speaker intent, illustration contract, learning goal, and question evidence. Do not treat another locale's sentences as the source text.
3. Read the locale continuously from title through questions. Assess the work as a story or nonfiction text, not as isolated valid sentences.
4. Apply the locale guide for every locale present:
   - read [references/zh-CN.md](references/zh-CN.md) for `zh-CN`;
   - read [references/en-US.md](references/en-US.md) for `en-US`;
   - for another locale, state the monolingual authorities and editorial conventions used. If native-level judgment is unavailable, return `NATIVE_REVIEW_REQUIRED`, not `PASS`.
5. Record a separate verdict and evidence for that locale before looking at any other locale's wording.
6. Only then compare locales for shared page events, character intent, learning goals, question evidence, and equivalent difficulty. Locales may split, merge, omit, foreground, or recast wording while preserving those invariants.

Never allow the stronger locale to hide defects in another one.

## Use live native-language evidence

The locale guides provide current external reference URLs and explain what each source can establish. Open the relevant original pages during review; do not copy dictionaries, corpora, standards, essays, or calibration passages into this repository.

Use sources in layers:

1. a national standard or editorial authority for orthography, punctuation, and formal convention;
2. a current monolingual dictionary for the intended sense, pronunciation, part of speech, usage label, and conventional examples;
3. a reputable native corpus for collocation, syntax, register, and genre-matched context;
4. reputable native prose or children's publishing pages for discourse rhythm, point of view, dialogue, and genre expectations.

No single layer proves that a sentence is native. A dictionary example may be grammatical but wrong for the character or level; a corpus hit may be erroneous, old, translated, or in the wrong register; literary prose may be intentionally marked. Open the context, compare more than one example, and record the exact URLs consulted for every researched finding. Do not treat search snippets, raw hit counts, bilingual dictionaries, or copied wording as evidence.

If the sources conflict or do not cover the precise context, return `NATIVE_REVIEW_REQUIRED` for that wording rather than inventing certainty.

## What must be reviewed

Review all learner-facing language:

- title, summary, chapter titles, narration, and dialogue;
- cast display names and the naturalness of TTS direction wording;
- question prompts, choices, answers, and explanations;
- inline target-word surface forms and localized vocabulary definitions;
- punctuation, typography, register, information flow, rhythm, and continuity of voice;
- whether the locale Writer is audible in creative decisions rather than merely named in metadata.

Lower proficiency must use natural simple language, not telegraphic or translated language. Higher proficiency may carry complex ideas, but must not become an outline, policy memo, or chain of abstract thesis statements unless that form is intentionally declared.

## Translationese and editorial failure

Treat wording as a finding when a fluent speaker could understand it but would not normally choose it in this narrative situation. Look for:

- mechanically shared clause order, sentence boundaries, modifier order, or dialogue turns across locales;
- a possible but uncommon collocation, imported word sense, literal idiom, or metaphor that belongs to another language;
- repeated subjects, possessives, pronouns, articles, or connectives inherited from the other locale;
- source-language information order, emphasis, politeness, punctuation, or paragraph rhythm;
- dialogue that explains the plot or moral instead of sounding spoken by the declared character;
- titles that expose a source-language noun phrase rather than functioning as a native title;
- short pages padded to resemble the length or shape of another locale;
- correct individual sentences whose accumulation has no native narrative cadence or recognizable Writer voice.

Do not excuse translationese because the text passes schema validation, stays under level limits, preserves meaning, or contains no spelling errors.

## Evidence required for a verdict

For each locale, report:

- `PASS`, `FAIL`, or `NATIVE_REVIEW_REQUIRED`;
- the Writer, level, and the voice/register/rhythm actually observed;
- coverage of title, summary, every page, chapters, cast wording, questions, and vocabulary wording;
- representative evidence from the beginning, middle, and end, with exact page or question IDs;
- every finding's current wording, the native-usage problem, a natural alternative, and whether the change affects only that locale or shared alignment;
- after the independent pass, the result of the cross-locale structural-mirroring check.

A `PASS` must be evidence-backed. Include representative natural phrases and explain briefly why their collocation, information order, register, and character voice are native to the locale. “Sounds natural,” “grammar is correct,” or a validator result is not sufficient evidence.

When usage is uncertain, follow the locale guide's live-source route. Search exact phrases and close alternatives in context, open the evidence, and distinguish what the source actually supports: form, sense, collocation, register, discourse, or level. Model intuition alone does not establish idiomatic usage.

## Fixing authorized findings

Rewrite from the source-neutral scene brief and the locale Writer's constraints. Do not repair one locale by translating another. Preserve the page event, speaker intent, illustration compatibility, learning goal, level, and question evidence, but change sentence structure and phrasing as freely as native expression requires.

After fixes, reread the entire locale independently, repeat the cross-locale comparison, and issue a fresh evidence-backed verdict.
