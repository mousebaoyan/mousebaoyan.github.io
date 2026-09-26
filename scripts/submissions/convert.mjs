import { readFile } from "node:fs/promises";
import { fromMarkdown } from "mdast-util-from-markdown";
import { parse, stringify } from "yaml";
import { parseFragment } from "parse5";

// The Issue Forms are the source of truth for field names, order and validation.
const forms = await Promise.all(
  ["experience", "resource"].map(async (type) => {
    const template = parse(await readFile(
      new URL(`../../.github/ISSUE_TEMPLATE/${type}-submission.yml`, import.meta.url), "utf8",
    ));
    return { type, fields: template.body.filter((field) => field.id) };
  }),
);

function readForm(body) {
  const tree = fromMarkdown(body);
  const headings = tree.children.filter((node) => node.type === "heading" && node.depth === 3);
  const label = (node) => node?.children.map((child) => child.value ?? "").join("");
  const form = forms.find(({ fields }) => label(headings[0]) === fields[0].attributes.label);
  if (!form || tree.children[0] !== headings[0]) {
    throw new Error("无法识别投稿表单，请使用“分享经验”或“推荐资源”表单，并保留原有字段标题。");
  }

  // The last field is tags. Everything between the body/notes heading and this
  // footer is Markdown, including arbitrary headings and fenced code blocks.
  const footer = headings.findLast((node) => label(node) === form.fields.at(-1).attributes.label);
  const boundaries = [...headings.slice(0, form.fields.length - 1), footer];
  const values = {};
  for (const [index, field] of form.fields.entries()) {
    const heading = boundaries[index];
    if (!heading || label(heading) !== field.attributes.label ||
        (index > 0 && heading.position.start.offset <= boundaries[index - 1].position.start.offset)) {
      throw new Error(`投稿字段「${field.attributes.label}」缺失或顺序改变，请保留模板中的字段标题。`);
    }
    let value = body.slice(heading.position.end.offset, boundaries[index + 1]?.position.start.offset).trim();
    if (value === "_No response_") value = "";
    if (field.validations?.required && !value) {
      throw new Error(`请填写「${field.attributes.label}」。`);
    }
    if (field.type !== "textarea" && value.includes("\n")) {
      throw new Error(`「${field.attributes.label}」只能填写一行内容。`);
    }
    if (field.type === "dropdown" && !field.attributes.options.includes(value)) {
      throw new Error(`「${field.attributes.label}」必须使用表单提供的选项。`);
    }
    values[field.id] = value;
  }
  return { type: form.type, values };
}

// GitHub's image uploader emits HTML when it includes image dimensions.
// Convert only plain image tags, rather than enabling HTML in published posts.
function normalizeUploadedImages(markdown) {
  const replacements = [];
  const visit = (node) => {
    if (node.type === "html") {
      const fragment = parseFragment(node.value);
      let imageCount = 0;
      const converted = [];
      const unsupported = () => {
        throw new Error(`正文第 ${node.position.start.line} 行包含不支持的 HTML。仅支持普通图片标签，其余内容请使用 Markdown；代码示例请放在代码块内。`);
      };
      for (const child of fragment.childNodes) {
        if (child.nodeName === "#text" && !child.value.trim()) {
          converted.push(child.value);
          continue;
        }
        if (child.tagName !== "img" || child.attrs.some(({ name }) => !["src", "alt", "title", "width", "height"].includes(name))) unsupported();
        const attributes = Object.fromEntries(child.attrs.map(({ name, value }) => [name, value]));
        if (!/^https?:\/\//i.test(attributes.src ?? "") || !URL.canParse(attributes.src)) {
          throw new Error(`正文第 ${node.position.start.line} 行的图片请使用完整的 HTTPS 或 HTTP 地址，可先上传到 GitHub Issue。`);
        }
        const src = new URL(attributes.src).href.replaceAll("<", "%3C").replaceAll(">", "%3E");
        const alt = (attributes.alt ?? "").replace(/\s+/g, " ").replace(/[\\`*{}\[\]()#+.!_<>~|]/g, "\\$&");
        const title = attributes.title === undefined ? "" : ` "${attributes.title.replace(/\s+/g, " ").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
        converted.push(`![${alt}](<${src}>${title})`);
        imageCount++;
      }
      if (!imageCount) unsupported();
      replacements.push({ start: node.position.start.offset, end: node.position.end.offset, value: converted.join("") });
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(fromMarkdown(markdown));
  for (const replacement of replacements.reverse()) {
    markdown = markdown.slice(0, replacement.start) + replacement.value + markdown.slice(replacement.end);
  }
  return markdown;
}

function validateMarkdown(markdown) {
  const tree = fromMarkdown(markdown);
  const imageReferences = new Set();
  const collectImages = (node) => {
    if (node.type === "imageReference") imageReferences.add(node.identifier);
    for (const child of node.children ?? []) collectImages(child);
  };
  collectImages(tree);
  const visit = (node) => {
    if (node.type === "html") {
      throw new Error("正文请使用 Markdown，不支持原始 HTML；代码示例请放在代码块内。");
    }
    if (node.url) {
      const url = new URL(node.url, "https://mousebaoyan.github.io/");
      if (!["http:", "https:", "mailto:"].includes(url.protocol)) {
        throw new Error("正文包含不支持的链接协议，请使用 HTTPS、HTTP 或邮件链接。");
      }
      if ((node.type === "image" || (node.type === "definition" && imageReferences.has(node.identifier))) && !/^https?:\/\//i.test(node.url)) {
        throw new Error("正文图片请使用完整的 HTTPS 或 HTTP 地址，可先上传到 GitHub Issue。");
      }
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(tree);
}

/** Convert the approved Issue snapshot to a deterministic, schema-compatible file. */
export function createSubmission(issue) {
  if (!Number.isSafeInteger(issue.number) || issue.number < 1) throw new Error("无效的 Issue 编号。");
  const { type, values } = readForm((issue.body ?? "").replace(/\r\n/g, "\n"));
  const tags = [...new Set(values.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean))];
  const body = normalizeUploadedImages(values.body ?? values.notes);
  validateMarkdown(body);

  let metadata;
  if (type === "experience") {
    metadata = {
      title: values.title,
      author: values.author,
      date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date(issue.created_at)),
      school: `${values.school || "匿名"} · ${values.major}`,
      target: values.target,
      ...(values.direction && { major: values.direction }),
      excerpt: values.excerpt,
    };
  } else {
    if (!/^https?:\/\//i.test(values.link) || !URL.canParse(values.link)) {
      throw new Error("资源链接必须是完整的 HTTPS 或 HTTP 地址。");
    }
    metadata = {
      name: values.name,
      description: values.description,
      category: values.category,
      link: values.link,
    };
  }

  const collection = type === "experience" ? "experiences" : "resources";
  const otherCollection = type === "experience" ? "resources" : "experiences";
  const filename = `submission-${issue.number}.md`;
  return {
    path: `src/content/${collection}/${filename}`,
    otherPath: `src/content/${otherCollection}/${filename}`,
    content: `---\n${stringify({ ...metadata, featured: false, draft: false, tags, sourceIssue: issue.html_url })}---\n\n${body}\n`,
  };
}
