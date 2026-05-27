import { VizStage, VizArray, Pointer, Arc, rowLayout, convergingVariant, useDemoLoop } from "../../viz";

// Generic illustration of the technique — NOT tied to any one problem.
// Auto-loops the signature motion: both pointers converge inward (and cells
// grey out as they're passed), demonstrating "move both inward" as MOTION —
// the opposite of sliding window, where the window slides one way.
const VALUES = ["a", "b", "c", "d", "e", "f", "g"];
const CELL = 70;
const GAP = 8;
const CELL_Y = 96;
const H = 280;
const W = VALUES.length * CELL + (VALUES.length - 1) * GAP + 48;

const layout = rowLayout({ count: VALUES.length, cellSize: CELL, gap: GAP, width: W });

const DEMO = [
  { l: 0, r: 6 },
  { l: 1, r: 5 },
  { l: 2, r: 4 },
  { l: 3, r: 3 },
];

export default function TwoPointersViz({ active = true }) {
  const i = useDemoLoop(DEMO.length, { interval: 1200, enabled: active });
  const s = DEMO[i];
  const merged = s.l === s.r;
  const items = VALUES.map((v, k) => ({ value: v, variant: convergingVariant(k, s.l, s.r) }));

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={34} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        loop while left &lt; right · move both inward
      </text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />

      <Pointer
        centerX={layout.centerX(s.l)}
        labelY={56}
        tipY={CELL_Y - 5}
        label={merged ? "left = right" : "left"}
        move={merged ? null : "right"}
      />
      {!merged && <Pointer centerX={layout.centerX(s.r)} labelY={56} tipY={CELL_Y - 5} label="right" move="left" />}

      {!merged && (
        <Arc
          key={`${s.l}-${s.r}`}
          x1={layout.centerX(s.l)}
          x2={layout.centerX(s.r)}
          y={CELL_Y + CELL + 4}
          depth={52}
          label="compare → if equal, move both inward"
        />
      )}
    </VizStage>
  );
}
