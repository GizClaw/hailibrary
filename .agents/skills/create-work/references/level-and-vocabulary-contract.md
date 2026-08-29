# Exact-level difficulty contract

HaiLibrary retains the 29 Reading A-Z labels as an ordered sequence while defining an internal age-aligned progression:

`AA, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, Z1, Z2`

Directory keys are `aa`, `a` through `z`, `z1`, and `z2`. Never compress neighboring labels. W-Z are secondary-school levels, Z1 is undergraduate, and Z2 is advanced undergraduate, graduate, or professional; those later meanings are HaiLibrary extensions rather than official Reading A-Z correlations.

The authoritative records are:

- `prompts/levels/levels.yaml`: order, age/grade and English Lexile references, page and unit ranges, sentence limits, text contract, inference, complexity floor, and questions;
- `prompts/levels/locale-references.yaml`: age band plus separate English grade/Lexile and Chinese curriculum checkpoints for every exact level;
- `prompts/vocabulary/ranges.yaml`: exact-level English and Chinese lexical scope;
- `prompts/vocabulary/index.yaml`: concrete queryable lists, lookup order, source metadata, and evidence limits.

Read the complete exact-level record in all four files before drafting or reviewing. Do not interpolate from a nearby letter and do not use this summary instead of the YAML.

## Quantitative overview

These are HaiLibrary internal editorial guardrails, not official Reading A-Z word-count specifications or certified Lexile measures.

| Level | Pages | English words | Chinese Han characters | Lexile English reference |
| --- | ---: | ---: | ---: | --- |
| AA | 6-10 | 8-30 | 12-45 | BR70L-10L |
| A | 6-12 | 16-50 | 25-80 | BR70L-10L |
| B | 8-12 | 25-70 | 40-110 | BR40L-160L |
| C | 8-12 | 35-100 | 55-150 | BR40L-160L |
| D | 10-14 | 50-140 | 80-210 | 190L-530L |
| E | 10-14 | 70-180 | 110-270 | 190L-530L |
| F | 10-16 | 90-220 | 140-330 | 190L-530L |
| G | 10-16 | 110-260 | 170-390 | 190L-530L |
| H | 12-16 | 140-320 | 220-470 | 190L-530L |
| I | 12-16 | 170-380 | 260-550 | 190L-530L |
| J | 12-18 | 200-440 | 320-650 | 190L-530L |
| K | 14-20 | 230-500 | 380-800 | 420L-650L |
| L | 14-20 | 300-600 | 470-950 | 420L-650L |
| M | 16-22 | 400-750 | 600-1150 | 420L-650L |
| N | 16-22 | 500-900 | 750-1350 | 520L-820L |
| O | 16-24 | 650-1100 | 900-1600 | 520L-820L |
| P | 18-24 | 800-1300 | 1050-1850 | 520L-820L |
| Q | 18-26 | 950-1500 | 1200-2100 | 740L-940L |
| R | 18-26 | 1100-1700 | 1400-2350 | 740L-940L |
| S | 20-28 | 1250-1900 | 1600-2600 | 830L-1010L |
| T | 20-28 | 1400-2200 | 1800-2900 | 830L-1010L |
| U | 20-30 | 1600-2500 | 2000-3200 | 925L-1070L |
| V | 20-30 | 1800-2800 | 2200-3500 | 925L-1070L |
| W | 22-36 | 2200-3600 | 2800-4500 | 970L-1185L |
| X | 24-40 | 2800-4500 | 3500-5500 | 1050L-1260L |
| Y | 26-44 | 3500-5500 | 4500-6500 | 1080L-1335L |
| Z | 28-50 | 4500-7000 | 6000-8500 | 1185L-1385L |
| Z1 | 28-60 | 1800-4500 | 2800-6500 | 1300L-1500L internal |
| Z2 | 32-80 | 2400-7000 | 3800-9500 | 1450L-1650L+ internal |

The K anchor is intentionally compact: the official Raz-Plus listing for *It's About Time* identifies it as Level K, 401 words, and 550L. Do not treat K as a proxy for Z1-Z2. Higher-education levels increase conceptual, lexical, syntactic, and evidence demands; they do not require book-length padding.

## Required pre-draft brief

For each locale record:

```text
Exact level and band:
HaiLibrary age band, locale grade/curriculum checkpoint, and English Lexile reference:

Mechanical ceiling:
- pages:
- total units:
- typical and maximum units per page:
- typical and maximum sentence units:
- maximum sentences and new words per page:

Complexity floor:
- reading goal and structure:
- cohesion and predictability:
- knowledge demand and illustration reliance:
- inference and evidence span:
- allowed and required question types:

Vocabulary plan:
- running-text baseline:
- target familiarity, form, meaning, and support:
- concrete lists, dictionaries, and curriculum evidence:
- indispensable exceptions and their support:
```

## Decision rules

- Reject a draft that exceeds page, total-unit, per-page, sentence, or new-word ceilings.
- Reject a draft below the complexity floor even when its word count fits.
- Lexile is an English quantitative reference only; never fabricate a Lexile score and never apply Lexile to Chinese.
- For English, frequency is evidence, not level assignment. From U upward, raw NGSL rank is especially insufficient without sense, register, abstraction, rhetoric, and domain review.
- For Chinese, verify the complete word and exact textbook evidence; familiar characters do not prove a familiar word.
- Lower levels must remain natural, not telegraphic. Higher levels must remain readable, not a policy memo or jargon stack.
- Shared page meaning and evidence must align across locales, but wording, sentence boundaries, information order, idiom, and target terms should be independently native.
