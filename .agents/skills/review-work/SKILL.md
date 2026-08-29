---
name: review-work
description: Review or audit a complete HaiLibrary book—整本书审核、验收、review、事实核查、等级、多语言对齐、词汇、问题和插画. Use for full-work review or authorized review-and-fix; use specialized skills for language-only, Writer-only, Style-only, or artwork-only requests.
---

# Review a HaiLibrary work

Review the whole work, not only the changed lines. Follow `AGENTS.md` and treat the YAML sources as authoritative.

Resolve the exact directory level from the 29 ordered labels (`aa`, `a` through `z`, `z1`, `z2`). Compare only with that exact HaiLibrary age-aligned record; never use the former compressed A-K mapping, treat K as advanced, or claim that HaiLibrary's secondary and higher-education extensions are official Reading A-Z grade meanings.

## Authorization boundary

For a review-only request or GitHub PR review, do not modify files. If the user explicitly authorizes fixes, fix actionable findings, rerun every check, and start a fresh full review rather than checking only edited locations.

If the authorized scope is text-only, preserve every image byte-for-byte. Do not regenerate, edit, recompress, rename, or delete cover, page, Style, Writer-avatar, or vocabulary-card images. Resolve artwork compatibility findings by revising text within the shared scene contract or report a blocker.

## Load the complete context

Read:

- the work directory and all its YAML files;
- `prompts/levels/levels.yaml` for the directory level;
- `prompts/levels/locale-references.yaml` for the exact English or Chinese reference checkpoint and its authority limits;
- `prompts/labels/index.yaml` and every label selected by the work;
- every referenced locale Writer prompt;
- the referenced Style prompt;
- every referenced vocabulary entry;
- every cited source needed to assess a real-world claim.

Apply the `$review-vocabulary` evidence procedure to every vocabulary entry referenced by the work; structural validity alone does not establish lexical or pronunciation correctness.

Apply `$review-writer` to every referenced locale Writer and `$review-style` to the referenced visual Style. Preserve their findings and verdicts; a referenced Writer or Style that does not pass blocks the complete work from receiving `PASS`.

Run the deterministic validator first:

```sh
npm run check-work -- works/<level>/<category>/<subcategory>/<slug>
```

Treat validator failures as findings, but do not stop there.

## Native-language editorial pass

Apply the complete `$review-native-language` procedure to every locale. This is a required independent pass, not an optional checklist inside the general review. Preserve its per-locale evidence and verdicts in the final work review.

Do not inspect another locale's prose before completing the independent editorial pass for the current locale. A semantically accurate translation is not sufficient. If `$review-native-language` returns `FAIL` or `NATIVE_REVIEW_REQUIRED` for any locale, the complete work cannot receive `PASS`.

## Independent web fact-check

Every review must browse the web independently to look for knowledge, factual, causal, safety, and ordinary common-sense errors. Do not limit the review to claims already listed in `research.yaml`, and do not treat `required: false` as permission to skip this step.

Read [references/fact-checking.md](references/fact-checking.md), then build a claim inventory from every locale story, question and answer, vocabulary definition, `artwork.yaml` scene, and any factual implication visible in the artwork. Include implicit claims such as whether an animal can perform an action, an object works as depicted, a cause can produce the stated result, a season or location is plausible, or a behavior is safe.

For each material claim:

1. Classify it as real-world fact, simplified explanation, ordinary physical or social assumption, cultural practice, historical claim, speculative premise, or purely invented detail.
2. Search current primary or authoritative sources and open the supporting pages; search snippets are not evidence.
3. Compare the sources with the exact page wording, illustration, answer, and cross-locale meaning.
4. Check whether `research.yaml` records every source that the published work needs and describes the supported claim accurately.

Use at least two independent authoritative sources for contested, safety-critical, culturally sensitive, medical, historical, or otherwise high-risk claims. A fictional or magical premise may be accepted when the work clearly establishes it, but nearby real-world facts and consequences must remain accurate or clearly fictionalized.

Distinguish a factual error from a harmless fantasy convention, an age-appropriate simplification, an unsupported assertion, and an internal-consistency error. When uncertainty is real, the work must not present one interpretation as settled fact.

## Editorial review

Check that:

- the work has a coherent beginning, development, and resolution or an appropriate nonfiction structure;
- vocabulary, syntax, sentence/page totals, inference, narrative structure, and question types fit the directory level;
- the English edition uses its declared age/grade and English-only Lexile reference, while the Chinese edition is judged against its own curriculum checkpoint without importing English Lexile claims; retained Reading A-Z labels are not mistaken for official later-grade correlations;
- each locale passes its own native-language editorial review, remains equivalent in meaning and learning difficulty, and is independently phrased rather than translated line by line;
- Writers shape high-level creative choices without copied expression or recognizable imitation;
- every character and narrator exists in every locale cast with distinct, complete TTS direction;
- pages and chapters are complete, unique, ordered, and aligned across locales;
- discovery labels are relevant, non-duplicated, centrally defined, and neither misleading nor a substitute for learning concepts;
- each question is answerable from its declared page evidence;
- inline vocabulary markers resolve to correct locale terms/forms, definitions, and wordless cards;
- every explicit or implicit checkable claim survives independent web research and is supported accurately by `research.yaml`, including uncertainty;
- ordinary actions, physical causality, scale, sequence, motivations, object use, cultural behavior, and safety advice remain plausible unless clearly established as fictional.

## Visual review

Apply the complete `$review-artwork` procedure to the cover, every page illustration, and `artwork.yaml`. Also preserve the vocabulary-card verdicts from `$review-vocabulary`, the Style-thumbnail verdict from `$review-style`, and Writer-avatar verdicts from `$review-writer`.

A GitHub binary diff proves only file presence; never claim pixel-level verification without viewing the images. A `FAIL` or uncompleted visual inspection from any required specialized review blocks the complete work from receiving `PASS`.

## Result

Return actionable findings first, ordered by severity. Include exact file paths and page, question, artwork, vocabulary, or cast IDs. Explain the concrete learner-facing or contract impact, and cite the sources that establish each factual finding.

Return `PASS` only when there are no findings, `$review-native-language` has produced an evidence-backed `PASS` for every locale, and the independent web fact-check is complete. Then summarize the level, Writers, Style, locales, per-locale editorial evidence and verdicts, page count, artwork count, speakers, vocabulary, claim categories searched, research evidence, question evidence, visual inspection, and validator result. If legal uncertainty remains around a Writer or Style, return `NEEDS_LEGAL_REVIEW` instead of `PASS`.
