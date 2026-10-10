# Translator notes author audit

Source: all 187 translator notes in [Gutenberg 1727](https://www.gutenberg.org/ebooks/1727). The English contains 9,304 words and 204 paragraphs. Chinese contains the same 187 notes and the same 204 paragraphs; every individual note's paragraph count matches. The source's malformed `29[]` marker is rendered as `[29]` in Chinese, while the English remains unchanged.

## Complete translation checks

1. Compared heading, numbering, order and per-note paragraph counts, including multi-paragraph notes 36, 48, 122, 135, 165, 178 and 186.
2. Walked all notes for omitted clauses, anecdotes, doubts, claims, citations, quantities and names. Preserved the historical author's opinions as attributed commentary, including claims now disputed.
3. Checked every quotation's speaker, addressee and intention. Recast the opaque literal English food idioms in note 17 as Chinese colloquial expressions serving the same function.
4. Scanned all 204 paragraphs for translationese. Repaired note 89's awkward treatment of a bride as a life stage without changing the assertion.
5. Retained Greek quotations and missing-Greek placeholders. Kept `Jutland` as the English word under discussion in note 50 so the etymological argument survives; checked the riding-island joke and ironic nickname as well as all source references.
6. Read all notes aloud in order, preserving the movement between terse references, detailed explanations, anecdotes and polemic.
7. Checked the whole translation for sanitization, moralizing, modernization, invented explanation and borrowing from a modern Chinese translation; none remained.

The same author restarted all seven items after the three fixes and repeated the full paragraph walk. The fresh pass found no issue. Numbering 1–187 is continuous, and mechanical comparison found no per-note paragraph mismatch.

The author profile is `samuel-butler`. These are editorial notes, not Homeric narrative, and have no audio script. `npx --no-install hailibrary-check-work works/series/the-odyssey/the-odyssey-footnotes` passed with exit status 0.
