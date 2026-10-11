import { getCollection } from "astro:content";

export const EXPERIENCE_PAGE_SIZE = 6;

export async function getPublishedExperiences() {
  return (await getCollection("experiences", ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime()
      || a.id.localeCompare(b.id, "en"));
}

// 投稿里的本科背景写作「学校 · 专业」
export function splitSchool(school: string) {
  const split = school.lastIndexOf(" · ");
  return split > 0
    ? { from: school.slice(0, split), major: school.slice(split + 3) }
    : { from: school, major: "" };
}

// 字数按汉字和英文单词计，阅读速度按每分钟 400 字估算
export function readingStats(body = "") {
  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "");
  const words = text.match(/\p{Script=Han}|[a-zA-Z0-9]+/gu)?.length ?? 0;
  return { words, minutes: Math.max(1, Math.ceil(words / 400)) };
}

export const shortDate = (date: Date) => `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
