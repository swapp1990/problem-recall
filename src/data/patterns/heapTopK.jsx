import { useState } from "react";
import { VizStage, Heap, useDemoLoop } from "../../viz";

const W = 760;
const H = 240;

// The Heap/Top-K card teaches the ONE structural fact every heap problem leans
// on: which extreme sits on top. It's a toggle between the two heap kinds so the
// difference is shown side-by-side (same insert, mirrored comparison):
//
//   "max-heap" — parent ≥ children, so the LARGEST bubbles to the root.
//   "min-heap" — parent ≤ children, so the SMALLEST bubbles to the root.
//
// Both demos do the same thing: a new item lands at the next leaf and sifts UP
// until the heap order holds. The only difference is the comparison direction —
// that's the whole point. (How a min-heap-of-size-k is used for the k-largest
// trick lives on the SOLUTION card, not here.)

// ---- max-heap: insert 45, bubble up while it's BIGGER than its parent ----
// Initial max-heap (array form): [50, 30, 40, 10, 20, 35]; insert 45 at index 6.
const MAX_FRAMES = [
  {
    items: [
      { value: 50 }, { value: 30 }, { value: 40 },
      { value: 10 }, { value: 20 }, { value: 35 },
      { value: 45, variant: "active" },
    ],
    pointerIndex: 6,
    caption: "new item 45 lands at the next leaf",
  },
  {
    items: [
      { value: 50 }, { value: 30 }, { value: 40, variant: "compare" },
      { value: 10 }, { value: 20 }, { value: 35 },
      { value: 45, variant: "active" },
    ],
    pointerIndex: 6,
    caption: "compare with parent 40 · 45 > 40 → swap (bigger rises)",
  },
  {
    items: [
      { value: 50 }, { value: 30 }, { value: 45, variant: "swap" },
      { value: 10 }, { value: 20 }, { value: 35 },
      { value: 40, variant: "swap" },
    ],
    pointerIndex: 2,
    caption: "swap · 45 climbs to index 2, 40 drops",
  },
  {
    items: [
      { value: 50, variant: "compare" }, { value: 30 }, { value: 45, variant: "active" },
      { value: 10 }, { value: 20 }, { value: 35 }, { value: 40 },
    ],
    pointerIndex: 2,
    caption: "compare with new parent 50 · 45 < 50 → stop",
  },
  {
    items: [
      { value: 50, variant: "result" }, { value: 30 }, { value: 45, variant: "result" },
      { value: 10 }, { value: 20 }, { value: 35 }, { value: 40 },
    ],
    pointerIndex: null,
    caption: "settled · the LARGEST stays on top",
  },
];

// ---- min-heap: insert 15, bubble up while it's SMALLER than its parent ----
// Initial min-heap (array form): [10, 30, 20, 50, 40, 35]; insert 15 at index 6.
const MIN_FRAMES = [
  {
    items: [
      { value: 10 }, { value: 30 }, { value: 20 },
      { value: 50 }, { value: 40 }, { value: 35 },
      { value: 15, variant: "active" },
    ],
    pointerIndex: 6,
    caption: "new item 15 lands at the next leaf",
  },
  {
    items: [
      { value: 10 }, { value: 30 }, { value: 20, variant: "compare" },
      { value: 50 }, { value: 40 }, { value: 35 },
      { value: 15, variant: "active" },
    ],
    pointerIndex: 6,
    caption: "compare with parent 20 · 15 < 20 → swap (smaller rises)",
  },
  {
    items: [
      { value: 10 }, { value: 30 }, { value: 15, variant: "swap" },
      { value: 50 }, { value: 40 }, { value: 35 },
      { value: 20, variant: "swap" },
    ],
    pointerIndex: 2,
    caption: "swap · 15 climbs to index 2, 20 drops",
  },
  {
    items: [
      { value: 10, variant: "compare" }, { value: 30 }, { value: 15, variant: "active" },
      { value: 50 }, { value: 40 }, { value: 35 }, { value: 20 },
    ],
    pointerIndex: 2,
    caption: "compare with new parent 10 · 15 > 10 → stop",
  },
  {
    items: [
      { value: 10, variant: "result" }, { value: 30 }, { value: 15, variant: "result" },
      { value: 50 }, { value: 40 }, { value: 35 }, { value: 20 },
    ],
    pointerIndex: null,
    caption: "settled · the SMALLEST stays on top",
  },
];

const MODES = {
  max: {
    label: "max-heap",
    glyph: "▲",
    kind: "max",
    frames: MAX_FRAMES,
    title: "a max-heap keeps the LARGEST on top — a new item bubbles up while it's bigger than its parent",
  },
  min: {
    label: "min-heap",
    glyph: "▼",
    kind: "min",
    frames: MIN_FRAMES,
    title: "a min-heap keeps the SMALLEST on top — a new item bubbles up while it's smaller than its parent",
  },
};

// Inner demo — keyed by mode in the parent so useDemoLoop remounts (index → 0)
// whenever the toggle flips.
function HeapDemo({ mode }) {
  const cfg = MODES[mode];
  const f = useDemoLoop(cfg.frames.length, { interval: 1500 });
  const frame = cfg.frames[f] || cfg.frames[0];

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={22} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#1a1814">
        {cfg.title}
      </text>
      <Heap
        items={frame.items}
        x0={40}
        y0={42}
        width={W - 80}
        height={140}
        cellSize={36}
        kind={cfg.kind}
        pointerIndex={frame.pointerIndex}
        pointerLabel="i"
        showIndices
      />
      <text x={W / 2} y={H - 12} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight={600} fill="#57534e">
        {frame.caption}
      </text>
    </VizStage>
  );
}

export default function HeapTopKViz() {
  const [mode, setMode] = useState("max");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%" }}>
      <div className="case-toggle">
        {Object.entries(MODES).map(([key, cfg]) => (
          <button
            key={key}
            className={"case-pill" + (mode === key ? " active" : "")}
            onClick={() => setMode(key)}
            title={cfg.title}
          >
            {cfg.glyph} {cfg.label}
          </button>
        ))}
      </div>
      {/* key=mode forces remount so the demo loop restarts at frame 0 */}
      <HeapDemo key={mode} mode={mode} />
    </div>
  );
}
