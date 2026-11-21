import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { compileSubjects } from "../src/subjects.ts";
import type { SubjectAlbum, SubjectWork } from "../src/subject-types.ts";

const source = fileURLToPath(new URL("../../../works/subjects", import.meta.url));

test("the subject catalog retains the four-language assignments, curated order and shared texts", async (t) => {
  const output = await mkdtemp(join(tmpdir(), "hailibrary-subjects-"));
  t.after(() => rm(output, { recursive: true, force: true }));
  const index = await compileSubjects(source, output);
  const read = async <T>(path: string) => JSON.parse(await readFile(join(output, path), "utf8")) as T;
  assert.deepEqual(index.subjects.map(({ title, language, menus }) => [title, language, menus.length]), [
    ["语文", "zh-CN", 4], ["英语", "en-US", 3], ["社会常识", "zh-CN", 4], ["自然科学知识", "zh-CN", 4],
  ]);
  const albums = index.subjects.flatMap((subject) => subject.menus.flatMap((menu) => menu.albums));
  assert.equal(albums.length, 154);
  assert.equal(albums.reduce((sum, album) => sum + album.total, 0), 1635);
  assert.equal(albums.reduce((sum, album) => sum + album.readable, 0), 1154);
  const firstGrade = await read<SubjectAlbum>("albums/cn-pep-zh-r2022-1a.json");
  assert.deepEqual(firstGrade.positions.slice(0, 3).map(({ title }) => title), ["我是中国人", "我爱我们的祖国", "我是小学生"]);
  assert.ok(firstGrade.bibliography?.official?.url);
  assert.ok(firstGrade.positions.every((position) => position.unavailable === "textbook-edition" && !position.work));
  const positions = (await Promise.all(albums.map(({ id }) => read<SubjectAlbum>(`albums/${id}.json`)))).flatMap((album) => album.positions);
  const shared = positions.filter(({ source }) => source.id === "social-allusion-history-cao-chong-weighs-elephant");
  assert.ok(shared.length > 1);
  assert.equal(new Set(shared.map((entry) => entry.work)).size, 1);
  assert.equal(new Set(positions.flatMap(({ work }) => work ? [work] : [])).size, 1089);
  const english = await read<SubjectWork>("readings/english-open-r1-01.json");
  assert.equal(english.language, "en-US");
  assert.equal(english.rights, "cc0");
  assert.match(english.markdown, /Lin puts a red box on the table/);
  assert.doesNotMatch(english.markdown, /[\u3400-\u9fff]/);
});
