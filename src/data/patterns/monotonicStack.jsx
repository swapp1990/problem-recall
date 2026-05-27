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

// Pop frames are shown explicitly (the smaller value flashes red as it's
// popped) so the mechanic that KEEPS the stack decreasing is visible, not
// collapsed into one jump. `kind` colors the note: pop (red) vs push (green).
const DEMO = [
  { i: 0, stack: [{ value: 3, variant: "new" }], note: "stack empty → push 3", kind: "push" },
  { i: 1, stack: [{ value: 3 }, { value: 1, variant: "new" }], note: "1 < 3 → push · stack 3,1 stays ↓", kind: "push" },
  { i: 2, stack: [{ value: 3 }, { value: 1, variant: "pop" }], note: "4 > 1 → pop 1 (4 is its next-greater)", kind: "pop" },
  { i: 2, stack: [{ value: 3, variant: "pop" }], note: "4 > 3 → pop 3", kind: "pop" },
  { i: 2, stack: [{ value: 4, variant: "new" }], note: "now push 4", kind: "push" },
  { i: 3, stack: [{ value: 4 }, { value: 1, variant: "new" }], note: "1 < 4 → push · stack 4,1 stays ↓", kind: "push" },
  { i: 4, stack: [{ value: 4 }, { value: 1, variant: "pop" }], note: "5 > 1 → pop 1", kind: "pop" },
  { i: 4, stack: [{ value: 4, variant: "pop" }], note: "5 > 4 → pop 4", kind: "pop" },
  { i: 4, stack: [{ value: 5, variant: "new" }], note: "now push 5", kind: "push" },
];

export default function MonotonicStackViz({ active = true }) {
  const i = useDemoLoop(DEMO.length, { interval: 1100, enabled: active });
  const s = DEMO[i];
  const items = VALUES.map((v, k) => ({ value: v, variant: k < s.i ? "matched" : k === s.i ? "active" : "muted" }));
  const sx = 470;

  return (
    <VizStage width={W} height={H}>
      <text x={ARRAY_ZONE / 2} y={32} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        a bigger value pops every smaller one, then is pushed
      </text>

      <VizArray items={items} layout={layout} y={STACK_Y} cellSize={CELL} showIndices />
      <Pointer centerX={layout.centerX(s.i)} labelY={STACK_Y - 26} tipY={STACK_Y - 5} label="scan" move={i < DEMO.length - 1 ? "right" : null} />

      <text x={sx} y={STACK_Y - 26} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">stack — kept decreasing</text>
      <Deque x={sx} y={STACK_Y} items={s.stack} cellW={50} cellH={50} frontLabel="bottom" backLabel="top ↓ smaller" />
      <text x={sx} y={STACK_Y + 70} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#a8a29e">top is always the smallest — so it pops first</text>

      <text x={ARRAY_ZONE / 2} y={H - 20} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill={s.kind === "pop" ? "#b91c1c" : "#15803d"}>{s.note}</text>
    </VizStage>
  );
}
