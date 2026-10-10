import { getCollection, render } from "astro:content";
import { groups } from "../data/faq";
import { markdownSections } from "../lib/search-index";
import type { SearchDocument } from "../lib/search";
import { getTalks, isAvailable, slideHeading, slidesFor } from "../lib/talks";

export async function GET() {
  const [experiences, resources, talks] = await Promise.all([
    getCollection("experiences", ({ data }) => !data.draft),
    getCollection("tools", ({ data }) => !data.draft),
    getTalks(),
  ]);
  const documents: SearchDocument[] = await Promise.all([
    ...experiences.map(async (entry): Promise<SearchDocument> => {
      const url = `/experiences/${entry.id}/`;
      const { headings } = await render(entry);
      const sections = markdownSections(entry.body ?? "", url, headings);
      // The reader hides a Markdown h1 that repeats the page title.
      if (headings[0]?.depth === 1 && headings[0].text.replace(/\s+/g, "") === entry.data.title.replace(/\s+/g, "")) {
        const repeatedTitle = `${url}#${encodeURIComponent(headings[0].slug)}`;
        sections.forEach((section) => { if (section.url === repeatedTitle) section.url = url; });
      }
      return { title: entry.data.title, url, kind: "保研经验",
        meta: [entry.data.author, entry.data.school, entry.data.target, entry.data.major, ...entry.data.tags].filter(Boolean).join(" · "),
        sections: [{ heading: "", url, text: entry.data.excerpt }, ...sections] };
    }),
    ...resources.map(async (entry): Promise<SearchDocument> => {
      const url = `/resources/${entry.id}/`;
      const { headings } = await render(entry);
      return { title: entry.data.name, url, kind: "保研资源", meta: [entry.data.category, ...entry.data.tags].join(" · "),
        sections: [{ heading: "", url, text: entry.data.description }, ...markdownSections(entry.body ?? "", url, headings)] };
    }),
  ]);
  // 每页课件单独成节，搜索结果直接打开对应页
  for (const talk of talks.filter(isAvailable)) {
    const url = `/talks/${talk.id}/`;
    documents.push({ title: talk.data.title, url, kind: "直播回放",
      meta: ["直播", ...talk.data.speakers].join(" · "),
      sections: [{ heading: "", url, text: talk.data.summary },
        ...talk.data.decks.flatMap((deck) => {
          const slides = slidesFor(talk, deck);
          return slides.text.map((text, index) => ({
            heading: `课件${slideHeading(deck, slides, index + 1)}`,
            url: `${url}#${deck.id}-${index + 1}`, text,
          }));
        })] });
  }
  for (const group of groups) {
    group.questions.forEach((item, index) => {
      const url = `/faq/#${group.id}-${index + 1}`;
      documents.push({ title: item.question, url, kind: "常见问题", meta: group.title, keywords: group.keywords,
        sections: [{ heading: "", url, text: item.answer }] });
    });
  }
  return new Response(JSON.stringify(documents), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
