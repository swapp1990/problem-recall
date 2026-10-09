import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const html = readFileSync(join(dist, "index.html"), "utf8");
const errors = [];

function assert(cond, msg) {
  if (!cond) errors.push(msg);
}

const h1s = html.match(/<h1/g) || [];
assert(h1s.length === 1, `expected one <h1, found ${h1s.length}`);

assert(
  html.includes('rel="canonical" href="https://leetcode.swapp1990.org/"'),
  "missing canonical https://leetcode.swapp1990.org/",
);
assert(/<meta name="description" content="[^"]+"/.test(html), "missing description");
assert(html.includes('property="og:title"'), "missing og:title");
assert(html.includes('property="og:description"'), "missing og:description");
assert(html.includes('property="og:url"'), "missing og:url");
assert(html.includes('property="og:image"'), "missing og:image");

const pLinks = html.match(/href="\/p\//g) || [];
assert(pLinks.length >= 25, `expected ≥ 25 href="/p/ links, found ${pLinks.length}`);

const slugHits = html.match(/problem-recall/g) || [];
assert(slugHits.length === 1, `expected problem-recall once, found ${slugHits.length}`);
assert(html.includes("APP_ID"), "missing APP_ID");
assert(html.includes("appId"), "missing appId");
assert(
  html.includes("analytics.swapp1990.org/api/events"),
  "missing analytics.swapp1990.org/api/events",
);

assert(!html.includes("gtag"), "gtag present in dist/index.html");

const assets = readdirSync(join(dist, "assets")).filter((f) => f.endsWith(".js"));
for (const file of assets) {
  const js = readFileSync(join(dist, "assets", file), "utf8");
  assert(!js.includes("gtag"), `gtag present in dist/assets/${file}`);
}

const robots = readFileSync(join(dist, "robots.txt"), "utf8");
assert(robots.includes("Sitemap: https://leetcode.swapp1990.org/sitemap.xml"), "robots.txt missing Sitemap line");

const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
const locs = sitemap.match(/<loc>/g) || [];
assert(locs.length === 1, `sitemap.xml expected 1 URL, found ${locs.length}`);
assert(sitemap.includes("https://leetcode.swapp1990.org/"), "sitemap.xml missing site URL");

if (errors.length) {
  console.error("check-seo failed:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}

console.log("check-seo ok");
