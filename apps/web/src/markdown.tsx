import DOMPurify from "dompurify";
import { marked } from "marked";
import { useMemo } from "react";

export function renderMarkdown(markdown: string, rewrite = (html: string) => html) {
  return DOMPurify.sanitize(rewrite(marked.parse(markdown, { async: false })));
}

export function SafeMarkdown({ markdown, className }: { markdown: string; className: string }) {
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
