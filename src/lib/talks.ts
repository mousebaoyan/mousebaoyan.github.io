import { getCollection, type CollectionEntry } from "astro:content";

export type Talk = CollectionEntry<"talks">;
export type Deck = Talk["data"]["decks"][number];
export interface SlideData { pages: number; aspectRatio: string; text: string[] }

const slideFiles = import.meta.glob<SlideData>("../data/slides/*.json", { eager: true, import: "default" });

export async function getTalks() {
  return (await getCollection("talks", ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// 有录屏的场次才生成详情页
export const isAvailable = (talk: Talk) => Boolean(talk.data.bvid);

export function slidesFor(talk: Talk, deck: Deck): SlideData {
  const data = slideFiles[`../data/slides/${talk.id}--${deck.id}.json`];
  if (!data) throw new Error(`Missing slides for ${talk.id}/${deck.id}. Run scripts/talks/build-slides.mjs first.`);
  return data;
}

export const slideImage = (talk: Talk, deck: Deck, page: number, thumb = false) =>
  `/talks/${talk.id}/${deck.id}/${String(page).padStart(2, "0")}${thumb ? "-thumb" : ""}.webp`;

export const deckPdf = (talk: Talk, deck: Deck) => `/talks/${talk.id}/${deck.id}.pdf`;

export function talkDate(talk: Talk) {
  const { date, exactDate } = talk.data;
  return date.toLocaleDateString("zh-CN", exactDate
    ? { year: "numeric", month: "long", day: "numeric" }
    : { year: "numeric", month: "long" });
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours} 小时 ${minutes} 分钟` : `${minutes} 分钟`;
}

// 课件页面的标题：第一行像标题（较短、不是列表项或句子）时直接使用，否则取所在章节名
export function slideHeading(deck: Deck, slides: SlideData, page: number) {
  const firstLine = slides.text[page - 1]?.split("\n")[0]?.trim() ?? "";
  const looksLikeTitle = firstLine && Array.from(firstLine).length <= 16 && !/^[·•\-]|[。，；：:]$/u.test(firstLine);
  const chapter = deck.chapters.filter((item) => item.page <= page).at(-1);
  return `第 ${page} 页 · ${looksLikeTitle ? firstLine : chapter?.title ?? deck.title}`;
}
