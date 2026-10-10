# The Odyssey: collection audit

This is the complete ungraded classic album at `works/series/the-odyssey/`: 24 narrative books, the dedication, both edition prefaces and all 187 numbered translator notes. All 28 articles have the source edition and newly authored Chinese prose. The 24 narrative books each have an English and a Chinese listening script. The four editorial articles have no audio script. These are scripts, not synthesized recordings.

Each article's linked audit records its author's concrete editorial checks and corrections. Chinese authors completed the seven-item `translate-classic` loop through a fresh complete pass without findings; audio authors completed `scriptize-article`'s prescribed single check pass and fixed its findings in place. This collection record documents import fidelity, shared metadata, continuity and mechanical integration; it does not replace those author checks.

## Edition and import boundaries

The source is [Project Gutenberg ebook 1727](https://www.gutenberg.org/ebooks/1727), Samuel Butler's 1900 prose translation as transcribed from the 1921 second edition. The [printed prefaces](https://www.gutenberg.org/files/1727/1727-h/1727-h.htm) identify the edition and Henry Festing Jones's editorial work; the [University of Pennsylvania Libraries record](https://onlinebooks.library.upenn.edu/webbin/work?id=olbp101204) independently identifies that publication history. Gutenberg marks the edition public domain in the USA. No modern Chinese translation or screen adaptation was used.

The captured UTF-8 source has SHA-256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9`. Import excludes the Gutenberg wrapper, redundant title/contents listing and empty illustration placeholder. Section headings become Markdown H1 titles. The section bodies preserve source wording, punctuation, paragraph boundaries, soft line wraps, editorial arguments and footnote markers. Printed anomalies, including missing Greek placeholders and the preface's `894`, are retained. The dedication is printed in Italian within the English edition; its `original.language` is `it` and its Chinese rendering is complete.

The table below links every article audit. Source-body hashes apply to UTF-8 text after removing the inserted H1 and its blank line and trimming outer whitespace, without normalizing internal whitespace. All 28 hashes matched the captured source sections. The source contains 129,433 whitespace-delimited words, including 117,384 in the 24 books and their printed arguments. Paragraph counts include each book's argument and exclude its H1; Chinese counts match the corresponding source counts.

| Section audit | Source words | Paragraphs per locale | Source-body SHA-256 |
|---|---:|---:|---|
| [Dedication](the-odyssey-dedication/audit.md) | 9 | 1 | `6c05d0cdd540152dcd14bfa3221993a41524824296ad4ad269ff4951960e7c03` |
| [First preface](the-odyssey-preface-first/audit.md) | 2,126 | 20 | `26d1c6a1e0e565c1512f85fd746a346a166273bd0ae7b2a333fe2a4c17722d0b` |
| [Second preface](the-odyssey-preface-second/audit.md) | 610 | 11 | `0ab5c0631556af14358ecf554bf94ce67ba1250d870d79161dc418ea184aac2e` |
| [Book 01](the-odyssey-01/audit.md) | 4,124 | 33 | `c372294dd61a61a852f27e6fbc522729aa94a850b2c729fc8349128f4d74235d` |
| [Book 02](the-odyssey-02/audit.md) | 4,208 | 36 | `108738d3ebd6c92095fa692a7d08ed21e89b735399a5b70fd2cfcf7349833431` |
| [Book 03](the-odyssey-03/audit.md) | 4,707 | 39 | `ffa22b5b0a11cce9debd7fdeffad869f0b280c31b960fc3b8fa8f51e8e730a41` |
| [Book 04](the-odyssey-04/audit.md) | 8,060 | 82 | `307471b9928df12b1368fc69aa351f9d3b03b747415c4717e4252eea9ffe9007` |
| [Book 05](the-odyssey-05/audit.md) | 4,673 | 38 | `5fbcf0869588647047704eb318be2d0f2c3cf096640ab87ea708b1e11e6b498d` |
| [Book 06](the-odyssey-06/audit.md) | 3,441 | 27 | `84029e4dd80d63e7aa47d68ab014b1147ede97fcf807f6e52d199553aeda75bc` |
| [Book 07](the-odyssey-07/audit.md) | 3,356 | 30 | `117e1880fd02acbd6ac23714b02cd10a689bcd9dcd32ee87427d5494ab92e417` |
| [Book 08](the-odyssey-08/audit.md) | 5,597 | 51 | `cfd8eb0f3c9a69e0ac70367c6dee9c490966db49673aa5830028cf0dc96bb7d4` |
| [Book 09](the-odyssey-09/audit.md) | 5,811 | 45 | `a47abe6558084e8fbf141b65b9e304d9e4ab8ba96feb90a8440424f2b72e212f` |
| [Book 10](the-odyssey-10/audit.md) | 5,688 | 50 | `e9c2fe9f9d5ce96f076ff33c9d92eaa92a8165096f91494d5f81bd0fb18513e8` |
| [Book 11](the-odyssey-11/audit.md) | 6,021 | 55 | `bfee619587b0b58e1611b1aa55d567a2816c9f9e87701dbe57f9a5374c6ab5e6` |
| [Book 12](the-odyssey-12/audit.md) | 4,599 | 40 | `1e6adf1338005933c1549b3a29f4bdc62b9f9130056e9a71ea84d60ce6ba53b7` |
| [Book 13](the-odyssey-13/audit.md) | 4,199 | 39 | `05a80f46f5cd880401bbeb9b3feaba414e2d7266642a6d98a6c197d83e57efdd` |
| [Book 14](the-odyssey-14/audit.md) | 5,382 | 36 | `db4893dc84a6ede88e83caa062d75418c007826fa58130505fab1cb3b06c41bd` |
| [Book 15](the-odyssey-15/audit.md) | 5,412 | 49 | `14e009c9662b0d12532244e2325229f161a516279b2ba2dccaa1b2d0883ec39f` |
| [Book 16](the-odyssey-16/audit.md) | 4,546 | 46 | `66152ebc6d6c2f2d6b460418b774dd6ab04e7e88461202cf111e7fe7bcfb4b48` |
| [Book 17](the-odyssey-17/audit.md) | 5,855 | 64 | `016a9ab8ce4265d7be042831bcaf693cd75552bfb839ac38e1b095096110c52b` |
| [Book 18](the-odyssey-18/audit.md) | 4,158 | 42 | `d9be50b72c03888238910c2a73d6c5c8d802b254ca1ac66f928359f362f6c2ea` |
| [Book 19](the-odyssey-19/audit.md) | 6,012 | 40 | `dc4c283302a72198d53629223f097f1e73da5937d497370cc4e1d697f7ba1d4d` |
| [Book 20](the-odyssey-20/audit.md) | 3,834 | 37 | `60c6463307575e264637a108c5a005e0149d7f563fa455d0f6e3a3e39b5e9d79` |
| [Book 21](the-odyssey-21/audit.md) | 4,252 | 43 | `eebc539a54f130aeb47023221e324ccae1881aa7df89a64d16a7fba493ad6521` |
| [Book 22](the-odyssey-22/audit.md) | 4,556 | 53 | `53a68132aac755d8253f79f5fd94816034f1b34424218097ee42c51f7e93f55f` |
| [Book 23](the-odyssey-23/audit.md) | 3,695 | 30 | `891a6234cc0a01b4435c113fece76b434e0aa5c02817e366cdd1cd78ca2d4019` |
| [Book 24](the-odyssey-24/audit.md) | 5,198 | 46 | `abf258cebf39d081df9a30f3feaa7e50afe41c58176f46119c0e0450664d4f9a` |
| [Notes](the-odyssey-footnotes/audit.md) | 9,304 | 204 | `2526647840d0921b6a127984181ec41ef0f642d5831b5459122483a6f7148485` |

## Collection-level article checks

1. Re-read the complete `classic` type contract. Checked the `fiction` / `adventure` taxonomy, required evidence, exact source URL, translators, bilingual titles, inherited age 14+, approximate original date and the full source order. This is ungraded literature with no proposed picture book, fixed page count, vocabulary targets or questions. Grouped labels resolve to the existing controlled IDs. Source hashes enforce the classic's prohibition on editorial rewriting.
2. Traced the narrative progression: Books I–IV establish the occupied home and the son's search; V–VIII bring the returning father to the Phaeacians; IX–XII recount his earlier losses; XIII–XVI return both men to Ithaca and reunite them; XVII–XXI test loyalties and prepare the bow contest; XXII–XXIV carry revenge through marital and paternal recognition to the final peace. The nonlinear order and the final settlement are preserved.
3. Compared the distinct dialogue roles against the per-article checks: the son's growing independence, the father's concealment and recognition, Penelope's testing, servant loyalties, suitor threats, divine instructions and the narrator's framing retain their speakers and intentions. English is the unchanged Butler edition. Chinese dialogue and spoken retellings are checked by their own authors rather than rewritten by an importer.
4. Read the ending against the opening: return alone does not resolve the occupied household. Recognition, the olive-root bed, Laertes, the bereaved families and the divine settlement are all included. The remaining voyage in the prophecy is retained as an unresolved future obligation, not silently replaced with a simpler happy ending.
5. Checked the persistent states in the continuity table below. The source's reported stories, disguises and disagreements remain distinct from the narrator's assertions; translation does not grant listeners knowledge earlier than the source does. Shared proper names and recurring objects were coordinated across books. The ninth-book talent term was normalized to 塔兰特 by its original translator, who then repeated the complete translation checklist.
6. Reconciled checkable metadata claims with the sources in every `research.yaml` and the [author-resource audit](authors-audit.md). Getty and the Metropolitan Museum support the traditional Homer attribution, approximate eighth-century BCE date, 24-book form and oral tradition. Institutional records distinguish Butler and Jones and support their dates and work. Homer's unknown lifespan is omitted.
7. Classified the supernatural narrative as declared myth, edition statements as supported bibliographic claims, and Butler's authorship/geography arguments and period assumptions as attributed historical interpretations. They are not presented as current HaiLibrary factual conclusions. Research notes preserve the limits of the evidence; source prose is not altered to update historical opinions.
8. Checked that all requested locales are present, all source paragraphs have Chinese counterparts, translator credits are explicit, and the Chinese authors' full fidelity/native-language passes are recorded. The exact English text remains immutable; independent original storytelling rules do not apply to an imported classic.
9. Checked the complete-content boundary and the age designation. Violence, slavery, sexuality, social hierarchy and disturbing punishments remain in the source and faithful translation. The new cover is wordless and non-graphic. No modern personal information, protected screen character, imitation instruction or newly invented moral was introduced.
10. Confirmed complete read-through and spoken-register work in the author records, final paragraph endings, script counts and valid single-voice cast references. No literary length cap is imposed on the imported classic. Quantitative spoken-length checks below supplement, rather than prove, narrative fidelity.

The first metadata pass corrected the label shape, original date and real-author associations. After those corrections, the complete collection-level checklist was repeated against the final metadata and the completed author records without another finding.

| Persistent state | Source-order checkpoints |
|---|---|
| Time and narrative frames | The opening is late in the homeward journey; Books IX–XII are the father's retrospective account; Book XIII resumes the present return. |
| Father and son | Telemachus travels while Odysseus is absent. Their separate returns meet at Eumaeus's hut in Book XVI before they act together in the palace. |
| Identity and knowledge | Athena's disguises, the father's cover stories, Euryclea's scar recognition and Penelope's later bed test are preserved at their respective moments. |
| Ships, companions and wealth | Successive losses at sea precede the Phaeacian passage. Deposited gifts, the son's ship and returning crew remain distinct. |
| Palace objects and access | The bow, axes, stored weapons, doors and servant movements retain their roles in the contest and fighting. |
| Household and ending | Eumaeus and Philoetius, the nurse, Penelope and Laertes have different recognition scenes; the suitors' relatives remain a threat after the palace victory. |
| Divine intervention | Athena's guidance and disguise, Poseidon's hostility and Zeus's final settlement remain mythical source actions, not physical-world instruction. |

## Spoken-script measurements

Counts use non-whitespace Unicode characters. They omit the title, editorial argument, source footnote numerals and Markdown emphasis delimiters; all block `text` values contribute to spoken length. Ratios therefore compare the narrative actually adapted. Approximately 90–105% is the working range. Each linked article audit provides that author's protected-beat, register, dialogue and correction evidence; matching length alone is not evidence of completeness. Chapter divisions are chosen independently for each language. Some article authors recorded counts with source footnote numerals or emphasis markers still included; this table recounts every script with the one normalized method above. The numeric footnote sequence also matches between each book's source and Chinese text.

| Book audit | English spoken / narrative | Ratio | Chapters / blocks | Chinese spoken / narrative | Ratio | Chapters / blocks |
|---|---:|---:|---:|---:|---:|---:|
| [01](the-odyssey-01/audit.md) | 15,739 / 17,172 | 91.6550% | 4 / 28 | 5,499 / 5,963 | 92.2187% | 4 / 28 |
| [02](the-odyssey-02/audit.md) | 15,842 / 17,531 | 90.3656% | 5 / 40 | 5,515 / 6,001 | 91.9013% | 4 / 39 |
| [03](the-odyssey-03/audit.md) | 18,308 / 20,289 | 90.2361% | 5 / 32 | 6,151 / 6,808 | 90.3496% | 4 / 32 |
| [04](the-odyssey-04/audit.md) | 30,330 / 33,670 | 90.0802% | 7 / 80 | 10,271 / 11,010 | 93.2879% | 6 / 80 |
| [05](the-odyssey-05/audit.md) | 17,474 / 19,326 | 90.4171% | 4 / 40 | 5,399 / 5,970 | 90.4355% | 5 / 41 |
| [06](the-odyssey-06/audit.md) | 12,859 / 14,273 | 90.0932% | 4 / 25 | 3,765 / 4,140 | 90.9420% | 3 / 25 |
| [07](the-odyssey-07/audit.md) | 12,870 / 14,255 | 90.2841% | 4 / 25 | 3,786 / 4,184 | 90.4876% | 3 / 26 |
| [08](the-odyssey-08/audit.md) | 21,609 / 23,961 | 90.1840% | 6 / 60 | 6,344 / 6,767 | 93.7491% | 5 / 60 |
| [09](the-odyssey-09/audit.md) | 21,359 / 23,565 | 90.6387% | 5 / 26 | 6,615 / 7,317 | 90.4059% | 4 / 26 |
| [10](the-odyssey-10/audit.md) | 21,028 / 23,273 | 90.3536% | 5 / 39 | 6,753 / 7,330 | 92.1282% | 6 / 40 |
| [11](the-odyssey-11/audit.md) | 22,591 / 25,013 | 90.3170% | 6 / 37 | 7,667 / 8,248 | 92.9559% | 5 / 37 |
| [12](the-odyssey-12/audit.md) | 17,093 / 18,840 | 90.7272% | 4 / 18 | 4,937 / 5,436 | 90.8205% | 5 / 19 |
| [13](the-odyssey-13/audit.md) | 16,007 / 17,695 | 90.4606% | 5 / 40 | 4,828 / 5,306 | 90.9913% | 4 / 39 |
| [14](the-odyssey-14/audit.md) | 19,852 / 22,012 | 90.1872% | 5 / 31 | 5,585 / 6,199 | 90.0952% | 5 / 31 |
| [15](the-odyssey-15/audit.md) | 20,311 / 22,449 | 90.4762% | 5 / 60 | 5,946 / 6,543 | 90.8757% | 6 / 60 |
| [16](the-odyssey-16/audit.md) | 17,103 / 18,817 | 90.8912% | 5 / 51 | 5,150 / 5,315 | 96.8956% | 4 / 51 |
| [17](the-odyssey-17/audit.md) | 22,112 / 24,412 | 90.5784% | 5 / 82 | 7,532 / 8,200 | 91.8537% | 6 / 83 |
| [18](the-odyssey-18/audit.md) | 15,780 / 17,425 | 90.5595% | 5 / 64 | 5,163 / 5,676 | 90.9619% | 4 / 63 |
| [19](the-odyssey-19/audit.md) | 22,640 / 25,137 | 90.0664% | 6 / 54 | 7,205 / 7,947 | 90.6631% | 5 / 52 |
| [20](the-odyssey-20/audit.md) | 14,715 / 16,254 | 90.5316% | 5 / 52 | 4,639 / 5,136 | 90.3232% | 4 / 51 |
| [21](the-odyssey-21/audit.md) | 15,908 / 17,644 | 90.1610% | 5 / 47 | 4,776 / 5,288 | 90.3177% | 4 / 49 |
| [22](the-odyssey-22/audit.md) | 17,436 / 19,297 | 90.3560% | 6 / 71 | 5,291 / 5,816 | 90.9732% | 5 / 70 |
| [23](the-odyssey-23/audit.md) | 13,812 / 15,339 | 90.0450% | 4 / 37 | 4,512 / 5,012 | 90.0239% | 3 / 37 |
| [24](the-odyssey-24/audit.md) | 20,316 / 22,103 | 91.9151% | 5 / 59 | 6,743 / 7,191 | 93.7700% | 4 / 59 |

## Authors, cover and portraits

The album and all 24 narrative books use the existing real-author profile mechanism, `original.writer: homer`. Both locales resolve to Homer / 荷马. Butler is the English translator and the author of the dedication, first preface and notes. Jones is the second preface's author. New Chinese translation credit is HaiLibrary. Six locale profiles, their evidence, image checks and shared portrait hashes are documented in [authors-audit.md](authors-audit.md).

The user selected Codex's built-in Image 2 for this task. The cover and three distinct portraits were generated from committed prompts through that tool. The cover also uses the referenced `epic-fantasy-illumination` Style. Final media consists of one 1536×1024 cover and six 1024×1024 avatar WebPs, with each portrait shared unchanged across two locales. All were visually inspected. Seven matching image states record `done`; Git LFS stores all seven media paths. Raw PNG sources are not committed.

The local reader exposed an existing byline defect: it always displayed the collection's author/year for editorial children. Its byline now uses the already loaded chapter manifest and that chapter's actual locale Writer, matching the standalone article reader. Browser verification covered the English and Chinese Jones preface, Butler's first preface, the first and last narrative books, chapter navigation, the cover, Homer's profile and its filtered works link. Both locale directory indicators read 28/28. No recording playback or deployment was performed.

## Final validation

Validation completed on 2026-10-11 (Asia/Singapore).

| Check | Result |
|---|---|
| `npx --no-install hailibrary-check-work works/series/the-odyssey` | PASS, exit 0 |
| Complete-artifact and source audit | 28 articles, 56 locale articles, 48 scripts, 28 article audits; no missing artifact, hash mismatch, paragraph mismatch or footnote-sequence mismatch |
| Script schema and spoken length | All cast references, sequential IDs, ensemble sizes, emotion restrictions and normalized ratios passed |
| Image generator dry run | Album plus six author-profile directories; 0 pending images, exit 0 |
| Media in the Git index | All seven WebP files have valid LFS pointers with the exact working-file SHA-256 and byte length |
| `pnpm build` | PASS; production catalog and reader compiled. Vite reported its non-failing 500 kB chunk-size advisory |
| `pnpm typecheck` | PASS |
| Existing catalog tests | 4/4 PASS, using `node --experimental-strip-types --test tools/catalog/test/*.test.ts` after the final build |
| Existing web tests | 19/19 PASS, using `pnpm --filter @hailibrary/web test` |
| Runtime collection and locale files | Exact 28-entry order, 28/28 in each locale, 24/24 audio scripts per locale, 56 article files and 48 script files |
| Runtime fidelity and assets | Every rendered source paragraph matches modulo whitespace; scripts exactly match source YAML; effective author overrides, relative URLs, profile avatars and shared cover resolve |
| Staged whitespace and scope | `git diff --cached --check` passed; 212 branch files, including 28 per-article audits and seven LFS WebPs |
| Local browser | Chinese/English reading, first/last-book navigation, three real-author bylines, Homer discovery and wordless cover verified |

The commit scope contains the album, its three author profiles in both languages, and the collection byline correction. Generated catalogs/build output, raw PNGs, downloads, temporary beat sheets and unrelated files are excluded. The submission links to Issue #73; merge and deployment remain separate operations.
