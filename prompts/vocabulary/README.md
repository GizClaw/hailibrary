# Vocabulary data

This directory deliberately separates three different things:

- `index.yaml` registers concrete datasets, versions, source URLs, licenses, limitations, and lookup order.
- `lists/` contains queryable rows. It is evidence data, not a collection of HaiLibrary vocabulary cards.
- `ranges.yaml` contains editorial criteria for assigning a locale-specific term and sense to a HaiLibrary level.

An external level or frequency band must not be copied into `vocabulary/<level>/<id>/entry.yaml` as if it were a HaiLibrary verdict. Record the external alignment, then judge the intended sense, form, context, and reader task against `ranges.yaml`.

Examples:

```sh
rg '^tree,' prompts/vocabulary/lists/en-US/ngsl-1.2-hai-bands.csv
rg ',树,' prompts/vocabulary/lists/zh-CN/tghz-2013-tier-1.csv
```

For Chinese, membership in the 3,500-character table only answers “is this a tier-one common standardized character?” It does not answer “which grade learned it?” or “does the learner know this word?” Those claims need the exact textbook edition and appendix evidence described in `index.yaml`.
