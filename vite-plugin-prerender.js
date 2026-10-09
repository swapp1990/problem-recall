import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

const SITE = "https://leetcode.swapp1990.org";

const HOME_TITLE = "Problem Recall — Visual LeetCode Pattern Drill";
const HOME_DESCRIPTION =
  "A visual flashcard drill for FAANG LeetCode problems. See the problem, recognize the pattern, watch the solution unfold.";

const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Swapnil Sawant",
  alternateName: "swapp1990",
  url: "https://swapp1990.org/",
  jobTitle: "Senior Software Engineer",
  worksFor: { "@type": "Organization", name: "Phoenix Bioinformatics" },
  homeLocation: { "@type": "Place", name: "SF Bay Area" },
  sameAs: [
    "https://github.com/swapp1990",
    "https://linkedin.com/in/swapnil-sawant-b038b480",
    "https://x.com/swapp19902",
  ],
};

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function jsonLdScript(obj) {
  const json = JSON.stringify(obj).replace(/<\//g, "<\\/");
  return `<script type="application/ld+json">${json}</script>`;
}

function pageDescription(problem, patternName) {
  const full = `${problem.title} (LeetCode #${problem.leetcode}, ${problem.difficulty}): ${problem.tagline} Recognize the ${patternName} pattern and watch the solution animate.`;
  if (full.length <= 160) return full;
  const trimmed = full.slice(0, 160);
  const bound = trimmed.lastIndexOf(" ");
  const cut = (bound > 0 ? trimmed.slice(0, bound) : trimmed).replace(/[\s.,;:]+$/, "");
  return cut;
}

function replaceOnce(html, pattern, replacement, label) {
  const matches = html.match(pattern);
  if (!matches || matches.length !== 1) {
    throw new Error(`[prerender] expected exactly one ${label}, found ${matches ? matches.length : 0}`);
  }
  return html.replace(pattern, replacement);
}

function setHeadTags(html, { title, description, canonical }) {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const c = escapeAttr(canonical);
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${t}</title>`, "<title>");
  html = replaceOnce(
    html,
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${d}"`,
    'meta[name=description]',
  );
  html = replaceOnce(
    html,
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${c}"`,
    "link[rel=canonical]",
  );
  html = replaceOnce(
    html,
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${t}"`,
    "og:title",
  );
  html = replaceOnce(
    html,
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${d}"`,
    "og:description",
  );
  html = replaceOnce(
    html,
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${c}"`,
    "og:url",
  );
  html = replaceOnce(
    html,
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${t}"`,
    "twitter:title",
  );
  html = replaceOnce(
    html,
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${d}"`,
    "twitter:description",
  );
  return html;
}

function stripWebApplicationLd(html) {
  const pattern =
    /<script type="application\/ld\+json">\s*\{[^{}]*"@type":"WebApplication"[\s\S]*?<\/script>\s*/;
  if (!pattern.test(html)) {
    throw new Error("[prerender] WebApplication JSON-LD missing from template");
  }
  return html.replace(pattern, "");
}

function injectRoot(html, markup) {
  const rootTag = '<div id="root"></div>';
  const matches = html.split(rootTag).length - 1;
  if (matches !== 1) {
    throw new Error(`[prerender] expected exactly one ${rootTag}, found ${matches}`);
  }
  return html.replace(rootTag, `<div id="root">${markup}</div>`);
}

function injectBeforeHeadClose(html, snippet) {
  if (!html.includes("</head>")) {
    throw new Error("[prerender] </head> missing");
  }
  return html.replace("</head>", `${snippet}\n</head>`);
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
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = (req.url || "").split("?")[0];
        const m = url.match(/^\/p\/([^/]+)\/?$/);
        if (m) req.url = `/p/${m[1]}.html`;
        next();
      });
    },
    async closeBundle() {
      let server;
      try {
        server = await createServer({
          root,
          configFile: false,
          server: { middlewareMode: true },
          appType: "custom",
          plugins: [react()],
          ssr: { noExternal: ["framer-motion"] },
        });
        const { render } = await server.ssrLoadModule("/src/entry-server.jsx");
        const { allProblems } = await server.ssrLoadModule("/src/data/problems.js");
        const { patterns: patternMap } = await server.ssrLoadModule("/src/data/patterns.js");
        const { faqItems } = await server.ssrLoadModule("/src/data/faq.js");

        if (allProblems.length < 25) {
          throw new Error(`[prerender] expected ≥ 25 problems, found ${allProblems.length}`);
        }

        const template = readFileSync(join(outDir, "index.html"), "utf8");
        mkdirSync(join(outDir, "p"), { recursive: true });

        const homeMarkup = render("/");
        let homeHtml = injectRoot(template, homeMarkup);
        homeHtml = setHeadTags(homeHtml, {
          title: HOME_TITLE,
          description: HOME_DESCRIPTION,
          canonical: `${SITE}/`,
        });
        const faqLd = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        };
        homeHtml = injectBeforeHeadClose(homeHtml, `${jsonLdScript(faqLd)}\n${jsonLdScript(PERSON_LD)}`);
        writeFileSync(join(outDir, "index.html"), homeHtml);

        const seenDesc = new Set([HOME_DESCRIPTION]);
        for (const problem of allProblems) {
          const url = `/p/${problem.id}`;
          const markup = render(url);
          let html = injectRoot(template, markup);
          html = stripWebApplicationLd(html);
          const patternName = patternMap[problem.patternId]?.name ?? problem.patternId;
          let description = pageDescription(problem, patternName);
          if (seenDesc.has(description)) {
            description = `${problem.title} (LeetCode #${problem.leetcode}).`.slice(0, 160);
          }
          seenDesc.add(description);
          html = setHeadTags(html, {
            title: `${problem.title} — Problem Recall`,
            description,
            canonical: `${SITE}${url}`,
          });
          writeFileSync(join(outDir, "p", `${problem.id}.html`), html);
        }

        const lastmod = new Date().toISOString().slice(0, 10);
        const urls = [`${SITE}/`, ...allProblems.map((p) => `${SITE}/p/${p.id}`)];
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}
</urlset>
`;
        writeFileSync(join(outDir, "sitemap.xml"), sitemap);
        const n = allProblems.length;
        console.log(`[prerender] / + ${n} problem pages + sitemap.xml (${n + 1} urls)`);
      } finally {
        if (server) await server.close();
      }
    },
  };
}
