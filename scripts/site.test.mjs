import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { parse } from "yaml";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");
const isFile = (path) => existsSync(path) && statSync(path).isFile();
function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

assert.ok(existsSync(join(dist, "index.html")), "Run npm run build before npm run test:site.");

test("published content has detail pages while drafts have no generated route", () => {
  for (const collection of ["experiences", "resources"]) {
    const directory = join(root, "src/content", collection);
    for (const path of filesIn(directory).filter((path) => path.endsWith(".md"))) {
      const metadata = parse(readFileSync(path, "utf8").split(/^---\s*$/m)[1]);
      const slug = relative(directory, path).replace(/\.md$/, "");
      const output = join(dist, collection, slug, "index.html");
      assert.equal(existsSync(output), !metadata.draft, `${collection}/${slug}: incorrect draft visibility`);
    }
  }
});

test("generated pages have no broken local links or asset references", () => {
  const missing = [];
  for (const file of filesIn(dist).filter((path) => path.endsWith(".html"))) {
    const route = relative(dist, file).replace(/index\.html$/, "");
    const base = new URL(route, "https://mousebaoyan.github.io/");
    const html = readFileSync(file, "utf8");
    // Astro emits quoted href/src attributes; code examples are HTML-escaped.
    for (const [, attribute] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = new URL(attribute.replaceAll("&amp;", "&"), base);
      if (url.origin !== base.origin) continue;
      const path = join(dist, decodeURIComponent(url.pathname));
      if (!isFile(path) && !isFile(join(path, "index.html")) && !isFile(`${path}.html`)) {
        missing.push(`${route || "/"} → ${attribute}`);
      }
    }
  }
  assert.deepEqual(missing, []);
});

test("detail pages have unique comment mappings and production backlinks", () => {
  const mappings = new Set();
  for (const file of filesIn(dist).filter((path) => path.endsWith(".html"))) {
    const route = `/${relative(dist, file).replace(/index\.html$/, "")}`;
    const html = readFileSync(file, "utf8");
    const isDetail = /^\/(experiences|resources)\/(?!page\/)[^/]+\/$/.test(route);
    const term = html.match(/data-term="([^"]+)"/)?.[1];
    assert.equal(Boolean(term), isDetail, `${route}: incorrect comment visibility`);
    if (!isDetail) continue;
    assert.equal(term, route, `${route}: comments must use a stable, normalized route`);
    assert.ok(!mappings.has(term), `${route}: comment mapping reused by another page`);
    mappings.add(term);
    assert.ok(html.includes(`name="giscus:backlink" content="https://mousebaoyan.github.io${route}"`));
  }
  assert.ok(mappings.size > 0);
  assert.ok(isFile(join(dist, "giscus/mouse-light.css")));
});
