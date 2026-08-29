import DOMPurify from "dompurify";
import { marked } from "marked";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadBook, loadCatalogPageIndex, loadHome, loadIndex, loadLabels, loadSearch, loadStory, loadStyles, loadVocabulary, loadVocabularyCatalogPage, loadVocabularyPageIndex, loadWriters, searchCards, sortReadingLevels, storyArticlePages, storyAudioPages, storyCast, storyPageBlocks, type Book, type BookCard, type CatalogPageIndex, type CatalogTaxonomy, type HomePageData, type LabelCatalog, type SiteIndex, type Story, type StoryBlock, type StoryContentPart, type StoryPage, type StyleProfile, type StyleSummary, type TaxonomyGroup, type VocabularyCatalogCard, type VocabularyEntry, type VocabularyPageIndex, type WriterProfile } from "./catalog";
import { brandName, localeName, ui } from "./i18n";
import { exportProgress, importProgress, readProgress, savePage, saveQuizAnswer, updateSettings, type ReadingProgress } from "./progress";
import { usesArticleLayout } from "./reading-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, ArrowsLeftRight as ArrowRightLeft, ArrowSquareOut as ExternalLink, BookOpen, CheckCircle as CircleCheck, DownloadSimple as Download, MagnifyingGlass as Search, Palette, Printer, SlidersHorizontal, Sparkle as Sparkles, UploadSimple as Upload, UserCircle as UserRound, X } from "@phosphor-icons/react";

type Route = { page: "library" | "catalog" | "writers" | "styles" | "vocabulary" | "reader" | "print" | "progress" | "about"; path?: string; locale?: string };

function routeFromHash(): Route {
  const raw = location.hash.slice(1) || "/";
  if (raw.startsWith("/read/")) {
    const [path, search = ""] = raw.slice(6).split("?");
    return { page: "reader", path, locale: new URLSearchParams(search).get("lang") ?? undefined };
  }
  if (raw.startsWith("/print/")) {
    const [path, search = ""] = raw.slice(7).split("?");
    return { page: "print", path, locale: new URLSearchParams(search).get("lang") ?? undefined };
  }
  if (raw.startsWith("/catalog")) return { page: "catalog" };
  if (raw.startsWith("/writers")) return { page: "writers" };
  if (raw.startsWith("/styles")) return { page: "styles" };
  if (raw.startsWith("/vocabulary")) return { page: "vocabulary" };
  if (raw.startsWith("/progress")) return { page: "progress" };
  if (raw.startsWith("/about")) return { page: "about" };
  return { page: "library" };
}

function catalogParam(name: string) {
  const [, search = ""] = location.hash.slice(1).split("?");
  return new URLSearchParams(search).get(name);
}

export function App() {
  const initial = readProgress();
  const [route, setRoute] = useState(routeFromHash);
  const [index, setIndex] = useState<SiteIndex | null>(null);
  const [interfaceLocale, setInterfaceLocale] = useState(initial.settings.interfaceLocale);
  const [learningLocale, setLearningLocale] = useState(initial.settings.learningLocale);

  useEffect(() => { loadIndex().then(setIndex); }, []);
  useEffect(() => { const onHash = () => setRoute(routeFromHash()); addEventListener("hashchange", onHash); return () => removeEventListener("hashchange", onHash) }, []);
  const setInterface = (value: string) => { setInterfaceLocale(value); updateSettings({ interfaceLocale: value }) };
  const setLearning = (value: string) => { setLearningLocale(value); updateSettings({ learningLocale: value }) };
  const swap = () => { const nextInterface = learningLocale; const nextLearning = interfaceLocale; setInterfaceLocale(nextInterface); setLearningLocale(nextLearning); updateSettings({ interfaceLocale: nextInterface, learningLocale: nextLearning }) };
  const locales = index?.locales ?? ["en-US", "zh-CN"];
  const text = ui(interfaceLocale);
  const siteName = brandName(interfaceLocale);
  useEffect(() => { document.title = siteName }, [siteName]);

  return <div className="site-shell">
    {route.page !== "reader" && route.page !== "print" && <Header route={route} locales={locales} interfaceLocale={interfaceLocale} learningLocale={learningLocale} setInterface={setInterface} setLearning={setLearning} swap={swap} />}
    {route.page === "library" && <Library interfaceLocale={interfaceLocale} learningLocale={learningLocale} />}
    {route.page === "catalog" && <Catalog interfaceLocale={interfaceLocale} learningLocale={learningLocale} />}
    {route.page === "writers" && <WritersPage interfaceLocale={interfaceLocale} learningLocale={learningLocale} />}
    {route.page === "styles" && <StylesPage interfaceLocale={interfaceLocale} />}
    {route.page === "vocabulary" && <VocabularyPage interfaceLocale={interfaceLocale} learningLocale={learningLocale} />}
    {route.page === "reader" && route.path && <Reader path={route.path} locale={route.locale ?? learningLocale} interfaceLocale={interfaceLocale} />}
    {route.page === "print" && route.path && <PrintBook path={route.path} locale={route.locale ?? learningLocale} />}
    {route.page === "progress" && <Progress />}
    {route.page === "about" && <About locale={interfaceLocale} />}
    {route.page !== "reader" && route.page !== "print" && <footer><a className="brand" href="#/"><span><Sparkles size={17} weight="fill" aria-hidden="true" /></span><BrandText locale={interfaceLocale} /></a><div className="footer-copy"><span>{text.eyebrow}</span><span className="footer-ai">{text.aiGenerated}</span></div><a className="footer-link" href="https://haivivi.com" target="_blank" rel="noreferrer">haivivi.com <ExternalLink size={14} aria-hidden="true" /></a><a className="footer-link" href="#/about">{text.about}<ArrowRight size={15} aria-hidden="true" /></a></footer>}
  </div>;
}

function Header({ route, locales, interfaceLocale, learningLocale, setInterface, setLearning, swap }: { route: Route; locales: string[]; interfaceLocale: string; learningLocale: string; setInterface: (v: string) => void; setLearning: (v: string) => void; swap: () => void }) {
  const text = ui(interfaceLocale);
  return <header className="site-header">
    <a className="brand" href="#/" aria-label={brandName(interfaceLocale)}><span><Sparkles size={20} weight="fill" aria-hidden="true" /></span><BrandText locale={interfaceLocale} /></a>
    <nav><a className={route.page === "catalog" ? "active" : ""} href="#/catalog">{text.library}</a><a className={route.page === "vocabulary" ? "active" : ""} href="#/vocabulary">{interfaceLocale === "zh-CN" ? "词汇表" : "Vocabulary"}</a><a className={route.page === "writers" ? "active" : ""} href="#/writers">{interfaceLocale === "zh-CN" ? "作家" : "Writers"}</a><a className={route.page === "styles" ? "active" : ""} href="#/styles">Styles</a><a className={route.page === "progress" ? "active" : ""} href="#/progress">{text.progress}</a><a className={route.page === "about" ? "active" : ""} href="#/about">{text.about}</a></nav>
    <div className="language-pair" aria-label="Language pair">
      <label><small>{text.speak}</small><Select value={interfaceLocale} onValueChange={setInterface}><SelectTrigger className="language-select"><SelectValue /></SelectTrigger><SelectContent>{locales.map((locale) => <SelectItem key={locale} value={locale}>{localeName(locale)}</SelectItem>)}</SelectContent></Select></label>
      <Button type="button" variant="secondary" size="icon" onClick={swap} aria-label="Swap language pair"><ArrowRightLeft size={18} aria-hidden="true" /></Button>
      <label className="learning"><small>{text.learn}</small><Select value={learningLocale} onValueChange={setLearning}><SelectTrigger className="language-select"><SelectValue /></SelectTrigger><SelectContent>{locales.map((locale) => <SelectItem key={locale} value={locale}>{localeName(locale)}</SelectItem>)}</SelectContent></Select></label>
    </div>
  </header>;
}

function Library({ interfaceLocale, learningLocale }: { interfaceLocale: string; learningLocale: string }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [writer, setWriter] = useState("all");
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [labelCatalog, setLabelCatalog] = useState<LabelCatalog | null>(null);
  const text = ui(interfaceLocale);
  useEffect(() => { loadHome(learningLocale).then(setHomeData); loadLabels().then(setLabelCatalog) }, [learningLocale]);
  const cards = homeData?.cards ?? [];
  const levels = useMemo(() => sortReadingLevels([...new Set(cards.map((card) => card.level))]), [cards]);
  const writers = useMemo(() => [...new Map(cards.map((card) => [card.writer.id, card.writer])).values()].sort((left, right) => left.displayName.localeCompare(right.displayName)), [cards]);
  const filtered = useMemo(() => searchCards(cards, query).filter((card) => (level === "all" || card.level === level) && (writer === "all" || card.writer.id === writer)), [cards, level, query, writer]);
  const hasFilters = query.length > 0 || level !== "all" || writer !== "all";
  const visibleCount = Math.min(filtered.length, 3);
  const cardSignature = filtered.map((card) => card.id).join("|");
  return <main>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">{text.eyebrow}</p><h1><BrandText locale={interfaceLocale} /></h1><p>{text.intro}<br />{text.intro2}</p><a className="primary-button" href="#library">{text.find}<ArrowRight size={17} aria-hidden="true" /></a></div><div className="hero-art" aria-hidden="true"><div className="sun" /><div className="book one">Aa</div><div className="book two">好</div><div className="language-card japanese"><strong>あ</strong><small>日本語</small></div><div className="language-card spanish"><strong>Ñ</strong><small>Español</small></div><div className="language-card french"><strong>É</strong><small>Français</small></div></div></section>
    <section className="library" id="library"><div className="section-heading library-heading"><div><p className="eyebrow">{text.browse}</p><h2>{text.fit}</h2><p className="section-intro">{interfaceLocale === "zh-CN" ? "从书名、主题或原创 Writer 开始，找到下一本刚刚好的读物。" : "Start with a title, topic, or original Writer and find your next just-right read."}</p></div><div className="catalog-summary"><strong>{homeData?.bookCount ?? 0}</strong><span>{interfaceLocale === "zh-CN" ? "本故事" : "stories"}</span><i /><strong>{homeData?.localeCount ?? 0}</strong><span>{interfaceLocale === "zh-CN" ? "种语言" : "languages"}</span></div></div>
      <div className="discovery-bar">
        <label className="search-field"><Search aria-hidden="true" size={22} /><span className="sr-only">{text.search}</span><Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && query.trim()) { event.preventDefault(); location.hash = `/catalog?q=${encodeURIComponent(query.trim())}` } }} placeholder={text.search} />{query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Clear search"><X size={17} /></button>}</label>
        <div className="filter-group"><SlidersHorizontal aria-hidden="true" size={17} /><label><span>{text.level}</span><Select value={level} onValueChange={setLevel}><SelectTrigger className="filter-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{text.all}</SelectItem>{levels.map((item) => <SelectItem key={item} value={item}>{item.toUpperCase()}</SelectItem>)}</SelectContent></Select></label><label><span>Writer</span><Select value={writer} onValueChange={setWriter}><SelectTrigger className="filter-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{text.all}</SelectItem>{writers.map((item) => <SelectItem key={item.id} value={item.id}>{item.displayName}</SelectItem>)}</SelectContent></Select></label></div>
      </div>
      <div className="results-row"><p>{filtered.length > visibleCount && <>{interfaceLocale === "zh-CN" ? "当前展示" : "Showing"} <strong>{visibleCount}</strong> / </>}<strong>{filtered.length}</strong> {interfaceLocale === "zh-CN" ? "个精选结果" : filtered.length === 1 ? "featured result" : "featured results"}<span> · {localeName(learningLocale)}</span></p><div>{hasFilters && <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setLevel("all"); setWriter("all") }}>{interfaceLocale === "zh-CN" ? "清除筛选" : "Clear filters"}</Button>}<Button asChild variant="outline" size="sm"><a href={query.trim() ? `#/catalog?q=${encodeURIComponent(query.trim())}` : "#/catalog"}>{query.trim() ? (interfaceLocale === "zh-CN" ? "搜索完整目录" : "Search full catalog") : (interfaceLocale === "zh-CN" ? "浏览完整目录" : "Browse full catalog")}<ArrowRight size={15} aria-hidden="true" /></a></Button></div></div>
      <div className="home-showcase">{homeData ? <HomeCardRotator key={`${learningLocale}-${cardSignature}`} cards={filtered} interfaceLocale={interfaceLocale} learningLocale={learningLocale} labelCatalog={labelCatalog} taxonomy={homeData.taxonomy} /> : <LoadingState locale={interfaceLocale} label={interfaceLocale === "zh-CN" ? "正在整理推荐书目…" : "Preparing featured books…"} />}
        <aside className="discovery-panel"><p className="eyebrow">{interfaceLocale === "zh-CN" ? "换一种发现方式" : "More ways to explore"}</p><h2>{interfaceLocale === "zh-CN" ? "不止是书架" : "Beyond the shelf"}</h2><p>{interfaceLocale === "zh-CN" ? "认识原创作家视角，或从不同的视觉语言出发寻找下一本书。" : "Meet the original Writer viewpoints, or start from a visual language that draws you in."}</p><a href="#/writers"><UserRound size={20} /><span><strong>{interfaceLocale === "zh-CN" ? "认识作家" : "Meet the Writers"}</strong><small>{interfaceLocale === "zh-CN" ? "按个性、价值与作品探索" : "Explore personalities, values, and works"}</small></span><ArrowRight size={17} aria-hidden="true" /></a><a href="#/styles"><Palette size={20} /><span><strong>{interfaceLocale === "zh-CN" ? "浏览视觉风格" : "Browse visual Styles"}</strong><small>{interfaceLocale === "zh-CN" ? "从水彩、拼贴到黏土场景" : "From watercolor and collage to clay"}</small></span><ArrowRight size={17} aria-hidden="true" /></a></aside></div>
    </section>
  </main>;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function LoadingState({ locale, label }: { locale: string; label?: string }) {
  return <div className="data-loading" role="status" aria-live="polite"><span aria-hidden="true"><Sparkles size={24} weight="fill" /></span><p>{label ?? (locale === "zh-CN" ? "正在加载内容…" : "Loading content…")}</p><div className="data-loading-bars" aria-hidden="true"><i /><i /><i /></div></div>;
}

function HomeCardRotator({ cards, interfaceLocale, learningLocale, labelCatalog, taxonomy }: { cards: BookCard[]; interfaceLocale: string; learningLocale: string; labelCatalog?: LabelCatalog | null; taxonomy?: CatalogTaxonomy }) {
  const slotCount = Math.min(cards.length, 3);
  const [rotation, setRotation] = useState(() => ({
    slots: Array.from({ length: slotCount }, (_, index) => ({ current: index, previous: null as number | null, revision: 0 })),
    cursor: 0,
    next: slotCount % Math.max(cards.length, 1),
  }));
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (cards.length <= 3 || paused || reducedMotion) return;
    const timer = window.setInterval(() => setRotation((current) => {
      const slots = current.slots.map((slot, index) => index === current.cursor
        ? { current: current.next, previous: slot.current, revision: slot.revision + 1 }
        : slot);
      return {
        slots,
        cursor: (current.cursor + 1) % slots.length,
        next: (current.next + 1) % cards.length,
      };
    }), 4800);
    return () => window.clearInterval(timer);
  }, [cards.length, paused, reducedMotion]);
  if (!cards.length) return <div className="empty"><h3>{interfaceLocale === "zh-CN" ? "没有找到相符的故事" : "No matching stories"}</h3><p>{interfaceLocale === "zh-CN" ? "试试书名、作家、主题，或者切换学习语言。" : "Try another title, Writer, topic, or learning language."}</p></div>;
  return <section className="home-book-grid home-card-rotator" aria-label={interfaceLocale === "zh-CN" ? "推荐故事" : "Featured stories"} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false) }}>{rotation.slots.map((slot, slotIndex) => <div className="home-card-slot" key={slotIndex}>{slot.previous !== null && <div className="home-card-layer" data-layer="previous" aria-hidden="true" key={`${slot.revision}-previous-${cards[slot.previous].id}`}><LibraryBookCard card={cards[slot.previous]} interfaceLocale={interfaceLocale} learningLocale={learningLocale} labelCatalog={labelCatalog} taxonomy={taxonomy} /></div>}<div className="home-card-layer" data-layer="current" key={`${slot.revision}-current-${cards[slot.current].id}`}><LibraryBookCard card={cards[slot.current]} interfaceLocale={interfaceLocale} learningLocale={learningLocale} labelCatalog={labelCatalog} taxonomy={taxonomy} /></div></div>)}</section>;
}

function Catalog({ interfaceLocale, learningLocale }: { interfaceLocale: string; learningLocale: string }) {
  const [pageIndex, setPageIndex] = useState<CatalogPageIndex | null>(null);
  const [cards, setCards] = useState<BookCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [labelCatalog, setLabelCatalog] = useState<LabelCatalog | null>(null);
  const [query, setQuery] = useState(() => catalogParam("q") ?? "");
  const [level, setLevel] = useState("all");
  const [category, setCategory] = useState("all");
  const [writer, setWriter] = useState(() => catalogParam("writer") ?? "all");
  const [style, setStyle] = useState(() => catalogParam("style") ?? "all");
  const [topic, setTopic] = useState("all");
  const [theme, setTheme] = useState("all");
  const [mood, setMood] = useState("all");
  const text = ui(interfaceLocale);
  useEffect(() => { loadCatalogPageIndex().then(setPageIndex); loadLabels().then(setLabelCatalog) }, []);
  useEffect(() => { let cancelled = false; setCardsLoading(true); loadSearch(learningLocale).then((nextCards) => { if (!cancelled) { setCards(nextCards); setCardsLoading(false) } }); return () => { cancelled = true } }, [learningLocale]);
  const levels = useMemo(() => sortReadingLevels([...new Set(cards.map((card) => card.level))]), [cards]);
  const categories = useMemo(() => [...new Set(cards.map((card) => card.category))].sort(), [cards]);
  const writers = useMemo(() => [...new Map(cards.map((card) => [card.writer.id, card.writer])).values()].sort((left, right) => left.displayName.localeCompare(right.displayName)), [cards]);
  const styles = useMemo(() => [...new Map(cards.map((card) => [card.style.id, card.style])).values()].sort((left, right) => styleName(left, interfaceLocale).localeCompare(styleName(right, interfaceLocale), interfaceLocale)), [cards, interfaceLocale]);
  const topicOptions = useMemo(() => getLabelOptions(cards, labelCatalog, "topics", interfaceLocale), [cards, interfaceLocale, labelCatalog]);
  const themeOptions = useMemo(() => getLabelOptions(cards, labelCatalog, "themes", interfaceLocale), [cards, interfaceLocale, labelCatalog]);
  const moodOptions = useMemo(() => getLabelOptions(cards, labelCatalog, "moods", interfaceLocale), [cards, interfaceLocale, labelCatalog]);
  const filtered = useMemo(() => searchCards(cards, query).filter((card) => (level === "all" || card.level === level) && (category === "all" || card.category === category) && (writer === "all" || card.writer.id === writer) && (style === "all" || card.style.id === style) && hasLabel(card, "topics", topic) && hasLabel(card, "themes", theme) && hasLabel(card, "moods", mood)), [cards, category, level, mood, query, style, theme, topic, writer]);
  return <main className="catalog-page">
    <section className="catalog-hero"><div><p className="eyebrow">{interfaceLocale === "zh-CN" ? "完整图书目录" : "The complete library"}</p><h1>{interfaceLocale === "zh-CN" ? "按自己的方式找故事" : "Find stories your way"}</h1><p>{interfaceLocale === "zh-CN" ? "浏览全部分级读物，或按语言难度、主题与原创 Writer 缩小范围。" : "Browse every graded reader, or narrow the shelves by level, topic, and original Writer."}</p></div><div className="catalog-language"><small>{text.learn}</small><strong>{localeName(learningLocale)}</strong><span>{cards.length} {interfaceLocale === "zh-CN" ? "本可读" : "available"}</span></div></section>
    <section className="catalog-browser">
      <div className="catalog-search-row"><label className="search-field"><Search aria-hidden="true" size={22} /><span className="sr-only">{text.search}</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} />{query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Clear search"><X size={17} /></button>}</label><p><strong>{filtered.length}</strong> {interfaceLocale === "zh-CN" ? "本书" : filtered.length === 1 ? "book" : "books"}</p></div>
      <div className="catalog-body"><aside className="catalog-filters"><div className="filter-title"><SlidersHorizontal size={18} /><strong>{interfaceLocale === "zh-CN" ? "筛选目录" : "Filter catalog"}</strong></div><CatalogFilter label={text.level} value={level} onChange={setLevel} all={text.all} options={levels.map((item) => ({ value: item, label: taxonomyName(pageIndex?.taxonomy.levels, item, interfaceLocale) }))} /><CatalogFilter label={interfaceLocale === "zh-CN" ? "分类" : "Category"} value={category} onChange={setCategory} all={text.all} options={categories.map((item) => ({ value: item, label: taxonomyName(pageIndex?.taxonomy.categories, item, interfaceLocale) }))} /><CatalogFilter label="Writer" value={writer} onChange={setWriter} all={text.all} options={writers.map((item) => ({ value: item.id, label: item.displayName }))} /><CatalogFilter label={interfaceLocale === "zh-CN" ? "风格" : "Style"} value={style} onChange={setStyle} all={text.all} options={styles.map((item) => ({ value: item.id, label: styleName(item, interfaceLocale) }))} /><CatalogFilter label={labelGroupName(labelCatalog, "topics", interfaceLocale)} value={topic} onChange={setTopic} all={text.all} options={topicOptions} /><CatalogFilter label={labelGroupName(labelCatalog, "themes", interfaceLocale)} value={theme} onChange={setTheme} all={text.all} options={themeOptions} /><CatalogFilter label={labelGroupName(labelCatalog, "moods", interfaceLocale)} value={mood} onChange={setMood} all={text.all} options={moodOptions} /><Button variant="ghost" onClick={() => { setQuery(""); setLevel("all"); setCategory("all"); setWriter("all"); setStyle("all"); setTopic("all"); setTheme("all"); setMood("all") }}>{interfaceLocale === "zh-CN" ? "重置全部筛选" : "Reset all filters"}</Button></aside>
        <div className="catalog-results">{cardsLoading ? <LoadingState locale={interfaceLocale} label={interfaceLocale === "zh-CN" ? "正在加载图书目录…" : "Loading the library…"} /> : filtered.length ? <div className="catalog-card-grid">{filtered.map((card) => <CatalogBookCard key={`${card.id}-${learningLocale}`} card={card} interfaceLocale={interfaceLocale} learningLocale={learningLocale} labelCatalog={labelCatalog} taxonomy={pageIndex?.taxonomy} />)}</div> : <div className="catalog-empty"><Search size={30} /><h2>{interfaceLocale === "zh-CN" ? "没有找到这本书" : "No stories found"}</h2><p>{interfaceLocale === "zh-CN" ? "换一个关键词，或者清除部分筛选条件。" : "Try another search or clear some filters."}</p></div>}</div></div>
    </section>
  </main>;
}

function CatalogFilter({ label, value, onChange, all, options }: { label: string; value: string; onChange: (value: string) => void; all: string; options: Array<{ value: string; label: string }> }) {
  return <label className="catalog-filter"><span>{label}</span><Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem key="all" value="all">{all}</SelectItem>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></label>;
}

function labelGroupName(catalog: LabelCatalog | null, groupId: string, locale: string) {
  return catalog?.groups[groupId]?.names[locale] ?? catalog?.groups[groupId]?.names["en-US"] ?? groupId;
}

function taxonomyName(group: TaxonomyGroup | undefined, id: string, locale: string) {
  return group?.[id]?.names[locale] ?? group?.[id]?.names["en-US"] ?? id;
}

function labelName(catalog: LabelCatalog | null | undefined, groupId: string, labelId: string, locale: string) {
  return catalog?.groups[groupId]?.labels[labelId]?.[locale] ?? catalog?.groups[groupId]?.labels[labelId]?.["en-US"] ?? labelId;
}

function getLabelOptions(cards: BookCard[], catalog: LabelCatalog | null, groupId: string, locale: string) {
  return [...new Set(cards.flatMap((card) => card.labels?.[groupId] ?? []))].sort((left, right) => labelName(catalog, groupId, left, locale).localeCompare(labelName(catalog, groupId, right, locale), locale)).map((id) => ({ value: id, label: labelName(catalog, groupId, id, locale) }));
}

function hasLabel(card: BookCard, groupId: string, selected: string) {
  return selected === "all" || (card.labels?.[groupId] ?? []).includes(selected);
}

function CatalogBookCard({ card, interfaceLocale, learningLocale, labelCatalog, taxonomy }: { card: BookCard; interfaceLocale: string; learningLocale: string; labelCatalog?: LabelCatalog | null; taxonomy?: CatalogTaxonomy }) {
  return <LibraryBookCard card={card} interfaceLocale={interfaceLocale} learningLocale={learningLocale} labelCatalog={labelCatalog} taxonomy={taxonomy} />;
}

function LibraryBookCard({ card, interfaceLocale, learningLocale, labelCatalog, taxonomy }: { card: BookCard; interfaceLocale: string; learningLocale: string; labelCatalog?: LabelCatalog | null; taxonomy?: CatalogTaxonomy }) {
  const labels = Object.entries(card.labels ?? {}).flatMap(([groupId, ids]) => ids.map((id) => labelName(labelCatalog, groupId, id, interfaceLocale))).slice(0, 3);
  return <a className="book-card-link" href={`#/read/${card.path}?lang=${learningLocale}`}><Card className="catalog-book-card"><span className="catalog-cover"><img src={card.cover} alt={`${card.title} cover`} /><Badge>{taxonomyName(taxonomy?.levels, card.level, interfaceLocale)}</Badge></span><div><p className="catalog-book-meta">{taxonomyName(taxonomy?.subcategories, card.subcategory, interfaceLocale)} · {card.pageCount} {interfaceLocale === "zh-CN" ? "页" : "pages"}</p><h2>{card.title}</h2><p>{card.summaries[interfaceLocale] ?? card.summary}</p>{labels.length > 0 && <div className="catalog-labels">{labels.map((label) => <Badge key={label} variant="secondary">{label}</Badge>)}</div>}<div className="catalog-book-footer"><span>Writer · {card.writer.displayName}</span></div></div></Card></a>;
}

function VocabularyPage({ interfaceLocale, learningLocale }: { interfaceLocale: string; learningLocale: string }) {
  const [index, setIndex] = useState<VocabularyPageIndex | null>(null);
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(0);
  const [entries, setEntries] = useState<VocabularyCatalogCard[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState<VocabularyCatalogCard | null>(null);
  useEffect(() => { loadVocabularyPageIndex().then(setIndex) }, []);
  const availableLevels = useMemo(() => sortReadingLevels(Object.keys(index?.locales[learningLocale] ?? {})), [index, learningLocale]);
  useEffect(() => {
    if (!availableLevels.length) { setLevel(""); setEntries([]); return }
    setLevel((current) => availableLevels.includes(current) ? current : availableLevels[0]);
    setPage(0);
  }, [availableLevels.join("|")]);
  const pageInfo = level ? index?.locales[learningLocale]?.[level] : undefined;
  useEffect(() => {
    const url = pageInfo?.pages[page];
    if (!url) { setEntries([]); setEntriesLoading(false); return }
    let cancelled = false;
    setEntriesLoading(true);
    loadVocabularyCatalogPage(url).then((nextEntries) => { if (!cancelled) { setEntries(nextEntries); setEntriesLoading(false) } });
    return () => { cancelled = true };
  }, [index, page, pageInfo]);
  useEffect(() => {
    if (!activeEntry) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setActiveEntry(null) };
    addEventListener("keydown", closeOnEscape);
    return () => removeEventListener("keydown", closeOnEscape);
  }, [activeEntry]);
  const pageCount = pageInfo?.pages.length ?? 0;
  return <main className="vocabulary-page">
    <section className="profiles-hero vocabulary-hero"><div><p className="eyebrow">{interfaceLocale === "zh-CN" ? "分级词汇" : "Graded vocabulary"}</p><h1>{interfaceLocale === "zh-CN" ? "浏览词汇表" : "Browse the vocabulary"}</h1><p>{interfaceLocale === "zh-CN" ? "按正在学习的语言与等级查看词义、读音和无文字词卡。每次只加载当前这一页。" : "Explore definitions, pronunciation, and wordless cards by learning language and level. Only the current page is loaded."}</p></div><BookOpen size={74} aria-hidden="true" /></section>
    <section className="vocabulary-browser">
      <div className="vocabulary-level-panel"><div className="vocabulary-level-heading"><div><p>{interfaceLocale === "zh-CN" ? "选择词汇等级" : "Choose a vocabulary level"}</p><span>{interfaceLocale === "zh-CN" ? `正在学习 ${localeName(learningLocale)}` : `Learning ${localeName(learningLocale)}`}</span></div><div><strong>{pageInfo?.count ?? 0}</strong><span>{interfaceLocale === "zh-CN" ? "个词汇" : "words"}</span></div></div><div className="vocabulary-level-tabs" role="tablist" aria-label={interfaceLocale === "zh-CN" ? "词汇等级" : "Vocabulary level"}>{availableLevels.map((item) => <button type="button" role="tab" aria-selected={level === item} data-active={level === item} key={item} onClick={() => { setEntriesLoading(true); setLevel(item); setPage(0); setActiveEntry(null) }}><strong>{item.toUpperCase()}</strong><span>{taxonomyName(index?.levels, item, interfaceLocale)}</span><small>{index?.locales[learningLocale]?.[item]?.count ?? 0}</small></button>)}</div></div>
      {!index || entriesLoading ? <LoadingState locale={interfaceLocale} label={interfaceLocale === "zh-CN" ? "正在加载词汇卡…" : "Loading vocabulary cards…"} /> : entries.length ? <div className="vocabulary-grid">{entries.map((entry) => <button type="button" className="vocabulary-tile" key={`${entry.level}-${entry.id}`} onClick={() => setActiveEntry(entry)} aria-label={`${interfaceLocale === "zh-CN" ? "查看词汇" : "Open vocabulary"}：${entry.term}`}><img src={entry.card} alt="" /><span><strong>{entry.term}</strong>{entry.pronunciation && <small>{entry.pronunciation}</small>}</span></button>)}</div> : <div className="catalog-empty"><BookOpen size={30} /><h2>{interfaceLocale === "zh-CN" ? "这个等级还没有词汇" : "No vocabulary at this level yet"}</h2></div>}
      {pageCount > 1 && <nav className="vocabulary-pagination" aria-label={interfaceLocale === "zh-CN" ? "词汇分页" : "Vocabulary pages"}><Button variant="outline" disabled={page === 0} onClick={() => { setEntriesLoading(true); setPage((current) => current - 1) }}><ArrowLeft size={16} />{interfaceLocale === "zh-CN" ? "上一页" : "Previous"}</Button><span>{page + 1} / {pageCount}</span><Button variant="outline" disabled={page >= pageCount - 1} onClick={() => { setEntriesLoading(true); setPage((current) => current + 1) }}>{interfaceLocale === "zh-CN" ? "下一页" : "Next"}<ArrowRight size={16} /></Button></nav>}
    </section>
    {activeEntry && <div className="vocabulary-modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setActiveEntry(null) }}><Card className="vocabulary-modal" role="dialog" aria-modal="true" aria-labelledby="vocabulary-modal-title"><button type="button" className="vocabulary-modal-close" onClick={() => setActiveEntry(null)} aria-label={interfaceLocale === "zh-CN" ? "关闭词汇详情" : "Close vocabulary details"}><X size={19} /></button><img src={activeEntry.card} alt={activeEntry.term} /><div><p>{activeEntry.partOfSpeech}</p><h2 id="vocabulary-modal-title">{activeEntry.term}</h2>{activeEntry.pronunciation && <code>{activeEntry.pronunciation}</code>}<span>{activeEntry.definition}</span><small>{taxonomyName(index?.levels, activeEntry.level, interfaceLocale)}</small></div></Card></div>}
  </main>;
}

function WritersPage({ interfaceLocale, learningLocale }: { interfaceLocale: string; learningLocale: string }) {
  const [writers, setWriters] = useState<WriterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  useEffect(() => { let cancelled = false; setLoading(true); loadWriters(learningLocale).then((nextWriters) => { if (!cancelled) { setWriters(nextWriters); setLoading(false) } }); return () => { cancelled = true } }, [learningLocale]);
  const needle = query.trim().normalize("NFKC").toLocaleLowerCase();
  const filtered = writers.filter((writer) => !needle || [writer.displayName, ...writer.traits, ...writer.values, JSON.stringify(writer.creativePreferences)].join(" ").normalize("NFKC").toLocaleLowerCase().includes(needle));
  return <main className="profiles-page"><section className="profiles-hero"><div><p className="eyebrow">{interfaceLocale === "zh-CN" ? "原创创作视角" : "Original creative viewpoints"}</p><h1>{interfaceLocale === "zh-CN" ? "认识我们的作家" : "Meet the Writers"}</h1><p>{interfaceLocale === "zh-CN" ? "每位 Writer 都是原创的创作人格，以不同的价值、节奏和观察方式，为学习者写出适合其语言等级的故事。" : "Each Writer is an original creative persona, bringing distinct values, rhythms, and ways of seeing to level-appropriate stories."}</p></div><UserRound size={74} aria-hidden="true" /></section><section className="profiles-browser"><label className="search-field"><Search size={21} aria-hidden="true" /><span className="sr-only">{interfaceLocale === "zh-CN" ? "搜索作家" : "Search Writers"}</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={interfaceLocale === "zh-CN" ? "搜索作家、特质或价值" : "Search Writers, traits, or values"} />{query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Clear search"><X size={17} /></button>}</label><p className="profile-count"><strong>{filtered.length}</strong> {interfaceLocale === "zh-CN" ? "位作家" : filtered.length === 1 ? "Writer" : "Writers"} · {localeName(learningLocale)}</p>{loading ? <LoadingState locale={interfaceLocale} label={interfaceLocale === "zh-CN" ? "正在加载作家…" : "Loading Writers…"} /> : <div className="writer-profile-grid">{filtered.map((writer) => <WriterProfileCard key={writer.id} writer={writer} interfaceLocale={interfaceLocale} />)}</div>}</section></main>;
}

function WriterProfileCard({ writer, interfaceLocale }: { writer: WriterProfile; interfaceLocale: string }) {
  const worksUrl = `#/catalog?writer=${encodeURIComponent(writer.id)}`;
  return <Card className="writer-profile-card"><a className="profile-portrait" href={worksUrl} aria-label={`${interfaceLocale === "zh-CN" ? "查看作品：" : "View works by "}${writer.displayName}`}><img src={writer.avatar} alt={writer.displayName} /><Badge>{writer.recommendedLevels.map((level) => level.toUpperCase()).join(" · ")}</Badge></a><div className="profile-copy"><p className="eyebrow">Writer · {localeName(writer.locale)}</p><h2><a href={worksUrl}>{writer.displayName}</a></h2><div className="profile-tags">{writer.traits.slice(0, 3).map((trait) => <Badge key={trait} variant="secondary">{trait}</Badge>)}</div><Button asChild variant="outline" className="profile-works-link"><a href={worksUrl}><BookOpen size={15} aria-hidden="true" />{interfaceLocale === "zh-CN" ? "查看作品" : "View works"}<ArrowRight size={15} aria-hidden="true" /></a></Button></div></Card>;
}

function StylesPage({ interfaceLocale }: { interfaceLocale: string }) {
  const [styles, setStyles] = useState<StyleProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  useEffect(() => { let cancelled = false; loadStyles().then((nextStyles) => { if (!cancelled) { setStyles(nextStyles); setLoading(false) } }); return () => { cancelled = true } }, []);
  const needle = query.trim().normalize("NFKC").toLocaleLowerCase();
  const filtered = styles.filter((style) => !needle || [style.displayName, ...Object.values(style.names ?? {}), JSON.stringify(style.visualTreatments ?? style.visualTreatment), JSON.stringify(style.continuity)].join(" ").normalize("NFKC").toLocaleLowerCase().includes(needle));
  return <main className="profiles-page"><section className="profiles-hero style-profiles-hero"><div><p className="eyebrow">{interfaceLocale === "zh-CN" ? "共享的视觉语言" : "Shared visual languages"}</p><h1>{interfaceLocale === "zh-CN" ? "探索视觉风格" : "Explore the Styles"}</h1><p>{interfaceLocale === "zh-CN" ? "每一种风格都定义了媒介、色彩、构图与连续性。一本书的所有语言版本共享同一组无文字插图。" : "Each Style defines medium, color, composition, and continuity. Every locale of a work shares the same wordless illustrations."}</p></div><Palette size={74} aria-hidden="true" /></section><section className="profiles-browser"><label className="search-field"><Search size={21} aria-hidden="true" /><span className="sr-only">{interfaceLocale === "zh-CN" ? "搜索视觉风格" : "Search Styles"}</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={interfaceLocale === "zh-CN" ? "搜索媒介、色彩或风格" : "Search medium, palette, or Style"} />{query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Clear search"><X size={17} /></button>}</label><p className="profile-count"><strong>{filtered.length}</strong> {interfaceLocale === "zh-CN" ? "种视觉风格" : filtered.length === 1 ? "Style" : "Styles"}</p>{loading ? <LoadingState locale={interfaceLocale} label={interfaceLocale === "zh-CN" ? "正在加载视觉风格…" : "Loading visual Styles…"} /> : <div className="style-profile-grid">{filtered.map((style) => <StyleProfileCard key={style.id} style={style} interfaceLocale={interfaceLocale} />)}</div>}</section></main>;
}

function StyleProfileCard({ style, interfaceLocale }: { style: StyleProfile; interfaceLocale: string }) {
  const name = styleName(style, interfaceLocale);
  const medium = styleTreatment(style, interfaceLocale).medium;
  const worksUrl = `#/catalog?style=${encodeURIComponent(style.id)}`;
  return <Card className="style-profile-card"><a className="style-profile-image" href={worksUrl} aria-label={`${interfaceLocale === "zh-CN" ? "查看使用此风格的作品：" : "View works using "}${name}`}><img src={style.thumbnail} alt={name} /></a><div><p className="eyebrow">{interfaceLocale === "zh-CN" ? "视觉风格" : "Visual Style"}</p><h2><a href={worksUrl}>{name}</a></h2>{typeof medium === "string" && <p className="style-summary">{medium}</p>}<Button asChild variant="outline" className="profile-works-link"><a href={worksUrl}><BookOpen size={16} aria-hidden="true" />{interfaceLocale === "zh-CN" ? "查看作品" : "View works"}<ArrowRight size={15} aria-hidden="true" /></a></Button></div></Card>;
}

function styleName(style: StyleSummary, locale: string) {
  return style.names?.[locale] ?? style.names?.["en-US"] ?? style.displayName;
}

function styleTreatment(style: StyleProfile, locale: string) {
  return style.visualTreatments?.[locale] ?? style.visualTreatments?.["en-US"] ?? style.visualTreatment;
}

function BrandText({ locale }: { locale: string }) {
  return <span className="brand-word">{locale === "zh-CN" ? <span className="brand-chinese">嗨！图书馆</span> : "Hai! Library"}</span>;
}

type PrintablePage =
  | { kind: "cover" }
  | { kind: "story"; page: StoryPage; number: number }
  | { kind: "vocabulary"; entries: Array<{ id: string; entry: VocabularyEntry }>; number: number }
  | { kind: "questions"; questions: NonNullable<Story["questions"]>; number: number; total: number }
  | { kind: "blank" }
  | { kind: "back" };

function chunks<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

function printableLine(line: StoryBlock) {
  return line.text ?? line.content?.map((part) => part.vocabulary?.text ?? part.text ?? "").join("") ?? "";
}

function printableContent(content?: StoryContentPart[]) {
  return content?.map((part) => part.vocabulary?.text ?? part.text ?? "").join("") ?? "";
}

function PrintBook({ path, locale }: { path: string; locale: string }) {
  const workId = path.split("/").filter(Boolean).at(-1) ?? path;
  const [book, setBook] = useState<Book | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [printLocale, setPrintLocale] = useState(locale);
  const [vocabulary, setVocabulary] = useState<Array<{ id: string; entry: VocabularyEntry }>>([]);
  useEffect(() => {
    let cancelled = false;
    loadBook(workId).then(async (nextBook) => {
      const selectedLocale = nextBook.availableLocales.includes(locale) ? locale : nextBook.availableLocales[0];
      const [nextStory, entries] = await Promise.all([
        loadStory(workId, selectedLocale),
        Promise.all(Object.keys(nextBook.vocabulary.entries).map(async (id) => ({ id, entry: await loadVocabulary(nextBook.level, id) }))),
      ]);
      if (cancelled) return;
      setBook(nextBook);
      setStory(nextStory);
      setPrintLocale(selectedLocale);
      setVocabulary(entries);
    });
    return () => { cancelled = true };
  }, [workId, locale]);
  useEffect(() => {
    if (!story) return;
    const previous = document.title;
    document.title = `${story.title} — ${printLocale === "zh-CN" ? "打印版" : "Printable edition"}`;
    return () => { document.title = previous };
  }, [printLocale, story]);
  if (!book || !story) return <main className="print-loading"><LoadingState locale={locale} label={locale === "zh-CN" ? "正在准备打印版…" : "Preparing printable edition…"} /></main>;
  if (usesArticleLayout(story)) return <PrintArticle book={book} story={story} locale={printLocale} vocabulary={vocabulary} />;
  const audioPages = storyAudioPages(story);

  const vocabularyPages: PrintablePage[] = chunks(vocabulary, 6).map((entries, number) => ({ kind: "vocabulary", entries, number }));
  const questionPages: PrintablePage[] = chunks(story.questions ?? [], 1).map((questions, number) => ({ kind: "questions", questions, number, total: story.questions?.length ?? 0 }));
  const insidePages: PrintablePage[] = [
    ...audioPages.map((page, index): PrintablePage => ({ kind: "story", page, number: index + 1 })),
    ...vocabularyPages,
    ...questionPages,
  ];
  const contentPages: PrintablePage[] = [{ kind: "cover" }, ...insidePages, { kind: "back" }];
  const logicalPages: PrintablePage[] = contentPages.length % 2 === 0 ? contentPages : [...contentPages, { kind: "blank" }];
  const sheets = chunks(logicalPages, 2).map(([left, right], index) => ({ left, right, sheet: index + 1 }));
  const switchPrintLanguage = (nextLocale: string) => { if (nextLocale !== printLocale) location.hash = `/print/${workId}?lang=${encodeURIComponent(nextLocale)}` };
  return <main className="print-view" lang={printLocale}>
    <header className="print-toolbar"><a href={`#/catalog`}><ArrowLeft size={17} aria-hidden="true" />{printLocale === "zh-CN" ? "返回图书馆" : "Back to library"}</a><div><strong>{story.title}</strong><span>{printLocale === "zh-CN" ? `内容 ${contentPages.length} 页 · ${sheets.length} 张纸` : `${contentPages.length} content pages · ${sheets.length} sheets`}</span></div>{book.availableLocales.length > 1 && <label><small>{printLocale === "zh-CN" ? "打印语言" : "Print language"}</small><Select value={printLocale} onValueChange={switchPrintLanguage}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{book.availableLocales.map((bookLocale) => <SelectItem value={bookLocale} key={bookLocale}>{localeName(bookLocale)}</SelectItem>)}</SelectContent></Select></label>}<p>{printLocale === "zh-CN" ? "A4 横向 · 每张两页 · 正常顺序 · 100% 比例" : "A4 landscape · two pages per sheet · sequential · 100% scale"}</p><Button onClick={() => window.print()}><Printer size={17} aria-hidden="true" />{printLocale === "zh-CN" ? "打印" : "Print"}</Button></header>
    <section className="print-sheets">{sheets.map((sheet) => <article className="print-sheet" key={sheet.sheet}><span className="print-sheet-label">{printLocale === "zh-CN" ? `第 ${sheet.sheet} 张 · 第 ${sheet.sheet * 2 - 1}–${Math.min(sheet.sheet * 2, contentPages.length)} 页` : `Sheet ${sheet.sheet} · pages ${sheet.sheet * 2 - 1}–${Math.min(sheet.sheet * 2, contentPages.length)}`}</span><PrintableBookPage page={sheet.left} book={book} story={story} locale={printLocale} position="left" /><PrintableBookPage page={sheet.right} book={book} story={story} locale={printLocale} position="right" /><span className="print-fold" aria-hidden="true" /></article>)}</section>
  </main>;
}

function PrintArticle({ book, story, locale, vocabulary }: { book: Book; story: Story; locale: string; vocabulary: Array<{ id: string; entry: VocabularyEntry }> }) {
  const chinese = locale === "zh-CN";
  const articlePages = storyArticlePages(story);
  const switchLanguage = (nextLocale: string) => { if (nextLocale !== locale) location.hash = `/print/${book.id}?lang=${encodeURIComponent(nextLocale)}` };
  return <main className="print-view print-view--article" lang={locale}>
    <header className="print-toolbar"><a href="#/catalog"><ArrowLeft size={17} aria-hidden="true" />{chinese ? "返回图书馆" : "Back to library"}</a><div><strong>{story.title}</strong><span>{chinese ? "长文打印" : "Article print"}</span></div>{book.availableLocales.length > 1 && <label><small>{chinese ? "打印语言" : "Print language"}</small><Select value={locale} onValueChange={switchLanguage}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{book.availableLocales.map((bookLocale) => <SelectItem value={bookLocale} key={bookLocale}>{localeName(bookLocale)}</SelectItem>)}</SelectContent></Select></label>}<p>{chinese ? "A4 竖向 · 文章排版 · 自动分页" : "A4 portrait · article layout · automatic pagination"}</p><Button onClick={() => window.print()}><Printer size={17} aria-hidden="true" />{chinese ? "打印" : "Print"}</Button></header>
    <section className="print-article-preview"><article className="print-article-paper">
      <header className="print-article-header"><img src={book.artwork.cover} alt="" /><p>{chinese ? "分级阅读文章" : "A graded reading article"} · {book.level.toUpperCase()}</p><h1>{story.title}</h1><div><span>{chinese ? "作者" : "Writer"} · {story.writer}</span><span>{localeName(locale)}</span></div><p className="print-article-summary">{story.summary}</p></header>
      <div className="print-article-body print-article-prose">{articlePages.flatMap((page) => page.paragraphs.map((paragraph, paragraphIndex) => <p className="print-article-paragraph" key={`${page.id}-${paragraphIndex}`}>{paragraph.text ?? printableContent(paragraph.content)}</p>))}</div>
      {vocabulary.length > 0 && <section className="print-article-appendix"><h2>{chinese ? "词汇表" : "Vocabulary"}</h2>{vocabulary.map(({ id, entry }) => { const localized = entry.locales[locale] ?? Object.values(entry.locales)[0]; return <p key={id}><strong>{localized.term}</strong>{localized.pronunciation && <code>{localized.pronunciation}</code>}<span>{localized.definition}</span></p> })}</section>}
      {(story.questions?.length ?? 0) > 0 && <section className="print-article-appendix print-article-questions"><h2>{chinese ? "阅读问答" : "Reading questions"}</h2><ol>{story.questions?.map((question) => <li key={question.id}>{question.prompt}<span aria-hidden="true" /></li>)}</ol></section>}
      <footer>{chinese ? "内容由 AI 生成" : "Content generated by AI"} · <BrandText locale={locale} /></footer>
    </article></section>
  </main>;
}

function PrintableBookPage({ page, book, story, locale, position }: { page: PrintablePage; book: Book; story: Story; locale: string; position: "left" | "right" }) {
  const chinese = locale === "zh-CN";
  const cast = storyCast(story);
  if (page.kind === "blank") return <section className="print-book-page print-blank" data-position={position} />;
  if (page.kind === "cover") return <section className="print-book-page print-cover" data-position={position}><img src={book.artwork.cover} alt="" /><div><p>{chinese ? "分级阅读小书" : "A graded-reading booklet"}</p><h1>{story.title}</h1><span>{chinese ? "作者" : "Writer"} · {story.writer}</span><span>{chinese ? "级别" : "Level"} · {book.level.toUpperCase()}</span></div></section>;
  if (page.kind === "back") return <section className="print-book-page print-back" data-position={position}><Sparkles size={34} weight="fill" aria-hidden="true" /><h2><BrandText locale={locale} /></h2><p>{story.summary}</p><dl><div><dt>{chinese ? "作者" : "Writer"}</dt><dd>{story.writer}</dd></div><div><dt>{chinese ? "级别" : "Level"}</dt><dd>{book.level.toUpperCase()}</dd></div><div><dt>{chinese ? "语言" : "Language"}</dt><dd>{localeName(locale)}</dd></div></dl><small>{chinese ? "内容由 AI 生成 · haivivi.com" : "Content generated by AI · haivivi.com"}</small></section>;
  if (page.kind === "story") return <section className="print-book-page print-story-page" data-position={position}><img src={book.artwork.pages[page.page.illustration]} alt="" /><div className="print-story-copy">{storyPageBlocks(page.page).map((line, index) => <div key={`${page.page.id}-${index}`}><small>{cast[line.speaker]?.display_name}</small><p>{printableLine(line)}</p></div>)}</div><footer><span>{page.number}</span><small>{chinese ? "内容由 AI 生成" : "Content generated by AI"}</small></footer></section>;
  if (page.kind === "vocabulary") return <section className="print-book-page print-appendix" data-position={position}><p className="eyebrow">{chinese ? "词汇表" : "Vocabulary"}{page.number > 0 ? ` · ${page.number + 1}` : ""}</p><h2>{chinese ? "读一读这些词" : "Words from the story"}</h2><div className="print-vocabulary-list">{page.entries.map(({ id, entry }) => { const localized = entry.locales[locale] ?? Object.values(entry.locales)[0]; return <article key={id}><img src={entry.card} alt="" /><div><strong>{localized.term}</strong>{localized.pronunciation && <code>{localized.pronunciation}</code>}<span>{localized.definition}</span></div></article> })}</div><footer><small>{chinese ? "内容由 AI 生成" : "Content generated by AI"}</small></footer></section>;
  return <section className="print-book-page print-appendix print-questions" data-position={position}><p className="eyebrow">{chinese ? "阅读问答" : "Reading questions"} · {page.number + 1} / {page.total}</p><h2>{chinese ? "用自己的话回答" : "Answer in your own words"}</h2><ol>{page.questions.map((question) => <li key={question.id}><strong>{question.prompt}</strong><div className="print-answer-space" aria-hidden="true" /></li>)}</ol><footer><small>{chinese ? "内容由 AI 生成" : "Content generated by AI"}</small></footer></section>;
}

function Reader({ path, locale, interfaceLocale }: { path: string; locale: string; interfaceLocale: string }) {
  const text = ui(interfaceLocale);
  const workId = path.split("/").filter(Boolean).at(-1) ?? path;
  const stored = readProgress();
  const storedBook = stored.books[`${workId}::${locale}`] ?? stored.books[`${path}::${locale}`];
  const [story, setStory] = useState<Story | null>(null);
  const [bookCover, setBookCover] = useState("");
  const [bookLevel, setBookLevel] = useState("");
  const [bookLocales, setBookLocales] = useState<string[]>([]);
  const [vocabulary, setVocabulary] = useState<Record<string, VocabularyEntry>>({});
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"article" | "script">("article");
  const [page, setPage] = useState(storedBook?.page ?? 0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>(storedBook?.quiz?.answers ?? {});
  const [reviewedQuestions, setReviewedQuestions] = useState<string[]>(storedBook?.quiz?.reviewed ?? []);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadBook(workId), loadStory(workId, locale)]).then(async ([book, nextStory]) => {
      const articlePages = storyArticlePages(nextStory);
      const ids = [...new Set(articlePages.flatMap((item) => item.paragraphs.flatMap((paragraph) => paragraph.content?.flatMap((part) => part.vocabulary?.id ?? []) ?? [])))];
      const entries = await Promise.all(ids.map(async (id) => [id, await loadVocabulary(book.level, id)] as const));
      if (cancelled) return;
      const progress = readProgress();
      const targetBook = progress.books[`${workId}::${locale}`] ?? progress.books[`${path}::${locale}`];
      setBookLevel(book.level);
      setBookCover(book.artwork.cover);
      setBookLocales(book.availableLocales);
      setVocabulary(Object.fromEntries(entries));
      setPage(Math.min(targetBook?.page ?? 0, Math.max(0, articlePages.length - 1)));
      setViewMode("article");
      setActiveWord(null);
      setStory(nextStory);
    });
    return () => { cancelled = true };
  }, [path, locale]);
  useEffect(() => { if (story?.language === locale) savePage(workId, locale, page, storyArticlePages(story).length) }, [workId, locale, page, story]);
  useEffect(() => { setActiveWord(null) }, [page]);
  useEffect(() => {
    const progress = readProgress().books[`${workId}::${locale}`] ?? readProgress().books[`${path}::${locale}`];
    const quiz = progress?.quiz;
    setQuizOpen(false);
    setQuestionIndex(0);
    setQuizAnswers(quiz?.answers ?? {});
    setReviewedQuestions(quiz?.reviewed ?? []);
    setAnswerRevealed(false);
  }, [path, locale]);
  const articleLayout = story ? usesArticleLayout(story) : false;
  const hasDualMode = Boolean(story?.article && story.audio_script);
  const continuousMode = articleLayout || (hasDualMode && viewMode === "script");
  useEffect(() => {
    if (!continuousMode || !story) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-reader-page]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
      if (visible) setPage(Number((visible.target as HTMLElement).dataset.readerPage ?? 0));
    }, { rootMargin: "-18% 0px -68%", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [continuousMode, story, viewMode]);
  if (!story) return <main className="loading reader-loading"><LoadingState locale={interfaceLocale} label={interfaceLocale === "zh-CN" ? "正在打开故事…" : "Opening story…"} /></main>;
  const articlePages = storyArticlePages(story);
  const audioPages = storyAudioPages(story);
  const cast = storyCast(story);
  const readingPages = articleLayout ? articlePages : audioPages;
  const current = audioPages[page];
  const questions = story.questions ?? [];
  const question = questions[questionIndex];
  const evidencePage = question ? readingPages.find((item) => item.id === question.page_refs[0]) ?? readingPages[page] : readingPages[page];
  const evidencePageIndex = readingPages.findIndex((item) => item.id === evidencePage.id);
  const activeEntry = activeWord ? vocabulary[activeWord] : undefined;
  const activeLocale = activeEntry?.locales[locale] ?? (activeEntry ? Object.values(activeEntry.locales)[0] : undefined);
  const switchLanguage = (nextLocale: string) => { if (nextLocale !== locale) location.hash = `/read/${workId}?lang=${encodeURIComponent(nextLocale)}` };
  const revealAnswer = () => {
    if (!question) return;
    const reviewed = reviewedQuestions.includes(question.id) ? reviewedQuestions : [...reviewedQuestions, question.id];
    setReviewedQuestions(reviewed);
    setAnswerRevealed(true);
    saveQuizAnswer(workId, locale, question.id, quizAnswers[question.id] ?? "", questions.length);
  };
  const moveQuestion = (nextIndex: number) => {
    setQuestionIndex(nextIndex);
    setAnswerRevealed(nextIndex < questions.length && reviewedQuestions.includes(questions[nextIndex].id));
  };
  return <main className="reader"><nav className="reader-actions" aria-label={interfaceLocale === "zh-CN" ? "阅读操作" : "Reading controls"}><div className="reader-book-heading"><a href="#/catalog" aria-label={interfaceLocale === "zh-CN" ? "返回图书目录" : "Back to library"}><ArrowLeft size={17} aria-hidden="true" /><span>{interfaceLocale === "zh-CN" ? "图书馆" : "Library"}</span></a><a className="reader-print" href={`#/print/${workId}?lang=${encodeURIComponent(locale)}`} aria-label={interfaceLocale === "zh-CN" ? `打印《${story.title}》` : `Print ${story.title}`}><Printer size={17} aria-hidden="true" /><span>{interfaceLocale === "zh-CN" ? "打印" : "Print"}</span></a><div className="reader-book-meta"><strong title={story.title}>{story.title}</strong><span title={story.writer}>{locale === "zh-CN" ? "作者" : "Writer"} · {story.writer}</span><span>{locale === "zh-CN" ? "级别" : "Level"} · {bookLevel.toUpperCase()}</span></div></div><div className="reader-top-actions">{hasDualMode && <div className="reader-view-mode" data-mode={viewMode} role="group" aria-label={interfaceLocale === "zh-CN" ? "阅读模式" : "Reading mode"}><button type="button" data-active={viewMode === "article"} aria-pressed={viewMode === "article"} onClick={() => setViewMode("article")}>{interfaceLocale === "zh-CN" ? "文章" : "Article"}</button><button type="button" data-active={viewMode === "script"} aria-pressed={viewMode === "script"} onClick={() => setViewMode("script")}>{interfaceLocale === "zh-CN" ? "脚本" : "Script"}</button></div>}{bookLocales.length > 1 && <label className="reader-language"><small>{interfaceLocale === "zh-CN" ? "阅读语言" : "Reading language"}</small><Select value={locale} onValueChange={switchLanguage}><SelectTrigger aria-label={interfaceLocale === "zh-CN" ? "切换本书语言" : "Change book language"}><SelectValue /></SelectTrigger><SelectContent>{bookLocales.map((bookLocale) => <SelectItem value={bookLocale} key={bookLocale}>{localeName(bookLocale)}</SelectItem>)}</SelectContent></Select></label>}</div></nav>
    {quizOpen ? <section className="reading-page quiz-page">{question ? <><div className="quiz-evidence"><img src={`./works/${workId}/artwork/${evidencePage.illustration}.webp`} alt="" /><span>{locale === "zh-CN" ? `回看第 ${evidencePageIndex + 1} 页` : `Review page ${evidencePageIndex + 1}`}</span></div><div className="quiz-copy"><p className="eyebrow">{locale === "zh-CN" ? "阅读问答" : "Reading questions"} · {questionIndex + 1} / {questions.length}</p><h1>{question.prompt}</h1><label><span>{locale === "zh-CN" ? "你的回答" : "Your answer"}</span><textarea value={quizAnswers[question.id] ?? ""} onChange={(event) => setQuizAnswers((answers) => ({ ...answers, [question.id]: event.target.value }))} placeholder={locale === "zh-CN" ? "用自己的话写下答案……" : "Answer in your own words…"} /></label>{!answerRevealed ? <Button onClick={revealAnswer} disabled={!(quizAnswers[question.id] ?? "").trim()}>{locale === "zh-CN" ? "查看参考答案" : "Check reference answer"}</Button> : <aside className="quiz-answer" aria-live="polite"><small>{locale === "zh-CN" ? "参考答案" : "Reference answer"}</small><p>{question.answer}</p></aside>}</div></> : <div className="quiz-complete"><CircleCheck size={54} weight="fill" aria-hidden="true" /><p className="eyebrow">{locale === "zh-CN" ? "问答完成" : "Questions complete"}</p><h1>{locale === "zh-CN" ? "你读完了这本书" : "You finished the book"}</h1><p>{locale === "zh-CN" ? `你完成了 ${questions.length} 道阅读题，回答和进度已经保存在此设备。` : `You completed ${questions.length} reading questions. Your answers and progress are saved on this device.`}</p></div>}</section> : hasDualMode && viewMode === "script" ? <ScriptStory story={story} locale={locale} level={bookLevel} cover={bookCover} activeWord={activeWord} activeEntry={activeEntry} activeLocale={activeLocale} onOpenWord={setActiveWord} aiDisclosure={text.aiGenerated} /> : articleLayout ? <ArticleStory story={story} locale={locale} level={bookLevel} cover={bookCover} activeWord={activeWord} activeEntry={activeEntry} activeLocale={activeLocale} onOpenWord={setActiveWord} aiDisclosure={text.aiGenerated} /> : <section className="reading-page"><img src={`./works/${workId}/artwork/${current.illustration}.webp`} alt={`Page ${page + 1}`} /><div className="reading-copy"><p className="eyebrow">{locale === "zh-CN" ? `第 ${page + 1} / ${audioPages.length} 页` : `Page ${page + 1} / ${audioPages.length}`}</p>{storyPageBlocks(current).map((line, index) => <div className="story-line" key={`${current.id}-${index}`}><small>{cast[line.speaker]?.display_name}</small><p><StoryText text={line.text} content={line.content} activeWord={activeWord} onOpen={setActiveWord} /></p></div>)}{activeWord && activeEntry && activeLocale && <aside className="vocabulary-card" aria-live="polite"><img src={`./vocabulary/${bookLevel}/${activeWord}/card.webp`} alt="" /><div><div className="vocabulary-heading"><span>{activeLocale.part_of_speech}</span><button type="button" onClick={() => setActiveWord(null)} aria-label={locale === "zh-CN" ? "关闭词卡" : "Close word card"}><X size={16} aria-hidden="true" /></button></div><h2>{activeLocale.term}</h2>{activeLocale.pronunciation && <p className="pronunciation">{activeLocale.pronunciation}</p>}<p>{activeLocale.definition}</p></div></aside>}<p className="reader-ai-disclosure"><Sparkles size={12} aria-hidden="true" />{text.aiGenerated}</p></div></section>}
    {quizOpen ? <div className="reader-footer"><button onClick={() => questionIndex > 0 ? moveQuestion(questionIndex - 1) : setQuizOpen(false)}><ArrowLeft size={17} aria-hidden="true" />{questionIndex > 0 ? (locale === "zh-CN" ? "上一题" : "Previous question") : (locale === "zh-CN" ? "返回故事" : "Back to story")}</button><span><CircleCheck size={16} aria-hidden="true" />{question ? `${questionIndex + 1} / ${questions.length}` : (locale === "zh-CN" ? "问答已完成" : "Questions complete")}</span>{question ? <button disabled={!answerRevealed} onClick={() => moveQuestion(questionIndex + 1)}>{questionIndex === questions.length - 1 ? (locale === "zh-CN" ? "完成问答" : "Finish") : (locale === "zh-CN" ? "下一题" : "Next question")}<ArrowRight size={17} aria-hidden="true" /></button> : <button onClick={() => { location.hash = "/catalog" }}>{locale === "zh-CN" ? "返回图书馆" : "Back to library"}<ArrowRight size={17} aria-hidden="true" /></button>}</div> : continuousMode ? <div className="reader-footer article-reader-footer"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><ArrowLeft size={17} aria-hidden="true" />{locale === "zh-CN" ? "返回顶部" : "Back to top"}</button><span><CircleCheck size={16} aria-hidden="true" />{viewMode === "script" ? (locale === "zh-CN" ? `脚本检查 · ${Math.round(((page + 1) / audioPages.length) * 100)}%` : `Script · ${Math.round(((page + 1) / audioPages.length) * 100)}%`) : (locale === "zh-CN" ? `文章阅读 · ${Math.round(((page + 1) / articlePages.length) * 100)}%` : `Article · ${Math.round(((page + 1) / articlePages.length) * 100)}%`)}</span><button disabled={questions.length === 0} onClick={() => setQuizOpen(true)}>{locale === "zh-CN" ? "开始答题" : "Start questions"}<ArrowRight size={17} aria-hidden="true" /></button></div> : <div className="reader-footer"><button disabled={page === 0} onClick={() => setPage((value) => value - 1)}><ArrowLeft size={17} aria-hidden="true" />{locale === "zh-CN" ? "上一页" : "Previous page"}</button><span><CircleCheck size={16} aria-hidden="true" />{locale === "zh-CN" ? "阅读进度已保存至此设备" : "Reading progress saved on this device"} · {page + 1} / {audioPages.length}</span><button disabled={page === audioPages.length - 1 && questions.length === 0} onClick={() => page === audioPages.length - 1 && questions.length > 0 ? setQuizOpen(true) : setPage((value) => value + 1)}>{page === audioPages.length - 1 && questions.length > 0 ? (locale === "zh-CN" ? "开始答题" : "Start questions") : (locale === "zh-CN" ? "下一页" : "Next page")}<ArrowRight size={17} aria-hidden="true" /></button></div>}</main>;
}

function ArticleStory({ story, locale, level, cover, activeWord, activeEntry, activeLocale, onOpenWord, aiDisclosure }: { story: Story; locale: string; level: string; cover: string; activeWord: string | null; activeEntry?: VocabularyEntry; activeLocale?: VocabularyEntry["locales"][string]; onOpenWord: (id: string | null) => void; aiDisclosure: string }) {
  const chinese = locale === "zh-CN";
  const articlePages = storyArticlePages(story);
  return <article className="article-reading-page article-view-page" lang={locale}><header className="article-reading-header"><img className="resource-reveal" src={cover} alt="" /><div><p className="eyebrow">{chinese ? "文章阅读" : "Article reading"}</p><h1>{story.title}</h1><p>{story.summary}</p><span>{chinese ? "作者" : "Writer"} · {story.writer}　·　{chinese ? "级别" : "Level"} {level.toUpperCase()}</span></div></header><div className="article-reading-copy">{activeWord && activeEntry && activeLocale && <aside className="vocabulary-card article-vocabulary-card" aria-live="polite"><img className="resource-reveal" src={`./vocabulary/${level}/${activeWord}/card.webp`} alt="" /><div><div className="vocabulary-heading"><span>{activeLocale.part_of_speech}</span><button type="button" onClick={() => onOpenWord(null)} aria-label={chinese ? "关闭词卡" : "Close word card"}><X size={16} aria-hidden="true" /></button></div><h2>{activeLocale.term}</h2>{activeLocale.pronunciation && <p className="pronunciation">{activeLocale.pronunciation}</p>}<p>{activeLocale.definition}</p></div></aside>}<div className="article-prose">{articlePages.map((page, pageIndex) => <section data-reader-page={pageIndex} key={page.id}>{page.paragraphs.map((paragraph, paragraphIndex) => <p className="article-paragraph" key={`${page.id}-${paragraphIndex}`}><StoryText text={paragraph.text} content={paragraph.content} activeWord={activeWord} onOpen={onOpenWord} /></p>)}</section>)}</div><p className="reader-ai-disclosure"><Sparkles size={12} aria-hidden="true" />{aiDisclosure}</p></div></article>;
}

function ScriptStory({ story, locale, level, cover, activeWord, activeEntry, activeLocale, onOpenWord, aiDisclosure }: { story: Story; locale: string; level: string; cover: string; activeWord: string | null; activeEntry?: VocabularyEntry; activeLocale?: VocabularyEntry["locales"][string]; onOpenWord: (id: string | null) => void; aiDisclosure: string }) {
  const chinese = locale === "zh-CN";
  const pages = storyAudioPages(story);
  const cast = storyCast(story);
  return <article className="article-reading-page script-reading-page" lang={locale}><header className="article-reading-header"><img className="resource-reveal" src={cover} alt="" /><div><p className="eyebrow">{chinese ? "配音脚本" : "Audio script"}</p><h1>{story.title}</h1><p>{chinese ? "每个编号对应一条独立字幕和未来的语音片段；说话人用于选择声音，不会写回文章正文。" : "Each ID addresses one subtitle cue and future audio clip. Speaker metadata selects a voice without changing the article."}</p><span>{chinese ? "作者" : "Writer"} · {story.writer}　·　{pages.reduce((total, page) => total + storyPageBlocks(page).length, 0)} {chinese ? "条语音片段" : "audio segments"}</span></div></header><div className="article-reading-copy">{activeWord && activeEntry && activeLocale && <aside className="vocabulary-card article-vocabulary-card" aria-live="polite"><img className="resource-reveal" src={`./vocabulary/${level}/${activeWord}/card.webp`} alt="" /><div><div className="vocabulary-heading"><span>{activeLocale.part_of_speech}</span><button type="button" onClick={() => onOpenWord(null)} aria-label={chinese ? "关闭词卡" : "Close word card"}><X size={16} aria-hidden="true" /></button></div><h2>{activeLocale.term}</h2>{activeLocale.pronunciation && <p className="pronunciation">{activeLocale.pronunciation}</p>}<p>{activeLocale.definition}</p></div></aside>}<div className="script-pages">{pages.map((page, pageIndex) => <section className="script-section" data-reader-page={pageIndex} key={page.id}><p className="script-page-label">{chinese ? `脚本页 ${pageIndex + 1}` : `Script page ${pageIndex + 1}`} · {page.id}</p>{storyPageBlocks(page).map((block, blockIndex) => { const segmentId = block.id ?? `${page.id}-b${String(blockIndex + 1).padStart(2, "0")}`; return <div className="script-block" data-segment-id={segmentId} key={segmentId}><small><strong>{cast[block.speaker]?.display_name ?? block.speaker}</strong><code>{segmentId}</code></small><p><StoryText text={block.text} content={block.content} activeWord={activeWord} onOpen={onOpenWord} /></p></div> })}</section>)}</div><p className="reader-ai-disclosure"><Sparkles size={12} aria-hidden="true" />{aiDisclosure}</p></div></article>;
}

function StoryText({ text, content, activeWord, onOpen }: { text?: string; content?: StoryContentPart[]; activeWord: string | null; onOpen: (id: string | null) => void }) {
  if (text) return text;
  return content?.map((part, index) => part.vocabulary ? <button type="button" className="vocabulary-word" data-active={activeWord === part.vocabulary.id} aria-expanded={activeWord === part.vocabulary.id} onClick={() => onOpen(activeWord === part.vocabulary!.id ? null : part.vocabulary!.id)} key={`${part.vocabulary.id}-${index}`}>{part.vocabulary.text}</button> : <span key={index}>{part.text}</span>);
}

function Progress() {
  const [progress, setProgress] = useState<ReadingProgress>(readProgress);
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { const refresh = () => setProgress(readProgress()); addEventListener("hailibrary-progress", refresh); return () => removeEventListener("hailibrary-progress", refresh) }, []);
  const activeLocale = progress.settings.learningLocale;
  const entries = Object.entries(progress.books).filter(([bookKey]) => bookKey.endsWith(`::${activeLocale}`));
  const completed = entries.filter(([, value]) => value.completed).length;
  return <main className="page-wrap"><section className="progress-page"><p className="eyebrow">仅保存在你的设备 · {localeName(activeLocale)}</p><h1>我的阅读进度</h1><p className="lead">当前只统计 {localeName(activeLocale)} 读物。切换“我要学习”的语言后，会显示该语言独立的阅读记录。</p><div className="stats"><Card><strong>{entries.length}</strong><span>读过的书</span></Card><Card><strong>{completed}</strong><span>完成的书</span></Card><Card><strong>{localeName(activeLocale)}</strong><span>当前学习语言</span></Card></div><Card className="data-card"><h2>你的数据可以随时带走</h2><p>导出 JSON 作为完整备份，其中每种语言的进度会分别保存；也可以在另一台设备或自己的“嗨！图书馆”部署中导入。</p><div><Button onClick={exportProgress}><Download size={17} aria-hidden="true" />导出进度 JSON</Button><Button variant="outline" onClick={() => input.current?.click()}><Upload size={17} aria-hidden="true" />导入 JSON</Button><input ref={input} hidden type="file" accept="application/json" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { await importProgress(file); setMessage("导入成功") } catch (error) { setMessage(error instanceof Error ? error.message : "导入失败") } }} /></div>{message && <p className="notice">{message}</p>}</Card></section></main>;
}

function About({ locale }: { locale: string }) {
  const [html, setHtml] = useState("");
  const availableLocale = locale === "zh-CN" ? "zh-CN" : "en-US";
  useEffect(() => {
    fetch(`./about/before-the-story-begins/${availableLocale}.md`)
      .then((response) => response.text())
      .then(async (markdown) => {
        const rendered = await marked.parse(markdown);
        const withAssetPaths = rendered.replaceAll('src="artwork/', 'src="./about/before-the-story-begins/artwork/');
        setHtml(DOMPurify.sanitize(withAssetPaths));
      });
  }, [availableLocale]);
  return <main className="page-wrap"><article className="markdown" lang={availableLocale} dangerouslySetInnerHTML={{ __html: html }} /></main>;
}
