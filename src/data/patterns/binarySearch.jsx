import { VizStage, VizArray, Pointer, rowLayout, useDemoLoop } from "../../viz";

// Generic illustration — NOT tied to a problem. Auto-loops the halving: left/
// right bound the search space, mid is checked, and the half that can't contain
// the target is discarded (greyed). Move chevrons telegraph the next jump and
// vanish on the final (found) frame.
const VALUES = [1, 3, 5, 7, 9, 11, 13, 15];
const CELL = 58;
const GAP = 8;
const CELL_Y = 116;
const H = 280;
const W = VALUES.length * CELL + (VALUES.length - 1) * GAP + 48;

const layout = rowLayout({ count: VALUES.length, cellSize: CELL, gap: GAP, width: W });

// searching for 13 (index 6)
const DEMO = [
  { l: 0, r: 7, mid: 3 },
  { l: 4, r: 7, mid: 5 },
  { l: 6, r: 7, mid: 6 },
];

export default function BinarySearchViz({ active = true }) {
  const i = useDemoLoop(DEMO.length, { interval: 1200, enabled: active });
  const s = DEMO[i];
  const next = i < DEMO.length - 1 ? DEMO[i + 1] : null;
  const leftMove = next && next.l > s.l ? "right" : null;
  const rightMove = next && next.r < s.r ? "left" : null;
  const items = VALUES.map((v, k) => ({ value: v, variant: k < s.l || k > s.r ? "matched" : k === s.mid ? "active" : "default" }));

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={34} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        check the middle, discard the half that can't hold the target
      </text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />

      <Pointer centerX={layout.centerX(s.l)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="left" move={leftMove} />
      <Pointer centerX={layout.centerX(s.r)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="right" move={rightMove} />
      <text x={layout.centerX(s.mid)} y={CELL_Y + CELL + 32} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="12" fontWeight="700" fill="#c2410c">↑ mid</text>
    </VizStage>
  );
}
