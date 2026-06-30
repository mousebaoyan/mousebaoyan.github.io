import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const tools = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tools" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum(["官方", "情报", "材料", "技巧", "备考", "选校", "工具", "其他"]),
    link: z.string().url(),
    featured: z.boolean().default(false),
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
    tags: z.array(z.string()),
  }),
});

export const collections = { tools, experiences };
