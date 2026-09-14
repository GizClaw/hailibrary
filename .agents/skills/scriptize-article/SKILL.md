---
name: scriptize-article
description: Convert a final ungraded HaiLibrary series article into a faithful chaptered multi-speaker audiobook script and self-check it against the source—把最终版不分级系列文章忠实转换为分章多人有声书脚本，并对照原文自查；不用于绘本。
---

# Scriptize a final series article

Convert one final `works/series/<id>/locales/<locale>/article.md` into adjacent `audio_script.yaml`. Read [references/annotated-article-contract.md](references/annotated-article-contract.md) first. Do not repair or rewrite the literary source here. Picture books have no audio script.

Read the complete article and series plan. Prefer canonical character IDs, add stable IDs for other quoted speakers, and include `narrator`. Preserve facts, events, causality, viewpoint, tone, ending, source order, and every word outside quotation marks. Assign quoted words to the correct speaker without quotation marks. Add only the shortest locale-natural attribution needed for audio clarity.

Start a block when the speaker changes; merge adjacent same-speaker content and preserve narrator paragraph breaks. Split long narration only above about 400 Chinese characters or 250 English words at an original paragraph boundary. Preserve source chapters; otherwise divide at natural transitions into 3–7 chapters. Use sequential `ch01` IDs and stable `<chapter>-b<two-digit-index>` block IDs.

Write root `audio_script` with `language`, `cast`, and ordered chapters/blocks. Give each cast member localized `display_name` and abstract TTS direction for delivery, timbre, pace, and pitch. Include no provider IDs, SSML, filenames, synthesis settings, stage directions, or invented actions.

Blocks may carry one optional `emotion`, limited to `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, or `calm`. Generally omit it from narration. Add it only to character dialogue whose emotion is explicit enough that a flat reading would distort the line, based on the source context or speech marker, such as “she stamped her foot in anger.” Do not annotate every line merely to make the reading expressive. When the emotion is uncertain, omit the field.

## Author self-reflection

This is the script's editorial review. The same author must execute every action, fix every finding, then restart the complete checklist until a fresh pass finds nothing:

1. Reconstruct the article from the script in chapter and block order: restore quotation marks around character blocks where the source has them and remove only explicitly added audio attributions. Compare the reconstruction with `article.md` character for character, including paragraph order and punctuation. Fix every omission, repetition, reordering, paraphrase, or invented word.
2. For every quoted span in the article, point to its script block and identify the speaking character from the surrounding source. Confirm the block uses that exact cast ID; split interrupted speech around narration and repair any guessed or swapped speaker.
3. Mark every word present in the script but absent from the source. Keep only the shortest locale-natural speaker attribution required to disambiguate otherwise unclear consecutive dialogue by ear; delete stage directions, delivery notes, explanations, actions, emotion words, transitions, and all other additions from the spoken text.
4. Compare source headings and paragraph boundaries with script chapters and narrator newlines. Confirm source order is intact, natural chaptering is used only when headings are absent, speaker changes create blocks, adjacent same-speaker content is merged, and long narration is split only at an original paragraph boundary.
5. Resolve every block speaker to one complete cast entry, verify sequential stable chapter and block IDs, and confirm TTS direction is abstract and reusable with no provider ID, SSML, filename, synthesis setting, or per-block voice data.
6. Inspect every `emotion`: point to its explicit basis in the source context or speech marker, confirm it is not used on narration, confirm the block has exactly one emotion, and confirm the value is one of `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, or `calm`. Remove any unsupported, uncertain, or merely decorative annotation.

Only hand off after the restarted checklist passes.
