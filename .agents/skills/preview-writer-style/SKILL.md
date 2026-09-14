---
name: preview-writer-style
description: Generate a disposable HaiLibrary Writer, aa-n Level, and Style preview—生成一次性的 Writer、aa-n 精确级别与 Style 组合预览，用于调试 prompt；不创建系列文章、绘本或正式图片。
---

# Preview a Writer and Style

Output a disposable preview in conversation. Do not edit repository content. Resolve one locale Writer, one exact picture-book level from `aa` through `n`, and one Style; read their complete prompts plus locale level/vocabulary references. Flag an off-range Writer recommendation rather than silently substituting.

Invent a low-stakes scene without material factual claims. The exact Level governs reader-facing difficulty, Writer prompts govern viewpoint and native phrasing, and Style governs only the written visual treatment. Produce a compact configuration line, one continuous level-bound sample without page or speaker markup, one concise visual scene/prompt preview with no visible text, and brief observations about level fit, Writer differentiation, and Style visibility.

This is neither a persisted ungraded `article.md` nor a finished `artwork.yaml` prompt. Do not pass it to `$scriptize-article`, create vocabulary, or run the full workflow. If the user approves it and requests real content, use `$write-article` for a series source or `$create-work` for an existing series derivative as separate authorization.
