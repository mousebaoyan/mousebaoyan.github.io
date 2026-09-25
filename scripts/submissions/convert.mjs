import { readFile } from "node:fs/promises";
import { fromMarkdown } from "mdast-util-from-markdown";
import { parse, stringify } from "yaml";

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
    throw new Error("无法识别投稿表单，请使用经验贴或推荐资源模板，并保留原有字段标题。");
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
  const body = values.body ?? values.notes;
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
