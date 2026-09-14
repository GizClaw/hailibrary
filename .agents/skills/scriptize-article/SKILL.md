---
name: scriptize-article
description: Convert a final ungraded HaiLibrary series article into a chaptered multi-speaker audiobook script without rewriting it—把最终版、不分级的系列文章逐字转换为分章、多角色有声书脚本；不用于文学创作、绘本改编或绘本 TTS。
---

# Scriptize a final series article

Convert one reviewed `works/series/<id>/locales/<locale>/article.md` into adjacent `audio_script.yaml`. Read `references/annotated-article-contract.md` first. If the literary source is incomplete or defective, return `ARTICLE_FIX_REQUIRED` and use `$write-article`; never repair it indirectly here. Picture books have no audio script.

Read the complete article and series `article.yaml`. Prefer canonical character IDs, add stable IDs for any other quoted speaker, and include `narrator`. Preserve all facts, events, causality, viewpoint, tone, ending, source order, and every word outside quotation marks. Assign quoted words to their speaker without quotation marks. Add only the shortest locale-natural attribution when otherwise ambiguous by ear.

Start a block when speaker changes; merge adjacent same-speaker content and preserve narrator paragraph breaks. Split long narration only above about 400 Chinese characters or 250 English words at an original paragraph boundary. Preserve `## ` chapters; otherwise divide at natural transitions into 3–7 chapters. Use sequential `ch01` IDs and stable `<chapter>-b<two-digit-index>` block IDs.

Write root `audio_script` with locale `language`, `cast`, and ordered chapters/blocks. Every cast member has localized `display_name` and abstract `tts.delivery`, `timbre`, `pace`, and `pitch`. Include no provider IDs, SSML, filenames, synthesis settings, stage directions, or invented actions.

Read blocks continuously and fix omissions, duplication, order changes, wrong speakers, unstable IDs, incomplete cast, and unnecessary attribution. Only after the series article and audiobook are final may `$adapt-article` derive picture books.
