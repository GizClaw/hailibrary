#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import process from "node:process";
import YAML from "yaml";

const MEDIA_SUFFIXES = new Set([".webp", ".mp3", ".m4a", ".ogg", ".wav", ".mp4", ".webm"]);
const TYPE_PART = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const asPosix = (value) => value.split(sep).join("/");
const isMapping = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const sameSet = (left, right) => left.size === right.size && [...left].every((value) => right.has(value));
const hasOnlyKeys = (value, allowed) => Object.keys(value).every((key) => allowed.has(key));

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
      const value = YAML.parse(readFileSync(path, "utf8"));
      if (!isMapping(value)) {
        this.errors.push(`expected YAML mapping: ${asPosix(relative(this.root, path))}`);
        return {};
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

function lineText(line) {
  if (typeof line.text === "string") return line.text;
  if (!Array.isArray(line.content)) return "";
  return line.content.map((segment) => segment?.text ?? segment?.vocabulary?.text ?? "").join("");
}

function countUnits(text, unitLanguage) {
  if (unitLanguage === "zh") return text.match(/\p{Script=Han}/gu)?.length ?? 0;
  return text.trim() === "" ? 0 : text.trim().split(/\s+/u).length;
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
      check.require(isMapping(entry.locales) && Object.keys(entry.locales).length > 0, `${level}/${vocabularyId}.locales must be a mapping`);
    }
    const entry = vocabularyCache.get(cacheKey);
    const locales = isMapping(entry.locales) ? entry.locales : {};
    const localized = locales[locale];
    if (!check.require(isMapping(localized), `${level}/${vocabularyId}: missing locale ${locale}`)) return;
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

function checkWork(workArgument) {
  const root = findRoot(resolve(process.cwd()));
  const work = isAbsolute(workArgument) ? resolve(workArgument) : resolve(root, workArgument);
  const check = new Check(root);
  const relativeWork = relative(join(root, "works"), work);
  if (relativeWork.startsWith("..") || isAbsolute(relativeWork)) return { work, errors: ["work must be inside works/"] };
  const parts = relativeWork.split(sep);
  if (parts.length !== 4) return { work, errors: ["work path must be works/<level>/<category>/<subcategory>/<slug>/"] };

  const [level, , , slug] = parts;
  check.require(existsSync(work) && statSync(work).isDirectory(), `missing work directory: ${work}`);
  const book = check.yamlMapping(join(work, "book.yaml"));
  const artwork = check.yamlMapping(join(work, "artwork.yaml"));
  check.yamlMapping(join(work, "research.yaml"));
  const levels = check.yamlMapping(join(root, "prompts", "levels", "levels.yaml"));
  const vocabularyIndex = check.yamlMapping(join(root, "prompts", "vocabulary", "index.yaml"));
  const vocabularyRanges = check.yamlMapping(join(root, "prompts", "vocabulary", "ranges.yaml"));
  const labelIndex = check.yamlMapping(join(root, "prompts", "labels", "index.yaml"));

  check.require(book.schema_version === 1, "book.schema_version must be 1");
  check.require(artwork.schema_version === 1, "artwork.schema_version must be 1");
  checkVocabularyData(check, root, vocabularyIndex);
  check.require(vocabularyRanges.schema_version === 1, "vocabulary ranges schema_version must be 1");
  check.require(labelIndex.schema_version === 1, "label index schema_version must be 1");
  check.require(book.id === slug, `book id must match directory slug: ${slug}`);
  const workType = typePath(check, book.type, "book.type");
  const levelRules = isMapping(levels.levels) ? levels.levels[level] : undefined;
  check.require(isMapping(levelRules), `unknown reading level: ${level}`);

  const styleId = book.style;
  if (check.require(typeof styleId === "string" && styleId.length > 0, "book.style must be a string")) {
    const styleDir = join(root, "prompts", "styles", styleId);
    const style = check.yamlMapping(join(styleDir, "prompt.yaml"));
    check.require(style.schema_version === 1, `Style schema_version must be 1: ${styleId}`);
    check.require(style.id === styleId, `Style id does not match: ${styleId}`);
    const thumbnail = style.thumbnail ?? "thumbnail.webp";
    if (check.require(typeof thumbnail === "string", `Style thumbnail must be a path: ${styleId}`)) check.resource(join(styleDir, thumbnail), `Style thumbnail for ${styleId}`);
  }

  const characters = Array.isArray(book.characters) ? book.characters : [];
  check.require(characters.length > 0, "book.characters must not be empty");
  const characterIds = characters.filter(isMapping).map((item) => item.id);
  check.require(characterIds.length === characters.length && characterIds.every((item) => typeof item === "string" && item.length > 0), "every character must have a string id");
  check.require(new Set(characterIds).size === characterIds.length, "character ids must be unique");

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
    if (check.require(typeof asset.file === "string", `artwork ${asset.id} must declare file`)) check.resource(join(work, asset.file), `artwork ${asset.id}`);
    check.require(typeof asset.scene === "string" && asset.scene.length > 0, `artwork ${asset.id} needs a scene`);
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
  const usedIllustrations = new Set();
  const vocabularyCache = new Map();
  for (const locale of locales) {
    const localeVocabularyRanges = vocabularyRanges[locale];
    check.require(isMapping(localeVocabularyRanges) && isMapping(localeVocabularyRanges.ranges?.[level]), `${locale}: vocabulary range is missing for level ${level}`);
    const story = check.yamlMapping(join(localeDir, locale, "story.yaml"));
    check.require(story.language === locale, `story.language must be ${locale}`);
    const writerId = story.writer;
    if (check.require(typeof writerId === "string" && writerId.length > 0, `${locale}: writer must be a string`)) {
      const writerDir = join(root, "prompts", "writers", locale, writerId);
      const writer = check.yamlMapping(join(writerDir, "prompt.yaml"));
      check.require(writer.schema_version === 1, `${locale}: Writer schema_version must be 1`);
      check.require(writer.id === writerId, `${locale}: Writer id does not match: ${writerId}`);
      check.require(writer.locale === locale, `${locale}: Writer locale does not match`);
      const avatar = writer.avatar ?? "avatar.webp";
      if (check.require(typeof avatar === "string", `${locale}: Writer avatar must be a path`)) check.resource(join(writerDir, avatar), `Writer avatar for ${writerId}`);
    }
    check.require(story.schema_version === 1, `${locale}: story.schema_version must be 1`);
    requiredString(check, story, "title", locale);
    requiredString(check, story, "summary", locale);

    const cast = isMapping(story.cast) ? story.cast : {};
    check.require(Object.keys(cast).length > 0, `${locale}: cast must not be empty`);
    check.require(sameSet(new Set(Object.keys(cast)), new Set(characterIds)), `${locale}: cast must exactly match book.characters`);
    for (const [castId, castEntry] of Object.entries(cast)) {
      check.require(characterIds.includes(castId), `${locale}: cast id is not in book.characters: ${castId}`);
      if (!check.require(isMapping(castEntry), `${locale}: cast ${castId} must be a mapping`)) continue;
      requiredString(check, castEntry, "display_name", `${locale}.cast.${castId}`);
      const tts = castEntry.tts;
      if (!check.require(isMapping(tts), `${locale}: cast ${castId} needs TTS direction`)) continue;
      for (const field of ["delivery", "timbre", "pace", "pitch"]) requiredString(check, tts, field, `${locale}.cast.${castId}.tts`);
    }

    const pages = Array.isArray(story.pages) ? story.pages : [];
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
      check.require(typeof page.illustration === "string", `${locale}/${pageId}: illustration must be an id`);
      if (typeof page.illustration === "string") {
        check.require(assetById.has(page.illustration), `${locale}/${pageId}: missing artwork id ${page.illustration}`);
        usedIllustrations.add(page.illustration);
      }
      const lines = Array.isArray(page.lines) ? page.lines : [];
      let pageUnits = 0;
      check.require(lines.length > 0, `${locale}/${pageId}: lines must not be empty`);
      for (const line of lines) {
        if (!isMapping(line)) {
          check.errors.push(`${locale}/${pageId}: line must be a mapping`);
          continue;
        }
        check.require(
          hasOnlyKeys(line, new Set(["speaker", "text", "content"])),
          `${locale}/${pageId}: line contains an unknown field (quote YAML text containing commas)`,
        );
        check.require(Object.hasOwn(cast, line.speaker), `${locale}/${pageId}: unknown speaker ${JSON.stringify(line.speaker)}`);
        const hasText = typeof line.text === "string" && line.text.length > 0;
        const hasContent = Array.isArray(line.content) && line.content.length > 0;
        check.require(hasText !== hasContent, `${locale}/${pageId}: line needs exactly one of text or content`);
        if (hasContent) checkContentSegments(check, root, level, locale, line.content, `${locale}/${pageId}.content`, vocabularyCache);
        if (unitLanguage !== null) pageUnits += countUnits(lineText(line), unitLanguage);
      }
      totalUnits += pageUnits;
      if (isMapping(languageRules) && Number.isInteger(languageRules.units_per_page_max)) {
        check.require(pageUnits <= languageRules.units_per_page_max, `${locale}/${pageId}: unit count ${pageUnits} exceeds level ${level} maximum ${languageRules.units_per_page_max}`);
      }
      check.require(!Object.hasOwn(page, "vocabulary"), `${locale}/${pageId}: vocabulary must be marked inline in line.content`);
    }
    if (isMapping(languageRules)) {
      if (Number.isInteger(languageRules.units_total_min)) check.require(totalUnits >= languageRules.units_total_min, `${locale}: total unit count ${totalUnits} is below level ${level} minimum ${languageRules.units_total_min}`);
      if (Number.isInteger(languageRules.units_total_max)) check.require(totalUnits <= languageRules.units_total_max, `${locale}: total unit count ${totalUnits} exceeds level ${level} maximum ${languageRules.units_total_max}`);
    }
    check.require(new Set(pageIds).size === pageIds.length, `${locale}: page ids must be unique`);
    if (canonicalPageIds === null) canonicalPageIds = pageIds;
    else check.require(JSON.stringify(pageIds) === JSON.stringify(canonicalPageIds), `${locale}: page order differs from other locales`);

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
      if (chapterId !== null) chapterIds.push(chapterId);
      requiredString(check, chapter, "title", `${locale}.chapter.${chapterId ?? "<unknown>"}`);
      const refs = stringList(check, chapter.page_refs, `${locale}.chapter.${chapterId ?? "<unknown>"}.page_refs`);
      chapterPageIds.push(...refs);
      for (const pageRef of refs) check.require(pageIds.includes(pageRef), `${locale}.chapter.${chapterId}: unknown page_ref ${pageRef}`);
    }
    check.require(new Set(chapterIds).size === chapterIds.length, `${locale}: chapter ids must be unique`);
    check.require(JSON.stringify(chapterPageIds) === JSON.stringify(pageIds), `${locale}: chapters must cover every page exactly once and in order`);

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
        hasOnlyKeys(question, new Set(["id", "type", "speaker", "prompt", "choices", "answer", "page_refs"])),
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
      check.require(Object.hasOwn(cast, question.speaker), `${locale}/${questionId}: question speaker is not in cast`);
      const refs = stringList(check, question.page_refs, `${locale}/${questionId}.page_refs`);
      for (const pageRef of refs) check.require(pageIds.includes(pageRef), `${locale}/${questionId}: unknown page_ref ${pageRef}`);
    }
    const requiredQuestionTypes = isMapping(levelRules?.questions) && Array.isArray(levelRules.questions.required) ? levelRules.questions.required : [];
    for (const questionType of requiredQuestionTypes) check.require(presentQuestionTypes.has(questionType), `${locale}: level ${level} requires a ${questionType} question`);
  }

  const declaredPageAssets = new Set([...assetById.keys()].filter((assetId) => assetId !== "cover"));
  check.require(sameSet(usedIllustrations, declaredPageAssets), "page illustrations and non-cover artwork assets must match exactly");
  return { work, errors: check.errors };
}

function usage() {
  console.error(`HaiLibrary deterministic work validator

Usage:
  hailibrary-check-work <works/<level>/<category>/<subcategory>/<slug>>

Arguments:
  work    A work directory, absolute or relative to the repository root.
          It must resolve to exactly four segments below works/.

Options:
  -h, --help    Show this help without validating a work.

Exit status:
  0    Validation passed, or help was shown.
  1    The work failed validation.
  2    Command usage was invalid.

Example:
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
