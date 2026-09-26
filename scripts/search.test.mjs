import assert from "node:assert/strict";
import test from "node:test";
import { searchDocuments, excerpt } from "../src/lib/search.ts";
import { markdownSections } from "../src/lib/search-index.ts";

const documents = [
  { title: "我的保研经历", kind: "保研经验", url: "/experiences/example/", meta: "计算机",
    sections: [{ heading: "导师联系", url: "/experiences/example/#contact", text: "联系导师之前，应阅读相关论文。面试时介绍自己的研究兴趣。" }] },
  { title: "导师联系工具", kind: "保研资源", url: "/resources/tool/", meta: "邮件",
    sections: [{ heading: "功能", url: "/resources/tool/#features", text: "AutoEmailSender 支持草稿管理。" }] },
];
test("Chinese body matches link to the correct section; title matches rank first", () => {
  assert.equal(searchDocuments(documents, "研究兴趣")[0].target, "/experiences/example/#contact");
  assert.equal(searchDocuments(documents, "导师")[0].kind, "保研资源");
  assert.ok(searchDocuments(documents, "研究兴趣")[0].excerpt.includes("研究兴趣"));
});
test("multiple keywords match across title and body; filters preserve the query", () => {
  assert.equal(searchDocuments(documents, "工具 草稿").length, 1);
  assert.equal(searchDocuments(documents, "导师", "保研经验").length, 1);
  assert.equal(searchDocuments(documents, "导师", "常见问题").length, 0);
  assert.equal(searchDocuments(documents, "工具 不存在").length, 0);
});
test("Latin case and full-width text match; empty and literal special queries are safe", () => {
  assert.equal(searchDocuments(documents, "ａｕｔｏｅｍａｉｌｓｅｎｄｅｒ").length, 1);
  for (const query of ["", "   ", "[.*]", "<img onerror=alert(1)>"]) assert.deepEqual(searchDocuments(documents, query), []);
});
test("snippets show deep body matches instead of the start of the article", () => {
  const result = excerpt("前文".repeat(200) + "目标关键词" + "后文".repeat(100), ["目标关键词"]);
  assert.ok(result.includes("目标关键词"));
  assert.ok(result.startsWith("…"));
  assert.ok(result.length < 120);
});
test("Markdown indexing retains readable content and uses actual rendered heading ids", () => {
  const sections = markdownSections("介绍\n\n## **导师**\n\n阅读[论文](https://example.com/private-url)。\n\n## 导师\n\n第二节内容。", "/article/", [
    { slug: "导师", text: "导师" }, { slug: "导师-1", text: "导师" },
  ]);
  assert.equal(sections[1].text, "阅读论文。");
  assert.equal(sections[2].url, `/article/#${encodeURIComponent("导师-1")}`);
  assert.ok(!JSON.stringify(sections).includes("private-url"));
});
