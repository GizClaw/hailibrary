# The Odyssey: reading-edition collection audit

## Publication boundary

`works/series/the-odyssey/` is an ungraded bilingual HaiLibrary reading edition of the classic attributed to Homer / 荷马. It contains the 24 narrative books in their received order, with one English and one Chinese article and listening script per book. The album is titled *The Odyssey: A HaiLibrary Retelling* / 《奥德赛：HaiLibrary 阅读版》.

The user explicitly requested natural, reorganized prose rather than a verbatim import or a sentence-matched translation, while retaining the classic category and Homer as author. This is a task-specific exception to the `classic` type's default import rules. The type prompt, skills, root `AGENTS.md` and other classics are unchanged.

This edition is condensed. It does not claim to reproduce every original line, catalogue, genealogy or repeated speech. Dedication, both prefaces, translator notes, numeric footnote markers and printed chapter arguments are excluded as requested. Important actions, character relationships, choices, intentions, threats and consequences are protected. The linked per-book audits distinguish retained material from compression; new expression does not authorize a kinder replacement character or a different ending.

The 48 audio artifacts are scripts, not synthesized recordings. No picture-book derivative, fixed pagination, vocabulary set, questions or additional chapter illustrations is included.

## Consulted source and authorship

The narrative evidence is [Project Gutenberg ebook 1727](https://www.gutenberg.org/ebooks/1727), Samuel Butler's prose translation first published in 1900, consulted in the Gutenberg transcription of the 1921 second edition. Its [full text](https://www.gutenberg.org/files/1727/1727-h/1727-h.htm) and the complete English chapter snapshots preserved in commit `1208d108e6801b566c13ceb90a2c600f48fb99d9` support the chapter comparisons. Gutenberg identifies the edition as public domain in the United States. No modern Chinese translation, modern English retelling or screen adaptation supplies expressive material.

A fresh download of the [plain-text edition](https://www.gutenberg.org/cache/epub/1727/pg1727.txt) has SHA-256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9`. All 24 original chapter snapshots match their live source sections modulo whitespace. This verifies the evidence consulted by the authors; it is not a claim that the newly written reading edition is an unchanged import.

[Getty's authority record](https://www.getty.edu/cona/CONAIconographyRecord.aspx?iconid=901000730) supports the traditional Homer attribution, Greek title, 24-book form and approximate eighth-century BCE date. [The Metropolitan Museum's account](https://www.metmuseum.org/perspectives/discovering-homer-odyssey) independently describes the ancient Greek myth and oral performance tradition. Supernatural acts are story events, not claims about real-world physical or medical effects. Each `research.yaml` records its own plot evidence and claim boundaries.

The ambiguous English word *vitals* in the mutilation threat and punishment was checked against [Greek line XXII.476 and its LSJ citations](https://atlas.perseus.tufts.edu/nodes/urn:cts:greekLit:tlg0012.tlg002.perseus-grc2:22.476/) and [the related XVIII.67 text and Cunliffe entry](https://atlas.perseus.tufts.edu/nodes/urn:cts:greekLit:tlg0012.tlg002.perseus-grc2:18.67/). Here the organ is the genitals, not the intestines. The affected book authors corrected the wording and recorded this additional primary-text and lexical evidence in their research files.

The album declares `original.writer: homer`; both locales of every article explicitly select `homer`. The existing real-author profiles display Homer / 荷马 and do not invent life dates. Butler is the consulted translator, not the author or translator of the newly composed locale prose. Obsolete locale `source_url` and `translator` bylines are removed. The unused Butler and Jones profiles introduced for the discarded editorial sections are also removed. See [authors-audit.md](authors-audit.md) for identity and media evidence.

## Author-performed checks

Each writing author compares the entire original chapter with both reading-edition locales, revises the source, and performs all ten concrete `write-article` self-reflection items. Findings require a restart from item 1 until a fresh complete pass is clear. Those same-author checks are the editorial review; the aggregate record does not substitute for them or add a separate editorial approval stage.

After its locale article is final, that author adapts the corresponding audio script from that locale alone. The prescribed four-item `scriptize-article` check is a single complete pass with fixes in place. Per-book records supply source decisions, continuity, dialogue, register, correction and length evidence. Length and schema checks supplement that evidence; they do not prove narrative fidelity.

The continuation specifically corrects readings that softened the original characters or replaced events with generic consequences. The author records identify concrete corrections, including Athena's advice about killing the suitors, the son's threats and authority over his mother, the Cyclops and Circe episodes, the threats around the palace, the nurse's recognition, the punishments after the fighting, Penelope's bed test, and the enforced final peace. Significant cruelty remains attributable to the character who performs or threatens it. No appended modern moral resolves the original conflict.

## Collection continuity

| State | Protected cross-book relationship |
|---|---|
| Narrative time | Books I–IV follow the son's search; V–VIII bring the father to the Phaeacians; IX–XII are his retrospective account; XIII resumes the present return. |
| Knowledge and disguise | Telemachus does not hear the divine council. Odysseus's concealment, false biographies and staged tests remain distinguishable from the narrator's account. Recognition occurs at its source moment. |
| Losses and possessions | The companions and ships are lost before the Phaeacian passage. The deposited Phaeacian gifts and the son's returning ship are different possessions and movements. |
| Father and son | Their separate returns converge at Eumaeus's hut in XVI. Their concealed cooperation, the palace weapons and the bow contest lead into the fighting. |
| Household identities | Eumaeus, Philoetius, Euryclea, Melanthius and Melantho have distinct roles. The nurse's scar recognition precedes Penelope's bed test and Laertes's orchard recognition. |
| Revenge and aftermath | The suitors' deaths do not end the conflict. Punished servants, spared speakers, recovered bodies, the bereaved families and renewed armed retaliation remain causally connected. |
| Remaining obligation | Tiresias's inland journey with the oar is repeated as a future obligation. It is not silently canceled, performed, or replaced with an invented later adventure. |
| Final peace | Laertes kills Eupeithes; the fighting does not end through voluntary mutual forgiveness. Odysseus's pursuit is stopped by the divine command and Zeus's thunderbolt, followed by Athena's peace. |

The shared recurring Chinese names include 忒勒马科斯、赫尔墨斯、卡吕普索、波吕斐摩斯、欧迈奥斯 and 欧律克勒娅. 墨兰提奥斯 is the goatherd and 墨兰托 the maid. The two locale narratives may organize exposition differently, but do not grant characters unavailable knowledge or move an event into a different book.

## Per-book evidence and measurements

The table below is generated only from the finalized, author-written artifacts. Source length counts non-whitespace Unicode characters after excluding the single H1 title; spoken length sums every audio block's `text`. English units are alphabetic words with internal apostrophes or hyphens; Chinese units are Han characters. Ratios compare each script with its own reading-edition article, not with Butler's longer original. The working range is approximately 90–105%, with no filler added merely to meet a number.

| Book audit | English words | Spoken / source | Ratio; chapters / blocks | Chinese Han | Spoken / source | Ratio; chapters / blocks |
|---|---:|---:|---|---:|---:|---|
| [01](the-odyssey-01/audit.md) | 1,159 | 5,223 / 5,329 | 98.0109%; 3 / 25 | 1,785 | 2,083 / 2,045 | 101.8582%; 3 / 25 |
| [02](the-odyssey-02/audit.md) | 1,287 | 5,455 / 5,919 | 92.1608%; 3 / 29 | 1,820 | 1,970 / 2,081 | 94.6660%; 3 / 24 |
| [03](the-odyssey-03/audit.md) | 1,116 | 5,287 / 5,450 | 97.0092%; 3 / 24 | 1,667 | 1,854 / 1,889 | 98.1472%; 3 / 19 |
| [04](the-odyssey-04/audit.md) | 1,746 | 7,562 / 8,073 | 93.6703%; 5 / 38 | 2,384 | 2,600 / 2,702 | 96.2250%; 4 / 24 |
| [05](the-odyssey-05/audit.md) | 1,324 | 5,721 / 5,923 | 96.5896%; 3 / 21 | 1,597 | 1,724 / 1,839 | 93.7466%; 3 / 12 |
| [06](the-odyssey-06/audit.md) | 1,033 | 4,203 / 4,666 | 90.0772%; 3 / 21 | 1,461 | 1,525 / 1,680 | 90.7738%; 3 / 21 |
| [07](the-odyssey-07/audit.md) | 955 | 4,303 / 4,475 | 96.1564%; 3 / 20 | 1,393 | 1,521 / 1,615 | 94.1796%; 3 / 20 |
| [08](the-odyssey-08/audit.md) | 1,470 | 6,289 / 6,910 | 91.0130%; 3 / 29 | 2,126 | 2,350 / 2,436 | 96.4696%; 3 / 27 |
| [09](the-odyssey-09/audit.md) | 1,468 | 6,050 / 6,201 | 97.5649%; 4 / 24 | 1,887 | 2,139 / 2,183 | 97.9844%; 4 / 24 |
| [10](the-odyssey-10/audit.md) | 1,443 | 5,846 / 6,154 | 94.9951%; 4 / 26 | 1,907 | 2,054 / 2,207 | 93.0675%; 4 / 24 |
| [11](the-odyssey-11/audit.md) | 1,903 | 7,890 / 8,361 | 94.3667%; 4 / 24 | 2,726 | 2,942 / 3,115 | 94.4462%; 4 / 24 |
| [12](the-odyssey-12/audit.md) | 1,292 | 5,292 / 5,525 | 95.7828%; 4 / 17 | 1,698 | 1,817 / 1,966 | 92.4212%; 4 / 17 |
| [13](the-odyssey-13/audit.md) | 1,533 | 6,330 / 7,030 | 90.0427%; 3 / 26 | 1,970 | 2,026 / 2,239 | 90.4868%; 3 / 21 |
| [14](the-odyssey-14/audit.md) | 1,510 | 6,242 / 6,925 | 90.1372%; 3 / 28 | 2,022 | 2,083 / 2,313 | 90.0562%; 3 / 23 |
| [15](the-odyssey-15/audit.md) | 1,619 | 6,785 / 7,529 | 90.1182%; 4 / 23 | 2,282 | 2,338 / 2,582 | 90.5500%; 4 / 16 |
| [16](the-odyssey-16/audit.md) | 1,491 | 6,365 / 7,001 | 90.9156%; 4 / 28 | 2,066 | 2,115 / 2,345 | 90.1919%; 4 / 23 |
| [17](the-odyssey-17/audit.md) | 1,505 | 6,673 / 6,924 | 96.3749%; 4 / 16 | 2,087 | 2,161 / 2,356 | 91.7233%; 4 / 12 |
| [18](the-odyssey-18/audit.md) | 1,399 | 6,135 / 6,523 | 94.0518%; 4 / 20 | 2,029 | 2,090 / 2,296 | 91.0279%; 4 / 12 |
| [19](the-odyssey-19/audit.md) | 1,663 | 6,701 / 7,432 | 90.1642%; 4 / 43 | 2,382 | 2,499 / 2,766 | 90.3471%; 4 / 42 |
| [20](the-odyssey-20/audit.md) | 1,304 | 5,394 / 5,978 | 90.2308%; 4 / 29 | 1,756 | 1,834 / 2,018 | 90.8821%; 4 / 27 |
| [21](the-odyssey-21/audit.md) | 1,302 | 5,433 / 5,959 | 91.1730%; 4 / 31 | 1,849 | 1,921 / 2,124 | 90.4426%; 4 / 27 |
| [22](the-odyssey-22/audit.md) | 1,470 | 6,159 / 6,843 | 90.0044%; 4 / 26 | 2,060 | 2,115 / 2,341 | 90.3460%; 4 / 25 |
| [23](the-odyssey-23/audit.md) | 1,473 | 6,042 / 6,711 | 90.0313%; 4 / 32 | 1,997 | 2,078 / 2,304 | 90.1910%; 4 / 32 |
| [24](the-odyssey-24/audit.md) | 1,588 | 6,664 / 7,394 | 90.1271%; 4 / 41 | 2,247 | 2,332 / 2,579 | 90.4226%; 4 / 34 |

## Artwork

The album retains its existing 1536×1024 wordless cover and the imagined Homer portrait shared across two 1024×1024 locale files. The user's requested square-avatar corrections for 百径灯 / Manypath Lantern and 砚舟 / Inkstone Observer are also retained: four distinct 1024×1024 WebPs with continuous backgrounds to all edges and corners. They are separate library personas and are not the Odyssey's displayed author.

All seven final files were visually inspected during this continuation. Exact hashes are in [authors-audit.md](authors-audit.md). Each has a matching `done` image state and exact Git LFS pointer. The image-generator dry run reports zero pending images. No image bytes were changed during the narrative fidelity corrections; the already completed square-avatar work remains in its preceding commits.

## Final integration validation

Completed on 2026-10-11 (Asia/Singapore), after all three chapter-author groups finalized their source, scripts, metadata and records.

| Check | Result |
|---|---|
| Complete original-source evidence | Fresh Gutenberg download hash matches the recorded edition; all 24 original chapter snapshots match their live sections modulo whitespace |
| Complete publication inventory | PASS: 24 narrative children, 48 locale articles, 48 scripts and 24 per-book audits, plus this aggregate and the author/artwork record |
| Per-book author process | All 24 article records contain concrete ten-item source checks with restarted clean passes and the prescribed single four-item audio check with findings corrected |
| Final text and script measurements | PASS: 34,053 English words, 47,198 Chinese Han characters and 1,196 script blocks; ratios 90.0044–101.8582%; final metadata lengths and all 144 recorded unit/source/spoken measurements reconcile |
| `npx --no-install hailibrary-check-work works/series/the-odyssey` | PASS, exit 0; authors also report PASS for each of the 24 children |
| Audio structure | PASS: deterministic chapter/block IDs, resolved individual cast references, valid ensembles, allowed dialogue emotions, no narrator emotions or written semicolons |
| Image-generator dry run | PASS, exit 0: album, both Homer profiles and all four requested persona profiles; zero pending images |
| Retained media | PASS: all seven WebPs have matching completed states, LFS attributes and exact Git-index SHA-256/length pointers; bytes are unchanged throughout this continuation |
| `pnpm build` | PASS after the final character-description corrections. Vite's 502.68 kB JavaScript bundle emits the existing non-failing 500 kB chunk-size advisory |
| `pnpm typecheck` | PASS |
| Existing catalog tests | 4/4 PASS against the final rebuilt catalog |
| Existing web tests | 19/19 PASS; reader source remains equal to the base branch |
| Built collection | PASS: exact 24-entry order, 24/24 articles and 24/24 scripts in each locale, Homer author bindings, inherited age/style/labels and exact final character descriptions |
| Built locale content | PASS: every article matches its source modulo whitespace and heading syntax; every exported audio JSON exactly matches its authored YAML |
| Built assets and removals | PASS: relative runtime URLs, byte-identical cover/avatars, no removed editorial article directories or unused Butler/Jones profile outputs |
| Local browser | PASS: Chinese/English first and last books, new Book XXIII, both Homer bylines, previous/next navigation, author discovery, wordless cover and square persona avatars |
| Commit scope and whitespace | PASS: 191 final branch files, no reader-code difference from base, working-tree and staged whitespace checks, and generated/scratch output exclusion |

The first integration count was deliberately run while the last group's metadata was still being updated and detected its stale Book XVII length. The final source audit passes after those measured values were reconciled. The final author pass also corrected character summaries in XIX, XXI and XXII that had softened threats or invented protective motives; the catalog and production site were rebuilt, the four catalog tests rerun, and runtime character arrays checked against final metadata.

The final commit scope includes the 24-book reading edition, its per-book and aggregate audits, bilingual Homer author resources, the shared cover and the four requested square persona avatars. The temporary chapter-byline code change is unnecessary once all retained children consistently reference Homer; the final reader source matches the base branch. Generated catalogs, `build/`, `dist/`, raw PNGs, downloads, scratch tools and the pre-existing untracked `docs/` directory are excluded.

Issue #73 remains a Feature issue with native closing linkage from PR #74. The PR is updated for this final reading-edition scope. Merge and deployment are separate, unperformed operations.
