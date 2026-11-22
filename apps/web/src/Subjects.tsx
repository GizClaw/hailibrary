import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowSquareOut } from "@phosphor-icons/react";
import type { Bibliography, Citation, Position, ReadingEdition, SubjectAlbum, SubjectWork } from "../../../tools/catalog/src/subject-types";
import { loadSubjectAlbum, loadSubjects, loadSubjectWork } from "./catalog";
import { localeName } from "./i18n";
import { SafeMarkdown } from "./markdown";
import "./subjects.css";

const root = "#/subjects";
export const subjectsLabel = (locale: string) => locale === "zh-CN" ? "按科目阅读" : "Read by subject";
type Link = { href: string; title: string };

function useResource<T>(key: string | undefined, load: (key: string) => Promise<T>) {
  const [state, setState] = useState<{ key: string; data?: T; error?: boolean }>();
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    load(key).then(
      (data) => { if (!cancelled) setState({ key, data }); },
      () => { if (!cancelled) setState({ key, error: true }); },
    );
    return () => { cancelled = true; };
  }, [key, load]);
  return state?.key === key ? state : undefined;
}

function Crumbs({ links, zh }: { links: Link[]; zh: boolean }) {
  return <nav className="subject-crumbs" aria-label={zh ? "所在位置" : "Breadcrumb"}>
    <ol>{links.map(({ href, title }, index) => <li key={href}>
      {index > 0 && <span aria-hidden="true">/</span>}
      <a href={href} lang={index === 0 ? undefined : "zh-CN"}>{title}</a>
    </li>)}</ol>
  </nav>;
}

function SourceLink({ citation }: { citation: Citation }) {
  return citation.url ? <a className="subject-source" href={citation.url} rel="noreferrer" target="_blank">
    {citation.title} <ArrowSquareOut size={14} aria-hidden="true" />
  </a> : <>{citation.title}</>;
}

const editionLabels: Record<ReadingEdition, [string, string]> = {
  "matching-text": ["正文与教材用字一致", "Text matches the listed textbook"],
  "classical-source": ["古籍原文", "Classical source text"],
  "original-excerpt": ["原作选读", "Original work excerpt"],
};

function EditionLabel({ edition, zh }: { edition: ReadingEdition; zh: boolean }) {
  return <>{editionLabels[edition][zh ? 0 : 1]}</>;
}

function EditionLinks({ entry }: { entry: Bibliography }) {
  return <>
    {entry.catalog && <SourceLink citation={entry.catalog} />}
    {entry.official && <SourceLink citation={entry.official} />}
  </>;
}

function AlbumHeader({ album, zh }: { album: SubjectAlbum; zh: boolean }) {
  return <header className="subject-heading">
    <h1 lang="zh-CN">{album.title}</h1>
    {album.description && <p lang="zh-CN">{album.description}</p>}
    {album.bibliography && <div className="subject-edition">
      <strong>{zh ? "教材版本" : "Textbook edition"}</strong>
      <p lang="zh-CN">{album.bibliography.edition}</p>
      <EditionLinks entry={album.bibliography} />
    </div>}
  </header>;
}

function AlbumContents({ album, zh, base, language }: { album: SubjectAlbum; zh: boolean; base: string; language: string }) {
  const readable = album.positions.filter((position) => position.work).length;
  return <>
    <AlbumHeader album={album} zh={zh} />
    <section className="subject-contents" aria-labelledby="subject-contents-title">
      <div className="subject-section-heading">
        <h2 id="subject-contents-title">{zh ? "篇目" : "Contents"}</h2>
        <span>{zh ? `${readable} / ${album.positions.length} 篇可读` : `${readable} of ${album.positions.length} available`}</span>
      </div>
      {readable < album.positions.length && <p className="subject-availability">{zh ? "其余篇目可按册次和页码查阅教材。" : "Find the remaining entries by edition and page number in the textbook."}</p>}
      <ol className="subject-positions">{album.positions.map((position) => <li key={position.id}>
          <div>
            {position.work
              ? <a href={`${base}/${position.id}`} lang={/[\u3400-\u9fff]/.test(position.title) ? "zh-CN" : "en-US"}>{position.title}</a>
              : <strong lang="zh-CN">{position.title}</strong>}
            {position.label && <small lang={language}>{position.label}</small>}
            {position.readingEdition && <small><EditionLabel edition={position.readingEdition} zh={zh} /></small>}
            {position.bibliography && <small lang="zh-CN">{position.bibliography.edition}{!position.work && <> · <EditionLinks entry={position.bibliography} /></>}</small>}
            {position.relatedReading && <small lang="zh-CN"><SourceLink citation={position.relatedReading} /></small>}
          </div>
          {!position.work && <span className="subject-reference">{zh ? "仅书目" : "Textbook reference"}</span>}
      </li>)}</ol>
    </section>
  </>;
}

function SubjectReading({ work, position, album, zh, base }: {
  work: SubjectWork; position: Position; album: SubjectAlbum; zh: boolean; base: string;
}) {
  const readable = album.positions.filter((item) => item.work);
  const index = readable.findIndex((item) => item.id === position.id);
  const previous = readable[index - 1];
  const next = readable[index + 1];
  const edition = position.bibliography ?? album.bibliography;
  const rights = {
    original: zh ? "HaiLibrary 原创" : "HaiLibrary original",
    "public-domain": zh ? "公版原文" : "Public-domain source text",
    cc0: "CC0 1.0",
  }[work.rights];
  return <>
    <article className="subject-reading" lang={work.language}>
      <header className="subject-heading">
        <p className="subject-reading-label" lang={zh ? "zh-CN" : "en-US"}>{localeName(work.language)} · {album.positions.indexOf(position) + 1} / {album.positions.length}{work.age && <> · <span lang="zh-CN">{work.age}</span></>}</p>
        <h1>{position.readingEdition ? position.title : work.title}</h1>
        <p>{work.author}</p>
        {position.readingEdition && <div className="subject-edition">
          <strong lang={zh ? "zh-CN" : "en-US"}><EditionLabel edition={position.readingEdition} zh={zh} /></strong>
          {edition && <p>{edition.edition}{position.label && <> · {position.label}</>}</p>}
        </div>}
      </header>
      <SafeMarkdown markdown={work.markdown} className={`series-prose subject-prose${work.rights === "public-domain" ? " subject-classic" : ""}`} />
    </article>
    <section className="subject-sources" aria-labelledby="subject-sources-title">
      <h2 id="subject-sources-title">{zh ? "来源与署名" : "Sources and credits"}</h2>
      <p>{rights}</p>
      {work.sources.length > 0 && <ul>{work.sources.map((citation, i) => <li key={i} lang={/[\u3400-\u9fff]/.test(citation.title) ? "zh-CN" : "en-US"}><SourceLink citation={citation} /></li>)}</ul>}
    </section>
    <nav className="chapter-pager subject-pager" aria-label={zh ? "同辑篇目" : "Read in this album"}>
      {previous ? <a href={`${base}/${previous.id}`}><small>{zh ? "上一篇" : "Previous"}</small><strong><ArrowLeft size={15} aria-hidden="true" />{previous.title}</strong></a> : <span />}
      {next ? <a className="next" href={`${base}/${next.id}`}><small>{zh ? "下一篇" : "Next"}</small><strong>{next.title}<ArrowRight size={15} aria-hidden="true" /></strong></a> : <span />}
    </nav>
  </>;
}

const fetchIndex = () => loadSubjects();

export function Subjects({ path, interfaceLocale }: { path: string; interfaceLocale: string }) {
  const zh = interfaceLocale === "zh-CN";
  const parts = path ? path.split("/") : [];
  const [subjectId, menuId, albumId, positionId] = parts;
  const index = useResource("index", fetchIndex);
  const subject = index?.data?.subjects.find((item) => item.id === subjectId);
  const menu = subject?.menus.find((item) => item.id === menuId);
  const summary = menu?.albums.find((item) => item.id === albumId);
  const album = useResource(summary?.id, loadSubjectAlbum);
  const position = album?.data?.positions.find((item) => item.id === positionId);
  const reading = useResource(position?.work, loadSubjectWork);
  const subjectBase = `${root}/${subjectId}`;
  const menuBase = `${subjectBase}/${menuId}`;
  const albumBase = `${menuBase}/${albumId}`;
  const main = useRef<HTMLElement>(null);
  const initialPath = useRef(path);
  const invalid = Boolean(parts.length > 4 || parts.some((part) => !part) || (index?.data && subjectId && !subject) ||
    (subject && menuId && !menu) || (menu && albumId && !summary) ||
    (album?.data && positionId && !position?.work));
  const failed = index?.error || album?.error || reading?.error;
  const loading = !failed && !invalid && (!index?.data || (summary && !album?.data) || (position?.work && !reading?.data));
  const label = subjectsLabel(interfaceLocale);
  const links: Link[] = [{ href: root, title: label }];
  if (subject && menuId) links.push({ href: subjectBase, title: subject.title });
  if (menu && albumId) links.push({ href: menuBase, title: menu.title });
  if (summary && positionId) links.push({ href: albumBase, title: summary.title });
  useEffect(() => { scrollTo({ top: 0, behavior: "instant" }); }, [path]);
  useEffect(() => {
    if (path === initialPath.current || loading) return;
    initialPath.current = path;
    main.current?.focus({ preventScroll: true });
  }, [path, loading]);

  const title = (position?.readingEdition ? position.title : reading?.data?.title) ?? summary?.title ?? menu?.title ?? subject?.title ?? label;
  useEffect(() => { document.title = `${title} | Hai! Library`; }, [title, interfaceLocale]);
  const readableCount = useMemo(() => menu?.albums.reduce((sum, album) => sum + album.readable, 0), [menu]);
  return <main className="subject-page" tabIndex={-1} ref={main}>
    {path && <Crumbs links={links} zh={zh} />}
    {failed ? <p role="alert">{zh ? "目录暂时无法加载。请刷新后重试。" : "Unable to load the catalog. Reload to try again."}</p>
      : invalid ? <p>{zh ? "找不到这个阅读入口。" : "This reading page could not be found."}</p>
      : loading ? <p role="status">{zh ? "正在加载…" : "Loading…"}</p>
      : reading?.data && position && album?.data ? <SubjectReading work={reading.data} position={position} album={album.data} zh={zh} base={albumBase} />
      : album?.data && subject ? <AlbumContents album={album.data} zh={zh} base={albumBase} language={subject.language} />
      : menu && subject ? <>
        <header className="subject-heading"><h1 lang="zh-CN">{menu.title}</h1><p>{!zh && <>{menu.en} · </>}{zh ? `${menu.albums.length} 辑 · ${readableCount} 篇可读` : `${menu.albums.length} albums · ${readableCount} available readings`}</p></header>
        <ul className="subject-grid">{menu.albums.map((album) => <li key={album.id}>
          <a href={`${menuBase}/${album.id}`}><strong lang="zh-CN">{album.title}</strong><small>{zh ? `${album.readable} / ${album.total} 篇可读` : `${album.readable} of ${album.total} available`}</small><ArrowRight size={18} aria-hidden="true" /></a>
        </li>)}</ul>
      </> : subject ? <>
        <header className="subject-heading"><h1 lang="zh-CN">{subject.title}</h1><p>{!zh && <>{subject.en} · </>}{zh ? "正文语言" : "Reading language"} · {localeName(subject.language)}</p></header>
        <ul className="subject-grid">{subject.menus.map((menu) => <li key={menu.id}>
          <a href={`${subjectBase}/${menu.id}`}><strong lang="zh-CN">{menu.title}</strong><small>{!zh && <>{menu.en} · </>}{zh ? `${menu.albums.length} 辑` : `${menu.albums.length} albums`}</small><ArrowRight size={18} aria-hidden="true" /></a>
        </li>)}</ul>
      </> : <>
        <header className="subject-heading"><h1>{label}</h1><p>{zh ? "选一门科目，再按栏目和专辑找想读的篇目。" : "Choose a subject, then browse its topics and albums."}</p></header>
        <ul className="subject-grid">{index?.data?.subjects.map((subject) => <li key={subject.id}>
          <a href={`${root}/${subject.id}`}><strong lang="zh-CN">{subject.title}</strong><small>{!zh && <>{subject.en} · </>}{localeName(subject.language)}</small><ArrowRight size={18} aria-hidden="true" /></a>
        </li>)}</ul>
      </>}
  </main>;
}
