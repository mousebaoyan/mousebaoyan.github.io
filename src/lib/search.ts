export type SearchKind = "经验贴" | "推荐资源" | "常见问题";
export interface SearchSection { heading: string; url: string; text: string }
export interface SearchDocument {
  title: string;
  url: string;
  kind: SearchKind;
  meta: string;
  keywords?: string;
  sections: SearchSection[];
}
export interface SearchResult extends SearchDocument {
  target: string;
  heading: string;
  excerpt: string;
  score: number;
}

const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase("zh-CN");
export const queryTerms = (query: string) => [...new Set(normalize(query.trim()).split(/\s+/u).filter(Boolean))];

export function excerpt(text: string, terms: string[], length = 115): string {
  const clean = text.replace(/\s+/gu, " ").trim();
  const normalized = normalize(clean);
  const positions = terms.map((term) => normalized.indexOf(term)).filter((index) => index >= 0);
  const match = positions.length ? Math.min(...positions) : 0;
  const start = Math.max(0, match - 28);
  return `${start ? "…" : ""}${clean.slice(start, start + length)}${start + length < clean.length ? "…" : ""}`;
}

export function searchDocuments(documents: SearchDocument[], query: string, kind = "全部"): SearchResult[] {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const phrase = normalize(query.trim());
  const results: SearchResult[] = [];
  for (const document of documents) {
    if (kind !== "全部" && kind !== document.kind) continue;
    const title = normalize(document.title);
    const meta = normalize(`${document.meta} ${document.keywords ?? ""}`);
    const sections = document.sections.map((section) => ({ ...section, normalized: normalize(`${section.heading}\n${section.text}`) }));
    const all = `${title}\n${meta}\n${sections.map((section) => section.normalized).join("\n")}`;
    if (!terms.every((term) => all.includes(term))) continue;
    const ranked = sections.map((section) => ({
      ...section,
      score: terms.reduce((score, term) => score + (section.normalized.includes(term) ? 3 : 0) + (normalize(section.heading).includes(term) ? 4 : 0), 0)
        + (section.normalized.includes(phrase) ? 5 : 0),
    })).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 18 : 0) + (meta.includes(term) ? 5 : 0), 0)
      + (title.includes(phrase) ? 25 : 0) + (best?.score ?? 0);
    results.push({ ...document, score, target: best?.score ? best.url : document.url,
      heading: best?.score ? best.heading : "", excerpt: excerpt(best?.text || document.meta, terms) });
  }
  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh-CN"));
}
