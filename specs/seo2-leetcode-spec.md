# seo2-leetcode: prerender every /p/<id> problem page (SSR + hydrate), real 404s, landing FAQ, founder block + cross-links, non-blocking fonts

Repo: `swapp1990/problem-recall`, branch `seo2-leetcode` off `origin/main` (46c6732). Live: https://leetcode.swapp1990.org
Audit: `/workspace/specs/seo-checklist-status-2026-10-08.md` (leetcode section). Shared blocks: `specs/seo2-shared-blocks.md` (use exactly).
Implementer: Grok CLI. Commit when checks pass. **Do NOT push, PR or deploy** (no `deploy.sh`).

## Context (facts, checked 2026-10-08)
- Vite 6 + React 18 + framer-motion, no router. `src/main.jsx` = `createRoot(...).render(<StrictMode><App/></StrictMode>)`.
  `src/App.jsx` reads the problem id from `/p/<id>` (else `defaultProblemId`), and on first render **replaceStates `/` → `/p/<default>`**;
  it sets `document.title = "<Title> — Problem Recall"` and calls `window.swapPageView(path, title)` (SwapAnalytics, appId
  `problem-recall`, in `index.html` — **do not change the beacon block**).
- `vite-plugin-prerender.js` (seo1) injects a hand-written static landing (H1 "Problem Recall: a visual LeetCode pattern drill",
  intro, 3 steps, every pattern as `<h2>` with `<a href="/p/<id>">` links) into `dist/index.html` and writes a 1-URL sitemap.
  React then **replaces** it: the rendered DOM has a different H1 ("Valid Palindrome — three-stage drill") and **0 `<a>` links**.
- Every `/p/<id>` URL returns 200 with the home page's title/H1/canonical (soft duplicates); unknown paths return 200 too.
- Live nginx vhost (`/etc/nginx/sites-available/problem-recall`, NOT in the repo yet) — exact current text:
```nginx
server {
    server_name leetcode.swapp1990.org;

    root /var/www/problem-recall;
    index index.html;

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # seo-1: real robots/sitemap only; never fall back to the SPA shell
    location = /robots.txt { try_files $uri =404; }
    location = /sitemap.xml { try_files $uri =404; }
    location ^~ /app-assets/ { try_files $uri =404; }
    location / {
        try_files $uri $uri/ /index.html;
        # seo-1: missing static files return 404 instead of index.html
        location ~* "^(?!.*/\.)/.*\.(?:js|mjs|cjs|css|map|png|jpe?g|gif|webp|avif|svg|ico|bmp|woff2?|ttf|otf|eot|json|webmanifest|txt|xml|mp4|webm|mp3|wav|ogg|glb|gltf|bin|hdr|ktx2|wasm|pdf|zip)$" {
            try_files $uri =404;
        }
    }

    location /assets/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/leetcode.swapp1990.org/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/leetcode.swapp1990.org/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = leetcode.swapp1990.org) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name leetcode.swapp1990.org;
    return 404; # managed by Certbot


}
```
- Lighthouse mobile today: LCP 1.5 s, CLS 0.036, TBT ~230 ms. Google Fonts (`Fraunces`, `JetBrains Mono`, `Manrope`) is a render-blocking `<link rel="stylesheet">`.

## 1. Real SSR prerender of every page + hydrate
- Add `src/entry-server.jsx` exporting `render(url)` → `ReactDOMServer.renderToString(<App initialPath={url} />)` (no StrictMode
  difference that changes markup). Make `App` accept an optional `initialPath` prop; when absent it uses `window.location.pathname`.
  No `window`/`document` access during render or at module top level anywhere in `src/` (move into effects/guards) so SSR works.
- **Home mode** (`path === "/"`): render the same header + drill for `defaultProblemId`, but the caption shows
  `<h1>Problem Recall: a visual LeetCode pattern drill</h1>` with the problem title as a smaller line under it (not a heading), and
  a short intro paragraph: "A visual flashcard drill for FAANG LeetCode problems. See the problem, recognize the pattern, watch the solution animate. No walls of text — the motion is the explanation."
  Do **not** replaceState `/` → `/p/<id>` any more; the home page view is sent as path `/` (`swapPageView("/", "Problem Recall")`).
  Choosing a problem from home pushes `/p/<id>` and switches to problem mode (as today).
- **Problem mode** (`/p/<id>`): as today (H1 "<Title> — three-stage drill").
- **On every page, below the stage** (React-rendered, so it's in both SSR and the hydrated DOM):
  - "All problems by pattern": `<h2>` + for each pattern `<h3>` + `<ul>` of real `<a href="/p/<id>">Title</a>` links. Clicking one
    must `preventDefault()` and switch problems client-side (pushState, no reload). Mark the current problem `aria-current="page"`.
  - Home only: the FAQ section (see §3).
  - Footer: founder block (shared A) + cross-links (shared C, without Problem Recall).
- `src/main.jsx`: if `#root` has server-rendered children (`root.hasChildNodes()`), use `ReactDOM.hydrateRoot`, else `createRoot`
  (dev mode). Server and client markup must match: no random ids/timestamps/`Math.random()`/viewport-dependent values in the first render
  (defer those to `useEffect`). Hydration must produce **no** console errors/warnings about mismatches.
- `vite-plugin-prerender.js` (rewrite): after the client build, load `src/entry-server.jsx` via Vite `ssrLoadModule` (temporary
  `createServer({ server:{ middlewareMode:true }, appType:'custom', plugins:[react()] })`, as the seo1 plugin already does for data),
  then for `/` and **every** problem id:
  - take the built `dist/index.html` template, replace the single `<div id="root"></div>` (assert exactly one) with
    `<div id="root">${render(url)}</div>`;
  - set per-page head tags, each exactly once (throw if a replacement misses): `<title>`, `meta[name=description]`,
    `link[rel=canonical]`, `og:title`, `og:description`, `og:url` (= canonical), `twitter:title`, `twitter:description`.
    - `/`: keep today's title/description/canonical `https://leetcode.swapp1990.org/`.
    - `/p/<id>`: title `"<Title> — Problem Recall"`; canonical `https://leetcode.swapp1990.org/p/<id>`; description built from the
      problem data only, e.g. `"<Title> (LeetCode #<n>, <difficulty>): <tagline> Recognize the <Pattern name> pattern and watch the solution animate."`
      (trim to ≤ 160 chars on a word boundary; unique per page). Keep the `WebApplication` JSON-LD only on `/`.
  - write `/` to `dist/index.html` and each problem to `dist/p/<id>.html`.
  - `/` also gets (before `</head>`) `FAQPage` JSON-LD (from the same data the visible FAQ uses) and the Person JSON-LD (shared B).
  - `dist/sitemap.xml`: `/` + every `/p/<id>` (lastmod = build date). Log `[prerender] / + N problem pages + sitemap.xml (N+1 urls)`.
  - Remove the old hand-written static landing (React SSR replaces it).
- `public/404.html`: standalone (inline CSS, **no** module script, **no** analytics beacon), `<meta name="robots" content="noindex">`,
  title "Page not found — Problem Recall", one `<h1>Page not found</h1>`, a sentence, a link to `/` and the full pattern/problem link
  list is optional; founder block + cross-links (shared A, C without Problem Recall).

## 2. nginx vhost in the repo: new file `deploy/nginx/problem-recall.conf`
Start from the exact live text above and change only the first `server {}` block's locations to:
```nginx
    error_page 404 /404.html;
    location = /404.html { internal; add_header Cache-Control "no-cache" always; }

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    location = / { }   # index index.html → internal redirect to /index.html (its no-cache header applies)

    # seo-2: one prerendered file per problem; unknown ids are real 404s
    location ^~ /p/ {
        rewrite ^/p/([^/]+)/$ /p/$1 permanent;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        try_files $uri.html =404;
    }

    location = /robots.txt { try_files $uri =404; }
    location = /sitemap.xml { try_files $uri =404; }
    location ^~ /app-assets/ { try_files $uri =404; }
    location /assets/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    # seo-2: no SPA fallback; only real files, everything else is a real 404
    location / { try_files $uri =404; }
```
Keep every certbot line and the port-80 server block byte-identical. Put a 2-line comment at the top saying the file is installed by
hand to `/etc/nginx/sites-available/problem-recall` (deploy.sh does not install it). If Docker is available, validate with
`nginx:alpine` (stub the cert paths in a temp copy); otherwise say it wasn't run.

## 3. Landing FAQ (home mode, visible + FAQPage JSON-LD)
A `<section id="faq">` with `<h2>Frequently asked questions</h2>` and `<h3>`/`<p>` per item, rendered by React on `/` only (so it's in
SSR and after hydration). Exactly these, word for word; `{N}` / `{M}` are computed from the data (problem count, pattern count):
1. **What is Problem Recall?** — Problem Recall is a visual flashcard drill for FAANG LeetCode problems. See the problem, recognize the pattern, watch the solution animate. No walls of text — the motion is the explanation.
2. **How does a drill work?** — Every problem has three stages: the problem, the pattern and the solution. Step through them with the Back and Next buttons or the ← and → arrow keys; Escape resets to the start.
3. **Which problems are included?** — {N} LeetCode problems grouped into {M} patterns. They're all listed on this page, each with its own drill.
4. **Do I need an account?** — No. There's no sign-up: open any problem and start the drill.
5. **Can I share a single problem?** — Yes. Every problem has its own link (/p/ followed by the problem name), so you can bookmark or share it.
Keep the data in one module (e.g. `src/data/faq.js`) used by both the component and the plugin's JSON-LD.

## 4. Fonts non-blocking (`index.html`)
Replace the Google Fonts `<link rel="stylesheet">` with `rel="preload" as="style" … onload="this.onload=null;this.rel='stylesheet'"`
+ `<noscript><link rel="stylesheet" …></noscript>` (same URL); keep both preconnects. If CLS rises because of the font swap, add
`size-adjust`/fallback metrics or `font-display: optional`-style mitigation so CLS stays ≤ today's 0.036.
No `<img>` is added anywhere (if you add any, it must be WebP/AVIF with width/height/alt).

## 5. scripts/check-seo.mjs (extend; keep valid existing checks, update the ones this ship changes)
- `dist/index.html`: one `<h1`, canonical `/`, FAQPage + Person JSON-LD parse (`JSON.parse`), FAQ question texts present in the
  visible HTML, ≥ 25 `href="/p/` links, `href="https://swapp1990.org/"` + `Made by`, beacon `problem-recall` exactly once, no `gtag`.
- For **every** problem id: `dist/p/<id>.html` exists; one `<h1` containing the title; canonical = its own URL; title/description
  unique across pages; ≥ 25 `href="/p/` links; beacon exactly once; root contains server-rendered markup (not empty).
- `dist/404.html`: noindex, one `<h1`, no `analytics.swapp1990.org`, no `type="module"`.
- `dist/sitemap.xml`: exactly 1 + N URLs. `dist/robots.txt`: Sitemap line.
- No link to agency/analytics/taxes/keywords/stockbroker/videogen/moltbot/vncreator/cars/destruction hosts in any dist html.
- `deploy/nginx/problem-recall.conf`: contains `location ^~ /p/`, `error_page 404 /404.html`, `location / { try_files $uri =404; }`,
  and all 4 certbot `ssl_*`/`include` lines exactly as above.

## Acceptance (paste output)
1. `npm ci && npm run build` passes (prerender line + `check-seo ok`).
2. `npx vite preview` and, with any headless browser you have (e.g. `npx -y playwright@1 …` only if already cached, or Chrome
   `--headless --dump-dom`), load `/` and `/p/two-sum`: H1s as specified, links present after JS, **no hydration warnings** in the
   console, and exactly one `page_view` per load (path `/` on home, `/p/two-sum` on the problem page). If no headless browser is
   available, say so (it will be verified on another machine).
3. `git diff --stat origin/main`: only `index.html`, `src/**`, `vite-plugin-prerender.js`, `scripts/check-seo.mjs`, `public/404.html`,
   `deploy/nginx/problem-recall.conf`, `package.json` (lock only if a dependency was truly needed — prefer none), `specs/**`.
4. After committing, delete `node_modules/` and `dist/`.
