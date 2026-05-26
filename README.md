# Problem Recall

A visual flashcard drill for LeetCode patterns. Each problem flows through three cards:

1. **The Problem** — input/output visualized, no walls of text
2. **The Pattern** — the technique stripped of any specific problem
3. **The Solution** — animated step-through of the algorithm

Built because pattern recognition is the actual skill, and most LeetCode prep tools bury it under prose.

## Live

→ `https://<your-deploy-url>` (add this once deployed)

## Stack

Static HTML. No framework, no build step. One file: `index.html`.

- Vanilla JavaScript for state and animation
- Inline SVG for all diagrams
- Google Fonts (Fraunces, Manrope, JetBrains Mono)
- ~30KB, loads instantly

## Run locally

```bash
# any static server works; pick one:
python3 -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000`.

## Deploy

Drop the folder onto any static host. Three good options:

**Cloudflare Pages** (recommended — best free tier, fastest CDN)
1. Push this repo to GitHub
2. `dash.cloudflare.com` → Workers & Pages → Create → Pages → Connect to Git
3. Pick this repo. Build command: empty. Output directory: `/`
4. Deploy. Live at `<repo-name>.pages.dev`

**Netlify**
1. `netlify deploy --prod` from this folder, or drag-drop the folder at `app.netlify.com/drop`

**Vercel**
1. `vercel --prod` from this folder

**GitHub Pages**
1. Settings → Pages → Source: deploy from branch → `main` / root → Save

All work identically for this site.

## Current scope

One problem wired up: **Valid Palindrome** (LeetCode #125).

The three-card structure, animation engine, and SVG primitives are in place. Adding a new problem means:
- A new entry in the problem data
- Three SVGs (problem viz, pattern viz, solution step-state)
- ~50 lines of step-state for the animation

## Roadmap

- [ ] Extract problem data into `problems.json`
- [ ] Pattern-viz library (reusable SVG primitives — cells, pointers, arcs, level rings)
- [ ] Pick-a-problem index page
- [ ] localStorage for seen / drill-again tracking
- [ ] 50 most-asked FAANG problems

## License

MIT. See `LICENSE`.
