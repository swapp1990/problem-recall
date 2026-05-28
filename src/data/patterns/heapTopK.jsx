import { VizStage, Heap, useDemoLoop } from "../../viz";

const W = 760;
const H = 240;

// Demo: insert 45 into a max-heap, watch it bubble UP. The pattern's
// signature motion is "new item compares with parent, swaps if it beats it,
// continues until it sits in the right place".
//
// Initial heap (max-heap, array form): [50, 30, 40, 10, 20, 35]
// Insert 45 at index 6 (child of 40 at index 2).
//   frame 0: 45 lands at the bottom
//   frame 1: compare 45 vs parent 40 — 45 wins
//   frame 2: swap · 45 moves up to index 2, 40 drops to index 6
//   frame 3: compare 45 vs new parent 50 — 50 wins · stop
//   frame 4: settled
const FRAMES = [
  // frame 0 — fresh insert
  {
    items: [
      { value: 50 }, { value: 30 }, { value: 40 },
      { value: 10 }, { value: 20 }, { value: 35 },
      { value: 45, variant: "active" },
    ],
    pointerIndex: 6,
    caption: "new item 45 lands at the end",
  },
  // frame 1 — compare with parent
  {
    items: [
      { value: 50 }, { value: 30 }, { value: 40, variant: "compare" },
      { value: 10 }, { value: 20 }, { value: 35 },
      { value: 45, variant: "active" },
    ],
    pointerIndex: 6,
    caption: "compare with parent 40 · 45 > 40 → swap",
  },
  // frame 2 — swap pair flashes
  {
    items: [
      { value: 50 }, { value: 30 }, { value: 45, variant: "swap" },
      { value: 10 }, { value: 20 }, { value: 35 },
      { value: 40, variant: "swap" },
    ],
    pointerIndex: 2,
    caption: "swap · 45 climbs to index 2, 40 drops",
  },
  // frame 3 — compare with grandparent
  {
    items: [
      { value: 50, variant: "compare" }, { value: 30 }, { value: 45, variant: "active" },
      { value: 10 }, { value: 20 }, { value: 35 }, { value: 40 },
    ],
    pointerIndex: 2,
    caption: "compare with new parent 50 · 45 < 50 → stop",
  },
  // frame 4 — settled
  {
    items: [
      { value: 50, variant: "result" }, { value: 30 }, { value: 45, variant: "result" },
      { value: 10 }, { value: 20 }, { value: 35 }, { value: 40 },
    ],
    pointerIndex: null,
    caption: "settled · max stays on top",
  },
];

export default function HeapTopKViz() {
  const f = useDemoLoop(FRAMES.length, { interval: 1500 });
  const frame = FRAMES[f];
  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={26} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#1a1814">
        a max-heap keeps the best on top — new items bubble up until they meet someone bigger
      </text>
      <Heap
        items={frame.items}
        x0={40}
        y0={42}
        width={W - 80}
        height={140}
        cellSize={36}
        kind="max"
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
