---
name: create-vocabulary
description: Create or materially revise a HaiLibrary picture-book vocabulary entry or word card after adapted prose is stable—在绘本改编文字稳定后创建或修改词汇条目、词卡、拼音、IPA、释义和课程对齐；不为系列文章预埋词汇。
---

# Create picture-book vocabulary

Create or revise `vocabulary/<level>/<id>/entry.yaml` and one wordless `card.webp`. Picture-book vocabulary levels are only `aa` through `n`. Read the exact level, locale references, vocabulary ranges/index, all inline usages, nearby entries, and `$review-vocabulary` source policy.

Choose one shared concept, exact story sense and grammatical role, stable ID, required locales, learner definition, and only evidence-backed alignments. English Lexile evidence never establishes Chinese placement; verify whole Chinese words rather than inferring from characters. Browse current authoritative monolingual or normative sources for terms, senses, parts of speech, pronunciation, forms, writing data, and claimed curricula.

Write schema-1 `entry.yaml` with matching ID/level, `card: card.webp`, and each locale's natural term, part of speech, supported pronunciation, level-appropriate definition, forms, writing metadata, and alignments. Inline markers may be added only after adapted prose is final; their surface form must already occur and equal a term or declared form.

Preserve existing cards during text-only work. For an authorized new card, create an original wordless image that depicts the shared concept across locales, save compressed WebP, confirm LFS, and visually inspect it. Picture-book `tools/imagegen` is for `artwork.yaml` cover/page assets, not vocabulary cards.

Run a fresh `$review-vocabulary` pass and validate every affected book. Return `PASS` only when evidence, metadata, usages, card, and validation have no findings.
