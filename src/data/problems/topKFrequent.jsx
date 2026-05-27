import { VizStage, VizArray, Pointer, Caption, Table, Output, rowLayout } from "../../viz";

const W = 620;
const H = 300;
const CELL = 52;
const GAP = 8;
const CELL_Y = 96;
const ARRAY_ZONE = 360;
const TABLE_X = 400;

const NUMS = [1, 1, 1, 2, 2, 3];
const K = 2;

// Phase 'count' tallies frequencies; phase 'pick' selects the k keys with the
// highest counts. `freq` snapshots are after the current element is counted.
const STEPS = [
  { phase: "count", i: 0, freq: [{ k: 1, v: 1 }], status: "count: 1 → 1×" },
  { phase: "count", i: 1, freq: [{ k: 1, v: 2 }], status: "count: 1 → 2×" },
  { phase: "count", i: 2, freq: [{ k: 1, v: 3 }], status: "count: 1 → 3×" },
  { phase: "count", i: 3, freq: [{ k: 1, v: 3 }, { k: 2, v: 1 }], status: "count: 2 → 1×" },
  { phase: "count", i: 4, freq: [{ k: 1, v: 3 }, { k: 2, v: 2 }], status: "count: 2 → 2×" },
  { phase: "count", i: 5, freq: [{ k: 1, v: 3 }, { k: 2, v: 2 }, { k: 3, v: 1 }], status: "count: 3 → 1×" },
  { phase: "pick", i: -1, freq: [{ k: 1, v: 3 }, { k: 2, v: 2 }, { k: 3, v: 1 }], pick: [1, 2], found: "[1, 2]", done: true, status: "pick the k = 2 highest counts → 1 (3×), 2 (2×)" },
];

function ProblemViz() {
  const cs = 56;
  const gap = 8;
  const cy = 140;
  const pl = rowLayout({ count: NUMS.length, cellSize: cs, gap, width: 760 });
  const items = NUMS.map((n) => ({ value: n, variant: n === 1 || n === 2 ? "active" : "default" }));
  return (
    <VizStage width={760} height={320}>
      <Caption joinX={470} cy={56} label="the k most frequent, k =" value="2" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={380} y={cy + cs + 42} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">
        1 appears 3×, 2 appears 2× → the two most frequent
      </text>
      <Caption joinX={340} cy={300} label="return" value="[1, 2]" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const input = data.input;
  const counting = step.phase === "count";
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });
  const items = input.map((n, idx) => ({ value: n, variant: !counting ? "matched" : idx === step.i ? "active" : idx < step.i ? "matched" : "muted" }));
  return (
    <VizStage width={W} height={H}>
      <text x={40} y={26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">{counting ? "phase 1 — count frequencies" : "phase 2 — pick the k highest"}  ·  k = {data.k}</text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      {counting && <Pointer centerX={layout.centerX(step.i)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="x" move={step.i < input.length - 1 ? "right" : null} />}

      <Output x={40} cy={244} label="top k" value={step.found ?? "?"} />

      <Table x={TABLE_X} y={64} name="freq" keyLabel="value" valLabel="count" rows={step.freq} highlightKeys={step.pick} annotation={step.pick ? "← top k" : null} />
    </VizStage>
  );
}

export default {
  id: "top-k-frequent",
  leetcode: 347,
  title: "Top K Frequent Elements",
  difficulty: "Medium",
  tagline: "Return the k elements that appear most often.",
  patternId: "arrays-hashing",
  constraint: "The answer is unique for the given k.",
  ProblemViz,
  examples: [
    { input: "[1,1,1,2,2,3], k=2", result: "[1,2]", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "First tally each value's frequency in a hash map (one pass). Then take the k keys with the largest counts. Sorting the map by count is O(n log n); bucketing by frequency (index = count) gets it to O(n).",
    code: `def topKFrequent(nums, k):
    freq = {}
    for x in nums:
        freq[x] = freq.get(x, 0) + 1
    return sorted(freq, key=freq.get, reverse=True)[:k]`,
    codeHighlight: [2, 3, 4, 5],
    codeNote: "count, then take the k largest",
    cases: [{ id: "topk", label: "k = 2", result: "[1, 2]", ok: true, input: NUMS, k: K, steps: STEPS }],
  },
};
