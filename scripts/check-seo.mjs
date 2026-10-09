import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const SITE = "https://leetcode.swapp1990.org";
const errors = [];

function assert(cond, msg) {
  if (!cond) errors.push(msg);
}

function load(rel) {
  return readFileSync(join(dist, rel), "utf8");
}

function jsonLdBlocks(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    blocks.push(JSON.parse(m[1]));
  }
  return blocks;
}

function problemIdsFromSource() {
  const problemsJs = readFileSync("src/data/problems.js", "utf8");
  const imports = [...problemsJs.matchAll(/^import \w+ from "\.\/problems\/([^"]+)"/gm)];
  const ids = [];
  for (const [, file] of imports) {
    const src = readFileSync(join("src/data/problems", file), "utf8");
    const id = src.match(/\bid:\s*"([^"]+)"/)?.[1];
    const title = src.match(/\btitle:\s*"([^"]+)"/)?.[1];
    if (!id || !title) throw new Error(`could not extract id/title from ${file}`);
    ids.push({ id, title });
  }
  return ids;
}

const html = load("index.html");
const h1s = html.match(/<h1/g) || [];
assert(h1s.length === 1, `expected one <h1, found ${h1s.length}`);

assert(
  html.includes(`rel="canonical" href="${SITE}/"`),
  `missing canonical ${SITE}/`,
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

assert(html.includes('href="https://swapp1990.org/"'), 'missing href="https://swapp1990.org/"');
assert(html.includes("Made by"), "missing Made by");

let indexLd;
try {
  indexLd = jsonLdBlocks(html);
} catch (err) {
  errors.push(`index.html JSON-LD JSON.parse failed: ${err.message}`);
  indexLd = [];
}
const byType = Object.fromEntries(indexLd.map((b) => [b["@type"], b]));
assert(!!byType.FAQPage, "missing FAQPage JSON-LD");
assert(!!byType.Person, "missing Person JSON-LD");
assert(!!byType.WebApplication, "missing WebApplication JSON-LD on /");

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&middot;/g, "·");
}

const rootHtml = decodeHtml(html.split('<div id="root">')[1] || "");
const faqQuestions = (byType.FAQPage?.mainEntity || []).map((e) => e.name);
assert(faqQuestions.length === 5, `expected 5 FAQ questions, found ${faqQuestions.length}`);
for (const q of faqQuestions) {
  assert(rootHtml.includes(q), `FAQ question missing from visible HTML: ${q}`);
  const entity = byType.FAQPage.mainEntity.find((e) => e.name === q);
  assert(rootHtml.includes(entity.acceptedAnswer.text), `FAQ answer missing from visible HTML: ${q}`);
}

const assets = readdirSync(join(dist, "assets")).filter((f) => f.endsWith(".js"));
for (const file of assets) {
  const js = readFileSync(join(dist, "assets", file), "utf8");
  assert(!js.includes("gtag"), `gtag present in dist/assets/${file}`);
}

const robots = load("robots.txt");
assert(robots.includes(`Sitemap: ${SITE}/sitemap.xml`), "robots.txt missing Sitemap line");

const problems = problemIdsFromSource();
const sitemap = load("sitemap.xml");
const locs = sitemap.match(/<loc>/g) || [];
assert(locs.length === 1 + problems.length, `sitemap.xml expected ${1 + problems.length} URLs, found ${locs.length}`);
assert(sitemap.includes(`${SITE}/`), "sitemap.xml missing site URL");

const titles = new Map();
const descriptions = new Map();

function recordUnique(map, value, label, page) {
  if (!value) {
    assert(false, `${page} missing ${label}`);
    return;
  }
  if (map.has(value)) assert(false, `duplicate ${label} on ${page} and ${map.get(value)}: ${value}`);
  else map.set(value, page);
}

const homeTitle = html.match(/<title>([^<]*)<\/title>/)?.[1];
const homeDesc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
recordUnique(titles, homeTitle, "title", "/");
recordUnique(descriptions, homeDesc, "description", "/");

for (const { id, title } of problems) {
  const rel = `p/${id}.html`;
  assert(existsSync(join(dist, rel)), `missing dist/${rel}`);
  if (!existsSync(join(dist, rel))) continue;
  const page = load(rel);
  const pageH1s = page.match(/<h1/g) || [];
  assert(pageH1s.length === 1, `${rel}: expected one <h1, found ${pageH1s.length}`);
  assert(page.includes(title), `${rel}: <h1 missing title ${title}`);
  assert(
    page.includes(`rel="canonical" href="${SITE}/p/${id}"`),
    `${rel}: canonical should be ${SITE}/p/${id}`,
  );
  const pageLinks = page.match(/href="\/p\//g) || [];
  assert(pageLinks.length >= 25, `${rel}: expected ≥ 25 href="/p/ links, found ${pageLinks.length}`);
  const pageSlug = page.match(/problem-recall/g) || [];
  assert(pageSlug.length === 1, `${rel}: expected problem-recall once, found ${pageSlug.length}`);
  const emptyRoot = /<div id="root">\s*<\/div>/.test(page);
  assert(!emptyRoot, `${rel}: root is empty (not server-rendered)`);
  assert(/<div id="root">\s*</.test(page), `${rel}: root missing server-rendered markup`);
  const pageTitle = page.match(/<title>([^<]*)<\/title>/)?.[1];
  const pageDesc = page.match(/<meta name="description" content="([^"]*)"/)?.[1];
  recordUnique(titles, pageTitle, "title", `/p/${id}`);
  recordUnique(descriptions, pageDesc, "description", `/p/${id}`);
}

const notFound = load("404.html");
assert(notFound.includes('name="robots" content="noindex"'), "404.html missing noindex");
const nfH1 = notFound.match(/<h1/g) || [];
assert(nfH1.length === 1, `404.html expected one <h1, found ${nfH1.length}`);
assert(!notFound.includes("analytics.swapp1990.org"), "404.html contains analytics.swapp1990.org");
assert(!notFound.includes('type="module"'), '404.html contains type="module"');

const banned = [
  "agency",
  "analytics",
  "taxes",
  "keywords",
  "stockbroker",
  "videogen",
  "moltbot",
  "vncreator",
  "cars",
  "destruction",
];
function checkBanned(name, text) {
  for (const host of banned) {
    const re = new RegExp(`href=["']https?://${host}\\.swapp1990\\.org`, "i");
    assert(!re.test(text), `${name} links to ${host}.swapp1990.org`);
  }
}
checkBanned("dist/index.html", html);
checkBanned("dist/404.html", notFound);
for (const { id } of problems) {
  const rel = `p/${id}.html`;
  if (existsSync(join(dist, rel))) checkBanned(rel, load(rel));
}

const nginxPath = "deploy/nginx/problem-recall.conf";
assert(existsSync(nginxPath), "missing deploy/nginx/problem-recall.conf");
const nginx = readFileSync(nginxPath, "utf8");
assert(nginx.includes("location ^~ /p/"), "nginx missing location ^~ /p/");
assert(nginx.includes("error_page 404 /404.html"), "nginx missing error_page 404 /404.html");
assert(nginx.includes("location / { try_files $uri =404; }"), "nginx missing location / { try_files $uri =404; }");
assert(
  nginx.includes("ssl_certificate /etc/letsencrypt/live/leetcode.swapp1990.org/fullchain.pem; # managed by Certbot"),
  "nginx missing ssl_certificate certbot line",
);
assert(
  nginx.includes("ssl_certificate_key /etc/letsencrypt/live/leetcode.swapp1990.org/privkey.pem; # managed by Certbot"),
  "nginx missing ssl_certificate_key certbot line",
);
assert(
  nginx.includes("include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot"),
  "nginx missing include options-ssl-nginx certbot line",
);
assert(
  nginx.includes("ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot"),
  "nginx missing ssl_dhparam certbot line",
);

if (errors.length) {
  console.error("check-seo failed:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}

console.log("check-seo ok");
