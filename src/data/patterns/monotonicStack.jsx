import { VizStage, VizArray, Pointer, Deque, rowLayout, useDemoLoop } from "../../viz";

// Generic illustration — NOT tied to a problem. Auto-loops a scan that keeps a
// decreasing stack: a new value first POPS every smaller value it "resolves"
// (it's their next-greater), then is pushed. The stack only ever holds values
// still waiting for something bigger.
const VALUES = [3, 1, 4, 1, 5];
const CELL = 56;
const GAP = 8;
const H = 290;
const ARRAY_ZONE = 360;
const W = 760;
const STACK_Y = 120;

const layout = rowLayout({ count: VALUES.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });

// stack = values held after processing index i (post pop+push)
const DEMO = [
  { i: 0, stack: [{ value: 3 }], note: "push 3" },
  { i: 1, stack: [{ value: 3 }, { value: 1 }], note: "1 < 3 → push 1" },
  { i: 2, stack: [{ value: 4, variant: "new" }], note: "4 pops 1 and 3 → push 4" },
  { i: 3, stack: [{ value: 4 }, { value: 1 }], note: "1 < 4 → push 1" },
  { i: 4, stack: [{ value: 5, variant: "new" }], note: "5 pops 1 and 4 → push 5" },
];

export default function MonotonicStackViz({ active = true }) {
  const i = useDemoLoop(DEMO.length, { interval: 1200, enabled: active });
  const s = DEMO[i];
  const items = VALUES.map((v, k) => ({ value: v, variant: k < s.i ? "matched" : k === s.i ? "active" : "muted" }));
  const sx = 470;

  return (
    <VizStage width={W} height={H}>
      <text x={ARRAY_ZONE / 2} y={36} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        pop everything the new value resolves, then push it
      </text>

      <VizArray items={items} layout={layout} y={STACK_Y} cellSize={CELL} showIndices />
      <Pointer centerX={layout.centerX(s.i)} labelY={STACK_Y - 26} tipY={STACK_Y - 5} label="scan" move={i < DEMO.length - 1 ? "right" : null} />

      <text x={sx} y={STACK_Y - 26} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">stack</text>
      <Deque x={sx} y={STACK_Y} items={s.stack} cellW={50} cellH={50} frontLabel="bottom" backLabel="top" />
      <text x={sx} y={H - 22} fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#c2410c">{s.note}</text>
    </VizStage>
  );
}
