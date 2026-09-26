import { fromMarkdown } from "mdast-util-from-markdown";
import type { RootContent } from "mdast";
import type { SearchSection } from "./search";

function plainText(node: { type: string; value?: string; alt?: string | null; children?: unknown[] }): string {
  if (node.type === "html" || node.type === "definition") return "";
  if (node.type === "image") return node.alt ?? "";
  if (node.value) return node.value;
  if (node.children) {
    const separator = ["paragraph", "heading", "strong", "emphasis", "link", "linkReference"].includes(node.type) ? "" : " ";
    return (node.children as RootContent[]).map(plainText).join(separator);
  }
  return "";
}

export function markdownSections(body: string, url: string, headings: { slug: string; text: string }[]): SearchSection[] {
  const sections: SearchSection[] = [];
  let current: SearchSection = { heading: "", url, text: "" };
  let headingIndex = 0;
  for (const node of fromMarkdown(body).children) {
    if (node.type === "heading") {
      if (current.text.trim() || current.heading) sections.push(current);
      const heading = headings[headingIndex++];
      current = { heading: plainText(node), url: heading ? `${url}#${encodeURIComponent(heading.slug)}` : url, text: "" };
    } else {
      const text = plainText(node).trim();
      if (text) current.text += `${current.text ? "\n" : ""}${text}`;
    }
  }
  if (current.text.trim() || current.heading) sections.push(current);
  return sections;
}
