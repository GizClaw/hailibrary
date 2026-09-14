---
name: scriptize-article
description: Convert a final ungraded HaiLibrary series article into a faithful chaptered multi-speaker audiobook script and self-check it against the source—把最终版不分级系列文章忠实转换为分章多人有声书脚本，并对照原文自查；不用于绘本。
---

# Scriptize a final series article

Convert one final `works/series/<id>/locales/<locale>/article.md` into adjacent `audio_script.yaml`. Read [references/annotated-article-contract.md](references/annotated-article-contract.md) first. Do not repair or rewrite the literary source here. Picture books have no audio script.

Read the complete article and series plan. Prefer canonical character IDs, add stable IDs for other quoted speakers, and include `narrator`. Preserve facts, events, causality, viewpoint, tone, ending, source order, and every word outside quotation marks. Assign quoted words to the correct speaker without quotation marks. Add only the shortest locale-natural attribution needed for audio clarity.

Start a block when the speaker changes; merge adjacent same-speaker content and preserve narrator paragraph breaks. Split long narration only above about 400 Chinese characters or 250 English words at an original paragraph boundary. Preserve source chapters; otherwise divide at natural transitions into 3–7 chapters. Use sequential `ch01` IDs and stable `<chapter>-b<two-digit-index>` block IDs.

Write root `audio_script` with `language`, `cast`, and ordered chapters/blocks. Give each cast member localized `display_name` and abstract TTS direction for delivery, timbre, pace, and pitch. Include no provider IDs, SSML, filenames, synthesis settings, stage directions, or invented actions.

## Author self-reflection

After producing the script, the same author concatenates its spoken text and compares it word for word and in order with the article, fixes every discrepancy, and repeats until none remain. Confirm every quote has the correct speaker, narrator paragraphs and chapter order are intact, cast and IDs are complete and stable, and only indispensable audio attribution was added.

