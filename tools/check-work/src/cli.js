#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import process from "node:process";
import YAML from "yaml";

const READING_A_Z_LEVELS = ["aa", ..."abcdefghijklmnopqrstuvwxyz", "z1", "z2"];
const PICTURE_BOOK_LEVELS = ["aa", ..."abcdefghijklmn"];

const MEDIA_SUFFIXES = new Set([".webp", ".mp3", ".m4a", ".ogg", ".wav", ".mp4", ".webm"]);
const VOCABULARY_LOCALE_KEYS = new Set(["term", "forms", "part_of_speech", "pronunciation", "definition", "writing", "alignments"]);
const TYPE_PART = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const asPosix = (value) => value.split(sep).join("/");
const isMapping = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const sameSet = (left, right) => left.size === right.size && [...left].every((value) => right.has(value));
const hasOnlyKeys = (value, allowed) => Object.keys(value).every((key) => allowed.has(key));
const hasNoNullValues = (value) => Object.values(value).every((item) => item !== null && item !== undefined);
const ARTWORK_ASSET_KEYS = new Set(["id", "file", "scene", "prompt"]);
const CHARACTER_KEYS = new Set(["id", "kind", "description", "visual_identity"]);
const CAST_ENTRY_KEYS = new Set(["display_name", "tts"]);
const TTS_KEYS = new Set(["delivery", "timbre", "pace", "pitch"]);
const AUDIO_BLOCK_KEYS = new Set(["id", "speaker", "speakers", "ensemble", "text", "emotion"]);
const AUDIO_EMOTIONS = new Set(["happy", "sad", "angry", "fearful", "disgusted", "surprised", "calm"]);
const CONTENT_YAML_FILES = new Set(["book.yaml", "artwork.yaml", "story.yaml", "article.yaml", "series.yaml", "audio_script.yaml", "research.yaml"]);
const BOOK_KEYS = new Set(["schema_version", "id", "type", "style", "status", "locales", "labels", "characters", "cover", "source"]);
const ARTWORK_KEYS = new Set(["schema_version", "style", "aspect_ratio", "embedded_text", "shared_by_all_locales", "assets"]);
const STORY_KEYS = new Set(["schema_version", "language", "writer", "title", "summary", "chapters", "questions", "article"]);
const STORY_ARTICLE_KEYS = new Set(["pages"]);
const STORY_PAGE_KEYS = new Set(["id", "illustration", "paragraphs"]);
const SERIES_ARTICLE_KEYS = new Set(["schema_version", "id", "type", "category", "genre", "age_range", "titles", "original", "style", "labels", "research", "premise", "characters", "locales", "picture_book", "picture_books", "cover_prompt"]);
const SERIES_KEYS = new Set(["schema_version", "id", "type", "category", "genre", "age_range", "titles", "original", "articles", "labels", "style", "cover_prompt"]);
const AGE_RANGE_KEYS = new Set(["min", "max"]);
const ORIGINAL_KEYS = new Set(["title", "author", "author_names", "writer", "countries", "year", "language"]);
const SERIES_CHARACTER_KEYS = new Set(["id", "description"]);
const SERIES_LOCALE_KEYS = new Set(["writer", "working_title", "length", "translator", "source_url"]);
const PICTURE_BOOK_PROPOSAL_KEYS = new Set(["level", "volumes"]);
const PICTURE_BOOK_KEYS = new Set(["level"]);
const RESEARCH_KEYS = new Set(["schema_version", "required", "sources", "notes"]);
const RESEARCH_SOURCE_KEYS = new Set(["url", "authority", "claims"]);

// A plain scalar inside `{...}` ends at the first comma, so `{scene: A, then B}` silently parses as
// `{scene: "A", "then B": null}`. Report every flow-mapping key that has no value.
function flowKeysWithoutValue(document) {
  const keys = [];
  YAML.visit(document, {
    Pair(_, pair, path) {
      const parent = path[path.length - 1];
      if (YAML.isMap(parent) && parent.flow && (pair.value === null || (YAML.isScalar(pair.value) && pair.value.value === null))) keys.push(String(YAML.isScalar(pair.key) ? pair.key.value : pair.key));
    },
  });
  return keys;
}

function nullValuePaths(value, path = []) {
  if (Array.isArray(value)) return value.flatMap((item, index) => nullValuePaths(item, [...path, String(index)]));
  if (!isMapping(value)) return [];
  const paths = [];
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...path, key];
    if (item === null || item === undefined) paths.push(itemPath.join("."));
    else paths.push(...nullValuePaths(item, itemPath));
  }
  return paths;
}

class Check {
  constructor(root) {
    this.root = root;
    this.errors = [];
  }

  require(condition, message) {
    if (!condition) this.errors.push(message);
    return condition;
  }

  yamlMapping(path) {
    if (!this.require(existsSync(path) && statSync(path).isFile(), `missing file: ${asPosix(relative(this.root, path))}`)) return {};
    try {
      const document = YAML.parseDocument(readFileSync(path, "utf8"));
      if (document.errors.length) throw document.errors[0];
      for (const key of flowKeysWithoutValue(document)) {
        this.errors.push(`flow mapping key has no value: ${asPosix(relative(this.root, path))}: ${JSON.stringify(key)} (quote YAML text containing commas)`);
      }
      const value = document.toJS();
      if (!isMapping(value)) {
        this.errors.push(`expected YAML mapping: ${asPosix(relative(this.root, path))}`);
        return {};
      }
      if (CONTENT_YAML_FILES.has(path.split(sep).at(-1))) {
        for (const valuePath of nullValuePaths(value)) {
          this.errors.push(`YAML key has an empty value: ${asPosix(relative(this.root, path))}: ${valuePath} (quote YAML text containing commas or colons)`);
        }
      }
      return value;
    } catch (error) {
      this.errors.push(`invalid YAML: ${asPosix(relative(this.root, path))}: ${error instanceof Error ? error.message : String(error)}`);
      return {};
    }
  }

  resource(path, label) {
    if (!this.require(existsSync(path) && statSync(path).isFile(), `missing ${label}: ${asPosix(relative(this.root, path))}`)) return;
    if (!MEDIA_SUFFIXES.has(extname(path).toLowerCase())) return;
    const relativePath = asPosix(relative(this.root, path));
    const result = spawnSync("git", ["check-attr", "filter", "--", relativePath], { cwd: this.root, encoding: "utf8" });
    if (result.status !== 0 || !result.stdout.trimEnd().endsWith("filter: lfs")) this.errors.push(`media is not covered by Git LFS: ${relativePath}`);
  }
}

function requireOnlyKeys(check, value, allowed, label) {
  if (isMapping(value)) check.require(hasOnlyKeys(value, allowed), `${label} contains an unknown field (quote YAML text containing commas or colons)`);
}

function normalizedQuestionPrompt(value) {
  return typeof value === "string" ? value.normalize("NFKC").toLocaleLowerCase().replace(/[\p{P}\p{S}\s]+/gu, "") : "";
}

function pictureBookDirs(root) {
  const works = join(root, "works");
  const found = [];
  if (!existsSync(works)) return found;
  for (const levelEntry of readdirSync(works, { withFileTypes: true })) {
    if (!levelEntry.isDirectory() || levelEntry.name === "series" || levelEntry.name === "articles") continue;
    const levelDir = join(works, levelEntry.name);
    for (const categoryEntry of readdirSync(levelDir, { withFileTypes: true })) {
      if (!categoryEntry.isDirectory()) continue;
      const categoryDir = join(levelDir, categoryEntry.name);
      for (const subcategoryEntry of readdirSync(categoryDir, { withFileTypes: true })) {
        if (!subcategoryEntry.isDirectory()) continue;
        const subcategoryDir = join(categoryDir, subcategoryEntry.name);
        for (const bookEntry of readdirSync(subcategoryDir, { withFileTypes: true })) {
          if (bookEntry.isDirectory() && existsSync(join(subcategoryDir, bookEntry.name, "book.yaml"))) found.push(join(subcategoryDir, bookEntry.name));
        }
      }
    }
  }
  return found;
}

function readYamlMappingQuietly(path) {
  try {
    const value = YAML.parse(readFileSync(path, "utf8"));
    return isMapping(value) ? value : null;
  } catch {
    return null;
  }
}

function stringList(check, value, label) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string" && item.length > 0)) {
    check.errors.push(`${label} must be a non-empty string list`);
    return [];
  }
  return value;
}

function typePath(check, value, label) {
  const parts = stringList(check, value, label);
  if (parts.length) {
    check.require(parts.length >= 2, `${label} must contain at least a family and subtype`);
    for (const part of parts) check.require(TYPE_PART.test(part), `${label} contains an invalid segment: ${JSON.stringify(part)}`);
  }
  return parts;
}

function requiredString(check, mapping, key, label) {
  const value = mapping[key];
  if (check.require(typeof value === "string" && value.trim().length > 0, `${label}.${key} must be a non-empty string`)) return value;
  return null;
}

function checkSourceArticle(check, path, locale) {
  const relativePath = asPosix(relative(check.root, path));
  if (!existsSync(path)) return;
  if (!check.require(statSync(path).isFile(), `source article must be a file: ${relativePath}`)) return;
  let article;
  try {
    article = new TextDecoder("utf-8", { fatal: true }).decode(readFileSync(path));
  } catch (error) {
    check.errors.push(`source article must be valid UTF-8 text: ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }
  const lines = article.split(/\r?\n/u);
  check.require(/^# \S.*$/u.test(lines[0] ?? ""), `${locale}: article.md must start with a non-empty level-1 title`);
  check.require(lines[0] !== "---", `${locale}: article.md must not contain YAML front matter`);
  const blocks = article.split(/\r?\n[ \t]*\r?\n/u);
  check.require(
    blocks.some((block, index) => index > 0 && block.trim().length > 0 && !block.trimStart().startsWith("#")),
    `${locale}: article.md must contain at least one non-heading prose paragraph`,
  );
  check.require(!/\{?vocabulary\s*:/iu.test(article), `${locale}: article.md must not contain vocabulary markers`);
}

function lineText(line) {
  if (typeof line.text === "string") return line.text;
  if (!Array.isArray(line.content)) return "";
  return line.content.map((segment) => segment?.text ?? segment?.vocabulary?.text ?? "").join("");
}

function countUnits(text, unitLanguage) {
  if (unitLanguage === "zh") return text.match(/\p{Script=Han}/gu)?.length ?? 0;
  return text.trim() === "" ? 0 : text.trim().split(/\s+/u).length;
}

function splitSentences(text, unitLanguage) {
  const terminator = unitLanguage === "zh" ? /[。！？]+(?:["”’']+)?/u : /[.!?]+(?:["”’']+)?(?=\s|$)/u;
  return text.split(terminator).map((sentence) => sentence.trim()).filter(Boolean);
}

function checkVocabularyData(check, root, index) {
  check.require(index.schema_version === 1, "vocabulary index schema_version must be 1");
  const datasets = isMapping(index.datasets) ? index.datasets : {};
  for (const [datasetId, dataset] of Object.entries(datasets)) {
    if (!isMapping(dataset) || typeof dataset.local_file !== "string") continue;
    const path = join(root, dataset.local_file);
    if (!check.require(existsSync(path) && statSync(path).isFile(), `missing vocabulary dataset: ${dataset.local_file}`)) continue;
    const raw = readFileSync(path);
    if (typeof dataset.sha256 === "string") check.require(createHash("sha256").update(raw).digest("hex") === dataset.sha256, `${datasetId}: SHA-256 does not match vocabulary index`);
    const lines = raw.toString("utf8").trimEnd().split(/\r?\n/u);
    if (Number.isInteger(dataset.count)) check.require(lines.length === dataset.count + 1, `${datasetId}: expected ${dataset.count} data rows, found ${lines.length - 1}`);
    if (Array.isArray(dataset.columns)) check.require(lines[0] === dataset.columns.join(","), `${datasetId}: CSV header does not match declared columns`);
    if (datasetId === "ngsl-1.2") {
      const lemmas = new Set();
      for (let index = 1; index < lines.length; index += 1) {
        const [lemma, rankText, sfiText, frequencyText, band] = lines[index].split(",");
        const rank = Number(rankText);
        const expectedBand = rank <= 250 ? "a" : rank <= 500 ? "b" : rank <= 800 ? "c" : rank <= 1100 ? "d" : rank <= 1450 ? "e" : rank <= 1800 ? "f" : rank <= 2200 ? "g" : "h";
        check.require(lemma.length > 0 && !lemmas.has(lemma), `${datasetId}: missing or duplicate lemma at row ${index}`);
        check.require(rank === index, `${datasetId}: non-continuous rank at row ${index}`);
        check.require(Number.isFinite(Number(sfiText)) && Number.isFinite(Number(frequencyText)), `${datasetId}: invalid frequency data at row ${index}`);
        check.require(band === expectedBand, `${datasetId}: incorrect internal band at row ${index}`);
        lemmas.add(lemma);
      }
    }
    if (datasetId === "tghz-2013-tier-1") {
      const characters = new Set();
      for (let index = 1; index < lines.length; index += 1) {
        const [entryNumber, character, unicode] = lines[index].split(",");
        check.require(entryNumber === String(index).padStart(4, "0"), `${datasetId}: non-continuous entry number at row ${index}`);
        check.require([...character].length === 1 && /\p{Script=Han}/u.test(character), `${datasetId}: invalid character at row ${index}`);
        check.require(unicode === `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`, `${datasetId}: Unicode value mismatch at row ${index}`);
        characters.add(character);
      }
      check.require(characters.size === dataset.count, `${datasetId}: characters must be unique`);
    }
  }
}

function checkContentSegments(check, root, level, locale, content, label, vocabularyCache) {
  if (!check.require(Array.isArray(content) && content.length > 0, `${label} must be a non-empty segment list`)) return;
  content.forEach((segment, index) => {
    const segmentLabel = `${label}[${index}]`;
    if (!isMapping(segment) || Object.keys(segment).length !== 1) {
      check.errors.push(`${segmentLabel} must contain exactly one text or vocabulary segment`);
      return;
    }
    if ("text" in segment) {
      check.require(typeof segment.text === "string" && segment.text.length > 0, `${segmentLabel}.text must be non-empty`);
      return;
    }
    const marker = segment.vocabulary;
    if (!isMapping(marker)) {
      check.errors.push(`${segmentLabel} must be text or vocabulary`);
      return;
    }
    requireOnlyKeys(check, marker, new Set(["id", "text"]), `${segmentLabel}.vocabulary`);
    const vocabularyId = requiredString(check, marker, "id", `${segmentLabel}.vocabulary`);
    const surface = requiredString(check, marker, "text", `${segmentLabel}.vocabulary`);
    if (vocabularyId === null) return;
    const cacheKey = `${level}/${vocabularyId}`;
    if (!vocabularyCache.has(cacheKey)) {
      const entryDir = join(root, "vocabulary", level, vocabularyId);
      const entry = check.yamlMapping(join(entryDir, "entry.yaml"));
      vocabularyCache.set(cacheKey, entry);
      check.require(entry.schema_version === 1, `${level}/${vocabularyId}: vocabulary schema_version must be 1`);
      check.require(entry.id === vocabularyId, `${level}/${vocabularyId}: vocabulary id does not match directory`);
      check.require(entry.level === level, `${level}/${vocabularyId}: vocabulary level does not match directory`);
      const card = requiredString(check, entry, "card", `${level}/${vocabularyId}`);
      if (card !== null) check.resource(join(entryDir, card), `vocabulary card for ${level}/${vocabularyId}`);
      if (Object.hasOwn(entry, "card_prompt")) requiredString(check, entry, "card_prompt", `${level}/${vocabularyId}`);
      check.require(isMapping(entry.locales) && Object.keys(entry.locales).length > 0, `${level}/${vocabularyId}.locales must be a mapping`);
    }
    const entry = vocabularyCache.get(cacheKey);
    const locales = isMapping(entry.locales) ? entry.locales : {};
    const localized = locales[locale];
    if (!check.require(isMapping(localized), `${level}/${vocabularyId}: missing locale ${locale}`)) return;
    check.require(hasOnlyKeys(localized, VOCABULARY_LOCALE_KEYS), `${level}/${vocabularyId}.${locale}: vocabulary locale contains unknown fields`);
    const term = requiredString(check, localized, "term", `${level}/${vocabularyId}.${locale}`);
    requiredString(check, localized, "pronunciation", `${level}/${vocabularyId}.${locale}`);
    requiredString(check, localized, "definition", `${level}/${vocabularyId}.${locale}`);
    check.require(Array.isArray(localized.alignments), `${level}/${vocabularyId}.${locale}.alignments must be a list`);
    const acceptedForms = new Set([term]);
    if (Array.isArray(localized.forms)) for (const form of localized.forms) if (typeof form === "string") acceptedForms.add(form);
    if (surface !== null) check.require(acceptedForms.has(surface), `${segmentLabel}: ${JSON.stringify(surface)} is not a declared form of ${level}/${vocabularyId}.${locale}`);
  });
  if (locale.toLowerCase().startsWith("en")) {
    const surfaces = content.map((segment) => segment.text ?? segment.vocabulary?.text ?? "");
    for (let index = 0; index < surfaces.length - 1; index += 1) {
      check.require(
        !(/[A-Za-z0-9]$/.test(surfaces[index]) && /^[A-Za-z0-9]/.test(surfaces[index + 1])),
        `${label}: English content segments ${index} and ${index + 1} need a separating space or punctuation`,
      );
    }
  }
}

function findRoot(start) {
  let candidate = start;
  while (true) {
    if (existsSync(join(candidate, ".git")) && existsSync(join(candidate, "works")) && statSync(join(candidate, "works")).isDirectory()) return candidate;
    const parent = dirname(candidate);
    if (parent === candidate) throw new Error("could not find the HaiLibrary repository root");
    candidate = parent;
  }
}

function checkSelectedLabels(check, labelIndex, labels, locales, label = "labels") {
  const availableGroups = isMapping(labelIndex.groups) ? labelIndex.groups : {};
  const selectedGroups = isMapping(labels) ? labels : {};
  check.require(isMapping(labels), `${label} must be a mapping`);
  for (const groupId of ["topics", "themes", "moods"]) {
    const group = availableGroups[groupId];
    if (!check.require(isMapping(group), `label index is missing group: ${groupId}`)) continue;
    const selected = stringList(check, selectedGroups[groupId], `${label}.${groupId}`);
    check.require(new Set(selected).size === selected.length, `${label}.${groupId} must not contain duplicates`);
    for (const labelId of selected) {
      check.require(TYPE_PART.test(labelId), `${label}.${groupId} contains an invalid label id: ${JSON.stringify(labelId)}`);
      const localizedNames = group.labels?.[labelId];
      if (!check.require(isMapping(localizedNames), `unknown label ${groupId}/${labelId}`)) continue;
      for (const locale of locales) check.require(typeof localizedNames[locale] === "string" && localizedNames[locale].length > 0, `label ${groupId}/${labelId} is missing name for ${locale}`);
    }
  }
  for (const groupId of Object.keys(selectedGroups)) check.require(Object.hasOwn(availableGroups, groupId), `${label} contains unknown group: ${groupId}`);
}

function checkAgeRange(check, value, label) {
  if (!check.require(isMapping(value), `${label} must be a mapping`)) return;
  requireOnlyKeys(check, value, AGE_RANGE_KEYS, label);
  check.require(Number.isInteger(value.min) && value.min >= 0 && value.min <= 99, `${label}.min must be an integer from 0 to 99`);
  if (Object.hasOwn(value, "max")) {
    check.require(Number.isInteger(value.max) && value.max >= 0 && value.max <= 99, `${label}.max must be an integer from 0 to 99`);
    if (Number.isInteger(value.min) && Number.isInteger(value.max)) check.require(value.max >= value.min, `${label}.max must be greater than or equal to min`);
  }
}

function validateOriginal(check, original, label, { requireTitle = true } = {}) {
  if (!check.require(isMapping(original), `${label} must be a mapping`)) return;
  requireOnlyKeys(check, original, ORIGINAL_KEYS, label);
  if (requireTitle) requiredString(check, original, "title", label);
  for (const key of ["author", "language"]) requiredString(check, original, key, label);
  if (Object.hasOwn(original, "author_names")) check.require(isMapping(original.author_names) && Object.entries(original.author_names).every(([locale, name]) => /^[a-z]{2}-[A-Z]{2}$/.test(locale) && typeof name === "string" && name.trim().length > 0), `${label}.author_names must map locales to non-empty names`);
  check.require(Array.isArray(original.countries) && original.countries.length > 0 && original.countries.every((country) => typeof country === "string" && /^[A-Z]{2}$/.test(country)), `${label}.countries must be a non-empty list of ISO 3166-1 alpha-2 codes`);
  check.require(Number.isInteger(original.year) || (typeof original.year === "string" && original.year.trim().length > 0), `${label}.year must be an integer or non-empty string`);
  if (typeof original.language === "string") check.require(/^[a-z]{2,3}$/.test(original.language), `${label}.language must be a BCP 47 primary language subtag`);
}

function articleLocations(root) {
  const locations = [];
  const standaloneRoot = join(root, "works", "articles");
  if (existsSync(standaloneRoot)) for (const entry of readdirSync(standaloneRoot, { withFileTypes: true })) if (entry.isDirectory() && existsSync(join(standaloneRoot, entry.name, "article.yaml"))) locations.push({ id: entry.name, path: join(standaloneRoot, entry.name), seriesId: null });
  const seriesRoot = join(root, "works", "series");
  if (existsSync(seriesRoot)) for (const seriesEntry of readdirSync(seriesRoot, { withFileTypes: true })) {
    if (!seriesEntry.isDirectory()) continue;
    const seriesDir = join(seriesRoot, seriesEntry.name);
    for (const entry of readdirSync(seriesDir, { withFileTypes: true })) if (entry.isDirectory() && existsSync(join(seriesDir, entry.name, "article.yaml"))) locations.push({ id: entry.name, path: join(seriesDir, entry.name), seriesId: seriesEntry.name });
  }
  return locations;
}

function checkGlobalArticleIds(check, root) {
  const seen = new Map();
  for (const location of articleLocations(root)) {
    if (seen.has(location.id)) check.errors.push(`article id is not globally unique: ${location.id} (${asPosix(relative(root, seen.get(location.id)))}, ${asPosix(relative(root, location.path))})`);
    else seen.set(location.id, location.path);
  }
  const articleIds = new Set(seen.keys());
  const seriesRoot = join(root, "works", "series");
  if (existsSync(seriesRoot)) for (const entry of readdirSync(seriesRoot, { withFileTypes: true })) if (entry.isDirectory()) check.require(!articleIds.has(entry.name), `series id collides with article id: ${entry.name}`);
}

function checkArticle(work, root, articleId, inherited = null, seriesId = null) {
  const check = new Check(root);
  check.require(existsSync(work) && statSync(work).isDirectory(), `missing work directory: ${work}`);
  const article = check.yamlMapping(join(work, "article.yaml"));
  const effective = { ...(inherited ?? {}), ...article, original: { ...(inherited?.original ?? {}), ...(article.original ?? {}) } };
  const labelIndex = check.yamlMapping(join(root, "prompts", "labels", "index.yaml"));
  requireOnlyKeys(check, article, SERIES_ARTICLE_KEYS, "article.yaml");
  check.require(article.schema_version === 1, "article.schema_version must be 1");
  check.require(article.id === articleId, `article id must match directory: ${articleId}`);
  const articleType = requiredString(check, effective, "type", "article");
  if (articleType !== null) {
    check.require(TYPE_PART.test(articleType), "article.type must be a lowercase identifier");
    const typeIndex = check.yamlMapping(join(root, "prompts", "article-types", "index.yaml"));
    check.require(Array.isArray(typeIndex.type_order) && typeIndex.type_order.includes(articleType), `article type must be listed in prompts/article-types/index.yaml: ${articleType}`);
    const typePrompt = check.yamlMapping(join(root, "prompts", "article-types", articleType, "prompt.yaml"));
    check.require(typePrompt.schema_version === 1 && typePrompt.id === articleType, `article type must exist and match id: ${articleType}`);
  }
  const classic = articleType === "classic";
  for (const key of ["category", "genre"]) {
    const value = requiredString(check, effective, key, "article");
    if (value !== null) check.require(TYPE_PART.test(value), `article.${key} must be a lowercase identifier`);
  }
  const taxonomy = check.yamlMapping(join(root, "prompts", "taxonomy", "index.yaml"));
  check.require(Object.hasOwn(taxonomy.categories ?? {}, effective.category), `article.category is not in prompts/taxonomy/index.yaml: ${effective.category}`);
  check.require(Object.hasOwn(taxonomy.subcategories ?? {}, effective.genre), `article.genre is not in prompts/taxonomy/index.yaml: ${effective.genre}`);
  checkAgeRange(check, effective.age_range, "article.age_range");
  if (classic) {
    check.require(isMapping(effective.titles) && Object.keys(effective.titles).length > 0 && Object.values(effective.titles).every((title) => typeof title === "string" && title.trim().length > 0), "classic article.titles must be a non-empty locale-to-title mapping");
    validateOriginal(check, effective.original, "article.original");
    const authorWriter = effective.original?.writer;
    if (authorWriter !== undefined) {
      if (check.require(typeof authorWriter === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(authorWriter), "article.original.writer must be a kebab-case Writer id")) {
        for (const locale of Object.keys(isMapping(article.locales) ? article.locales : {})) {
          const profile = check.yamlMapping(join(root, "prompts", "writers", locale, authorWriter, "prompt.yaml"));
          check.require(profile.schema_version === 1 && profile.id === authorWriter && profile.locale === locale && profile.kind === "author" && typeof profile.display_name === "string" && isMapping(profile.author) && typeof profile.author.name === "string", `${locale}: original.writer must resolve to an author Writer profile: ${authorWriter}`);
        }
      }
    }
  } else {
    check.require(!Object.hasOwn(article, "original"), "article.original is only allowed for type: classic");
  }
  if (!classic) {
    const styleId = requiredString(check, article, "style", "article");
    if (styleId !== null) {
      const style = check.yamlMapping(join(root, "prompts", "styles", styleId, "prompt.yaml"));
      check.require(style.schema_version === 1 && style.id === styleId, `Style must exist and match id: ${styleId}`);
    }
    check.require(article.research === "required" || article.research === "none", "article.research must be required or none");
    const characters = Array.isArray(article.characters) ? article.characters : [];
    check.require(characters.length > 0, "article.characters must not be empty");
    const characterIds = [];
    for (const character of characters) {
      if (!check.require(isMapping(character), "every article character must be a mapping")) continue;
      requireOnlyKeys(check, character, SERIES_CHARACTER_KEYS, "article.character");
      const id = requiredString(check, character, "id", "article.character");
      requiredString(check, character, "description", `article.character.${id ?? "<unknown>"}`);
      if (id !== null) characterIds.push(id);
    }
    check.require(new Set(characterIds).size === characterIds.length, "article character ids must be unique");
  }
  const localePlans = isMapping(article.locales) ? article.locales : {};
  const locales = Object.keys(localePlans);
  check.require(isMapping(article.locales), "article.locales must be a mapping");
  if (!classic) check.require(locales.length > 0, "article.locales must be a non-empty mapping");
  if (!classic || Object.hasOwn(article, "labels")) checkSelectedLabels(check, labelIndex, article.labels, locales, "article.labels");
  const localeDir = join(work, "locales");
  const actualLocales = existsSync(localeDir) && statSync(localeDir).isDirectory() ? readdirSync(localeDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort() : [];
  check.require(JSON.stringify([...locales].sort()) === JSON.stringify(actualLocales), "article.locales must exactly match locales/ directories");
  for (const locale of locales) {
    const plan = localePlans[locale];
    if (!check.require(isMapping(plan), `article.locales.${locale} must be a mapping`)) continue;
    requireOnlyKeys(check, plan, SERIES_LOCALE_KEYS, `article.locales.${locale}`);
    const writerId = Object.hasOwn(plan, "writer") ? requiredString(check, plan, "writer", `article.locales.${locale}`) : null;
    if (!classic && writerId === null) check.errors.push(`article.locales.${locale}.writer must be a non-empty string`);
    if (writerId !== null) {
      const writer = check.yamlMapping(join(root, "prompts", "writers", locale, writerId, "prompt.yaml"));
      check.require(writer.schema_version === 1 && writer.id === writerId && writer.locale === locale, `${locale}: Writer must exist and match locale: ${writerId}`);
    }
    const sourcePath = join(localeDir, locale, "article.md");
    check.require(existsSync(sourcePath), `${locale}: missing article.md`);
    checkSourceArticle(check, sourcePath, locale);
    const scriptPath = join(localeDir, locale, "audio_script.yaml");
    if (!existsSync(scriptPath)) continue;
    const wrapper = check.yamlMapping(scriptPath);
    check.require(hasOnlyKeys(wrapper, new Set(["audio_script"])), `${locale}: audio_script.yaml root must contain only audio_script`);
    const script = isMapping(wrapper.audio_script) ? wrapper.audio_script : {};
    check.require(hasOnlyKeys(script, new Set(["language", "cast", "chapters"])), `${locale}: audio_script contains an unknown field`);
    check.require(script.language === locale, `${locale}: audio_script.language must match locale`);
    const cast = isMapping(script.cast) ? script.cast : {};
    check.require(Object.keys(cast).length > 0, `${locale}: audio_script.cast must not be empty`);
    for (const [castId, castEntry] of Object.entries(cast)) {
      if (!check.require(isMapping(castEntry), `${locale}: cast ${castId} must be a mapping`)) continue;
      check.require(hasOnlyKeys(castEntry, CAST_ENTRY_KEYS), `${locale}: cast ${castId} contains an unknown field`);
      requiredString(check, castEntry, "display_name", `${locale}.cast.${castId}`);
      const tts = castEntry.tts;
      if (!check.require(isMapping(tts), `${locale}: cast ${castId} needs TTS direction`)) continue;
      check.require(hasOnlyKeys(tts, TTS_KEYS), `${locale}: cast ${castId} TTS contains an unknown field`);
      for (const key of TTS_KEYS) requiredString(check, tts, key, `${locale}.cast.${castId}.tts`);
    }
    const chapters = Array.isArray(script.chapters) ? script.chapters : [];
    check.require(chapters.length > 0, `${locale}: audio_script.chapters must not be empty`);
    const blockIds = new Set();
    chapters.forEach((chapter, chapterIndex) => {
      if (!check.require(isMapping(chapter), `${locale}: audio chapter must be a mapping`)) return;
      requireOnlyKeys(check, chapter, new Set(["id", "title", "blocks"]), `${locale}: audio chapter`);
      const expectedChapterId = `ch${String(chapterIndex + 1).padStart(2, "0")}`;
      check.require(chapter.id === expectedChapterId, `${locale}: chapter ${chapterIndex + 1} id must be ${expectedChapterId}`);
      requiredString(check, chapter, "title", `${locale}.chapter.${expectedChapterId}`);
      const blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
      check.require(blocks.length > 0, `${locale}: chapter ${expectedChapterId} blocks must not be empty`);
      blocks.forEach((block, blockIndex) => {
        if (!check.require(isMapping(block), `${locale}/${expectedChapterId}: block must be a mapping`)) return;
        check.require(hasOnlyKeys(block, AUDIO_BLOCK_KEYS), `${locale}/${expectedChapterId}: block contains an unknown field`);
        const expectedBlockId = `${expectedChapterId}-b${String(blockIndex + 1).padStart(2, "0")}`;
        check.require(block.id === expectedBlockId, `${locale}/${expectedChapterId}: block ${blockIndex + 1} id must be ${expectedBlockId}`);
        if (typeof block.id === "string") {
          check.require(!blockIds.has(block.id), `${locale}: duplicate audio block id ${block.id}`);
          blockIds.add(block.id);
        }
        if (Object.hasOwn(block, "speakers") || Object.hasOwn(block, "ensemble")) {
          check.require(!Object.hasOwn(block, "speaker"), `${locale}/${expectedBlockId}: use either speaker or speakers, not both`);
          const voices = Array.isArray(block.speakers) ? block.speakers : [];
          check.require(voices.length >= 2 && voices.every((voice) => typeof voice === "string" && Object.hasOwn(cast, voice)) && new Set(voices).size === voices.length, `${locale}/${expectedBlockId}: speakers must list distinct cast ids`);
          check.require(block.ensemble === "duo" ? voices.length === 2 : block.ensemble === "chorus" ? voices.length >= 3 : false, `${locale}/${expectedBlockId}: ensemble must be duo for two speakers or chorus for three or more`);
        } else {
          check.require(typeof block.speaker === "string" && Object.hasOwn(cast, block.speaker), `${locale}/${expectedBlockId}: speaker must exist in cast`);
        }
        requiredString(check, block, "text", `${locale}.${expectedBlockId}`);
        if (Object.hasOwn(block, "emotion")) {
          check.require(AUDIO_EMOTIONS.has(block.emotion), `${locale}/${expectedBlockId}: emotion must be one of ${[...AUDIO_EMOTIONS].join(", ")}`);
        }
      });
    });
  }
  if (Object.hasOwn(article, "picture_book")) {
    if (check.require(isMapping(article.picture_book), "article.picture_book must be a mapping")) {
      requireOnlyKeys(check, article.picture_book, PICTURE_BOOK_KEYS, "article.picture_book");
      check.require(PICTURE_BOOK_LEVELS.includes(article.picture_book.level), `article.picture_book.level must be one of aa, a-n: ${article.picture_book.level}`);
    }
  }
  if (Array.isArray(article.picture_books)) {
    article.picture_books.forEach((proposal, index) => requireOnlyKeys(check, proposal, PICTURE_BOOK_PROPOSAL_KEYS, `article.picture_books[${index}]`));
  }
  if (article.research === "required") {
    const research = check.yamlMapping(join(work, "research.yaml"));
    requireOnlyKeys(check, research, RESEARCH_KEYS, "research.yaml");
    if (Array.isArray(research.sources)) research.sources.forEach((source, index) => requireOnlyKeys(check, source, RESEARCH_SOURCE_KEYS, `research.sources[${index}]`));
  }
  checkGlobalArticleIds(check, root);
  return { work, errors: check.errors };
}

function checkSeries(work, root, seriesId) {
  const check = new Check(root);
  check.require(existsSync(work) && statSync(work).isDirectory(), `missing work directory: ${work}`);
  const source = check.yamlMapping(join(work, "series.yaml"));
  requireOnlyKeys(check, source, SERIES_KEYS, "series.yaml");
  check.require(source.schema_version === 1, "series.schema_version must be 1");
  check.require(source.id === seriesId, `series id must match directory: ${seriesId}`);
  const articleType = requiredString(check, source, "type", "series");
  const typeIndex = check.yamlMapping(join(root, "prompts", "article-types", "index.yaml"));
  if (articleType !== null) check.require(typeIndex.type_order?.includes(articleType), `series type must be listed in prompts/article-types/index.yaml: ${articleType}`);
  for (const key of ["category", "genre"]) requiredString(check, source, key, "series");
  checkAgeRange(check, source.age_range, "series.age_range");
  check.require(isMapping(source.titles) && Object.keys(source.titles).length > 0, "series.titles must be a non-empty mapping");
  if (articleType === "classic") validateOriginal(check, source.original, "series.original");
  else check.require(!Object.hasOwn(source, "original"), "series.original is only allowed for type: classic");
  const articles = stringList(check, source.articles, "series.articles");
  check.require(new Set(articles).size === articles.length, "series.articles must not contain duplicates");
  const childDirs = readdirSync(work, { withFileTypes: true }).filter((entry) => entry.isDirectory() && existsSync(join(work, entry.name, "article.yaml"))).map((entry) => entry.name).sort();
  check.require(JSON.stringify([...articles].sort()) === JSON.stringify(childDirs), "series.articles must exactly match child article directories");
  checkGlobalArticleIds(check, root);
  for (const articleId of articles) check.errors.push(...checkArticle(join(work, articleId), root, articleId, source, seriesId).errors);
  return { work, errors: [...new Set(check.errors)] };
}

function checkWork(workArgument) {
  const root = findRoot(resolve(process.cwd()));
  const work = isAbsolute(workArgument) ? resolve(workArgument) : resolve(root, workArgument);
  const check = new Check(root);
  const relativeWork = relative(join(root, "works"), work);
  if (relativeWork.startsWith("..") || isAbsolute(relativeWork)) return { work, errors: ["work must be inside works/"] };
  const parts = relativeWork.split(sep);
  if (parts.length === 2 && parts[0] === "articles") return checkArticle(work, root, parts[1]);
  if (parts.length === 2 && parts[0] === "series") return checkSeries(work, root, parts[1]);
  if (parts.length === 3 && parts[0] === "series") {
    const series = new Check(root).yamlMapping(join(root, "works", "series", parts[1], "series.yaml"));
    return checkArticle(work, root, parts[2], series, parts[1]);
  }
  if (parts.length !== 4) return { work, errors: ["work path must be works/articles/<id>/, works/series/<series-id>/, works/series/<series-id>/<article-id>/, or works/<level>/<category>/<subcategory>/<slug>/"] };

  const [level, , , slug] = parts;
  check.require(existsSync(work) && statSync(work).isDirectory(), `missing work directory: ${work}`);
  const book = check.yamlMapping(join(work, "book.yaml"));
  const artwork = check.yamlMapping(join(work, "artwork.yaml"));
  requireOnlyKeys(check, book, BOOK_KEYS, "book.yaml");
  requireOnlyKeys(check, artwork, ARTWORK_KEYS, "artwork.yaml");
  const levelIndex = check.yamlMapping(join(root, "prompts", "levels", "index.yaml"));
  const levelRulesById = Object.fromEntries(
    READING_A_Z_LEVELS.map((levelId) => [levelId, check.yamlMapping(join(root, "prompts", "levels", `${levelId}.yaml`))]),
  );
  const localeReferences = check.yamlMapping(join(root, "prompts", "levels", "locale-references.yaml"));
  const vocabularyIndex = check.yamlMapping(join(root, "prompts", "vocabulary", "index.yaml"));
  const vocabularyRanges = check.yamlMapping(join(root, "prompts", "vocabulary", "ranges.yaml"));
  const labelIndex = check.yamlMapping(join(root, "prompts", "labels", "index.yaml"));
  const taxonomyIndex = check.yamlMapping(join(root, "prompts", "taxonomy", "index.yaml"));
  const writerIndex = check.yamlMapping(join(root, "prompts", "writers", "index.yaml"));

  check.require(levelIndex.schema_version === 2, "level index schema_version must be 2");
  check.require(JSON.stringify(levelIndex.level_order) === JSON.stringify(READING_A_Z_LEVELS), "level_order must preserve the 29 ordered labels aa, a-z, z1, z2");
  check.require(isMapping(levelIndex.level_files) && JSON.stringify(Object.keys(levelIndex.level_files)) === JSON.stringify(READING_A_Z_LEVELS), "level_files must preserve every exact HaiLibrary level");
  check.require(localeReferences.schema_version === 1, "locale reference schema_version must be 1");
  check.require(JSON.stringify(localeReferences.level_order) === JSON.stringify(READING_A_Z_LEVELS), "locale reference level_order must match aa, a-z, z1, z2");
  check.require(isMapping(localeReferences.levels) && JSON.stringify(Object.keys(localeReferences.levels)) === JSON.stringify(READING_A_Z_LEVELS), "locale references must preserve every ordered HaiLibrary level");
  for (const referenceLevel of READING_A_Z_LEVELS) {
    const localeReference = localeReferences.levels?.[referenceLevel];
    const exactLevel = levelRulesById[referenceLevel];
    const englishReference = localeReference?.["en-US"];
    const chineseReference = localeReference?.["zh-CN"];
    const expectedReadingAZ = referenceLevel === "aa" ? "aa" : referenceLevel.toUpperCase();
    check.require(typeof localeReference?.age_band === "string", `${referenceLevel}: locale reference must declare an age band`);
    check.require(isMapping(englishReference) && englishReference.reading_a_z_label === expectedReadingAZ && (typeof englishReference.grade_band === "string" || typeof englishReference.grade_band === "number") && typeof englishReference.lexile_reference === "string", `${referenceLevel}: en-US locale reference must declare the retained label, grade band, and English Lexile reference`);
    check.require(isMapping(chineseReference) && typeof chineseReference.checkpoint === "string" && typeof chineseReference.grade_band === "string" && typeof chineseReference.reading_task === "string", `${referenceLevel}: zh-CN locale reference must declare checkpoint, grade band, and reading task`);
    check.require(isMapping(localeReferences["zh-CN"]?.curriculum_checkpoints?.[chineseReference?.checkpoint]), `${referenceLevel}: zh-CN locale reference uses an unknown curriculum checkpoint`);
    check.require(levelIndex.level_files?.[referenceLevel] === `${referenceLevel}.yaml`, `${referenceLevel}: level_files must reference ${referenceLevel}.yaml`);
    check.require(exactLevel?.schema_version === 1, `${referenceLevel}: level file schema_version must be 1`);
    check.require(exactLevel?.id === referenceLevel, `${referenceLevel}: level file id must match its filename`);
    check.require(typeof exactLevel?.prompt === "string" && exactLevel.prompt.trim().length > 0, `${referenceLevel}: level must declare a non-empty prompt`);
    const levelExternalReference = exactLevel?.external_reference;
    check.require(isMapping(levelExternalReference) && levelExternalReference.reading_a_z_label === englishReference?.reading_a_z_label && String(levelExternalReference.age_band) === localeReference?.age_band && String(levelExternalReference.en_grade_reference) === String(englishReference?.grade_band) && levelExternalReference.en_lexile_reference === englishReference?.lexile_reference, `${referenceLevel}: level and locale age and English references must agree`);
  }
  check.require(PICTURE_BOOK_LEVELS.includes(level), `picture-book level must be one of aa, a-n: ${level}`);
  check.require(book.schema_version === 2, "book.schema_version must be 2");
  check.require(artwork.schema_version === 2, "artwork.schema_version must be 2");
  checkVocabularyData(check, root, vocabularyIndex);
  check.require(vocabularyRanges.schema_version === 1, "vocabulary ranges schema_version must be 1");
  check.require(JSON.stringify(vocabularyRanges.level_order) === JSON.stringify(READING_A_Z_LEVELS), "vocabulary level_order must match aa, a-z, z1, z2");
  for (const locale of ["en-US", "zh-CN"]) {
    const ranges = vocabularyRanges[locale]?.ranges;
    check.require(isMapping(ranges) && sameSet(new Set(Object.keys(ranges)), new Set(READING_A_Z_LEVELS)), `${locale}: vocabulary ranges must define every exact Reading A-Z level once`);
  }
  check.require(isMapping(taxonomyIndex.levels) && JSON.stringify(Object.keys(taxonomyIndex.levels)) === JSON.stringify(READING_A_Z_LEVELS), "taxonomy levels must preserve the ordered AA, A-Z, Z1, Z2 sequence");
  for (const locale of ["en-US", "zh-CN"]) {
    const defaults = writerIndex.default_writer_by_locale_and_level?.[locale];
    check.require(isMapping(defaults) && JSON.stringify(Object.keys(defaults)) === JSON.stringify(READING_A_Z_LEVELS), `${locale}: default Writer map must preserve every ordered Reading A-Z level`);
  }
  check.require(labelIndex.schema_version === 1, "label index schema_version must be 1");
  check.require(book.id === slug, `book id must match directory slug: ${slug}`);
  for (const other of pictureBookDirs(root)) {
    if (resolve(other) !== resolve(work) && other.split(sep).at(-1) === slug) check.errors.push(`book slug ${slug} is not unique: ${asPosix(relative(root, other))} uses it too`);
  }
  requiredString(check, book, "status", "book");
  const hasSource = Object.hasOwn(book, "source");
  const source = isMapping(book.source) ? book.source : {};
  if (hasSource) check.require(isMapping(book.source), "book.source must be a mapping when present");
  if (hasSource) check.require(hasOnlyKeys(source, new Set(["article", "volume", "volumes"])), "book.source contains an unknown field");
  const sourceArticle = hasSource ? requiredString(check, source, "article", "book.source") : null;
  if (sourceArticle !== null) check.require(articleLocations(root).some((location) => location.id === sourceArticle), `book.source.article does not exist: ${sourceArticle}`);
  const sourceVolume = hasSource ? source.volume ?? 1 : null;
  const sourceVolumes = hasSource ? source.volumes ?? 1 : null;
  if (hasSource) {
    check.require(Number.isInteger(sourceVolume) && sourceVolume > 0, "book.source.volume must be a positive integer when present");
    check.require(Number.isInteger(sourceVolumes) && sourceVolumes > 0, "book.source.volumes must be a positive integer when present");
    if (Number.isInteger(sourceVolume) && Number.isInteger(sourceVolumes)) check.require(sourceVolume <= sourceVolumes, "book.source.volume must not exceed book.source.volumes");
  }
  const workType = typePath(check, book.type, "book.type");
  const levelRules = levelRulesById[level];
  check.require(isMapping(levelRules), `unknown reading level: ${level}`);

  const styleId = book.style;
  if (check.require(typeof styleId === "string" && styleId.length > 0, "book.style must be a string")) {
    const styleDir = join(root, "prompts", "styles", styleId);
    const style = check.yamlMapping(join(styleDir, "prompt.yaml"));
    check.require(style.schema_version === 1, `Style schema_version must be 1: ${styleId}`);
    check.require(style.id === styleId, `Style id does not match: ${styleId}`);
    check.require(typeof style.prompt === "string" && style.prompt.trim().length > 0, `Style prompt must be non-empty: ${styleId}`);
    const thumbnail = style.thumbnail ?? "thumbnail.webp";
    if (check.require(typeof thumbnail === "string", `Style thumbnail must be a path: ${styleId}`)) check.resource(join(styleDir, thumbnail), `Style thumbnail for ${styleId}`);
  }
  check.require(artwork.style === styleId, "artwork.style must match book.style");
  requiredString(check, artwork, "aspect_ratio", "artwork");

  const characters = Array.isArray(book.characters) ? book.characters : [];
  check.require(characters.length > 0, "book.characters must not be empty");
  const characterIds = characters.filter(isMapping).map((item) => item.id);
  check.require(characterIds.length === characters.length && characterIds.every((item) => typeof item === "string" && item.length > 0), "every character must have a string id");
  check.require(new Set(characterIds).size === characterIds.length, "character ids must be unique");
  for (const character of characters.filter(isMapping)) {
    const characterLabel = `book.characters.${typeof character.id === "string" ? character.id : "<unknown>"}`;
    check.require(hasOnlyKeys(character, CHARACTER_KEYS), `${characterLabel} contains an unknown field (quote YAML text containing commas)`);
    check.require(hasNoNullValues(character), `${characterLabel} contains an empty field (quote YAML text containing commas)`);
    for (const key of CHARACTER_KEYS) requiredString(check, character, key, characterLabel);
  }

  const assets = Array.isArray(artwork.assets) ? artwork.assets : [];
  check.require(assets.length > 0, "artwork.assets must not be empty");
  const assetById = new Map();
  for (const asset of assets) {
    if (!isMapping(asset) || typeof asset.id !== "string") {
      check.errors.push("every artwork asset must have a string id");
      continue;
    }
    if (assetById.has(asset.id)) check.errors.push(`duplicate artwork id: ${asset.id}`);
    assetById.set(asset.id, asset);
    check.require(hasOnlyKeys(asset, ARTWORK_ASSET_KEYS), `artwork ${asset.id} contains an unknown field (quote YAML scenes containing commas)`);
    check.require(hasNoNullValues(asset), `artwork ${asset.id} contains an empty field (quote YAML scenes containing commas)`);
    if (check.require(typeof asset.file === "string", `artwork ${asset.id} must declare file`)) {
      check.require(asset.file === `artwork/${asset.id}.webp`, `artwork ${asset.id} file must be artwork/${asset.id}.webp`);
      check.resource(join(work, asset.file), `artwork ${asset.id}`);
    }
    check.require(typeof asset.scene === "string" && asset.scene.length > 0, `artwork ${asset.id} needs a scene`);
    check.require(typeof asset.prompt === "string" && asset.prompt.length > 0, `artwork ${asset.id} needs a prompt`);
  }

  if (check.require(typeof book.cover === "string", "book.cover must be a path")) {
    check.resource(join(work, book.cover), "book cover");
    const coverAsset = assetById.get("cover");
    check.require(coverAsset !== undefined, "artwork.assets must contain id: cover");
    if (coverAsset !== undefined) check.require(coverAsset.file === book.cover, "book.cover and artwork cover file must match");
  }

  check.require(artwork.shared_by_all_locales === true, "artwork must be shared by all locales");
  check.require(artwork.embedded_text === "prohibited", "artwork must prohibit embedded text");

  const locales = stringList(check, book.locales, "book.locales");
  const availableLabelGroups = isMapping(labelIndex.groups) ? labelIndex.groups : {};
  const selectedLabelGroups = isMapping(book.labels) ? book.labels : {};
  check.require(isMapping(book.labels), "book.labels must be a mapping");
  for (const groupId of ["topics", "themes", "moods"]) {
    const group = availableLabelGroups[groupId];
    if (!check.require(isMapping(group), `label index is missing group: ${groupId}`)) continue;
    const names = isMapping(group.names) ? group.names : {};
    const definitions = isMapping(group.labels) ? group.labels : {};
    check.require(Object.keys(definitions).length > 0, `label group ${groupId} must define labels`);
    const selected = stringList(check, selectedLabelGroups[groupId], `book.labels.${groupId}`);
    check.require(selected.length > 0, `book.labels.${groupId} must not be empty`);
    check.require(new Set(selected).size === selected.length, `book.labels.${groupId} must not contain duplicates`);
    for (const locale of locales) check.require(typeof names[locale] === "string" && names[locale].length > 0, `label group ${groupId} is missing name for ${locale}`);
    for (const labelId of selected) {
      check.require(TYPE_PART.test(labelId), `book.labels.${groupId} contains an invalid label id: ${JSON.stringify(labelId)}`);
      const localizedNames = definitions[labelId];
      if (!check.require(isMapping(localizedNames), `unknown label ${groupId}/${labelId}`)) continue;
      for (const locale of locales) check.require(typeof localizedNames[locale] === "string" && localizedNames[locale].length > 0, `label ${groupId}/${labelId} is missing name for ${locale}`);
    }
  }
  for (const groupId of Object.keys(selectedLabelGroups)) check.require(Object.hasOwn(availableLabelGroups, groupId), `book.labels contains unknown group: ${groupId}`);
  const localeDir = join(work, "locales");
  const actualLocales = existsSync(localeDir) && statSync(localeDir).isDirectory() ? readdirSync(localeDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort() : [];
  check.require(JSON.stringify([...locales].sort()) === JSON.stringify(actualLocales), "book.locales must exactly match locales/ directories");

  let canonicalPageIds = null;
  let canonicalPageLayout = null;
  let canonicalChapterCoverage = null;
  const usedIllustrations = new Set();
  const vocabularyCache = new Map();
  for (const locale of locales) {
    const localeVocabularyRanges = vocabularyRanges[locale];
    check.require(isMapping(localeVocabularyRanges) && isMapping(localeVocabularyRanges.ranges?.[level]), `${locale}: vocabulary range is missing for level ${level}`);
    const story = check.yamlMapping(join(localeDir, locale, "story.yaml"));
    requireOnlyKeys(check, story, STORY_KEYS, `${locale}: story.yaml`);
    check.require(story.language === locale, `story.language must be ${locale}`);
    const writerId = story.writer;
    if (check.require(typeof writerId === "string" && writerId.length > 0, `${locale}: writer must be a string`)) {
      const writerDir = join(root, "prompts", "writers", locale, writerId);
      const writer = check.yamlMapping(join(writerDir, "prompt.yaml"));
      check.require(writer.schema_version === 1, `${locale}: Writer schema_version must be 1`);
      check.require(writer.id === writerId, `${locale}: Writer id does not match: ${writerId}`);
      check.require(writer.locale === locale, `${locale}: Writer locale does not match`);
      check.require(Array.isArray(writer.recommended_levels) && writer.recommended_levels.includes(level), `${locale}: Writer ${writerId} does not recommend exact level ${level}`);
      check.require(typeof writer.prompt === "string" && writer.prompt.trim().length > 0, `${locale}: Writer ${writerId} prompt must be non-empty`);
      check.require(typeof writer.language_prompt === "string" && writer.language_prompt.trim().length > 0, `${locale}: Writer ${writerId} language_prompt must be non-empty`);
      const avatar = writer.avatar ?? "avatar.webp";
      if (check.require(typeof avatar === "string", `${locale}: Writer avatar must be a path`)) check.resource(join(writerDir, avatar), `Writer avatar for ${writerId}`);
    }
    requiredString(check, story, "title", locale);
    requiredString(check, story, "summary", locale);

    check.require(story.schema_version === 3, `${locale}: story.schema_version must be 3`);
    check.require(!Object.hasOwn(story, "audio_script"), `${locale}: picture-book story must not contain audio_script`);
    check.require(!Object.hasOwn(story, "cast"), `${locale}: picture-book story must not contain cast`);
    check.require(!Object.hasOwn(story, "pages"), `${locale}: picture-book story must not contain top-level pages`);
    check.require(isMapping(story.article), `${locale}: article must be a mapping`);
    requireOnlyKeys(check, story.article, STORY_ARTICLE_KEYS, `${locale}: story.article`);
    const pages = Array.isArray(story.article?.pages) ? story.article.pages : [];
    const unitLanguage = locale.toLowerCase().startsWith("zh") ? "zh" : locale.toLowerCase().startsWith("en") ? "en" : null;
    const languageRules = unitLanguage === null || !isMapping(levelRules?.languages) ? null : levelRules.languages[unitLanguage];
    let totalUnits = 0;
    check.require(pages.length > 0, `${locale}: pages must not be empty`);
    const pageIds = [];
    for (const page of pages) {
      if (!isMapping(page) || typeof page.id !== "string") {
        check.errors.push(`${locale}: every page must have a string id`);
        continue;
      }
      const pageId = page.id;
      pageIds.push(pageId);
      requireOnlyKeys(check, page, STORY_PAGE_KEYS, `${locale}/${pageId}: page`);
      check.require(typeof page.illustration === "string", `${locale}/${pageId}: illustration must be an id`);
      if (typeof page.illustration === "string") {
        check.require(assetById.has(page.illustration), `${locale}/${pageId}: missing artwork id ${page.illustration}`);
        usedIllustrations.add(page.illustration);
      }
      const hasParagraphs = Array.isArray(page.paragraphs);
      check.require(hasParagraphs, `${locale}/${pageId}: page needs paragraphs`);
      const blocks = hasParagraphs ? page.paragraphs : [];
      const blockLabel = "paragraph";
      let pageUnits = 0;
      let pageSentences = 0;
      const pageVocabularyIds = new Set();
      check.require(blocks.length > 0, `${locale}/${pageId}: paragraphs must not be empty`);
      for (const line of blocks) {
        if (!isMapping(line)) {
          check.errors.push(`${locale}/${pageId}: ${blockLabel} must be a mapping`);
          continue;
        }
        check.require(
          hasOnlyKeys(line, new Set(["text", "content"])),
          `${locale}/${pageId}: ${blockLabel} contains an unknown field (quote YAML text containing commas)`,
        );
        const hasText = typeof line.text === "string" && line.text.length > 0;
        const hasContent = Array.isArray(line.content) && line.content.length > 0;
        check.require(hasText !== hasContent, `${locale}/${pageId}: ${blockLabel} needs exactly one of text or content`);
        if (hasContent) {
          checkContentSegments(check, root, level, locale, line.content, `${locale}/${pageId}.content`, vocabularyCache);
          for (const segment of line.content) {
            if (typeof segment?.vocabulary?.id === "string") pageVocabularyIds.add(segment.vocabulary.id);
          }
        }
        if (unitLanguage !== null) {
          const sentences = splitSentences(lineText(line), unitLanguage);
          pageUnits += countUnits(lineText(line), unitLanguage);
          pageSentences += sentences.length;
          if (isMapping(languageRules) && Number.isInteger(languageRules.units_per_sentence_max)) {
            for (const sentence of sentences) {
              const sentenceUnits = countUnits(sentence, unitLanguage);
              check.require(sentenceUnits <= languageRules.units_per_sentence_max, `${locale}/${pageId}: sentence unit count ${sentenceUnits} exceeds level ${level} maximum ${languageRules.units_per_sentence_max}`);
            }
          }
        }
      }
      totalUnits += pageUnits;
      if (isMapping(languageRules) && Number.isInteger(languageRules.units_per_page_max)) {
        check.require(pageUnits <= languageRules.units_per_page_max, `${locale}/${pageId}: unit count ${pageUnits} exceeds level ${level} maximum ${languageRules.units_per_page_max}`);
      }
      if (isMapping(languageRules) && Number.isInteger(languageRules.sentences_per_page_max)) {
        check.require(pageSentences <= languageRules.sentences_per_page_max, `${locale}/${pageId}: sentence count ${pageSentences} exceeds level ${level} maximum ${languageRules.sentences_per_page_max}`);
      }
      if (isMapping(languageRules) && Number.isInteger(languageRules.new_words_per_page_max)) {
        check.require(pageVocabularyIds.size <= languageRules.new_words_per_page_max, `${locale}/${pageId}: target vocabulary count ${pageVocabularyIds.size} exceeds level ${level} maximum ${languageRules.new_words_per_page_max}`);
      }
      check.require(!Object.hasOwn(page, "vocabulary"), `${locale}/${pageId}: vocabulary must be marked inline in content`);
    }
    if (isMapping(languageRules)) {
      if (Number.isInteger(languageRules.units_total_min)) check.require(totalUnits >= languageRules.units_total_min, `${locale}: total unit count ${totalUnits} is below level ${level} minimum ${languageRules.units_total_min}`);
      if (Number.isInteger(languageRules.units_total_max)) check.require(totalUnits <= languageRules.units_total_max, `${locale}: total unit count ${totalUnits} exceeds level ${level} maximum ${languageRules.units_total_max}`);
    }
    check.require(new Set(pageIds).size === pageIds.length, `${locale}: page ids must be unique`);

    if (canonicalPageIds === null) canonicalPageIds = pageIds;
    else check.require(JSON.stringify(pageIds) === JSON.stringify(canonicalPageIds), `${locale}: page order differs from other locales`);
    const pageLayout = pages.filter(isMapping).map((page) => [page.id, page.illustration]);
    if (canonicalPageLayout === null) canonicalPageLayout = pageLayout;
    else check.require(JSON.stringify(pageLayout) === JSON.stringify(canonicalPageLayout), `${locale}: page IDs and illustrations must exactly match other locales`);

    if (isMapping(levelRules) && workType.includes("reading") && isMapping(levelRules.pages)) {
      const { min, max } = levelRules.pages;
      if (Number.isInteger(min) && Number.isInteger(max)) check.require(min <= pages.length && pages.length <= max, `${locale}: page count ${pages.length} is outside ${min}..${max}`);
    }

    const chapters = Array.isArray(story.chapters) ? story.chapters : [];
    check.require(chapters.length > 0, `${locale}: chapters must not be empty`);
    const chapterIds = [];
    const chapterPageIds = [];
    for (const chapter of chapters) {
      if (!isMapping(chapter)) {
        check.errors.push(`${locale}: chapter must be a mapping`);
        continue;
      }
      const chapterId = requiredString(check, chapter, "id", `${locale}.chapter`);
      check.require(
        hasOnlyKeys(chapter, new Set(["id", "title", "page_refs"])),
        `${locale}/chapter/${chapterId ?? "<unknown>"}: chapter contains an unknown field (quote YAML titles containing colons)`,
      );
      if (chapterId !== null) chapterIds.push(chapterId);
      requiredString(check, chapter, "title", `${locale}.chapter.${chapterId ?? "<unknown>"}`);
      const refs = stringList(check, chapter.page_refs, `${locale}.chapter.${chapterId ?? "<unknown>"}.page_refs`);
      chapterPageIds.push(...refs);
      for (const pageRef of refs) check.require(pageIds.includes(pageRef), `${locale}.chapter.${chapterId}: unknown page_ref ${pageRef}`);
    }
    check.require(new Set(chapterIds).size === chapterIds.length, `${locale}: chapter ids must be unique`);
    check.require(JSON.stringify(chapterPageIds) === JSON.stringify(pageIds), `${locale}: chapters must cover every page exactly once and in order`);
    const chapterCoverage = chapters.filter(isMapping).map((chapter) => [chapter.id, Array.isArray(chapter.page_refs) ? chapter.page_refs : []]);
    if (canonicalChapterCoverage === null) canonicalChapterCoverage = chapterCoverage;
    else check.require(JSON.stringify(chapterCoverage) === JSON.stringify(canonicalChapterCoverage), `${locale}: chapter IDs and page coverage must exactly match other locales`);

    const questions = Array.isArray(story.questions) ? story.questions : [];
    if (isMapping(levelRules) && isMapping(levelRules.questions)) {
      const { min, max } = levelRules.questions;
      if (Number.isInteger(min) && Number.isInteger(max)) check.require(min <= questions.length && questions.length <= max, `${locale}: question count ${questions.length} is outside ${min}..${max}`);
    }
    const presentQuestionTypes = new Set();
    for (const question of questions) {
      if (!isMapping(question)) {
        check.errors.push(`${locale}: question must be a mapping`);
        continue;
      }
      const questionId = question.id ?? "<unknown>";
      check.require(
        hasOnlyKeys(question, new Set(["id", "type", "prompt", "answer", "page_refs"])),
        `${locale}/${questionId}: question contains an unknown field (quote YAML text containing commas)`,
      );
      requiredString(check, question, "id", `${locale}.question`);
      const questionType = requiredString(check, question, "type", `${locale}.question.${questionId}`);
      if (questionType !== null) presentQuestionTypes.add(questionType);
      const allowedQuestionTypes = isMapping(levelRules?.questions) && Array.isArray(levelRules.questions.types) ? levelRules.questions.types : [];
      if (questionType !== null && allowedQuestionTypes.length > 0) {
        check.require(allowedQuestionTypes.includes(questionType), `${locale}/${questionId}: question type ${questionType} is not allowed at level ${level}`);
      }
      requiredString(check, question, "prompt", `${locale}.question.${questionId}`);
      requiredString(check, question, "answer", `${locale}.question.${questionId}`);
      check.require(!Object.hasOwn(question, "speaker"), `${locale}/${questionId}: question must not contain speaker`);
      const refs = stringList(check, question.page_refs, `${locale}/${questionId}.page_refs`);
      for (const pageRef of refs) check.require(pageIds.includes(pageRef), `${locale}/${questionId}: unknown page_ref ${pageRef}`);
    }
    const requiredQuestionTypes = isMapping(levelRules?.questions) && Array.isArray(levelRules.questions.required) ? levelRules.questions.required : [];
    for (const questionType of requiredQuestionTypes) check.require(presentQuestionTypes.has(questionType), `${locale}: level ${level} requires a ${questionType} question`);
  }

  if (sourceArticle !== null && Number.isInteger(sourceVolume)) {
    const seenSiblingPrompts = new Map();
    for (const siblingWork of pictureBookDirs(root)) {
      if (resolve(siblingWork) === resolve(work)) continue;
      const siblingBook = readYamlMappingQuietly(join(siblingWork, "book.yaml"));
      if (siblingBook?.source?.article !== sourceArticle) continue;
      const siblingLocales = Array.isArray(siblingBook.locales) ? siblingBook.locales : [];
      for (const siblingLocale of siblingLocales) {
        const siblingStory = readYamlMappingQuietly(join(siblingWork, "locales", siblingLocale, "story.yaml"));
        if (!Array.isArray(siblingStory?.questions)) continue;
        for (const siblingQuestion of siblingStory.questions) {
          const normalized = normalizedQuestionPrompt(siblingQuestion?.prompt);
          if (normalized) seenSiblingPrompts.set(`${siblingLocale}\0${normalized}`, { work: asPosix(relative(root, siblingWork)), id: siblingQuestion?.id ?? "<unknown>" });
        }
      }
    }
    for (const locale of locales) {
      const story = readYamlMappingQuietly(join(localeDir, locale, "story.yaml"));
      if (!Array.isArray(story?.questions)) continue;
      for (const question of story.questions) {
        const normalized = normalizedQuestionPrompt(question?.prompt);
        const duplicate = normalized ? seenSiblingPrompts.get(`${locale}\0${normalized}`) : null;
        if (duplicate) check.errors.push(`${locale}/${question?.id ?? "<unknown>"}: question prompt duplicates another volume from article ${sourceArticle}: ${duplicate.work}/${duplicate.id} (compared after removing whitespace and punctuation)`);
      }
    }
  }

  const declaredPageAssets = new Set([...assetById.keys()].filter((assetId) => assetId !== "cover"));
  check.require(sameSet(usedIllustrations, declaredPageAssets), "page illustrations and non-cover artwork assets must match exactly");
  return { work, errors: check.errors };
}

function usage() {
  console.error(`HaiLibrary deterministic work validator

Usage:
  hailibrary-check-work <works/articles/<id>>
  hailibrary-check-work <works/series/<series-id>>
  hailibrary-check-work <works/series/<series-id>/<article-id>>
  hailibrary-check-work <works/<level>/<category>/<subcategory>/<slug>>

Arguments:
  work    A work directory, absolute or relative to the repository root.
          It must resolve to a standalone article, series, series article, or four-segment picture book below works/.

Options:
  -h, --help    Show this help without validating a work.

Exit status:
  0    Validation passed, or help was shown.
  1    The work failed validation.
  2    Command usage was invalid.

Example:
  npx --no-install hailibrary-check-work works/articles/the-helper-we-built
  npx --no-install hailibrary-check-work works/series/grimms-fairy-tales/rapunzel
  npx --no-install hailibrary-check-work works/a/fiction/animals/the-lost-kite`);
}

const args = process.argv.slice(2);
if (args.length !== 1 || args[0] === "-h" || args[0] === "--help") {
  usage();
  process.exit(args.length === 1 ? 0 : 2);
}

try {
  const { work, errors } = checkWork(args[0]);
  if (errors.length) {
    console.error(`FAIL ${work}`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(`PASS ${work}`);
} catch (error) {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
