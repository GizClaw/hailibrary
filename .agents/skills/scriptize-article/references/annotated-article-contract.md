# Article audiobook script contract

Use this contract to derive `audio_script.yaml` by retelling the complete, ungraded literary source at `works/articles/<article-id>/locales/<locale>/article.md` or `works/series/<series-id>/<article-id>/locales/<locale>/article.md`.

## Shape

```yaml
audio_script:
  language: en-US
  cast:
    narrator:
      display_name: Narrator
      tts:
        delivery: observant and composed
        timbre: warm and clear
        pace: measured
        pitch: medium
    grandpa:
      display_name: Grandpa
      tts:
        delivery: patient and direct
        timbre: low and weathered
        pace: unhurried
        pitch: low
  chapters:
    - id: ch01
      title: <source chapter title>
      blocks:
        - id: ch01-b01
          speaker: narrator
          text: <spoken narration>
        - id: ch01-b02
          speaker: grandpa
          text: <spoken dialogue>
          emotion: angry
        - id: ch01-b03
          speakers: [ming, lan]
          ensemble: duo
          text: <a line both children say together>
```

The root contains exactly `audio_script`. It contains one locale `language`, one `cast` mapping, and an ordered `chapters` list. Each chapter has `id`, `title`, and ordered `blocks`; each block has `id`, exactly one of `speaker` or `speakers` + `ensemble`, plain `text`, and optionally one `emotion`.

## Identity and voice

- Adapt each locale only from its own complete `article.md`. Never translate, align, or use another locale's script as source. Locale scripts need not match in blocks, block count, inferred chaptering, attribution placement, or emotion placement.
- Prefer speaker IDs declared in the article's effective `characters` data.
- Add stable IDs for other people who speak in the source. A line the source gives to an unnamed person or an unidentified voice gets its own individual speaker (for example `passerby`); never reassign it to a named character.
- Every cast entry is exactly one voice: one person, animal, or personified thing. Never create a group cast entry such as "two children", "the kids", "the courtiers", or "the crowd".
- When several voices say a line together, give the block `speakers` (a list of distinct cast IDs, in speaking order) and `ensemble` instead of `speaker`: `ensemble: duo` for exactly two voices, `ensemble: chorus` for three or more. A named group in the source (the seven kids, the crowd) is voiced by individual cast entries such as `kid_1`, `kid_2`, `kid_3`; use at most four voices for a chorus. A line only one member of a group says uses that member's single `speaker`.
- Include `narrator` even when narration is brief.
- When a script already exists, keep its cast entries, including `display_name` and TTS direction, unless a speaker is added or removed or an entry breaks this contract.
- Keep declared character IDs shared across locales. Each cast entry has locale-native `display_name` plus locale-native abstract `tts.delivery`, `tts.timbre`, `tts.pace`, and `tts.pitch` strings; all spoken text is locale-native too.
- Cast contains no provider voice ID. Blocks contain no voice configuration, SSML, audio filename, synthesis setting, stage direction, or delivery annotation.

## Dialogue emotion

- The optional block `emotion` is limited to MiniMax-supported `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, or `calm`.
- Never use `emotion` on narration.
- Untagged is the default. Tag a dialogue block only when the article clearly marks a feeling beyond ordinary talk through its speech tag, described reaction, or unmistakable scene. Plain statements, instructions, questions, and announcements of action stay untagged; `calm` is reserved for lines the source presents as deliberately steadying or soothing.
- Derive the value from the article rather than the words alone. Do not guess when the source is ambiguous, and do not add tags merely to make a neutral performance expressive.
- A block has at most one `emotion`.

## Chapter and block identity

- Source headings beginning with `## ` define chapters and titles. Otherwise divide the uninterrupted work at natural scene transitions into 3–7 chapters.
- Chapter IDs are sequential `ch01`, `ch02`, and so on. Block IDs restart within each chapter as `ch01-b01`, `ch01-b02`, and so on.
- IDs are deterministic sequential positions in the current finalized script: each chapter and block ID must equal its array position. Recompute following IDs after insertion, removal, merge, split, or reorder; do not promise semantic stability across edits.

## Story fidelity and listening adaptation

- Fidelity protects the story and authorship, not wording. Protected content is events, asserted facts or evidence, causality, who does or says what, characters or viewpoint, emotional arc, scene order, and ending; add no plot fact, character, action, or moral. Everything else may and normally should be re-said for the ear: wording, sentence shape, clause order, emphasis, minor descriptive detail, and short listener bridges.
- Under-adaptation is a failure equal to story drift. A script whose narration or dialogue mostly keeps the source's sentences with small word swaps is unfinished.
- Signatures are the only content kept close to source wording: at most 3–5 per chapter, chosen from recurring narration images, key narration moments, and at most two key dialogue lines that carry the theme or turning point. Keep their core nouns and verbs; smooth only what the ear cannot follow. All other dialogue, including a character's joke or personification, survives by its idea and is re-said as speech.
- Keep the script comparable in extent to the source: total non-whitespace block text about 90–105% of the source body, never above 110%. Re-voicing replaces written shapes and does not add words; cut filler, reassurance words, doubled explanations, and extra clauses rather than protected beats. When two spoken versions work, choose the shorter.
- Every narration sentence traces to a source passage. Do not add details, motives, results, or reactions the source does not state, even small ones.
- Match the genre's telling voice: a legend or folktale keeps the unhurried weight of an old tale in plain words rather than casual chatter.
- Re-voice narration for listening. The narrator is a storyteller speaking to a listener, not a reader reciting the page. Use the words and sentence shapes people in that locale actually say. Break long written sentences into shorter spoken breaths and vary their length; replace heavy nominal phrases, stacked modifiers, parentheticals, dashes, semicolons, bookish connectives, parallel written constructions, and aphoristic compression with plain speech. A light turn to the listener may frame existing content but must add no fact.
- Restate anything a listener cannot see, including layout, lists, and typographic emphasis, in speakable form. Drop only attribution clauses whose whole content is already supplied by the speaker identity. Retain every story-bearing action, state, timing, or emotion carried by a speech tag, and add a brief locale-natural attribution where the ear otherwise loses needed information.
- Dialogue belongs to the actual speaker and preserves meaning, intent, and information, not wording. It must sound like that real person at that age, in that role and moment: complete everyday nouns rather than compressed images, stated subjects where omission is ambiguous, natural particles, repetition, fragments, self-interruption, and trailing off where they fit. Keep each character's own humor, teasing, and personification. A young child speaks in short concrete words and direct questions; baby talk is not allowed. Vary particles and rhythm by speaker instead of adding them everywhere.
- Split interrupted dialogue around narration only when the intervening action or attribution still needs to be heard. Change blocks when the speaker changes; merge consecutive content from the same speaker while keeping meaningful narrator paragraph breaks and spoken rhythm. Keep the source's paragraph breaks at chapter openings, turning points, and the ending; a standalone closing line stays on its own.
- Never put stage directions, SSML, delivery notes, provider IDs, filenames, synthesis settings, or per-block voice data in `text`.

### Written-register signs

Avoid these while writing, and rewrite any that remain in the final scan unless that speaker would really say it:

- Written punctuation: semicolons, dashes that are not a spoken sound, and colon-introduced lists.
- Written vocabulary: classical function words, bookish connectives and adverbs, formal measure words and locatives, and written conjunctions where speech would simply pause or link clauses plainly.
- Written shapes: parallel or antithetical paired clauses, aphoristic summary sentences, syntax carried over from another language, long modifier chains before a noun, everyday things compressed into an image, omitted subjects that leave the referent ambiguous, and runs of equal-length sentences.

Spoken connectives, discourse markers, and sentence-final particles are tools, not quotas. Choose them per speaker so that different characters do not all end lines the same way, and leave a line bare when the person would say it bare.

Treat these as signs to check in every locale; judge each by how people in that locale actually talk, not by mechanical substitution.

During read-aloud review, ask of every sentence: “Would a storyteller actually say this out loud to a listener?” and of every line: “Would this person really say this, right now?” If it sounds like reading a printed book, rewrite it.

`article.md` remains authoritative. If it is incomplete or internally defective, report the source problem instead of repairing the story indirectly in `audio_script.yaml`.
