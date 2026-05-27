import { VizStage, VizArray, Pointer, Window, rowLayout, windowVariant, useDemoLoop } from "../../viz";

// Generic illustration — NOT tied to a problem. Auto-loops the signature
// motion: the window expands (right edge slides right) then shrinks (left edge
// slides right), demonstrating "expand right · shrink left" as MOTION. Both
// edges move the same way — the window slides — in deliberate contrast to
// two-pointers converging inward.
//
// Move chevrons are derived from the NEXT demo state (telegraph), so a chevron
// only ever appears for a move that actually happens; on the last frame (before
// the loop resets) no chevron shows — the "done" state, never implying the
// window can extend further than it does.
const VALUES = ["a", "b", "c", "d", "e", "f"];
const CELL = 64;
const GAP = 8;
const CELL_Y = 96;
const H = 280;
const W = VALUES.length * CELL + (VALUES.length - 1) * GAP + 48;

const layout = rowLayout({ count: VALUES.length, cellSize: CELL, gap: GAP, width: W });

const DEMO = [
  { l: 1, r: 1 },
  { l: 1, r: 2 },
  { l: 1, r: 3 },
  { l: 2, r: 3 },
  { l: 3, r: 3 },
  { l: 3, r: 4 },
  { l: 3, r: 5 },
  { l: 4, r: 5 },
  { l: 5, r: 5 },
];

export default function SlidingWindowViz({ active = true }) {
  const i = useDemoLoop(DEMO.length, { interval: 1050, enabled: active });
  const s = DEMO[i];
  const next = i < DEMO.length - 1 ? DEMO[i + 1] : null; // null on the last frame → no chevron (done)
  const rightMove = next && next.r > s.r ? "right" : null; // window grows
  const leftMove = next && next.l > s.l ? "right" : null; // window shrinks (left slides right)
  const merged = s.l === s.r;

  const items = VALUES.map((v, k) => ({ value: v, variant: windowVariant(k, s.l, s.r) }));
  const wx = layout.cellX(s.l);
  const ww = layout.cellX(s.r) + CELL - wx;

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={34} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        expand right · shrink left to keep the window valid
      </text>

      <Window x={wx} width={ww} y={CELL_Y - 8} height={CELL + 16} />
      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />

      <Pointer
        centerX={layout.centerX(s.l)}
        labelY={56}
        tipY={CELL_Y - 5}
        label={merged ? "l = r" : "left"}
        move={merged ? leftMove ?? rightMove : leftMove}
      />
      {!merged && <Pointer centerX={layout.centerX(s.r)} labelY={56} tipY={CELL_Y - 5} label="right" move={rightMove} />}
    </VizStage>
  );
}
