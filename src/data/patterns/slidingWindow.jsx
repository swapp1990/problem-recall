import { VizStage, VizArray, Pointer, Window, rowLayout, windowVariant } from "../../viz";

// Generic illustration — NOT tied to any problem. Both pointers carry a
// rightward move hint: in sliding window the window SLIDES (both edges move the
// same way), in deliberate contrast to two-pointers converging inward.
const VALUES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const W = 800;
const H = 280;
const CELL = 64;
const GAP = 8;
const CELL_Y = 96;
const L = 2;
const R = 4;

const layout = rowLayout({ count: VALUES.length, cellSize: CELL, gap: GAP, width: W });

export default function SlidingWindowViz() {
  const items = VALUES.map((v, i) => ({ value: v, variant: windowVariant(i, L, R) }));
  const wx = layout.cellX(L);
  const ww = layout.cellX(R) + CELL - wx;

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={34} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        expand right · shrink left to keep the window valid
      </text>

      <Window x={wx} width={ww} y={CELL_Y - 8} height={CELL + 16} />
      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />

      <Pointer centerX={layout.centerX(L)} labelY={56} tipY={CELL_Y - 5} label="left" move="right" />
      <Pointer centerX={layout.centerX(R)} labelY={56} tipY={CELL_Y - 5} label="right" move="right" />
    </VizStage>
  );
}
