# problem-recall — repo guidelines

## Visualization design language
- `src/viz/` is a self-contained, Manim-inspired animation engine, intended to be extracted as its own OSS package later. **Read `src/viz/README.md` before adding or changing any visualization** — it documents the engine layout, the reusable primitives, and the design-language principles (e.g. "a step visualizes its own conclusion", "show the motion-phrase as motion", "the answer looks different from scratch state").
- Reuse the existing primitives (`Cell`, `Pointer`, `Window`, `Arc`, `Table`, `Deque`, `Span`, `Caption`, `Badge`, `Output`) and shared motion presets instead of hand-rolling SVG. Pull everything from the barrel `import { ... } from "../../viz"`.
- Keep `src/viz/` **app-agnostic**: nothing in it may import host app components, data, or CSS variables — all tokens live in `src/viz/theme.js`. This boundary is what makes extraction possible; don't violate it for convenience.
- When you introduce a genuinely new design-language element (a new primitive or a new visual convention), add a primitive to `src/viz/` AND record the principle in `src/viz/README.md` so the learning travels with the engine.

## Verifying visual changes
- For any change that affects rendered output (positions, sizes, animations, layout), pull a **real screenshot from a foreground browser tab** rather than trusting DOM attribute probes. Attribute/text checks pass while the actual render is wrong — that's exactly how the pointer-positioning bug slipped through (framer wrote `x` as an SVG attribute a `<g>` ignored, so pointers never moved, yet DOM checks looked fine).
- Note: browser timers (`setInterval`) are throttled in background tabs, so auto-animations look "frozen" unless the tab is foregrounded before sampling.
