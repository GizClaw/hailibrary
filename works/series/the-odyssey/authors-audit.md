# Odyssey author-resource audit

The profiles use the repository's existing `kind: author` format, as used for Aesop and other classic authors. They identify historical authors rather than creative Writer personas. Persona prompts, recommended reading levels and default-Writer changes therefore do not apply.

| Author ID | English / Chinese display | Scope |
|---|---|---|
| `homer` | Homer / 荷马 | Album and all 24 narrative books |
| `samuel-butler` | Samuel Butler / 塞缪尔·巴特勒 | Dedication, first-edition preface and translator notes |
| `henry-festing-jones` | Henry Festing Jones / 亨利·费斯廷·琼斯 | Second-edition preface |

Both locales of every narrative book inherit `original.writer: homer`. Editorial articles override that Writer explicitly. English prose names Samuel Butler as translator; new Chinese prose names HaiLibrary as translator. Homer has no invented birth or death year.

## Evidence consulted

- [Getty's Odyssey authority record](https://www.getty.edu/cona/CONAIconographyRecord.aspx?iconid=901000730): traditional Homer attribution, Greek title, 24 books and approximate eighth-century BCE date.
- [The Metropolitan Museum's account](https://www.metmuseum.org/perspectives/discovering-homer-odyssey): approximate date and oral performance tradition.
- [National Trust Homer record](https://www.nationaltrustcollections.org.uk/object/852220): uncertain biography and authorship, oral tradition and the later, imagined nature of Homer portraits.
- [National Portrait Gallery's Samuel Butler record](https://www.npg.org.uk/collections/search/person/mp00682/samuel-butler): the writer and artist born in 1835 and deceased in 1902, distinguishing him from the earlier author of the same name.
- [Gutenberg 1727](https://www.gutenberg.org/ebooks/1727) and [the printed prefaces](https://www.gutenberg.org/files/1727/1727-h/1727-h.htm): translator identity, 1900 publication, and Jones's work on and preface to the 1921 edition.
- [Gutenberg's Jones record](https://www.gutenberg.org/ebooks/24652) and [British Library manuscript catalogue](https://searcharchives.bl.uk/catalog/032-002085392): Henry Festing Jones's authorship and 1851–1928 dates.

## First complete author check pass

1. Compared schema, IDs, directories, locales, native names, author fields and default avatar paths for all six profiles. Kept the 29-level/default-Writer index unchanged. Checked the album's inheritance and each editorial override against actual catalog behavior.
2. Searched and read institutional author records. Used the intended historical identities; distinguished the two Samuel Butlers by dates and works. Omitted uncertain dates for Homer rather than inventing a lifespan.
3. Checked all biography assertions and prompt references. The image prompts create original stylized portraits and request no copied photograph, painting, living-artist style, protected character, title or logo. Homer's portrait is explicitly imagined. Narrowed Jones's biography to the writer/editor roles supported by the consulted material.
4. Checked use in two different narrative books and in the editorial entries. These profiles supply authorship and discovery links, and do not instruct the system to rewrite or imitate a classic author.
5. Read both native-language biographies and compared their meaning. Kept original authors and locale translators distinct, without inserting a fictional personality or generation prompt into the real-author schema.
6. Opened each final English-locale WebP at its original 1024×1024 pixels. Confirmed the three identities' prompt details, readable portraits, shared visual family, absent embedded text and no copied identifiable artwork. Verified WebP encoding, Git LFS coverage and completed imagegen state.

## Restarted complete second pass

All six items were repeated after the biography correction. Profile IDs/locales and every author/translator binding resolved; biographies matched their evidence; uncertainty remained explicit; no fictional-persona or imitation instruction was introduced. Each Chinese-locale WebP was opened at original pixels and checked against its prompt. Cross-locale SHA-256 checks confirmed identical portrait bytes. The fresh full pass found no issue.

| Shared portrait | SHA-256 of WebP in each locale |
|---|---|
| Homer | `dd606af8cb929dff364aa17abb025ed7a9d48e03757169199458612a919505fe` |
| Samuel Butler | `41dbfc974738fb69a141759bb41beb2f2311547c8dfa938e4eca3dcb896a02c0` |
| Henry Festing Jones | `440807484e5462c8cc9f638c7c201f280977af36830304d415d5e2df5c664f92` |

The user selected Codex's built-in Image 2. Portraits were generated from committed avatar prompts, converted to compressed WebP and shared across locale profiles. `hailibrary-imagegen --dry-run` reports zero pending assets for the cover and all six author targets.

The catalog compiled successfully. A local browser check found 荷马 under 原著作家; its 查看文学作品 link opened the filtered Odyssey album, and Book I's Chinese byline displayed 荷马 with translator HaiLibrary. This verifies the same author-discovery path used by existing classic articles.

The collection reader was also checked on the editorial articles. It initially used the parent collection's author and date even though the chapter manifest correctly identified Jones. The byline now reads the current chapter manifest and its actual locale Writer, matching standalone articles. The local browser then displayed Henry Festing Jones / 亨利·费斯廷·琼斯 with 1921 for the second preface, 塞缪尔·巴特勒 with 1900 for the first preface, and Homer / 荷马 for the narrative books. Chinese translator credit remains HaiLibrary.
