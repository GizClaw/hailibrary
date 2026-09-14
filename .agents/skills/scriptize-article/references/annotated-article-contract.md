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

- Prefer speaker IDs declared in the series-level `article.yaml` `characters` data.
- Add stable IDs for other people who speak in the source. Every block speaker resolves to exactly one cast entry.
- Include `narrator` even when narration is brief.
- Each cast entry has localized `display_name` plus abstract `tts.delivery`, `tts.timbre`, `tts.pace`, and `tts.pitch` strings.
- Cast contains no provider voice ID. Blocks contain no voice configuration, SSML, audio filename, synthesis setting, stage direction, or delivery annotation.

## Dialogue emotion

- The optional block `emotion` is limited to MiniMax-supported `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, or `calm`.
- Generally leave narration unannotated. Use `emotion` only on character dialogue whose emotion is explicit and whose meaning or delivery would be distorted by a flat reading.
- Derive the value from the original article's context and speech markers, such as “she stamped her foot in anger”; do not invent an emotion from the words alone when the source is ambiguous.
- Do not mark every line merely to make the performance expressive. A block has at most one `emotion`; when uncertain, omit it.

## Chapter and block identity

- Source headings beginning with `## ` define chapters and titles. Otherwise divide the uninterrupted work at natural scene transitions into 3–7 chapters.
- Chapter IDs are sequential `ch01`, `ch02`, and so on. Block IDs restart within each chapter as `ch01-b01`, `ch01-b02`, and so on.
- IDs are unique within the locale and remain attached to the same spoken content after publication. Insertions should disturb existing IDs as little as possible; never silently reuse an ID for different content.

## Audiobook preservation invariants

- Taken in chapter and block order, the script covers the complete article without summaries, omissions, repetitions, or reordering.
- Narrator text preserves verbatim all source prose outside quotation marks, including speech tags, action, expression, transitions, and paragraph order. Added attribution is the sole permitted new prose.
- Quoted words belong to the actual speaker and omit only their quotation marks.
- An interrupted utterance remains character—narrator—character when the source places a speech tag or narration between its parts.
- Add a minimal narrator attribution only when omitted source tags make consecutive dialogue ambiguous by ear. It identifies only who spoke or asked and remains natural in the locale language.
- Change blocks when the speaker changes; merge consecutive content from the same speaker. Keep original paragraph breaks as newlines inside merged narrator text.
- Split long narration only above about 400 Chinese characters or 250 English words and only at an original paragraph boundary.
- Narration may end with a source dialogue lead-in such as `说：`, `问：`, or `said,`.
- Never add dialogue, facts, actions, emotion words, thoughts, or explanatory material to the spoken text.

`article.md` remains authoritative. If it is incomplete or internally defective, report the source problem instead of repairing the story indirectly in `audio_script.yaml`.
