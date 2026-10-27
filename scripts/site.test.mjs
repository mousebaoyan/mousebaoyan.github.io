import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { parse } from "yaml";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");
const isFile = (path) => existsSync(path) && statSync(path).isFile();
const frontmatter = (path) => parse(readFileSync(path, "utf8").split(/^---\s*$/m)[1]);
function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

assert.ok(existsSync(join(dist, "index.html")), "Run npm run build before npm run test:site.");

test("search index contains published content only, with real section targets", () => {
  const documents = JSON.parse(readFileSync(join(dist, "search-index.json"), "utf8"));
  const urls = new Set(documents.map((document) => document.url));
  assert.equal(urls.size, documents.length, "Do not duplicate pages in search results");
  for (const collection of ["experiences", "resources"]) {
    for (const path of filesIn(join(root, "src/content", collection)).filter((path) => path.endsWith(".md"))) {
      const metadata = frontmatter(path);
      const slug = relative(join(root, "src/content", collection), path).replace(/\.md$/, "");
      assert.equal(urls.has(`/${collection}/${slug}/`), !metadata.draft);
    }
  }
  // Talks only get a page (and search entry) once their recording is available.
  for (const path of filesIn(join(root, "src/content/talks")).filter((path) => path.endsWith(".md"))) {
    const metadata = frontmatter(path);
    const slug = relative(join(root, "src/content/talks"), path).replace(/\.md$/, "");
    assert.equal(urls.has(`/talks/${slug}/`), Boolean(metadata.bvid) && !metadata.draft);
  }
  assert.ok(documents.some((document) => document.kind === "常见问题"));
  for (const document of documents) {
    for (const target of [document.url, ...document.sections.map((section) => section.url)]) {
      const url = new URL(target, "https://mousebaoyan.cn");
      assert.equal(url.origin, "https://mousebaoyan.cn");
      const html = readFileSync(join(dist, decodeURIComponent(url.pathname), "index.html"), "utf8");
      if (url.hash) assert.ok(html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing search target: ${target}`);
    }
  }
});

test("published content has detail pages while drafts have no generated route", () => {
  for (const collection of ["experiences", "resources"]) {
    const directory = join(root, "src/content", collection);
    for (const path of filesIn(directory).filter((path) => path.endsWith(".md"))) {
      const metadata = frontmatter(path);
      const slug = relative(directory, path).replace(/\.md$/, "");
      const output = join(dist, collection, slug, "index.html");
      assert.equal(existsSync(output), !metadata.draft, `${collection}/${slug}: incorrect draft visibility`);
    }
  }
  for (const path of filesIn(join(root, "src/content/talks")).filter((path) => path.endsWith(".md"))) {
    const metadata = frontmatter(path);
    const slug = relative(join(root, "src/content/talks"), path).replace(/\.md$/, "");
    assert.equal(existsSync(join(dist, "talks", slug, "index.html")), Boolean(metadata.bvid) && !metadata.draft,
      `talks/${slug}: pages are generated only for published talks with a recording`);
  }
});

test("talk pages offer every slide, PDF, and available PPTX source", () => {
  const timeline = readFileSync(join(dist, "talks/index.html"), "utf8");
  for (const path of filesIn(join(root, "src/content/talks")).filter((path) => path.endsWith(".md"))) {
    const metadata = frontmatter(path);
    const slug = relative(join(root, "src/content/talks"), path).replace(/\.md$/, "");
    if (!metadata.bvid || metadata.draft) continue;
    const html = readFileSync(join(dist, "talks", slug, "index.html"), "utf8");
    assert.ok(timeline.includes(`href="/talks/${slug}/"`), `${slug}: missing replay on timeline`);
    assert.ok(html.includes(`player.bilibili.com/player.html?bvid=${metadata.bvid}`), `${slug}: missing video player`);
    assert.ok(html.includes(`href="https://www.bilibili.com/video/${metadata.bvid}/"`), `${slug}: missing Bilibili link`);
    for (const deck of metadata.decks ?? []) {
      const { pages } = JSON.parse(readFileSync(join(root, "src/data/slides", `${slug}--${deck.id}.json`), "utf8"));
      for (let page = 1; page <= pages; page++) assert.ok(html.includes(`id="${deck.id}-${page}"`), `${slug}: missing slide ${page}`);
      assert.ok(html.includes(`href="/talks/${slug}/${deck.id}.pdf"`), `${slug}: missing PDF download`);
      const pptx = `/talks/${slug}/${deck.id}.pptx`;
      assert.equal(html.includes(`href="${pptx}"`), Boolean(deck.pptx), `${slug}: incorrect PPTX download visibility`);
      if (deck.pptx) {
        const source = readFileSync(join(root, "public", pptx));
        assert.equal(source.subarray(0, 2).toString(), "PK", `${slug}: invalid PPTX source`);
        assert.deepEqual(readFileSync(join(dist, pptx)), source, `${slug}: PPTX source changed during build`);
      }
    }
  }
});

test("generated pages have no broken or redirected local links or asset references", () => {
  const missing = [];
  const redirected = [];
  for (const file of filesIn(dist).filter((path) => path.endsWith(".html"))) {
    const route = relative(dist, file).replace(/index\.html$/, "");
    const base = new URL(route, "https://mousebaoyan.cn/");
    const html = readFileSync(file, "utf8");
    // Astro emits quoted href/src attributes; code examples are HTML-escaped.
    for (const [, attribute] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = new URL(attribute.replaceAll("&amp;", "&"), base);
      if (url.origin !== base.origin) continue;
      const path = join(dist, decodeURIComponent(url.pathname));
      const link = `${route || "/"} → ${attribute}`;
      // GitHub Pages redirects a directory URL without its trailing slash, costing a round trip.
      if (isFile(join(path, "index.html"))) {
        if (!url.pathname.endsWith("/")) redirected.push(link);
      } else if (!isFile(path) && !isFile(`${path}.html`)) {
        missing.push(link);
      }
    }
  }
  assert.deepEqual(missing, []);
  assert.deepEqual(redirected, []);
});

test("detail pages point discussion to the forum", () => {
  for (const file of filesIn(dist).filter((path) => path.endsWith(".html"))) {
    const route = `/${relative(dist, file).replace(/index\.html$/, "")}`;
    const html = readFileSync(file, "utf8");
    const isDetail = /^\/(experiences|resources|talks)\/(?!page\/)[^/]+\/$/.test(route);
    assert.equal(html.includes('class="forum-prompt'), isDetail, `${route}: incorrect forum prompt visibility`);
  }
});
