# Static API catalog

Books are authored as YAML. The TypeScript catalog build emits a versioned, read-only static API that the website and other clients consume directly.

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

Each `works/<work-id>/index.json` is a self-describing book manifest. It lists locale story URLs, Writer and Style profile URLs, cover and page artwork URLs, and every referenced vocabulary-entry URL. Locale files contain only that edition's prose, cast, chapters, questions, and answers.

The website loads data by route:

- the homepage loads `catalog.json` and one localized featured file;
- the full catalog loads the lightweight catalog shards, which remain independently cacheable;
- the reader loads one book manifest, one selected locale, and only that work's referenced vocabulary entries;
- Writer and Style pages load their own indexes and individual profiles;
- the vocabulary page loads its index and one locale/level/page shard at a time.

All URLs stored in JSON are relative to the API root. Do not add a leading slash: relative URLs continue to work when the release is hosted below a path such as `https://open.haivivi.com/hai-library/`.

Generated JSON and copied runtime assets are build outputs. Do not hand-edit them.
