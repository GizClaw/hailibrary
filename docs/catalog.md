# Static API catalog

Ungraded source literature and audiobook scripts live under `works/series/`. Picture books at levels `aa` through `n` derive from those series and store schema-version-3 locale page text. The catalog compiles both source series and derived books while keeping every locale independently loadable.

```text
build/
  catalog.json
  series.json
  series/<series-id>/
    index.json
    <locale>.json
    <locale>-audio.json
    cover.webp
  catalog/
    home-en-US.json
    home-zh-CN.json
    a-fiction-adventure.json
    a-fiction-animals.json
  works/<work-id>/
    index.json
    en-US.json
    zh-CN.json
    artwork/*.webp
  writers/
    index.json
    zh-CN/index.json
    zh-CN/<writer-id>.json
    zh-CN/<writer-id>/avatar.webp
  styles/
    index.json
    <style-id>.json
    <style-id>/thumbnail.webp
  vocabulary/
    index.json
    catalog/<locale>/<level>/<page>.json
    <level>/<entry-id>.json
    <level>/<entry-id>/card.webp
  labels.json
  taxonomy.json
```

`catalog.json` is the only global entry point. It contains supported locales, taxonomy, page indexes, and an array of lightweight catalog-shard descriptors. Each descriptor points to one independently cacheable `catalog/<level>-<category>-<subcategory>.json` file.

Each `works/<work-id>/index.json` is a self-describing picture-book manifest. It lists locale story URLs, Writer and Style profile URLs, cover and page artwork URLs, source-series metadata, and referenced vocabulary-entry URLs. Locale files contain only that edition's prose, chapters, questions, and answers; picture books contain no cast or audio script.

`series.json` is the lightweight Works index. Each `series/<series-id>/index.json` contains metadata, localized titles and Writers, locale article/audio URLs, the copied cover URL, and derived books grouped in taxonomy level order and sorted by `source.volume`. A book source may omit `volume` and `volumes`; the catalog normalizes that single-book case to `1/1` while preserving explicit legacy multi-volume metadata. Each `<locale>.json` contains only the parsed title, `##` chapters, and paragraphs. Optional `<locale>-audio.json` files preserve the complete audiobook script. Each audio block contains `id`, `speaker`, and `text`; character dialogue may also carry one optional MiniMax `emotion`: `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, or `calm`. The catalog copies this field unchanged when present and does not emit it when absent.

The website loads data by route:

- the homepage loads `catalog.json` and one localized featured file;
- the full catalog loads the lightweight catalog shards, which remain independently cacheable;
- the reader loads one book manifest, one selected locale, and only that work's referenced vocabulary entries;
- Writer and Style pages load their own indexes and individual profiles;
- the vocabulary page loads its index and one locale/level/page shard at a time.
- the Works page loads `series.json`; a detail page loads one series manifest and only the selected article locale, leaving audio unloaded until needed.

All URLs stored in JSON are relative to the API root. Do not add a leading slash: relative URLs continue to work when the release is hosted below a path such as `https://open.haivivi.com/hai-library/`.

Generated JSON and copied runtime assets are build outputs. Do not hand-edit them.
