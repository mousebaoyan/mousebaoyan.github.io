import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";
import { createSubmission } from "./convert.mjs";
import { fromMarkdown } from "mdast-util-from-markdown";
import { createSubmissionFromIssue, MAX_ATTACHMENT_BYTES } from "./attachments.mjs";

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

const attachmentUrl = "https://github.com/user-attachments/files/33529977/default.md";
const attachmentLink = `[保研经验贴.md](${attachmentUrl})`;

test("GitHub Markdown attachments become the complete body for both submission types", async () => {
  const body = "# 原标题\r\n\r\n### 标签（选填）\r\n\r\n附件里的文章小节。\r\n\r\n## 经历\r\n\r\n" + "长文内容。".repeat(15_000);
  for (const type of ["experience", "resource"]) {
    const issue = await fixture(type, { body: attachmentLink, notes: attachmentLink });
    const calls = [];
    const submission = await createSubmissionFromIssue(issue, { fetch: async (url, options) => {
      calls.push(url);
      assert.equal(options.redirect, "manual");
      assert.ok(options.signal instanceof AbortSignal);
      return new Response(body);
    } });
    assert.deepEqual(calls, [attachmentUrl]);
    assert.ok(submission.content.endsWith(body.replaceAll("\r\n", "\n") + "\n"));
    assert.equal(metadata(submission).sourceIssue, issue.html_url);
    assert.equal(metadata(submission).draft, false);
    assert.ok(!submission.content.includes(attachmentLink));
  }
});

test("pasted articles need no network access and retain their existing output", async () => {
  for (const type of ["experience", "resource"]) {
    const issue = await fixture(type);
    assert.deepEqual(await createSubmissionFromIssue(issue, { fetch: () => assert.fail("unexpected download") }), createSubmission(issue));
  }
});

test("attachments cannot silently publish just the download link or ambiguous mixed content", async () => {
  const issue = await fixture("experience", { body: attachmentLink });
  assert.throws(() => createSubmission(issue), /尚未读取/);
  for (const body of [`说明文字\n\n${attachmentLink}`, `${attachmentLink}\n\n${attachmentLink}`]) {
    await assert.rejects(createSubmissionFromIssue(await fixture("experience", { body })), /只保留一个/);
  }
});

test("downloads follow GitHub storage redirects without forwarding credentials", async () => {
  const issue = await fixture("experience", { body: attachmentLink });
  const destination = "https://objects.githubusercontent.com/github-production-repository-file-123/file?signature=example";
  const calls = [];
  const submission = await createSubmissionFromIssue(issue, { fetch: async (url, options) => {
    calls.push(url);
    assert.equal(options.headers, undefined);
    return calls.length === 1 ? new Response(null, { status: 302, headers: { location: destination } }) : new Response("## 经历\n\n全文。");
  } });
  assert.deepEqual(calls, [attachmentUrl, destination]);
  assert.ok(submission.content.endsWith("## 经历\n\n全文。\n"));
});

test("only public HTTPS GitHub upload URLs and trusted download redirects are fetched", async () => {
  for (const url of ["https://example.com/post.md", "http://github.com/user-attachments/files/1/post.md", "https://github.com:444/user-attachments/files/1/post.md", "https://user:pass@github.com/user-attachments/files/1/post.md", "https://github.com/owner/repo/post.md", "post.md"]) {
    const issue = await fixture("experience", { body: `[文章](${url})` });
    await assert.rejects(createSubmissionFromIssue(issue, { fetch: () => assert.fail("untrusted URL fetched") }), /直接上传/);
  }
  const issue = await fixture("experience", { body: attachmentLink });
  for (const location of ["http://127.0.0.1/private", "https://example.com/post.md", "https://objects.githubusercontent.com.evil.test/post.md"]) {
    let calls = 0;
    await assert.rejects(createSubmissionFromIssue(issue, { fetch: async () => {
      assert.equal(++calls, 1);
      return new Response(null, { status: 302, headers: { location } });
    } }), /直接上传/);
  }
});

test("download errors, redirect loops and empty attachments stop publication", async () => {
  const issue = await fixture("experience", { body: attachmentLink });
  await assert.rejects(createSubmissionFromIssue(issue, { fetch: async () => new Response("", { status: 404 }) }), /HTTP 404/);
  await assert.rejects(createSubmissionFromIssue(issue, { fetch: async () => { throw new TypeError("fetch failed"); } }), /下载失败/);
  await assert.rejects(createSubmissionFromIssue(issue, { fetch: async () => new Response(null, { status: 302, headers: { location: attachmentUrl } }) }), /重定向次数/);
  await assert.rejects(createSubmissionFromIssue(issue, { fetch: async () => new Response(" \n\t") }), /正文为空/);
});

test("attachment size is bounded using both headers and the actual byte stream", async () => {
  const issue = await fixture("experience", { body: attachmentLink });
  await assert.rejects(createSubmissionFromIssue(issue, { fetch: async () => new Response("small", { headers: { "content-length": MAX_ATTACHMENT_BYTES + 1 } }) }), /2 MB/);
  // No content-length header: enforce the limit while reading, before parsing.
  await assert.rejects(createSubmissionFromIssue(issue, { fetch: async () => new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(MAX_ATTACHMENT_BYTES));
      controller.enqueue(new Uint8Array(1));
      controller.close();
    },
  })) }), /2 MB/);
});

test("attachments require UTF-8 text and use the existing Markdown safety checks", async () => {
  const issue = await fixture("experience", { body: attachmentLink });
  for (const [body, pattern] of [
    [new Uint8Array([0xff, 0xfe, 0x80]), /UTF-8/],
    ["text\0binary", /二进制/],
    ["<script>alert(1)</script>", /HTML/],
    ["![图片](./local.png)", /图片/],
    ["[链接](javascript:alert%281%29)", /协议/],
  ]) {
    await assert.rejects(createSubmissionFromIssue(issue, { fetch: async () => new Response(body) }), pattern);
  }
  const submission = await createSubmissionFromIssue(issue, { fetch: async () => new Response('\ufeff## 正文\r\n\r\n<img src="https://example.com/photo.png" alt="图片">') });
  assert.ok(submission.content.endsWith('## 正文\n\n![图片](<https://example.com/photo.png>)\n'));
});
