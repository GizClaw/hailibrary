---
name: scriptize-article
description: Retell a final ungraded HaiLibrary article as a story-faithful, genuinely spoken, listening-first chaptered multi-speaker audiobook script and self-check it against the source—把最终版不分级文章用讲故事的口吻重新讲成忠于故事、真正口语、适合聆听的分章多人有声书脚本，并对照原文自查；不用于绘本。
---

# Scriptize a final article

Retell one final standalone `works/articles/<article-id>/locales/<locale>/article.md` or series child `works/series/<series-id>/<article-id>/locales/<locale>/article.md` as adjacent `audio_script.yaml`, working as a storyteller and script director preparing it for listening. Read [references/annotated-article-contract.md](references/annotated-article-contract.md) first. Do not repair or rewrite the literary source here. Picture books have no audio script, and neither does a classic's front or back matter (prefaces, introductions, notices, notes).

Adapt each locale only from its own complete `article.md`. Locale scripts are independent: never translate, align, or use another locale's script as source, and do not force matching blocks, block counts, inferred chapters, attributions, or emotion placement. Keep declared character IDs shared, but make `display_name`, TTS direction, and all spoken text native to the locale.

## Three equal failures

A script fails if it changes the story, if it still reads like the printed page, or if it grows longer than the story it tells. A light copy-edit of the article, with a word swapped here and a particle added there, is an unfinished script, not a safe one.

- **Story drift:** changed events, asserted facts or evidence, causality, who does or says what, characters or viewpoint, emotional arc, scene order, or ending; any added plot fact, character, action, motive, result, or moral, including small narration details the source never states.
- **Under-adaptation:** narration or dialogue that keeps the source's written sentence shapes, bookish words, semicolons, aphoristic compression, translated syntax, or image-compressed phrasing that a real speaker would not say aloud.
- **Padding:** spoken text inflated with filler, reassurance words, restated explanations, or extra clauses. Re-voicing replaces written shapes; it does not add words. Total spoken text should land at about 90–105% of the source's; above 110% is a failure.

Everything that is not protected story content is yours to re-say: wording, sentence shape, clause order, emphasis, minor descriptive detail, and short listener bridges. Rewriting every sentence for the ear is the default. Keeping a source sentence close to verbatim needs a reason, and the only valid reason is that it is a declared signature.

## Process

Get it right while writing; the final check is a single pass, not a revision loop.

1. **Beat sheet (scratch, not committed).** For each source chapter, list in order every protected beat: event, action, state change, who speaks, and what each line means and intends. Mark at most 3–5 signatures per chapter: recurring images, key narration moments, and at most two key dialogue lines that carry the work's theme or turning point, such as a title character's central answer. Keep signatures close to source wording, smoothing only what the ear cannot follow and keeping their core nouns and verbs. Every other dialogue line, including a character's joke, survives by its idea, not its wording. Note who each unnamed voice is in the source.
2. **Tell it.** Write each chapter from the beat sheet, not from the source sentences, the way a storyteller would tell it out loud to a child beside them, giving every character the words that person would really say in that moment. Consult the source only for a signature or a needed fact. When two spoken versions work, choose the shorter one. Apply the narration, dialogue, and reference rules as you write.

Write every block by hand as the storyteller. Never generate, split, or copy script text with code, regular expressions, or quotation-mark parsing: a quoted name, title, word, or sound inside narration stays inside its narration sentence, and a speech tag is never left as its own block. Code may only count or validate a script the author already wrote.

When `audio_script.yaml` already exists, keep its `cast` entries, including `display_name` and TTS direction, unless a speaker must be added or removed or an entry breaks the reference; rewrite only the chapters.

## Narration

Re-voice narration in the narrator's established register as speech, not recitation. Match the genre: a legend or folktale is told with the unhurried weight of an old tale in plain words, not as casual chatter. Use short, varied spoken breaths; no semicolons; no written connectives, parallel written constructions, or aphoristic summaries; say compressed metaphors plainly while keeping signature images recognizable. Make unseen layout or emphasis audible. A light turn to the listener may frame existing content but adds no fact. Drop only attribution-only clauses made wholly redundant by the speaker change; keep every story-bearing action, state, timing, or emotion carried by a speech tag. Keep the source's paragraph breaks at chapter openings, turning points, and the ending as separate narration blocks or paragraphs; never merge a standalone closing line into the paragraph before it.

## Dialogue

Preserve each line's speaker, meaning, intent, and information, not its wording. Apart from declared key-line signatures, no dialogue line may stay close to its source wording; re-say every one as speech. A line spoken by an unnamed or collective voice in the source belongs to a generic group speaker, never to a named character. Say it as that person really would at that age and in that role and moment: complete everyday nouns instead of compressed images, stated subjects where omission is ambiguous, and natural particles, repetition, fragments, or self-interruption where they fit, varied by speaker rather than stuffed everywhere. Keep each character's own humor, teasing, and personification. A young child sounds young through short concrete words and direct questions, never baby talk. Do not add a new proposal, request, question, or idea the character did not express.

## Structure and emotion

Start a block when the speaker changes; merge adjacent same-speaker content without flattening meaningful rhythm. Preserve source chapters; otherwise divide at natural transitions into 3–7 chapters. Assign deterministic sequential chapter and block IDs for the current finalized script.

Write root `audio_script` with `language`, `cast`, and ordered chapters/blocks. Give each cast member localized `display_name` and abstract TTS direction for delivery, timbre, pace, and pitch. Include no provider IDs, SSML, filenames, synthesis settings, stage directions, or invented actions.

Never tag narration with `emotion`. Untagged is the default for dialogue. Tag a block with one of `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, or `calm` only when the article itself clearly marks that feeling through its speech tag, described reaction, or unmistakable scene; the feeling must differ from ordinary talk. Plain statements, instructions, questions, and announcements of action stay untagged, and `calm` is only for a line the source presents as deliberately steadying or soothing. Never guess or tag to make a performance livelier.

## Author self-reflection

Run this checklist once, after the script is complete. Fix each finding in place; do not restart the checklist or re-audit the whole script afterward.

1. **Fidelity.** Walk the beat sheet against the script: every beat and dialogue line present, in order, with the right speaker; no invented event, fact, intent, or moral. Trace each narration sentence to its source passage and delete any detail, motive, or result that has none. Confirm each signature is still recognizable with its core nouns and verbs.
2. **Spoken register.** Scan the text for the reference's written-register signs, and reread every dialogue line and every narration sentence that still matches its source apart from small word swaps and is not a signature image. Rewrite those sentences.
3. **Length.** Count non-whitespace characters of the source body and of all block text, and record the ratio. Above 105%, cut filler, reassurance words, doubled explanations, and extra clauses until it is at most 105%, without cutting protected beats.
4. **Structure.** Chapters follow the source; IDs equal array positions; every speaker resolves to one single-voice cast entry, lines said together use `speakers` with `ensemble: duo` or `chorus` and no group cast entry exists, and unnamed voices are not attributed to named characters; ending paragraph breaks are kept; cast has no provider data; each emotion tag has a clear source marker and neutral lines are untagged.

Hand off when the single pass is done.
