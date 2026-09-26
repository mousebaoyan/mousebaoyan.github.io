import { getCollection } from "astro:content";

export const EXPERIENCE_PAGE_SIZE = 6;

export async function getPublishedExperiences() {
  return (await getCollection("experiences", ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime()
      || a.id.localeCompare(b.id, "en"));
}
