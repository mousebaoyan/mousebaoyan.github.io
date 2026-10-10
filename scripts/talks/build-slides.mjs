// Converts a PDF deck into web slides: full-size and thumbnail WebP images,
// a copy of the original PDF for download, and per-page text for alt text and search.
// Usage: node scripts/talks/build-slides.mjs <deck.pdf> <talk-slug> <deck-slug>
// Requires poppler (pdftoppm, pdftotext, pdfinfo) and cwebp.
import { execFileSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const [pdf, talk, deck] = process.argv.slice(2);
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
if (!pdf || !slug.test(talk ?? "") || !slug.test(deck ?? "")) {
  console.error("Usage: node scripts/talks/build-slides.mjs <deck.pdf> <talk-slug> <deck-slug>");
  process.exit(1);
}

const root = fileURLToPath(new URL("../../", import.meta.url));
const run = (command, args) => execFileSync(command, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const info = run("pdfinfo", [pdf]);
const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
const [, width, height] = info.match(/^Page size:\s+([\d.]+) x ([\d.]+)/m) ?? [];
if (!pages) throw new Error("Could not read the page count from the PDF.");

const output = join(root, "public/talks", talk, deck);
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
const work = mkdtempSync(join(tmpdir(), "slides-"));
try {
  run("pdftoppm", ["-png", "-scale-to-x", "1920", "-scale-to-y", "-1", pdf, join(work, "page")]);
  const rendered = readdirSync(work).filter((name) => name.endsWith(".png")).sort();
  rendered.forEach((name, index) => {
    const number = String(index + 1).padStart(2, "0");
    run("cwebp", ["-quiet", "-q", "82", "-resize", "1600", "0", join(work, name), "-o", join(output, `${number}.webp`)]);
    run("cwebp", ["-quiet", "-q", "70", "-resize", "320", "0", join(work, name), "-o", join(output, `${number}-thumb.webp`)]);
  });
} finally {
  rmSync(work, { recursive: true, force: true });
}
const download = join(root, "public/talks", talk, `${deck}.pdf`);
copyFileSync(pdf, download);
chmodSync(download, 0o644);

const text = Array.from({ length: pages }, (_, index) =>
  run("pdftotext", ["-f", String(index + 1), "-l", String(index + 1), "-enc", "UTF-8", pdf, "-"])
    .replace(/\f/g, "").replace(/[ \t　]+/g, " ").replace(/\s*\n\s*/g, "\n").trim());
const data = { pages, aspectRatio: `${Math.round(Number(width))} / ${Math.round(Number(height))}`, text };
writeFileSync(join(root, "src/data/slides", `${talk}--${deck}.json`), `${JSON.stringify(data, null, 2)}\n`);
console.log(`Built ${pages} slides into public/talks/${talk}/${deck}/`);
