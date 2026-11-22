import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import YAML from "yaml";

import type { Bibliography, Citation, ReadingText, Subject, SubjectAlbum, SubjectIndex, SubjectMenu, SubjectWork } from "./subject-types.ts";

type EnglishEdition = { albums: Record<string, string>; works: Record<string, ReadingText> };

type SourceIndex = { subjects: Array<Omit<Subject, "menus"> & {
  menus: Array<Omit<SubjectMenu, "albums"> & { albums: string[] }>;
}> };

const tokenPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const token = (value: string) => typeof value === "string" && tokenPattern.test(value);
const citation = ({ title, url }: Citation) => Boolean(title?.trim()) && (!url || URL.canParse(url) && new URL(url).protocol === "https:");
const bibliographyIsValid = (entry: Bibliography) => Boolean(entry.edition?.trim()) &&
  (!entry.official || citation(entry.official)) &&
  (!entry.catalog || Boolean(entry.catalog.url) && citation(entry.catalog));
const readJson = async <T>(path: string) => JSON.parse(await readFile(path, "utf8")) as T;

function validate(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`Subject catalog: ${message}`);
}

export async function compileSubjects(sourceDir: string, outputDir: string) {
  const writeJson = async (path: string, data: unknown) => {
    const filename = join(outputDir, path);
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, `${JSON.stringify(data)}\n`);
  };
  const source = await readJson<SourceIndex>(join(sourceDir, "index.json"));
  const works = new Map<string, SubjectWork>();
  const englishReadings = new Map<string, ReadingText>();
  const bodies = new Map<string, string>();
  const validateBody = (id: string, language: SubjectWork["language"], markdown: string) => {
    validate(!/^\s*<\/?(?:img|iframe|script)|!\[[^\]]*\]\(|\]\((?!https:\/\/)/im.test(markdown), `unexpected asset or non-HTTPS link in ${id}`);
    const hash = createHash("sha256").update(`${language}\0${markdown}`).digest("hex");
    validate(!bodies.has(hash), `${id} duplicates the body of ${bodies.get(hash)}. Use a reference.`);
    bodies.set(hash, id);
  };
  for (const file of await readdir(join(sourceDir, "readings"))) {
    if (!file.endsWith(".md")) continue;
    const contents = await readFile(join(sourceDir, "readings", file), "utf8");
    // Group sources by their owning album. Each unique reading becomes its own small payload.
    const sections = [...contents.matchAll(/^<!-- reading: ([a-z0-9.-]+) -->\r?\n([\s\S]*?)(?=^<!-- reading: |$(?![\s\S]))/gm)];
    validate(sections.length && sections.map((section) => section[0]).join("") === contents, `invalid reading separators in ${file}`);
    for (const [, id, section] of sections) {
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/.exec(section);
      validate(frontmatter && token(id) && !works.has(id), `invalid or duplicate reading ${id}`);
      const meta = YAML.parse(frontmatter[1]) as Omit<SubjectWork, "id" | "markdown">;
      const markdown = frontmatter[2].trim();
      validate(meta.title?.trim() && meta.author?.trim() && markdown, `empty title, author or body for ${id}`);
      validate(meta.language === "zh-CN" || meta.language === "en-US", `unsupported language for ${id}`);
      validate(["original", "public-domain", "cc0"].includes(meta.rights), `missing publication basis for ${id}`);
      validate(Array.isArray(meta.sources) && meta.sources.every(citation), `invalid citation for ${id}`);
      validate(meta.rights !== "public-domain" || meta.sources.length > 0, `missing edition citation for ${id}`);
      validate(meta.rights !== "cc0" || meta.sources.some((entry) => entry.url === "https://creativecommons.org/publicdomain/zero/1.0/"), `missing CC0 link for ${id}`);
      validateBody(id, meta.language, markdown);
      works.set(id, { ...meta, id, markdown });
    }
  }
  const index: SubjectIndex = { schemaVersion: 1, subjects: [] };
  const referenced = new Set<string>();
  const albumIds = new Set<string>();
  const subjectIds = new Set<string>();
  for (const { menus, ...subject } of source.subjects) {
    validate(token(subject.id) && !subjectIds.has(subject.id) && subject.title && subject.en, `invalid subject ${subject.id}`);
    validate(subject.language === "zh-CN" || subject.language === "en-US", `invalid subject language for ${subject.id}`);
    if (subject.availableLocales !== undefined) {
      validate(subject.language === "zh-CN" && Array.isArray(subject.availableLocales) && subject.availableLocales.length === 2 &&
        subject.availableLocales[0] === "zh-CN" && subject.availableLocales[1] === "en-US", `invalid edition locales for ${subject.id}`);
    }
    const englishEdition = subject.availableLocales && await readJson<EnglishEdition>(join(sourceDir, `${subject.id}.en-US.json`));
    if (subject.availableLocales) validate(englishEdition && englishEdition.albums && englishEdition.works, `missing English edition for ${subject.id}`);
    const localizedAlbums = new Set<string>();
    const localizedWorks = new Set<string>();
    subjectIds.add(subject.id);
    const compiledSubject: Subject = { ...subject, menus: [] };
    const menuIds = new Set<string>();
    for (const { albums, ...menu } of menus) {
      validate(token(menu.id) && !menuIds.has(menu.id) && menu.title && menu.en, `invalid menu ${menu.id}`);
      menuIds.add(menu.id);
      const compiledMenu: SubjectMenu = { ...menu, albums: [] };
      for (const id of albums) {
        validate(token(id) && !albumIds.has(id), `invalid or duplicate album ${id}`);
        albumIds.add(id);
        const album = await readJson<SubjectAlbum>(join(sourceDir, "albums", `${id}.json`));
        validate(album.id === id && album.title && album.source && album.positions.length, `invalid album ${id}`);
        if (englishEdition) {
          const title = englishEdition.albums[id];
          validate(typeof title === "string" && title.trim() && title !== album.title, `missing English album title for ${id}`);
          album.englishTitle = title;
          localizedAlbums.add(id);
        }
        validate(!album.bibliography || bibliographyIsValid(album.bibliography), `invalid edition for ${id}`);
        const positionIds = new Set<string>();
        let readable = 0;
        for (const position of album.positions) {
          validate(token(position.id) && !positionIds.has(position.id) && position.title && position.originalOrder && position.source?.path, `invalid position in ${id}`);
          validate(!position.bibliography || bibliographyIsValid(position.bibliography), `invalid edition for ${id}/${position.id}`);
          const bibliography = position.bibliography ?? album.bibliography;
          positionIds.add(position.id);
          if (position.work) {
            const work = works.get(position.work);
            validate(work?.language === subject.language && !position.unavailable, `missing reading or incorrect language for ${id}/${position.id}`);
            if (position.readingEdition) {
              validate(bibliography && work.rights === "public-domain" &&
                ["matching-text", "classical-source", "original-excerpt"].includes(position.readingEdition),
              `invalid textbook reading edition for ${id}/${position.id}`);
            }
            if (englishEdition) {
              const text = englishEdition.works[work.id];
              validate(typeof text?.title === "string" && text.title.trim() && text.title !== work.title &&
                typeof text.markdown === "string" && text.markdown.trim() && text.markdown.trim() !== work.markdown,
                `missing English reading for ${id}/${position.id}`);
              position.englishTitle = text.title;
              if (!localizedWorks.has(work.id)) {
                validate(!englishReadings.has(work.id), `duplicate English edition for ${work.id}`);
                validateBody(work.id, "en-US", text.markdown.trim());
                englishReadings.set(work.id, { title: text.title, markdown: text.markdown.trim() });
                localizedWorks.add(work.id);
              }
            }
            referenced.add(position.work);
            readable++;
          } else {
            validate(!englishEdition, `missing bilingual reading for ${id}/${position.id}`);
            validate(position.unavailable === "textbook-edition" && bibliography && !position.readingEdition, `missing reason or bibliography for ${id}/${position.id}`);
            validate(!position.relatedReading || position.relatedReading.url && citation(position.relatedReading), `invalid related reading for ${id}/${position.id}`);
          }
        }
        await writeJson(`albums/${id}.json`, album);
        compiledMenu.albums.push({ id, title: album.title, ...(album.englishTitle ? { englishTitle: album.englishTitle } : {}), total: album.positions.length, readable });
      }
      compiledSubject.menus.push(compiledMenu);
    }
    if (englishEdition) {
      validate(Object.keys(englishEdition.albums).every((id) => localizedAlbums.has(id)) &&
        Object.keys(englishEdition.works).every((id) => localizedWorks.has(id)), `unreferenced English edition entries for ${subject.id}`);
    }
    index.subjects.push(compiledSubject);
  }
  for (const [id, work] of works) {
    validate(referenced.has(id), `unreferenced reading ${id}`);
    await writeJson(`readings/${id}.json`, work);
  }
  for (const [id, text] of englishReadings) await writeJson(`readings/en-US/${id}.json`, text);
  await writeJson("index.json", index);
  return index;
}
