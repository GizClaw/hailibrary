# Annotated article contract

Use this contract to derive the persisted `audio_script` layer from the Writer's persisted visible `article` layer.

## Shape

Keep one ordered list of blocks. Each block has exactly one `speaker` and either plain `text` or structured `content`, matching the final HaiLibrary line contract:

```yaml
annotated_article:
  language: zh-CN
  title: 屋檐下的小碗
  blocks:
    - id: p01-b01
      speaker: narrator
      text: 雨停了，苗苗发现窗台下的小碗还是空的。
    - id: p01-b02
      speaker: miao
      text: 它们不是刚喝过雨吗？
    - id: p01-b03
      speaker: narrator
      content:
        - text: 她顺着墙上的
        - vocabulary: {id: trace, text: 水痕}
        - text: 望过去。
```

`id` is the stable join key shared by one TTS clip and its subtitle. Use `<page-id>-b<two-digit-index>` within each locale, keep IDs unique, and do not silently reuse an existing ID for different spoken content after publication. `speaker` is a TTS voice marker. Vocabulary remains an inline content marker inside the same spoken block. A speaker's reusable voice direction is defined once in `audio_script.cast`; blocks contain no voice configuration.

The YAML under `works/` remains authoritative. `article.pages[].paragraphs[]` stores exactly what article mode shows, including natural quotation and attribution. `audio_script.pages[].blocks[]` stores the TTS adaptation, stable block IDs, and speaker IDs. A separate script mode may show those blocks for subtitle/audio debugging, but the web reader must not synthesize article prose from them.

## Preservation invariants

- Concatenating the blocks in order must yield one continuous article, not page-sized summaries.
- Every source paragraph, event, claim, causal link, uncertainty, and conclusion must remain represented.
- Speaker labels may change delivery, but must not change who knows what or what happened.
- A dialogue block requires a present speaker, an addressee or plausible self-directed utterance, and an immediate conversational purpose.
- Narration remains the default for exposition and transitions.
- Every speaker ID must resolve to the locale cast before final serialization.
- Every block ID must be unique inside the locale and stable enough to address one future audio clip and subtitle cue.
- Existing vocabulary IDs and surface forms remain byte-for-byte unchanged during scriptization.

## Mapping to the current work schema

After the annotated article passes a continuous read:

1. choose page boundaries at real scene, action, or paragraph transitions;
2. copy contiguous blocks into each matching `audio_script` page without reordering them;
3. attach the page illustration ID;
4. apply vocabulary creation/review for any newly selected terms;
5. validate the complete work.

The two layers may differ in punctuation, attribution, and narration-to-dialogue adaptation, but not in events, facts, causal claims, conclusion, vocabulary concepts, page order, or illustration mapping. Review both whenever either changes.
