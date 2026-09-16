# Series audiobook script contract

Use this contract to derive `audio_script.yaml` from the complete, ungraded literary source at `works/series/<id>/locales/<locale>/article.md`.

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
      title: The Sound Below the Ridge
      blocks:
        - id: ch01-b01
          speaker: narrator
          text: |-
            Xiaoman stopped beside the path. Grandpa stamped his foot and shouted,
        - id: ch01-b02
          speaker: grandpa
          text: Listen to the echo first!
          emotion: angry
```

The root contains exactly `audio_script`. It contains one locale `language`, one `cast` mapping, and an ordered `chapters` list. Each chapter has `id`, `title`, and ordered `blocks`; each block has `id`, `speaker`, plain `text`, and optionally one `emotion`.

## Identity and voice

- Adapt each locale only from its own complete `article.md`. Never translate, align, or use another locale's script as source. Locale scripts need not match in blocks, block count, inferred chaptering, attribution placement, or emotion placement.
- Prefer speaker IDs declared in the series-level `article.yaml` `characters` data.
- Add stable IDs for other people who speak in the source. Every block speaker resolves to exactly one cast entry.
- Include `narrator` even when narration is brief.
- Keep series-declared character IDs shared across locales. Each cast entry has locale-native `display_name` plus locale-native abstract `tts.delivery`, `tts.timbre`, `tts.pace`, and `tts.pitch` strings; all spoken text is locale-native too.
- Cast contains no provider voice ID. Blocks contain no voice configuration, SSML, audio filename, synthesis setting, stage direction, or delivery annotation.

## Dialogue emotion

- The optional block `emotion` is limited to MiniMax-supported `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, or `calm`.
- Never use `emotion` on narration.
- Judge every character dialogue block from the source context, speech marker, and scene. Tag it when the line is emotionally colored; leave it untagged only when it is genuinely neutral or the source gives no basis.
- Derive the value from the article rather than the words alone. Do not guess when the source is ambiguous, and do not add tags merely to make a neutral performance expressive.
- A block has at most one `emotion`.

## Chapter and block identity

- Source headings beginning with `## ` define chapters and titles. Otherwise divide the uninterrupted work at natural scene transitions into 3–7 chapters.
- Chapter IDs are sequential `ch01`, `ch02`, and so on. Block IDs restart within each chapter as `ch01-b01`, `ch01-b02`, and so on.
- IDs are deterministic sequential positions in the current finalized script: each chapter and block ID must equal its array position. Recompute following IDs after insertion, removal, merge, split, or reorder; do not promise semantic stability across edits.

## Story fidelity and listening adaptation

- Fidelity protects the story and authorship, not every wording, meaning nuance, or minor detail. The director may rephrase, vary descriptive detail and emphasis, recast a metaphor, reorder clauses within a passage, add a short bridge or clarification for listeners, condense or drop minor description, or open up compressed prose. Do not change events, asserted facts or evidence, causality, who does or says what, characters or viewpoint, emotional arc, scene order, or ending; add no plot fact, character, action, or moral. Keep signature images and key lines recognizable as the same author's work even when rephrased.
- Keep the script comparable in extent to the source, without large cuts or padding. Protected story coverage and emphasis are the controlling diagnostics.
- Re-voice narration for listening. The narrator is a storyteller speaking to a listener, not a reader reciting the page. Use the words and sentence shapes people in that locale actually say. Break long written sentences into shorter spoken breaths; replace heavy nominal phrases, stacked modifiers, parentheticals, dashes, semicolons, bookish connectives, and aphoristic compression with plain speech. Light spoken connectives and rhythm are allowed when they do not change protected story content.
- In Chinese, treat dense `之/其/则/亦/尚/遂`, long `的` chains, front-loaded modifiers, and repeated `于是/并不/然而/此时/仿佛/便` as warning signs, not banned forms. Alternatives such as `就/这下`、`不/没`、`可是/不过`、`这时候`、`好像` may help only when they preserve meaning and fit the narrator's or character's register. Use connectives and particles such as `结果`、`其实`、`呢`、`吧`、`啊`、`嘛` only where naturally demanded; never stuff them in to satisfy a checklist. A light turn to the listener such as `你想想` or `说来也怪` may frame existing content but must add no fact. Say compressed metaphors and aphorisms plainly while keeping signature images recognizable.
- In English, contractions, shorter clauses, familiar concrete wording, and occasional spoken links such as “so,” “and then,” or “but here's the thing” are alternatives when appropriate, not mechanical substitutions. Preserve the narrator's and characters' register and the protected story content.
- Restate anything a listener cannot see, including layout, lists, and typographic emphasis, in speakable form. Drop only attribution clauses whose whole content is already supplied by the speaker identity. Retain every story-bearing action, state, timing, or emotion carried by a speech tag, and add a brief locale-natural attribution where the ear otherwise loses needed information.
- Dialogue belongs to the actual speaker and preserves what is said, its intent, and the character's voice, but should sound like a real person of that age and role. Natural particles, fragments, contractions, and interruptions are allowed; childish or baby talk is not. Split interrupted dialogue around narration only when the intervening action or attribution still needs to be heard.
- Change blocks when the speaker changes; merge consecutive content from the same speaker while keeping meaningful narrator paragraph breaks and spoken rhythm.
- Never put stage directions, SSML, delivery notes, provider IDs, filenames, synthesis settings, or per-block voice data in `text`.

Register calibration:

- zh, before: `夜幕降临后，他并未立即离开，而是继续观察窗外不断变化的云层。` → after: `天黑了，他也没马上走，还在看外头的云一点点变样。`
- en, before: `Nevertheless, she did not immediately disclose her conclusion, because additional evidence was required.` → after: `But she didn't share her conclusion just yet. She still needed more evidence.`

During read-aloud review, ask of every sentence: “Would a storyteller actually say this out loud to a listener?” If it sounds like reading a printed book, rewrite it.

`article.md` remains authoritative. If it is incomplete or internally defective, report the source problem instead of repairing the story indirectly in `audio_script.yaml`.
