import { VizStage, VizArray, Pointer, rowLayout, useDemoLoop } from "../../viz";

// Generic illustration — NOT tied to any problem. Auto-loops a left→right sweep
// that builds the running cumulative-sum row beneath the array: prefix[i] =
// nums[0] + … + nums[i]. That running total is what lets any range sum (or a
// lookup in a map) be answered in O(1).
const VALUES = [2, 1, 3, 2, 4];
const PREFIX = VALUES.reduce((acc, v, i) => (acc.push((acc[i - 1] || 0) + v), acc), []);
const CELL = 62;
const GAP = 10;
const H = 280;
const W = VALUES.length * CELL + (VALUES.length - 1) * GAP + 120;
const ROW1 = 70;
const ROW2 = 168;

const layout = rowLayout({ count: VALUES.length, cellSize: CELL, gap: GAP, width: W });

export default function PrefixSumViz({ active = true }) {
  const i = useDemoLoop(VALUES.length, { interval: 1000, enabled: active });
  const nums = VALUES.map((v, k) => ({ value: v, variant: k <= i ? "default" : "muted" }));
  const prefix = PREFIX.map((p, k) => ({ value: p, variant: k < i ? "matched" : k === i ? "active" : "muted" }));

  return (
    <VizStage width={W} height={H}>
      <text x={layout.originX - 14} y={ROW1 + CELL / 2 + 5} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="12" fill="#57534e">nums</text>
      <text x={layout.originX - 14} y={ROW2 + CELL / 2 + 5} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="12" fill="#c2410c">prefix</text>

      <VizArray items={nums} layout={layout} y={ROW1} cellSize={CELL} />
      <VizArray items={prefix} layout={layout} y={ROW2} cellSize={CELL} showIndices />

      <Pointer centerX={layout.centerX(i)} labelY={ROW1 - 26} tipY={ROW1 - 5} label="sweep" move="right" />

      <text x={W / 2} y={H - 16} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        prefix[i] = nums[0] + … + nums[i] → any range sum in O(1)
      </text>
    </VizStage>
  );
}
