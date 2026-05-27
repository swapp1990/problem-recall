# viz — a Manim-inspired animation engine (embedded, to be extracted)

> **Note to future us:** this directory is intentionally self-contained so it can
> be lifted out into its own open-source package later — a web-native,
> Manim-inspired engine for explanatory algorithm/data-structure animations.
> Treat the boundary as real: **nothing in here may import from the host app**
> (no app components, no app data, no app CSS variables). Everything it needs —
> colors, fonts, sizing — lives in `theme.js`.

## Why this exists

Manim (3Blue1Brown's engine) renders to *video* via a Python pipeline — gorgeous
but non-interactive and impossible to embed as a live widget. This engine keeps
the Manim *design language* (smooth pointer travel, "write-on" strokes, calm
cross-fades) while staying **interactive and in-browser**: it's React + SVG +
Framer Motion, driven by step state the host controls (play/pause/step).

## Design-language principles (reuse these)

- **A step should visualize its own conclusion, not just narrate it.** If a step
  ends with "move left inward", *show* that intent inside the step — don't leave
  it only in the status text. The viewer should understand the next move before
  clicking next. Implemented as the `move` hint on `Pointer` (an animated
  directional chevron). When you add a new technique, ask: "what decision does
  this step reach, and how is that decision visible on the diagram itself?"
- **Smooth travel over teleport.** State changes animate (pointers spring,
  strokes write on, fills cross-fade) so the eye can follow what changed.
- **A move hint must reflect a move that actually happens — track the done
  state.** The chevron telegraphs the *next* move; never show it when the loop
  ends or a pointer is pinned at a bound (can't increment). Prefer deriving the
  chevron from the diff to the next state so it's correct by construction:
  no next state (terminal / loop reset) ⇒ no chevron. A lingering "can expand"
  arrow at the end is a bug.
- **Semantic variants, not raw colors.** Cells/arcs take a meaning
  ("active", "matched", mismatch) and the theme maps it to color.
- **Name viz variables exactly as the code does.** A pointer, badge, or
  derived value in a diagram must use the identifier from the solution code —
  pointer labelled `i` (not "day"), `w` (not "word"), `ch` (not "i") to match
  the `for` variable. And show a computed result the way the code writes it,
  with the real values substituted: `ans[j] = i − j = 4 − 2 = 2`, not a bare
  `waited 2`. The learner is mapping the picture onto the code they'll type;
  divergent names silently break that mapping. When a number appears (the `4`,
  the `2`), it must be traceable to a named thing on screen (the `i` pointer at
  index 4, the `j` cell at index 2).
- **The answer looks different from scratch state.** The value being
  accumulated / returned (count, best, longest) is the *goal*, not just
  another variable — render it with the `Output` primitive (a solid-filled
  green "↩ ANSWER" pill), so it stands apart from working state (pointers,
  prefix, sum), which uses outlined `Caption` badges.
- **Show a removal as its own frame, not a jump.** When a step pops/evicts
  elements (monotonic stack/deque), give each pop its own frame: flash the
  outgoing item red (`variant: "pop"`) alongside the comparison that forces it
  (e.g. "76 > 71 → pop"). Collapsing "x pops a, b, c then pushes x" into a
  single state change hides the whole mechanic. Likewise, make a structural
  invariant *visible* — label a monotonic stack "kept decreasing" and let the
  on-screen values actually read as decreasing — so the property isn't just
  asserted in prose.
- **Show the motion-phrase as motion.** A pattern's signature description
  ("expand right · shrink left", "move both inward") should be *demonstrated*,
  not just printed. Pattern cards auto-loop their motion via `useDemoLoop`
  (cycles demo states; pauses when the card is off-screen or the tab is hidden;
  respects `prefers-reduced-motion`). When adding a pattern, give its card a
  short `DEMO` state list and drive the primitives from it.

## Layout

```
viz/
  index.js          barrel — the package's public API
  theme.js          design tokens (colors, fonts, cell sizing)
  motion.js         shared transition presets + cell variant → visual mapping
  layout.js         pure geometry (rowLayout) — no React
  context.js        theme React context
  VizStage.jsx      SVG root: coordinate space, <defs> markers, theme provider
  primitives/
    Cell.jsx        a labeled box with animated variant state
    Pointer.jsx     a labeled arrow that springs between columns
    Arc.jsx         a quadratic arc that writes on / fades out
    VizArray.jsx    lays out a row of Cells from items + a layout
    Table.jsx       a hash MAP as a dict literal — `name = { k: v, ... }`
    HashSet.jsx     a hash SET as a set literal — `name = { a, b, ... }`
```

**Hashing problems share a visual language**: render the input as a row
(`VizArray` + `Pointer`) on the left, and the hash structure on the right —
`Table` for a map (key→value), `HashSet` for a set (membership). Both render as
the literal you'd write in code and support `highlight`/`block` to show a
lookup landing (green) or the value that fails a check (red). Don't hand-roll
set/map cells; reuse these so every problem in the family reads the same.

## Usage

```jsx
import { VizStage, VizArray, Pointer, Arc, rowLayout } from "../viz";

const layout = rowLayout({ count: word.length, cellSize: 70, gap: 8, width: 800 });
const items = word.map((ch, i) => ({ value: ch, variant: variantFor(i) }));

<VizStage width={800} height={280}>
  <VizArray items={items} layout={layout} y={90} cellSize={70} showIndices />
  <Pointer centerX={layout.centerX(left)} labelY={48} tipY={85} label="left" />
  <AnimatePresence>{comparing && <Arc x1={...} x2={...} y={164} />}</AnimatePresence>
</VizStage>
```

## Extraction checklist (when we spin it out)

- [ ] Move `viz/` to its own repo / workspace package; add `package.json` with
      `react`, `react-dom`, `framer-motion` as peer deps.
- [ ] Replace host imports (`../viz`) with the package name.
- [ ] Add a primitive gallery / Storybook and per-primitive docs.
- [ ] Grow the primitive set the roadmap wants: level rings (trees), edges
      (graphs), grids (matrices/DP), a timeline/track for sequencing steps.
- [ ] Decide on an API for *declarative step sequences* (a "scene script") so
      hosts describe states, not frame math.
