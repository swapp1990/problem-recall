import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

const SITE = "https://leetcode.swapp1990.org";
const H1 = "Problem Recall: a visual LeetCode pattern drill";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadCatalogRegex(root) {
  const patternsSrc = readFileSync(join(root, "src/data/patterns.js"), "utf8");
  const patterns = [];
  const patternRe = /id:\s*"([^"]+)"\s*,\s*name:\s*"([^"]+)"/g;
  let m;
  while ((m = patternRe.exec(patternsSrc))) {
    patterns.push({ id: m[1], name: m[2] });
  }

  const problemsJs = readFileSync(join(root, "src/data/problems.js"), "utf8");
  const imports = [...problemsJs.matchAll(/^import \w+ from "\.\/problems\/([^"]+)"/gm)];
  const problems = [];
  for (const [, file] of imports) {
    const src = readFileSync(join(root, "src/data/problems", file), "utf8");
    const id = src.match(/\bid:\s*"([^"]+)"/)?.[1];
    const title = src.match(/\btitle:\s*"([^"]+)"/)?.[1];
    const patternId = src.match(/\bpatternId:\s*"([^"]+)"/)?.[1];
    if (!id || !title || !patternId) {
      throw new Error(`[prerender] could not extract id/title/patternId from ${file}`);
    }
    problems.push({ id, title, patternId });
  }

  return { patterns, problems };
}

async function loadCatalog(root) {
  let server;
  try {
    server = await createServer({
      root,
      configFile: false,
      server: { middlewareMode: true },
      appType: "custom",
      plugins: [react()],
    });
    const { allProblems } = await server.ssrLoadModule("/src/data/problems.js");
    const { patterns: patternMap } = await server.ssrLoadModule("/src/data/patterns.js");
    const problems = allProblems.map((p) => ({
      id: p.id,
      title: p.title,
      patternId: p.patternId,
    }));
    const patterns = Object.values(patternMap).map((p) => ({ id: p.id, name: p.name }));
    return { patterns, problems };
  } catch (err) {
    console.warn("[prerender] ssrLoadModule failed, using regex extraction:", err.message);
    return loadCatalogRegex(root);
  } finally {
    if (server) await server.close();
  }
}

function renderLanding({ patterns, problems }) {
  const sections = patterns
    .map((pattern) => {
      const items = problems.filter((p) => p.patternId === pattern.id);
      const lis = items
        .map((p) => `<li><a href="/p/${escapeHtml(p.id)}">${escapeHtml(p.title)}</a></li>`)
        .join("");
      return `<h2>${escapeHtml(pattern.name)}</h2>\n<ul>${lis}</ul>`;
    })
    .join("\n");

  return `<div data-prerendered="/">
<style>
[data-prerendered]{font-family:Georgia,serif;max-width:42rem;margin:2rem auto;padding:0 1.25rem;color:#1a1814;line-height:1.5}
[data-prerendered] h1{font-size:1.75rem;margin:0 0 .75rem}
[data-prerendered] h2{font-size:1.15rem;margin:1.5rem 0 .4rem}
[data-prerendered] p,[data-prerendered] ol{margin:0 0 .75rem}
[data-prerendered] ol{padding-left:1.25rem}
[data-prerendered] ul{margin:0 0 .5rem 1.25rem;padding:0}
[data-prerendered] a{color:#c2410c}
</style>
<h1>${escapeHtml(H1)}</h1>
<p>A visual flashcard drill for FAANG LeetCode problems. See the problem, recognize the pattern, watch the solution animate. No walls of text — the motion is the explanation.</p>
<ol>
<li>See the problem</li>
<li>Recognize the pattern</li>
<li>Watch the solution animate</li>
</ol>
${sections}
</div>`;
}

export default function prerenderPlugin() {
  let outDir = "dist";
  let root = process.cwd();

  return {
    name: "prerender",
    apply: "build",
    configResolved(config) {
      root = config.root;
      outDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const { patterns, problems } = await loadCatalog(root);
      if (problems.length < 25) {
        throw new Error(`[prerender] expected ≥ 25 problems, found ${problems.length}`);
      }
      if (patterns.length < 10) {
        throw new Error(`[prerender] expected ≥ 10 patterns, found ${patterns.length}`);
      }

      const indexPath = join(outDir, "index.html");
      const html = readFileSync(indexPath, "utf8");
      const rootTag = "<div id=\"root\"></div>";
      const matches = html.split(rootTag).length - 1;
      if (matches !== 1) {
        throw new Error(`[prerender] expected exactly one ${rootTag}, found ${matches}`);
      }

      const injected = html.replace(rootTag, `<div id="root">${renderLanding({ patterns, problems })}</div>`);
      writeFileSync(indexPath, injected);

      const lastmod = new Date().toISOString().slice(0, 10);
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${lastmod}</lastmod></url>
</urlset>
`;
      writeFileSync(join(outDir, "sitemap.xml"), sitemap);
      console.log("[prerender] / + sitemap.xml");
    },
  };
}
