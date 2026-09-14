# Static API catalog

Ungraded source literature and audiobook scripts live under `works/series/`. Picture books at levels `aa` through `n` derive from those series and store schema-version-3 locale page text. The current catalog intentionally compiles only derived picture books; the website does not load series `article.md` or `audio_script.yaml`.

```text
build/
  catalog.json
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

The website loads data by route:

- the homepage loads `catalog.json` and one localized featured file;
- the full catalog loads the lightweight catalog shards, which remain independently cacheable;
- the reader loads one book manifest, one selected locale, and only that work's referenced vocabulary entries;
- Writer and Style pages load their own indexes and individual profiles;
- the vocabulary page loads its index and one locale/level/page shard at a time.

All URLs stored in JSON are relative to the API root. Do not add a leading slash: relative URLs continue to work when the release is hosted below a path such as `https://open.haivivi.com/hai-library/`.

Generated JSON and copied runtime assets are build outputs. Do not hand-edit them.
