# Odyssey author and artwork record

## Published author

The album and all 24 narrative articles use the existing classic-author mechanism: `original.writer: homer` and a `kind: author` profile in each locale. Both locale records of every article explicitly select `homer`. The displayed author is Homer / 荷马, consistent with the library's other classics. No creative Writer persona is presented as the author of the Odyssey.

The published text is a HaiLibrary reading edition, not an unchanged import of Samuel Butler's translation or a paragraph-matched Chinese translation. Butler's public-domain edition remains identified as the consulted plot source in each `research.yaml`. Its translator credit is not attached to the newly written English. The removed dedication, prefaces and translator notes do not appear in the album; the now-unused Butler and Henry Festing Jones profiles introduced for those sections are removed from this branch.

This is the user's explicit task-specific request to reorganize the prose while retaining the classic category and Homer attribution. It does not change the repository's default faithful-import contract for other classics.

## Evidence and profile checks

- [Getty's Odyssey record](https://www.getty.edu/cona/CONAIconographyRecord.aspx?iconid=901000730) identifies the Greek title, traditional Homer attribution, 24-book form and approximate eighth-century BCE date.
- [The Metropolitan Museum's account](https://www.metmuseum.org/perspectives/discovering-homer-odyssey) independently describes its approximate date, ancient Greek myth and oral performance tradition.
- [Project Gutenberg 1727](https://www.gutenberg.org/ebooks/1727) identifies Homer, Samuel Butler and the source edition's public-domain status in the United States. The [source text](https://www.gutenberg.org/files/1727/1727-h/1727-h.htm) is consulted for narrative evidence.

The existing bilingual Homer profiles were checked for matching IDs, directories, locales and historical identity. Their biographies describe a traditional attribution and uncertain life details; neither invents birth or death dates. The portrait prompt explicitly requests an imagined epic singer rather than a documented likeness. The profiles contain no imitation instruction, provider voice ID or fictional author identity. No level/default-Writer index or author biography was changed during this continuation.

## Retained cover and Homer portrait

The existing cover and Homer portrait were opened and visually inspected again during this continuation. The cover shows a returning seafarer, olive tree, sea, ship and distant settlement, with no embedded text. The portrait shows an imagined older singer with silver hair, beard, plain clothing and a lyre. The two localized Homer files share identical portrait bytes. Text and fidelity corrections did not regenerate these assets.

| Media | SHA-256 |
|---|---|
| `works/series/the-odyssey/cover.webp` | `851be9caa720ee9f72e8105fe78c876a35dc7c35f3acf5aa46981c39999ed27b` |
| Both `prompts/writers/*/homer/avatar.webp` files | `dd606af8cb929dff364aa17abb025ed7a9d48e03757169199458612a919505fe` |

The preceding work generated these assets from committed prompts using the user's selected Codex Image 2 and recorded matching completed image states. Their encoding, dimensions, state and exact Git LFS pointers are covered by the final collection validation.

## Requested square persona avatars

The user also requested removal of circular backgrounds from 百径灯 / Manypath Lantern and 砚舟 / Inkstone Observer. The preceding two local commits contain the full-bleed avatar prompts, four edited WebPs and their image states. They remain part of this PR. These personas are separate library resources; they are not the Odyssey's author.

All four final images were opened during this continuation. Each has a continuous square background reaching the edges and corners, with no circular frame, corner wedge or embedded text. The lanterns retain their books and landscape settings; the observers retain their magnifying glasses and blank notebooks. Locale-specific images remain distinct. No further image generation or image-byte modification was performed.

| Avatar | SHA-256 |
|---|---|
| `en-US/manypath-lantern` | `657cc73bb88654f6f9dd317aaadf144a62d4dc0b4c39aacafcbc7466e12634a1` |
| `zh-CN/百径灯` | `f5eb730976d35e404de3fd82657b8f720d71dcd80f4a2da3af94472d997717c2` |
| `en-US/inkstone-observer` | `b2c14208c4821db94beedb7b9b5cb0e850bb29d3cc12b849cadb06cebf162ce9` |
| `zh-CN/砚舟` | `8197da1ab7aa5235ccb1ee5863ca9cc28d56bfe0f270e068b36cd729ee980528` |

Author discovery, both reading-language bylines and the final 24-entry contents are checked against the built catalog and local browser in the collection audit. No synthesized recording, merge or deployment is included.
