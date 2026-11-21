import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import YAML from "yaml";

import type { Citation, Subject, SubjectAlbum, SubjectIndex, SubjectMenu, SubjectWork } from "./subject-types.ts";

type SourceIndex = { subjects: Array<Omit<Subject, "menus"> & {
  menus: Array<Omit<SubjectMenu, "albums"> & { albums: string[] }>;
}> };

const tokenPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const token = (value: string) => typeof value === "string" && tokenPattern.test(value);
const citation = ({ title, url }: Citation) => Boolean(title?.trim()) && (!url || URL.canParse(url) && new URL(url).protocol === "https:");
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
  const bodies = new Map<string, string>();
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
      validate(!/^\s*<\/?(?:img|iframe|script)|!\[[^\]]*\]\(|\]\((?!https:\/\/)/im.test(markdown), `unexpected asset or non-HTTPS link in ${id}`);
      const hash = createHash("sha256").update(`${meta.language}\0${markdown}`).digest("hex");
      validate(!bodies.has(hash), `${id} duplicates the body of ${bodies.get(hash)}. Use a reference.`);
      bodies.set(hash, id);
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
        validate(!album.bibliography || album.bibliography.edition && (!album.bibliography.official || citation(album.bibliography.official)), `invalid edition for ${id}`);
        const positionIds = new Set<string>();
        let readable = 0;
        for (const position of album.positions) {
          validate(token(position.id) && !positionIds.has(position.id) && position.title && position.originalOrder && position.source?.path, `invalid position in ${id}`);
          positionIds.add(position.id);
          if (position.work) {
            const work = works.get(position.work);
            validate(work?.language === subject.language && !position.unavailable, `missing reading or incorrect language for ${id}/${position.id}`);
            referenced.add(position.work);
            readable++;
          } else {
            const bibliography = position.bibliography ?? album.bibliography;
            validate(position.unavailable === "textbook-edition" && bibliography?.edition && (!bibliography.official || citation(bibliography.official)), `missing reason or bibliography for ${id}/${position.id}`);
          }
        }
        await writeJson(`albums/${id}.json`, album);
        compiledMenu.albums.push({ id, title: album.title, total: album.positions.length, readable });
      }
      compiledSubject.menus.push(compiledMenu);
    }
    index.subjects.push(compiledSubject);
  }
  for (const [id, work] of works) {
    validate(referenced.has(id), `unreferenced reading ${id}`);
    await writeJson(`readings/${id}.json`, work);
  }
  await writeJson("index.json", index);
  return index;
}
