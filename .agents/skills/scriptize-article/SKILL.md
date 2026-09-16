---
name: scriptize-article
description: Adapt a final ungraded HaiLibrary series article into a story-faithful, colloquial, listening-first chaptered multi-speaker audiobook script and self-check it against the source—把最终版不分级系列文章改编成忠于故事、口语自然、适合聆听的分章多人有声书脚本，并对照原文自查；不用于绘本。
---

# Scriptize a final series article

Adapt one final `works/series/<id>/locales/<locale>/article.md` into adjacent `audio_script.yaml` as a script director preparing it for listening. Read [references/annotated-article-contract.md](references/annotated-article-contract.md) first. Do not repair or rewrite the literary source here. Picture books have no audio script.

Adapt each locale only from its own complete `article.md`. Locale scripts are independent: never translate, align, or use another locale's script as source, and do not force matching blocks, block counts, inferred chapters, attributions, or emotion placement. Keep series-declared character IDs shared, but make `display_name`, TTS direction, and all spoken text native to the locale.

Fidelity protects the story and authorship, not every wording, meaning nuance, or minor detail. The director may rephrase, vary descriptive detail and emphasis, recast a metaphor, reorder clauses within a passage, add a short bridge or clarification for listeners, condense or drop minor description, or open up compressed prose. Do not change events, asserted facts or evidence, causality, who does or says what, characters or viewpoint, emotional arc, scene order, or ending; add no plot fact, character, action, or moral. Keep signature images and key lines recognizable as the same author's work even when rephrased.

Re-voice narration for the ear in the narrator's established register. Split written-only constructions into speakable breaths and make unseen layout or emphasis audible without changing protected story content. Drop only attribution-only clauses made wholly redundant by the speaker change; keep every story-bearing action, state, timing, or emotion carried by a speech tag.

Keep dialogue with the correct speaker and preserve what is said, its intent, and the character's register. Start a block when the speaker changes; merge adjacent same-speaker content without flattening meaningful rhythm. Preserve source chapters; otherwise divide at natural transitions into 3–7 chapters. Assign deterministic sequential chapter and block IDs for the current finalized script.

Write root `audio_script` with `language`, `cast`, and ordered chapters/blocks. Give each cast member localized `display_name` and abstract TTS direction for delivery, timbre, pace, and pitch. Include no provider IDs, SSML, filenames, synthesis settings, stage directions, or invented actions.

Never tag narration with `emotion`. For every character dialogue block, judge its emotion from the source context, speech marker, and scene. Tag emotionally colored dialogue with at most one of `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, or `calm`; omit the field only when the line is genuinely neutral or the source gives no basis. Never guess.

## Author self-reflection

This is the script's editorial review. The same author must execute every action, fix every finding, then restart the complete checklist until a fresh pass finds nothing:

1. For each locale, use only its own complete article as source. Confirm no block, count, inferred chapter, attribution, emotion, or spoken wording was copied or forced to align across locales; keep shared declared character IDs while localizing every locale-owned field.
2. Apply the reference's story-fidelity contract scene by scene in source order. Account for every protected beat and dialogue line; fix every story-changing omission, repetition, reordering, erased scene, wrong speaker or assertion, and invention.
3. Apply the reference's listening and register contract sentence by sentence while reading every block aloud in its assigned voice. Fix written-only phrasing, unspoken visual dependencies, redundant attribution-only clauses, lost story-bearing speech-tag information, awkward transitions, and out-of-character dialogue.
4. Compare source and script emphasis and overall extent. Use protected story coverage as the controlling test; fix large cuts, filler, or padding, and confirm key lines, signature images, and the ending remain recognizable.
5. Apply the reference's chapter, block, and ID rules to the complete finalized script. Verify source order, speaker boundaries, same-speaker grouping, and deterministic sequential IDs equal to current array positions.
6. Resolve every block speaker to one complete cast entry. Confirm each TTS direction and field follows the reference and contains no provider-specific or per-block voice data.
7. Audit every character dialogue block against the source context, speech marker, and scene. Add a valid tag to every clearly emotional line; for every tag, record its source basis. Confirm narration has none, each block has at most one, every value is allowed, and every neutral or untagged line has no supported emotional color.
8. Run `npx --no-install hailibrary-check-work works/series/<id>`. Fix every error and rerun it, then restart this entire checklist because deterministic success does not prove fidelity or listening quality.

Only hand off after the restarted checklist passes.
