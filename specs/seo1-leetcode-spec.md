# seo1-leetcode: prerendered landing, robots.txt, sitemap.xml, meta/canonical/OG, and replace the dead GA call with SwapAnalytics

Repo: `swapp1990/problem-recall`, branch `seo1-leetcode` off `main` (ebba38a). Live: https://leetcode.swapp1990.org.
Source audit: `/workspace/specs/seo-audit-2026-10-08.md` §12. Implementer: Grok 4.6 CLI. Do NOT commit, push or deploy.

## Context (facts, checked 2026-10-08)
- Vite 6 + React 18, no router, no tests. `npm run build` → `dist/` (assets in `dist/assets/`). Deployed by `deploy.sh`
  (tar of `dist/` → `/var/www/problem-recall`, atomic swap). Live `/` references `/assets/index-CzCpVeNf.js` and `/assets/index-CjK7ktFM.css`.
- Host nginx for leetcode (already configured, do not edit anything about it): `= /robots.txt` and `= /sitemap.xml` are
  `try_files $uri =404`; `location /` is `try_files $uri $uri/ /index.html`; missing files with an extension → 404. So a file
  in `public/` is served as itself. Today robots/sitemap → 404.
- Raw HTML today: title + description + partial OG (no og:url/og:image), no canonical, no H1, empty `<div id="root"></div>`.
- `src/App.jsx`: each problem has its own client-side URL `/p/<id>`; on load the app `replaceState`s `/` → `/p/<defaultId>`,
  sets `document.title`, then calls `window.gtag("event","page_view",…)` **only if `window.gtag` exists. No gtag loader is on
  the page, so this measures nothing today.** Problems and patterns live in `src/data/problems.js` / `src/data/patterns.js`,
  which import `.jsx` modules (so they can't be imported directly from plain Node).

## 1. Analytics: replace the dead GA call with the SwapAnalytics beacon (ship blocker — get this exactly right)
Copy the SwapAnalytics IIFE from `swapp1990/writeforyou-web` `index.html` (the same code that's on swapp1990.org; reference
copy below), with these differences:
- `APP_ID = 'problem-recall'` (the product slug used by the agency dashboard), `PROD_HOST = 'leetcode.swapp1990.org'`,
  endpoint `https://analytics.swapp1990.org/api/events`, `DEVICE_KEY = 'swapanalytics_device_id'`, same payload shape
  `{appId, eventName, environment, metadata, deviceId}`, sendBeacon with `application/json` Blob, fetch keepalive fallback,
  every path wrapped in try/catch ("analytics must never break the page").
- **No automatic page_view on script parse and no pushState/replaceState patching** (the app's own `replaceState` on load
  would otherwise double-count). Instead expose one function: `window.swapPageView = function (path, title) {…}` that sends
  `page_view` with metadata `{path, title, referrer: document.referrer || null, …utm params}`; it de-dupes consecutive calls
  with the same path.
- Keep the outbound-link `product_click` listener if it's in the reference copy (harmless), else omit it.
- Put the `<script>` in `<head>` of source `index.html` **before** the module script, so it's defined before React runs.
- In `src/App.jsx`, replace the `window.gtag` block with:
  ```js
  if (typeof window.swapPageView === "function") window.swapPageView(path, p.title);
  ```
  Result: exactly one `page_view` per problem shown (one on initial load with path `/p/<defaultId>`, one per problem switch, back/forward included).
- Remove every other `gtag` reference. Don't add a GA loader.

Reference (writeforyou-web `send()`):
```js
var payload = { appId: APP_ID, eventName: eventName, environment: environment(), metadata: metadata || {}, deviceId: getDeviceId() };
var body = JSON.stringify(payload);
if (navigator.sendBeacon) { var blob = new Blob([body], { type: 'application/json' }); if (navigator.sendBeacon(ENDPOINT, blob)) return; }
fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
```

## 2. Head tags (source `index.html`)
- Keep the existing title "Problem Recall — Visual LeetCode Pattern Drill" and description.
- Add `<link rel="canonical" href="https://leetcode.swapp1990.org/">`, `og:url` = same, `og:site_name` "Problem Recall",
  `og:image` absolute + `og:image:alt`, `twitter:title`, `twitter:description`, `twitter:image`. For the image: add
  `public/og.png` (1200×630, < 150 KB: the "P" mark on `#f4f1ea` plus the title, made with any local tool — sharp via npx,
  ImageMagick or Python PIL). If no tool works, use no og:image and say so.
- Optional `application/ld+json` `WebApplication` (name, url, description, applicationCategory "EducationalApplication").

## 3. Prerendered landing (`vite-plugin-prerender.js`, DesignForYou pattern)
- New `vite-plugin-prerender.js` at repo root registered in `vite.config.js` (`plugins: [react(), prerenderPlugin()]`).
  `apply: 'build'`, `outDir` from `configResolved`, work in `closeBundle`. Read built `dist/index.html`, replace the single
  `<div id="root"></div>` (assert exactly one, throw otherwise) with `<div id="root"><div data-prerendered="/">…</div></div>`.
  Never touch `<script>` tags. `src/main.jsx` keeps `createRoot` (no hydrateRoot); React replaces the static markup on first render.
- Static content: **exactly one `<h1>`** ("Problem Recall: a visual LeetCode pattern drill"), a 2–3 sentence intro (see the
  problem → recognize the pattern → watch the solution animate), the three-step flow, then for **every pattern** an `<h2>`
  with its name and a `<ul>` of its problems as real links `<a href="/p/<id>">Title</a>`.
  Get pattern names and problem ids/titles from the real data, without duplicating it by hand: e.g. use Vite's
  `ssrLoadModule` on `src/data/problems.js` + `src/data/patterns.js` in a temporary `createServer({ server: { middlewareMode: true }, appType: 'custom' })`,
  or a regex extraction from the source files. Fail the build if it finds fewer than 25 problems or 10 patterns.
- Visual: keep it plain, readable and unstyled-safe (a short `<style>` scoped to `[data-prerendered]` is fine). It shows for
  a fraction of a second before React mounts. No `<img>`.
- Write nothing else into `dist/` except `sitemap.xml` (below). Log `[prerender] / + sitemap.xml`.

## 4. robots.txt and sitemap.xml
`public/robots.txt` (exact):
```
User-agent: *
Allow: /

Sitemap: https://leetcode.swapp1990.org/sitemap.xml
```
`dist/sitemap.xml` (generated by the plugin, lastmod = build date):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://leetcode.swapp1990.org/</loc><lastmod>BUILD-DATE</lastmod></url>
</urlset>
```
Only `/`: the `/p/<id>` pages share the `/` shell and canonical in this ship (per-problem prerender is a later ship).

## 5. Acceptance checks (run, paste output)
1. BEFORE any change: `npm ci && npm run build` on main and report the built `assets/index-*.js` name (live is `index-CzCpVeNf.js`).
2. After: `npm run build` passes and logs the prerender line.
3. New `scripts/check-seo.mjs`, run as part of build (`"build": "vite build && node scripts/check-seo.mjs"`), asserting on
   `dist/index.html`: one `<h1`, canonical `https://leetcode.swapp1990.org/`, description, og:title/description/url(/image),
   ≥ 25 `href="/p/` links, `appId`/`APP_ID` `problem-recall` present once, endpoint `analytics.swapp1990.org/api/events`
   present, the word `gtag` absent from `dist/index.html` and from `dist/assets/*.js`; `dist/robots.txt` has the Sitemap line;
   `dist/sitemap.xml` has exactly the 1 URL.
4. `npx vite preview` then load `/` in a browser or Playwright/puppeteer if available locally, and confirm one POST to
   `analytics.swapp1990.org/api/events` with `eventName: page_view` and `appId: problem-recall`, and a second after switching
   problem. If no headless browser is available, say so (it will be verified live).
5. `git diff --stat`: only `index.html`, `src/App.jsx`, `vite.config.js`, `vite-plugin-prerender.js`, `scripts/check-seo.mjs`,
   `package.json` (+ lock only if a devDependency was really needed), `public/robots.txt`, `public/og.png`, `specs/`.
