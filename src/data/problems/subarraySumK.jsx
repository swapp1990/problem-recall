import { VizStage, VizArray, Pointer, Caption, Table, rowLayout } from "../../viz";

const W = 860;
const H = 300;
const CELL = 56;
const GAP = 8;
const CELL_Y = 92;
const ARRAY_ZONE = 460;
const TABLE_X = 548;

const C1 = [4, 2, -2, 4, 2];
const C2 = [1, 2, 3];

// `seen` snapshots are the map state at LOOKUP time (before inserting the
// current prefix). `lookKey` = prefix − k; `found` = how many earlier starts
// close a subarray ending here, which is what we add to count.
const C1_STEPS = [
  { i: -1, prefix: 0, count: 0, lookKey: null, found: 0, seen: [{ k: 0, v: 1 }], status: "start: seen = {0: 1}, count = 0" },
  { i: 0, prefix: 4, count: 1, lookKey: 0, found: 1, seen: [{ k: 0, v: 1 }], status: "add 4 → prefix 4. look 4−4 = 0 → found 1 → count 1" },
  { i: 1, prefix: 6, count: 1, lookKey: 2, found: 0, seen: [{ k: 0, v: 1 }, { k: 4, v: 1 }], status: "add 2 → prefix 6. look 6−4 = 2 → absent → count 1" },
  { i: 2, prefix: 4, count: 2, lookKey: 0, found: 1, seen: [{ k: 0, v: 1 }, { k: 4, v: 1 }, { k: 6, v: 1 }], status: "add −2 → prefix 4. look 4−4 = 0 → found 1 → count 2" },
  { i: 3, prefix: 8, count: 4, lookKey: 4, found: 2, seen: [{ k: 0, v: 1 }, { k: 4, v: 2 }, { k: 6, v: 1 }], status: "add 4 → prefix 8. look 8−4 = 4 → seen twice → count += 2 → 4" },
  { i: 4, prefix: 10, count: 5, lookKey: 6, found: 1, seen: [{ k: 0, v: 1 }, { k: 4, v: 2 }, { k: 6, v: 1 }, { k: 8, v: 1 }], status: "add 2 → prefix 10. look 10−4 = 6 → found 1 → count 5" },
  { i: 5, prefix: 10, count: 5, lookKey: null, found: 0, seen: [{ k: 0, v: 1 }, { k: 4, v: 2 }, { k: 6, v: 1 }, { k: 8, v: 1 }, { k: 10, v: 1 }], status: "done → 5 subarrays sum to 4" },
];

const C2_STEPS = [
  { i: -1, prefix: 0, count: 0, lookKey: null, found: 0, seen: [{ k: 0, v: 1 }], status: "start: seen = {0: 1}, count = 0" },
  { i: 0, prefix: 1, count: 0, lookKey: -9, found: 0, seen: [{ k: 0, v: 1 }], status: "add 1 → prefix 1. look 1−10 = −9 → absent → count 0" },
  { i: 1, prefix: 3, count: 0, lookKey: -7, found: 0, seen: [{ k: 0, v: 1 }, { k: 1, v: 1 }], status: "add 2 → prefix 3. look 3−10 = −7 → absent → count 0" },
  { i: 2, prefix: 6, count: 0, lookKey: -4, found: 0, seen: [{ k: 0, v: 1 }, { k: 1, v: 1 }, { k: 3, v: 1 }], status: "add 3 → prefix 6. look 6−10 = −4 → absent → count 0" },
  { i: 3, prefix: 6, count: 0, lookKey: null, found: 0, seen: [{ k: 0, v: 1 }, { k: 1, v: 1 }, { k: 3, v: 1 }, { k: 6, v: 1 }], status: "done → no subarray sums to 10 → 0" },
];

function ProblemViz() {
  const nums = C1;
  const cs = 60;
  const gap = 10;
  const cy = 150;
  const pl = rowLayout({ count: nums.length, cellSize: cs, gap, width: 800 });
  const items = nums.map((n) => ({ value: n, variant: "default" }));
  return (
    <VizStage width={800} height={340}>
      <Caption joinX={478} cy={56} label="count subarrays with sum =" value="4" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={400} y={cy + cs + 42} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">
        [4] · [4,2,−2] · [2,−2,4] · [−2,4,2] · [4] — 5 in total
      </text>
      <Caption joinX={360} cy={300} label="return" value="5" fill="#dcfce7" stroke="#15803d" color="#15803d" />
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
      <text x={40} y={28} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">k = {k}</text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      {step.i >= 0 && <Pointer centerX={layout.centerX(step.i)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="i" move="right" />}

      <Caption joinX={150} cy={206} label="prefix" value={step.prefix} />
      <Caption joinX={330} cy={206} label="count" value={step.count} fill="#dcfce7" stroke="#15803d" color="#15803d" />

      {step.lookKey != null && (
        <text x={40} y={258} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#c2410c">
          look up  prefix − k = {step.prefix} − {k} = {step.lookKey}  in seen →
        </text>
      )}

      <Table
        x={TABLE_X}
        y={70}
        name="seen"
        keyLabel="prefix sum"
        valLabel="times seen"
        rows={step.seen}
        highlightKey={step.found > 0 ? step.lookKey : null}
        annotation="← prefix − k"
      />
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
    { input: "[4,2,-2,4,2], k=4", result: "5", ok: true },
    { input: "[1,2,3], k=10", result: "0", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Unlike a sliding window, this handles negatives: it counts prefix sums in a map instead of shrinking a window. seen[p] is how many times prefix sum p has occurred, so count += seen[prefix−k] adds every earlier start that closes a subarray summing to k — which is why a prefix seen twice bumps the count by 2.",
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
      { id: "negatives", label: "k = 4", result: "5", ok: true, input: C1, k: 4, steps: C1_STEPS },
      { id: "none", label: "k = 10 (no match)", result: "0", ok: false, input: C2, k: 10, steps: C2_STEPS },
    ],
  },
};
