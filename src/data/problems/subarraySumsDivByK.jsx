import { VizStage, VizArray, Pointer, Caption, Table, Span, Output, rowLayout } from "../../viz";

const W = 860;
const H = 308;
const CELL = 50;
const GAP = 8;
const ARRAY_ZONE = 470;
const TABLE_X = 548;

const C1 = [4, 5, 0, -2, -3, 1];
const C1_K = 5;
const C2 = [1, 2, 3];
const C2_K = 7;

// Same idea as #560, but the map key is prefix % k. Two prefixes with the same
// remainder bound a subarray whose sum is divisible by k. `seen` snapshots are
// the map at lookup time (before inserting the current remainder).
const C1_STEPS = [
  { i: -1, prefix: 0, rem: null, count: 0, found: 0, seen: [{ k: 0, v: 1 }], status: "start: seen = {0: 1}, count = 0" },
  { i: 0, prefix: 4, rem: 4, count: 0, found: 0, seen: [{ k: 0, v: 1 }], status: "add 4 → prefix 4. 4 % 5 = 4 → absent → count 0" },
  { i: 1, prefix: 9, rem: 4, count: 1, found: 1, seen: [{ k: 0, v: 1 }, { k: 4, v: 1 }], status: "add 5 → prefix 9. 9 % 5 = 4 → found 1 → count 1" },
  { i: 2, prefix: 9, rem: 4, count: 3, found: 2, seen: [{ k: 0, v: 1 }, { k: 4, v: 2 }], status: "add 0 → prefix 9. 9 % 5 = 4 → found 2 → count += 2 → 3" },
  { i: 3, prefix: 7, rem: 2, count: 3, found: 0, seen: [{ k: 0, v: 1 }, { k: 4, v: 3 }], status: "add −2 → prefix 7. 7 % 5 = 2 → absent → count 3" },
  { i: 4, prefix: 4, rem: 4, count: 6, found: 3, seen: [{ k: 0, v: 1 }, { k: 4, v: 3 }, { k: 2, v: 1 }], status: "add −3 → prefix 4. 4 % 5 = 4 → found 3 → count += 3 → 6" },
  { i: 5, prefix: 5, rem: 0, count: 7, found: 1, seen: [{ k: 0, v: 1 }, { k: 4, v: 4 }, { k: 2, v: 1 }], status: "add 1 → prefix 5. 5 % 5 = 0 → found 1 → count 7" },
  { i: 6, done: true, prefix: 5, rem: null, count: 7, found: 0, seen: [{ k: 0, v: 2 }, { k: 4, v: 4 }, { k: 2, v: 1 }], status: "done → 7 subarrays divisible by 5" },
];

const C2_STEPS = [
  { i: -1, prefix: 0, rem: null, count: 0, found: 0, seen: [{ k: 0, v: 1 }], status: "start: seen = {0: 1}, count = 0" },
  { i: 0, prefix: 1, rem: 1, count: 0, found: 0, seen: [{ k: 0, v: 1 }], status: "add 1 → prefix 1. 1 % 7 = 1 → absent → count 0" },
  { i: 1, prefix: 3, rem: 3, count: 0, found: 0, seen: [{ k: 0, v: 1 }, { k: 1, v: 1 }], status: "add 2 → prefix 3. 3 % 7 = 3 → absent → count 0" },
  { i: 2, prefix: 6, rem: 6, count: 0, found: 0, seen: [{ k: 0, v: 1 }, { k: 1, v: 1 }, { k: 3, v: 1 }], status: "add 3 → prefix 6. 6 % 7 = 6 → absent → count 0" },
  { i: 3, done: true, prefix: 6, rem: null, count: 0, found: 0, seen: [{ k: 0, v: 1 }, { k: 1, v: 1 }, { k: 3, v: 1 }, { k: 6, v: 1 }], status: "done → none divisible by 7 → 0" },
];

function ProblemViz() {
  const nums = C1;
  const cs = 56;
  const gap = 8;
  const cy = 110;
  const pl = rowLayout({ count: nums.length, cellSize: cs, gap, width: 800 });
  const items = nums.map((n) => ({ value: n, variant: "default" }));
  // a couple of qualifying subarrays summing to a multiple of 5
  const subs = [
    { s: 1, e: 2, label: "5 + 0 = 5" },
    { s: 1, e: 4, label: "5 + 0 − 2 − 3 = 0" },
  ];
  return (
    <VizStage width={800} height={340}>
      <Caption joinX={486} cy={50} label="count subarrays with sum divisible by" value="5" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      {subs.map((sub, i) => (
        <Span key={i} x1={pl.cellX(sub.s)} x2={pl.cellX(sub.e) + cs} y={cy + cs + 30 + i * 32} label={sub.label} />
      ))}
      <text x={400} y={cy + cs + 30 + subs.length * 32 + 6} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#a8a29e">… 7 in total</text>
      <Caption joinX={360} cy={312} label="return" value="7" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const input = data.input;
  const k = data.k;
  const cum = input.reduce((acc, v, idx) => (acc.push((acc[idx - 1] || 0) + v), acc), []);
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });
  const variantFor = (idx) => (step.i < 0 ? "muted" : idx === step.i ? "active" : idx < step.i ? "matched" : "muted");
  const nums = input.map((n, idx) => ({ value: n, variant: variantFor(idx) }));
  const prefixes = cum.map((p, idx) => ({ value: idx <= step.i ? p : "", variant: variantFor(idx) }));
  const NUMS_Y = 58;
  const PREFIX_Y = 124;

  return (
    <VizStage width={W} height={H}>
      <text x={40} y={26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">k = {k}</text>

      <text x={layout.originX - 12} y={NUMS_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">nums</text>
      <VizArray items={nums} layout={layout} y={NUMS_Y} cellSize={CELL} />
      {step.i >= 0 && !step.done && (
        <Pointer centerX={layout.centerX(step.i)} labelY={NUMS_Y - 26} tipY={NUMS_Y - 5} label="x" move={step.i < input.length - 1 ? "right" : null} />
      )}

      <text x={layout.originX - 12} y={PREFIX_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">prefix</text>
      <VizArray items={prefixes} layout={layout} y={PREFIX_Y} cellSize={CELL} showIndices />
      {step.i >= 0 && !step.done && (
        <text x={layout.centerX(step.i)} y={PREFIX_Y + CELL + 32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#c2410c">↑ prefix = {step.prefix}</text>
      )}

      {step.rem != null && (
        <text x={40} y={236} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">
          remainder = {step.prefix} % {k} = <tspan fontWeight="700" fill="#c2410c">{step.rem}</tspan>  →  seen[{step.rem}] = <tspan fontWeight="700" fill={step.found > 0 ? "#c2410c" : "#a8a29e"}>{step.found}</tspan>
        </text>
      )}

      <Output x={40} cy={278} label="count" value={step.count} />
      {step.rem != null && (
        <text x={162} y={283} fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill={step.found > 0 ? "#c2410c" : "#a8a29e"}>+ {step.found}</text>
      )}

      <Table
        x={TABLE_X}
        y={64}
        name="seen"
        keyLabel="remainder"
        valLabel="times seen"
        rows={step.seen}
        highlightKey={step.found > 0 ? step.rem : null}
        annotation="← prefix % k"
      />
    </VizStage>
  );
}

export default {
  id: "subarray-sums-div-k",
  leetcode: 974,
  title: "Subarray Sums Divisible by K",
  difficulty: "Medium",
  tagline: "Count contiguous subarrays whose sum is divisible by k.",
  patternId: "prefix-sum",
  constraint: "Values may be negative (use ((p % k) + k) % k).",
  ProblemViz,
  examples: [
    { input: "[4,5,0,-2,-3,1], k=5", result: "7", ok: true },
    { input: "[1,2,3], k=7", result: "0", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    note: "A subarray (j, i] is divisible by k exactly when prefix[i] and prefix[j] have the SAME remainder mod k (their difference is a multiple of k). So count remainders in a map just like #560 counts prefix sums — count += seen[prefix % k].",
    code: `def subarraysDivByK(nums, k):
    count = 0
    prefix = 0
    seen = {0: 1}
    for x in nums:
        prefix += x
        r = (prefix % k + k) % k
        count += seen.get(r, 0)
        seen[r] = seen.get(r, 0) + 1
    return count`,
    codeHighlight: [6, 7, 8, 9],
    codeNote: "prefix % k + map lookup",
    cases: [
      { id: "div", label: "k = 5", result: "7", ok: true, input: C1, k: C1_K, steps: C1_STEPS },
      { id: "none", label: "k = 7 (none)", result: "0", ok: false, input: C2, k: C2_K, steps: C2_STEPS },
    ],
  },
};
