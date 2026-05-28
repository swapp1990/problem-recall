import { useState } from "react";
import { VizStage, Heap, Cell, useDemoLoop } from "../../viz";

const W = 760;
const H = 260;

// The Heap/Top-K card teaches TWO things the problems actually rely on, and the
// distinction is the whole point — so it's a toggle, not one demo:
//
//   "basics"  — a MAX-heap: a new item bubbles UP until it meets someone bigger.
//               This is the mechanical intuition for what a heap *is*.
//   "top-k"   — a MIN-heap of size k: the counter-intuitive trick the k-largest
//               problems (#215 etc.) use. The root is the SMALLEST survivor — the
//               weakest of the current top-k — so any bigger newcomer cheaply
//               evicts it. After the sweep the heap holds the k biggest values and
//               its root is the k-th largest. People expect a MAX-heap for a
//               "largest" question; making them flip a switch to see the min-heap
//               makes the inversion stick.

// ---- "basics": insert 45 into a max-heap, watch it sift UP ----
// Initial max-heap (array form): [50, 30, 40, 10, 20, 35]; insert 45 at index 6.
const MAX_FRAMES = [
  {
    items: [
      { value: 50 }, { value: 30 }, { value: 40 },
      { value: 10 }, { value: 20 }, { value: 35 },
      { value: 45, variant: "active" },
    ],
    pointerIndex: 6,
    caption: "new item 45 lands at the end",
  },
  {
    items: [
      { value: 50 }, { value: 30 }, { value: 40, variant: "compare" },
      { value: 10 }, { value: 20 }, { value: 35 },
      { value: 45, variant: "active" },
    ],
    pointerIndex: 6,
    caption: "compare with parent 40 · 45 > 40 → swap",
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
    caption: "settled · max stays on top",
  },
];

// ---- "top-k": a MIN-heap of size k=3 sweeping a stream ----
// The root is the weakest of the top-3, so a bigger newcomer evicts it; a
// smaller one is discarded outright. heap stays [root=weakest, ...].
const MIN_FRAMES = [
  {
    items: [{ value: 5 }, { value: 8 }, { value: 9 }],
    pointerIndex: 0,
    caption: "min-heap of size k = 3 · root 5 is the SMALLEST survivor — the weakest of the top 3",
  },
  {
    items: [{ value: 5, variant: "compare" }, { value: 8 }, { value: 9 }],
    pointerIndex: 0,
    candidate: { value: 7, state: "enter" },
    caption: "stream sends 7 · compare with root 5 · 7 > 5 → it beats the weakest survivor",
  },
  {
    items: [{ value: 5, variant: "pop" }, { value: 8 }, { value: 9 }],
    pointerIndex: 0,
    candidate: { value: 7, state: "enter" },
    caption: "evict the root 5 — it drops out of the top 3 for good",
  },
  {
    items: [{ value: 7, variant: "active" }, { value: 8 }, { value: 9 }],
    pointerIndex: 0,
    caption: "7 takes the root slot · the new smallest survivor, 7, is now on top",
  },
  {
    items: [{ value: 7, variant: "compare" }, { value: 8 }, { value: 9 }],
    pointerIndex: 0,
    candidate: { value: 6, state: "reject" },
    caption: "stream sends 6 · 6 ≤ root 7 → discard, it can't crack the top 3",
  },
  {
    items: [{ value: 7, variant: "result" }, { value: 8, variant: "result" }, { value: 9, variant: "result" }],
    pointerIndex: null,
    caption: "the weakest survivor is always on top → O(log k) to evict · that's why 'k largest' uses a MIN-heap",
  },
];

const MODES = {
  basics: {
    label: "sift-up basics",
    kind: "max",
    frames: MAX_FRAMES,
    title: "a max-heap keeps the best on top — new items bubble up until they meet someone bigger",
  },
  topk: {
    label: "the top-k trick",
    kind: "min",
    frames: MIN_FRAMES,
    title: "for the k LARGEST, hold a MIN-heap of size k — its root is the weakest survivor, cheap to evict",
  },
};

// Inner demo — keyed by mode in the parent so useDemoLoop remounts (index → 0)
// whenever the toggle flips.
function HeapDemo({ mode }) {
  const cfg = MODES[mode];
  const f = useDemoLoop(cfg.frames.length, { interval: 1500 });
  const frame = cfg.frames[f] || cfg.frames[0];

  // Heap geometry (mirrors Heap's own layout math) so the candidate arrow can
  // point at the root.
  const heapX0 = 40;
  const heapY0 = 86;
  const heapW = W - 80;
  const cellSize = 36;
  const rootCx = heapX0 + heapW / 2;
  const rootTopY = heapY0 + 16; // node top edge of the root cell

  const cand = frame.candidate;
  const candSize = 38;
  const candX = rootCx - candSize / 2;
  const candY = 30;

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={20} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#1a1814">
        {cfg.title}
      </text>

      {/* Incoming stream candidate (top-k mode only) */}
      {cand && (
        <g>
          <text x={candX - 12} y={candY + candSize / 2 + 5} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">stream →</text>
          <Cell x={candX} y={candY} size={candSize} value={cand.value} variant={cand.state === "reject" ? "muted" : "active"} />
          {cand.state === "reject" ? (
            <>
              <line x1={rootCx} y1={candY + candSize + 2} x2={rootCx} y2={rootTopY - 4} stroke="#b91c1c" strokeWidth={2.5} strokeDasharray="5 4" markerEnd="url(#viz-arrow-down)" />
              <text x={rootCx + 14} y={(candY + candSize + rootTopY) / 2} fontFamily="JetBrains Mono, monospace" fontSize="18" fontWeight={700} fill="#b91c1c">✗</text>
            </>
          ) : (
            <line x1={rootCx} y1={candY + candSize + 2} x2={rootCx} y2={rootTopY - 4} stroke="#c2410c" strokeWidth={2.5} markerEnd="url(#viz-arrow-down)" />
          )}
        </g>
      )}

      <Heap
        items={frame.items}
        x0={heapX0}
        y0={heapY0}
        width={heapW}
        height={120}
        cellSize={cellSize}
        kind={cfg.kind}
        pointerIndex={frame.pointerIndex}
        pointerLabel="i"
        showIndices
      />

      <text x={W / 2} y={H - 10} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight={600} fill="#57534e">
        {frame.caption}
      </text>
    </VizStage>
  );
}

export default function HeapTopKViz() {
  const [mode, setMode] = useState("basics");
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
            {cfg.kind === "max" ? "▲" : "▼"} {cfg.label}
          </button>
        ))}
      </div>
      {/* key=mode forces remount so the demo loop restarts at frame 0 */}
      <HeapDemo key={mode} mode={mode} />
    </div>
  );
}
