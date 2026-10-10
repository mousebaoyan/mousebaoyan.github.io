import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const tools = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/resources" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum(["官方", "情报", "材料", "技巧", "备考", "选校", "工具", "其他"]),
    link: z.string().url(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()),
  }),
});

const experiences = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/experiences" }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.coerce.date(),
    school: z.string(),
    target: z.string(),
    major: z.string().optional(),
    excerpt: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()),
  }),
});

const talks = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/talks" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // 只知道月份的场次填 false，页面只显示到月
    exactDate: z.boolean().default(true),
    speakers: z.array(z.string()).default([]),
    summary: z.string(),
    // 录屏暂不可访问时不填 bvid，列表页显示为待完善
    bvid: z.string().regex(/^BV[0-9A-Za-z]{10}$/).optional(),
    duration: z.number().int().positive().optional(),
    decks: z.array(z.object({
      // 对应 scripts/talks/build-slides.mjs 的 deck-slug
      id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string(),
      speaker: z.string(),
      chapters: z.array(z.object({ title: z.string(), page: z.number().int().positive() })).default([]),
    })).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { tools, experiences, talks };
