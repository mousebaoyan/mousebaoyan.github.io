import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";
import { createSubmission } from "./convert.mjs";
import { fromMarkdown } from "mdast-util-from-markdown";

async function fixture(type, overrides = {}) {
  const template = parse(await readFile(new URL(`../../.github/ISSUE_TEMPLATE/${type}-submission.yml`, import.meta.url), "utf8"));
  const values = {
    title: '经验："双非"保研', author: "匿名", school: "某高校", major: "软件工程",
    target: "某大学 · 软件学院", direction: "具身智能", excerpt: "摘要第一行\n第二行",
    body: "## 背景\n\n内容\n\n### 面试经历\n\n更多内容。",
    tags: "夏令营, 直博，夏令营, ", name: "推荐网站", description: "描述",
    category: "工具", link: "https://example.com/?a=1&b=2", notes: "## 使用建议\n\n推荐理由。",
    ...overrides,
  };
  return {
    number: 42,
    html_url: "https://github.com/mousebaoyan/mousebaoyan.github.io/issues/42",
    created_at: "2026-09-25T16:03:04Z",
    body: template.body.filter((field) => field.id).map((field) => `### ${field.attributes.label}\n\n${values[field.id]}`).join("\n\n"),
  };
}

const metadata = (submission) => parse(submission.content.split(/^---$/m)[1]);

test("experience conversion maps school, undergraduate major and research direction correctly", async () => {
  const issue = await fixture("experience");
  const submission = createSubmission(issue);
  assert.equal(submission.path, "src/content/experiences/submission-42.md");
  assert.deepEqual(metadata(submission), {
    title: '经验："双非"保研', author: "匿名", date: "2026-09-26",
    school: "某高校 · 软件工程", target: "某大学 · 软件学院", major: "具身智能",
    excerpt: "摘要第一行\n第二行", featured: false, draft: false,
    tags: ["夏令营", "直博"], sourceIssue: issue.html_url,
  });
  assert.match(submission.content, /### 面试经历\n\n更多内容。/);
});

test("resources use the current template categories and preserve notes", async () => {
  const submission = createSubmission(await fixture("resource"));
  assert.equal(submission.path, "src/content/resources/submission-42.md");
  assert.equal(metadata(submission).category, "工具");
  assert.equal(metadata(submission).link, "https://example.com/?a=1&b=2");
  assert.match(submission.content, /## 使用建议\n\n推荐理由。/);
});

test("optional answers and GitHub's empty-answer placeholder are handled", async () => {
  const submission = createSubmission(await fixture("experience", { school: "_No response_", direction: "", tags: "_No response_" }));
  assert.equal(metadata(submission).school, "匿名 · 软件工程");
  assert.equal(metadata(submission).major, undefined);
  assert.deepEqual(metadata(submission).tags, []);
  assert.ok(createSubmission(await fixture("resource", { notes: "_No response_", tags: "" })).content.endsWith("---\n\n\n"));
});

test("body headings resembling form fields and headings inside fences stay in the article", async () => {
  const body = "### 标签（选填）\n\n文章中的小节\n\n```md\n### 作者署名\n\n<script>alert(1)</script>\n```\n\n### 结尾\n\n结尾。";
  const issue = await fixture("experience", { body });
  assert.ok(createSubmission(issue).content.endsWith(`${body}\n`));
});

test("CRLF, images, links, quotations and Markdown hard breaks are preserved", async () => {
  const body = "原文  \n下一行\n\n![图片](https://example.com/image.png)\n\n> 引用\n\n[链接](https://example.com)";
  const issue = await fixture("experience", { body });
  issue.body = issue.body.replaceAll("\n", "\r\n");
  assert.ok(createSubmission(issue).content.endsWith(`${body}\n`));
});

test("GitHub uploaded HTML images convert to Markdown for both submission types", async () => {
  const body = '正文。\n\n<img width="1530" height="1100" alt="Image" src="https://github.com/user-attachments/assets/example" />\n\n后文。';
  for (const type of ["experience", "resource"]) {
    const submission = createSubmission(await fixture(type, { body, notes: body }));
    assert.ok(submission.content.endsWith('正文。\n\n![Image](<https://github.com/user-attachments/assets/example>)\n\n后文。\n'));
  }
});

test("image conversion handles entities, Markdown characters and multiple images without touching code", async () => {
  const body = '<img src="https://example.com/a.png?a=1&amp;b=2" alt="[示例] &lt;script&gt;" title="A &quot;quote&quot;" />\n<img src="https://example.com/b.png">\n\n`<img src=x>`\n\n```html\n<img src=x onerror=alert(1)>\n```';
  const content = createSubmission(await fixture("experience", { body })).content.split(/^---\s*$/m).slice(2).join("---");
  const images = [];
  const visit = (node) => {
    assert.notEqual(node.type, "html");
    if (node.type === "image") images.push(node);
    for (const child of node.children ?? []) visit(child);
  };
  visit(fromMarkdown(content));
  assert.equal(images.length, 2);
  assert.equal(images[0].url, "https://example.com/a.png?a=1&b=2");
  assert.equal(images[0].alt, "[示例] <script>");
  assert.equal(images[0].title, 'A "quote"');
  assert.ok(content.includes('```html\n<img src=x onerror=alert(1)>\n```'));
});

test("image compatibility does not allow arbitrary HTML, event handlers or unsafe sources", async () => {
  for (const body of [
    '<img src="https://example.com/a.png" onerror="alert(1)">',
    '<img src="https://example.com/a.png" style="display:none">',
    '<img src="https://example.com/a.png"><script>alert(1)</script>',
    '<div><img src="https://example.com/a.png"></div>',
    '<img src="jav&#x61;script:alert(1)">',
    '<img src="data:image/svg+xml,test">',
    '<img src="/local.png">',
    '<img alt="missing source">',
  ]) {
    const issue = await fixture("experience", { body });
    assert.throws(() => createSubmission(issue), /HTML|图片/);
  }
});

test("YAML-looking field values cannot inject publication metadata", async () => {
  const submission = createSubmission(await fixture("experience", {
    title: "false", author: "[admin]", excerpt: "---\ndraft: true\nfeatured: true\n---",
  }));
  assert.equal(metadata(submission).title, "false");
  assert.equal(metadata(submission).author, "[admin]");
  assert.equal(metadata(submission).draft, false);
  assert.equal(metadata(submission).featured, false);
});

test("reapproval keeps the path and submission date while applying edited content", async () => {
  const issue = await fixture("experience");
  const before = createSubmission(issue);
  const after = createSubmission({ ...issue, body: issue.body.replace("更多内容。", "管理员修订后的内容。") });
  assert.equal(after.path, before.path);
  assert.equal(metadata(after).date, metadata(before).date);
  assert.notEqual(after.content, before.content);
  assert.deepEqual(createSubmission(issue), before);
});

test("missing, renamed or reordered form headers fail clearly", async () => {
  const issue = await fixture("experience");
  for (const body of [
    issue.body.replace("### 作者署名", "### 昵称"),
    issue.body.replace("### 标签（选填）", "### 自定义标签"),
    issue.body.replace("### 本科专业", "### 去向（录取院校 · 学院）"),
    "一个没有模板的普通 Issue",
  ]) assert.throws(() => createSubmission({ ...issue, body }), /字段|表单/);
});

test("required fields, categories and resource URLs are validated", async () => {
  for (const [type, overrides, pattern] of [
    ["experience", { title: "_No response_" }, /请填写/],
    ["experience", { author: "姓名\n另一行" }, /一行/],
    ["resource", { category: "未知类别" }, /选项/],
    ["resource", { link: "javascript:alert(1)" }, /资源链接/],
    ["resource", { link: "https://" }, /资源链接/],
  ]) {
    const issue = await fixture(type, overrides);
    assert.throws(() => createSubmission(issue), pattern);
  }
});

test("raw HTML, unsafe links and local image paths are rejected", async () => {
  for (const body of [
    "<script>alert(1)</script>", "<img src=x onerror=alert(1)>",
    "[点击](javascript:alert%281%29)", "[点击](jav&#x61;script:alert%281%29)",
    "![图片](../../private.png)", "![图片][photo]\n\n[photo]: ../../private.png",
    "[点击][link]\n\n[link]: data:text/html,test",
  ]) {
    const issue = await fixture("experience", { body });
    assert.throws(() => createSubmission(issue), /HTML|协议|图片/);
  }
});

test("paths always come from a valid Issue number", async () => {
  const issue = await fixture("experience");
  for (const number of ["../other", 0, -1, 1.5]) {
    assert.throws(() => createSubmission({ ...issue, number }), /Issue 编号/);
  }
});
