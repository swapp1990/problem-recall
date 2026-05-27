import { VizStage, VizArray, Pointer, Caption, Table, rowLayout } from "../../viz";

const W = 820;
const H = 280;
const CELL = 60;
const GAP = 8;
const CELL_Y = 104;
const ARRAY_ZONE = 470;
const TABLE_X = 540;

const C1 = [1, 2, 3];
const C2 = [1, -1, 1];

// seen-snapshots are the map state at LOOKUP time (before inserting the current
// prefix) — the order that matters for correctness. `lookKey` is prefix − k;
// `found` is how many earlier starts close a subarray here.
const C1_STEPS = [
  { i: -1, prefix: 0, count: 0, lookKey: null, found: 0, seen: [{ k: 0, v: 1 }], status: "start: seen = {0: 1}, count = 0" },
  { i: 0, prefix: 1, count: 0, lookKey: -2, found: 0, seen: [{ k: 0, v: 1 }], status: "add 1 → prefix 1. look 1−3 = −2 → absent → count 0" },
  { i: 1, prefix: 3, count: 1, lookKey: 0, found: 1, seen: [{ k: 0, v: 1 }, { k: 1, v: 1 }], status: "add 2 → prefix 3. look 3−3 = 0 → found 1 → count 1" },
  { i: 2, prefix: 6, count: 2, lookKey: 3, found: 1, seen: [{ k: 0, v: 1 }, { k: 1, v: 1 }, { k: 3, v: 1 }], status: "add 3 → prefix 6. look 6−3 = 3 → found 1 → count 2" },
  { i: 3, prefix: 6, count: 2, lookKey: null, found: 0, seen: [{ k: 0, v: 1 }, { k: 1, v: 1 }, { k: 3, v: 1 }, { k: 6, v: 1 }], status: "done → 2 subarrays sum to 3" },
];

// Negatives: a window can't shrink safely, but prefix-sum counting still works —
// and seen[0] = 2 shows why we add the COUNT, not just 1.
const C2_STEPS = [
  { i: -1, prefix: 0, count: 0, lookKey: null, found: 0, seen: [{ k: 0, v: 1 }], status: "start: seen = {0: 1}, count = 0" },
  { i: 0, prefix: 1, count: 1, lookKey: 0, found: 1, seen: [{ k: 0, v: 1 }], status: "add 1 → prefix 1. look 1−1 = 0 → found 1 → count 1" },
  { i: 1, prefix: 0, count: 1, lookKey: -1, found: 0, seen: [{ k: 0, v: 1 }, { k: 1, v: 1 }], status: "add −1 → prefix 0. look 0−1 = −1 → absent → count 1" },
  { i: 2, prefix: 1, count: 3, lookKey: 0, found: 2, seen: [{ k: 0, v: 2 }, { k: 1, v: 1 }], status: "add 1 → prefix 1. look 0 → found 2 → count += 2 → 3" },
  { i: 3, prefix: 1, count: 3, lookKey: null, found: 0, seen: [{ k: 0, v: 2 }, { k: 1, v: 2 }], status: "done → 3 subarrays sum to 1" },
];

function ProblemViz() {
  const nums = C1;
  const cs = 64;
  const gap = 10;
  const cy = 150;
  const pl = rowLayout({ count: nums.length, cellSize: cs, gap, width: 800 });
  const items = nums.map((n) => ({ value: n, variant: "default" }));
  return (
    <VizStage width={800} height={340}>
      <Caption joinX={470} cy={56} label="count subarrays with sum =" value="3" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      {/* two qualifying subarrays */}
      <g stroke="#15803d" strokeWidth="2" fill="none">
        <path d={`M ${pl.cellX(0) + 4} ${cy + cs + 14} L ${pl.cellX(0) + 4} ${cy + cs + 24} L ${pl.cellX(1) + cs - 4} ${cy + cs + 24} L ${pl.cellX(1) + cs - 4} ${cy + cs + 14}`} />
        <path d={`M ${pl.cellX(2) + 4} ${cy + cs + 14} L ${pl.cellX(2) + 4} ${cy + cs + 24} L ${pl.cellX(2) + cs - 4} ${cy + cs + 24} L ${pl.cellX(2) + cs - 4} ${cy + cs + 14}`} />
      </g>
      <text x={(pl.cellX(0) + pl.cellX(1) + cs) / 2} y={cy + cs + 44} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#15803d">[1,2] = 3 ✓</text>
      <text x={pl.cellX(2) + cs / 2} y={cy + cs + 44} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#15803d">[3] = 3 ✓</text>
      <Caption joinX={360} cy={300} label="return" value="2" fill="#dcfce7" stroke="#15803d" color="#15803d" />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const input = data.input;
  const k = data.k;
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });
  const variantFor = (idx) => (step.i < 0 ? "muted" : idx === step.i ? "active" : idx < step.i ? "matched" : "muted");
  const items = input.map((n, idx) => ({ value: n, variant: variantFor(idx) }));
  return (
    <VizStage width={W} height={H}>
      <text x={ARRAY_ZONE / 2} y={30} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">k = {k}</text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      {step.i >= 0 && <Pointer centerX={layout.centerX(step.i)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="i" move="right" />}

      <Caption joinX={150} cy={212} label="prefix" value={step.prefix} />
      <Caption joinX={330} cy={212} label="count" value={step.count} fill="#dcfce7" stroke="#15803d" color="#15803d" />

      <Table x={TABLE_X} y={96} title="seen (prefix → count)" rows={step.seen} highlightKey={step.found > 0 ? step.lookKey : null} />
    </VizStage>
  );
}

export default {
  id: "subarray-sum-k",
  leetcode: 560,
  title: "Subarray Sum Equals K",
  difficulty: "Medium",
  tagline: "Count contiguous subarrays whose sum equals k (values may be negative).",
  patternId: "prefix-sum",
  constraint: "Values may be negative.",
  ProblemViz,
  examples: [
    { input: "[1,2,3], k=3", result: "2", ok: true },
    { input: "[1,2,3], k=100", result: "0", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Unlike a sliding window, this handles negatives: it counts prefix sums in a map instead of shrinking a window. seen[p] is how many times prefix p occurred, so count += seen[prefix−k] adds every earlier start that closes a subarray summing to k.",
    code: `def subarraySum(nums, k):
    count = 0
    prefix = 0
    seen = {0: 1}
    for x in nums:
        prefix += x
        count += seen.get(prefix - k, 0)
        seen[prefix] = seen.get(prefix, 0) + 1
    return count`,
    codeHighlight: [6, 7, 8],
    codeNote: "prefix + map lookup",
    cases: [
      { id: "basic", label: "k = 3", result: "2", ok: true, input: C1, k: 3, steps: C1_STEPS },
      { id: "negatives", label: "with negatives", result: "3", ok: true, input: C2, k: 1, steps: C2_STEPS },
    ],
  },
};
