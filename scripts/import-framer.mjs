#!/usr/bin/env node
// Imports the server-rendered Framer page into this Next.js app.
//
//   node scripts/import-framer.mjs [source.html]
//
// Without an argument the live page is fetched. The script strips Framer's
// runtime, analytics and editor bar, downloads every font and image into
// public/assets, and writes the CSS + markup to site/generated/*.ts so the
// page can be rendered statically by app/page.tsx.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://www.reveliolabs.app/";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = path.join(root, "site/generated");
const assetDir = path.join(root, "public/assets");

const source = process.argv[2];
const html = source
  ? await readFile(source, "utf8")
  : await (await fetch(SITE_URL, { headers: { "user-agent": "Mozilla/5.0 revelio-import" } })).text();

const head = html.slice(0, html.indexOf("<body"));
let body = html.slice(html.indexOf(">", html.indexOf("<body")) + 1, html.lastIndexOf("</body>"));

// Appear animation data and breakpoints are embedded as JSON script tags.
const jsonScript = (id) => {
  const match = html.match(new RegExp(`<script type="framer/appear" id="${id}">([\\s\\S]*?)</script>`));
  return match ? JSON.parse(match[1]) : null;
};
const appear = jsonScript("__framer__appearAnimationsContent");

// --- CSS -----------------------------------------------------------------
let css = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");

// --- Body ----------------------------------------------------------------
body = body
  .replace(/<script\b[\s\S]*?<\/script>/g, "")
  .replace(/<noscript\b[\s\S]*?<\/noscript>/g, "")
  .replace(/<link\b[^>]*>/g, "")
  .replace(/<iframe[^>]*id="__framer-editorbar"[\s\S]*?<\/iframe>/g, "")
  .replace(/<!--(?!\$|\/\$)[\s\S]*?-->/g, "")
  .replace(/ data-framer-hydrate-v2="[^"]*"/g, "")
  .replace(/ data-framer-ssr-released-at="[^"]*"/g, "")
  .replace(/href="\.\/#/g, 'href="#')
  .replace(/href="\.\/"/g, 'href="/"')
  .trim();

// --- Metadata --------------------------------------------------------------
const metaContent = (attr, name) =>
  head.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1]?.replace(/&amp;/g, "&");
const meta = {
  title: head.match(/<title>([^<]*)<\/title>/)?.[1],
  description: metaContent("name", "description"),
  ogImage: metaContent("property", "og:image"),
  icon: head.match(/<link href="([^"]+)" rel="icon"/)?.[1],
};

// Assets referenced from client code or metadata rather than the markup.
const extraAssets = [
  meta.ogImage,
  meta.icon,
  "https://framerusercontent.com/images/pGiXYozQ3mE4cilNOItfe2L2fUA.svg",
].filter(Boolean);

// Some icon components register their <symbol> in #svg-templates from
// JavaScript, so the server HTML references ids it never defines. Those
// symbols are kept in site/svg-symbols.html and appended here.
const knownSymbols = await readFile(path.join(root, "site/svg-symbols.html"), "utf8");
const missingSymbols = [...new Set([...body.matchAll(/<use href="#([^"]+)"/g)].map((m) => m[1]))].filter(
  (id) => !body.includes(`id="${id}"`)
);
const symbolMarkup = missingSymbols.map((id) => {
  const match = knownSymbols.match(new RegExp(`<svg[^>]*id="${id}"[\\s\\S]*?</svg>`));
  if (!match) console.warn(`warning: no definition for svg symbol #${id}; capture it into site/svg-symbols.html`);
  return match?.[0] ?? "";
});
body = body.replace(/(<div id="svg-templates"[^>]*>)/, `$1${symbolMarkup.join("")}`);

// --- Assets --------------------------------------------------------------
const assetPattern = /https:\/\/(?:framerusercontent\.com|fonts\.gstatic\.com)\/[^\s"'()<>,]+/g;
const urls = new Set(
  [...css.matchAll(assetPattern), ...body.matchAll(assetPattern)]
    .map((m) => m[0].replace(/&amp;/g, "&"))
    .filter((url) => !/\.(m?js|json)$/.test(new URL(url).pathname))
    .concat(extraAssets)
);
const localFor = new Map();

for (const url of urls) {
  const { pathname, search } = new URL(url);
  const ext = path.extname(pathname) || ".bin";
  const base = path.basename(pathname, ext);
  const isFont = /\.(woff2?|ttf|otf)$/.test(ext);
  const suffix = search ? "-" + createHash("sha1").update(search).digest("hex").slice(0, 8) : "";
  const rel = `${isFont ? "fonts" : "media"}/${base}${suffix}${ext}`;
  const file = path.join(assetDir, rel);
  if (!existsSync(file)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log("downloaded", rel);
  }
  localFor.set(url, `/assets/${rel}`);
}

const localize = (text) =>
  text.replace(assetPattern, (url) => localFor.get(url.replace(/&amp;/g, "&")) ?? url);
css = localize(css);
body = localize(body);

// --- Output --------------------------------------------------------------
await mkdir(outDir, { recursive: true });
const banner = "// Generated by scripts/import-framer.mjs. Do not edit by hand.\n";
await writeFile(path.join(outDir, "framer-css.ts"), `${banner}export const framerCss = ${JSON.stringify(css)};\n`);
await writeFile(path.join(outDir, "framer-body.ts"), `${banner}export const framerBody = ${JSON.stringify(body)};\n`);
meta.ogImage = localFor.get(meta.ogImage);
meta.icon = localFor.get(meta.icon);
await writeFile(path.join(outDir, "meta.ts"), `${banner}export const siteMeta = ${JSON.stringify(meta, null, 2)};\n`);
await writeFile(path.join(outDir, "appear.ts"), `${banner}export const appearAnimations = ${JSON.stringify(appear, null, 2)} as const;\n`);

console.log(`css ${(css.length / 1024).toFixed(0)}KB, body ${(body.length / 1024).toFixed(0)}KB, ${localFor.size} assets`);
