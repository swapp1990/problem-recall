import { VizStage, VizArray, Pointer, Caption, Span, Output, rowLayout } from "../../viz";

const W = 760;
const H = 316;
const CELL = 62;
const GAP = 10;
const NUMS_Y = 64;
const P_Y = 172;

const NUMS = [2, 4, 1, 5, 3];
const P = NUMS.reduce((acc, v) => (acc.push(acc[acc.length - 1] + v), acc), [0]); // [0,2,6,7,12,15]

// Phase 1 builds the prefix array P (P[i] = sum of the first i values). Phase 2
// answers each query in O(1): sumRange(l, r) = P[r+1] − P[l].
const STEPS = [
  { phase: "build", k: 0, status: "P[0] = 0  (sum of nothing)" },
  { phase: "build", k: 1, status: "P[1] = P[0] + 2 = 2" },
  { phase: "build", k: 2, status: "P[2] = P[1] + 4 = 6" },
  { phase: "build", k: 3, status: "P[3] = P[2] + 1 = 7" },
  { phase: "build", k: 4, status: "P[4] = P[3] + 5 = 12" },
  { phase: "build", k: 5, status: "P[5] = P[4] + 3 = 15.  prefix array ready — built once, O(n)" },
  { phase: "query", l: 1, r: 3, ans: 10, status: "sumRange(1, 3) = P[4] − P[1] = 12 − 2 = 10" },
  { phase: "query", l: 0, r: 4, ans: 15, status: "sumRange(0, 4) = P[5] − P[0] = 15 − 0 = 15" },
  { phase: "query", l: 3, r: 3, ans: 5, status: "sumRange(3, 3) = P[4] − P[3] = 12 − 7 = 5  — each query is O(1)" },
];

const layout = rowLayout({ count: P.length, cellSize: CELL, gap: GAP, width: W });

function ProblemViz() {
  const cs = 60;
  const gap = 10;
  const cy = 120;
  const pl = rowLayout({ count: NUMS.length, cellSize: cs, gap, width: 760 });
  const items = NUMS.map((n, i) => ({ value: n, variant: i >= 1 && i <= 3 ? "active" : "default" }));
  return (
    <VizStage width={760} height={320}>
      <Caption joinX={470} cy={52} label="answer many range-sum queries, e.g." value="sum(1,3)" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <Span x1={pl.cellX(1)} x2={pl.cellX(3) + cs} y={cy + cs + 26} label="4 + 1 + 5 = 10" />
      <text x={380} y={cy + cs + 80} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#57534e">
        precompute prefix sums → every query is O(1)
      </text>
      <Caption joinX={320} cy={300} label="return" value="10" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const build = step.phase === "build";
  const numItems = NUMS.map((n, i) => {
    let variant;
    if (build) variant = i <= step.k - 1 ? (i === step.k - 1 ? "active" : "matched") : "muted";
    else variant = i >= step.l && i <= step.r ? "active" : "default";
    return { value: n, variant };
  });
  const pItems = P.map((p, i) => {
    // During the build, slots not yet computed are blank (not pre-filled).
    if (build && i > step.k) return { value: "", variant: "muted" };
    let variant;
    if (build) variant = i === step.k ? "active" : "matched";
    else variant = i === step.l || i === step.r + 1 ? "active" : "default";
    return { value: p, variant };
  });

  return (
    <VizStage width={W} height={H}>
      <text x={layout.originX - 12} y={NUMS_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">nums</text>
      <VizArray items={numItems} layout={layout} y={NUMS_Y} cellSize={CELL} />

      <text x={layout.originX - 12} y={P_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">P</text>
      <VizArray items={pItems} layout={layout} y={P_Y} cellSize={CELL} showIndices />

      {build && step.k >= 1 && (
        <Pointer centerX={layout.centerX(step.k)} labelY={P_Y - 26} tipY={P_Y - 5} label="build" move={step.k < P.length - 1 ? "right" : null} />
      )}

      {!build && (
        <>
          <Span x1={layout.cellX(step.l)} x2={layout.cellX(step.r) + CELL} y={NUMS_Y + CELL + 10} label={`nums[${step.l}..${step.r}]`} color="#c2410c" />
          <text x={40} y={284} fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#57534e">
            sumRange({step.l}, {step.r}) = P[{step.r + 1}] − P[{step.l}] = {P[step.r + 1]} − {P[step.l]}
          </text>
          <Output x={520} cy={276} label="sum" value={step.ans} />
        </>
      )}
    </VizStage>
  );
}

export default {
  id: "range-sum-query",
  leetcode: 303,
  title: "Range Sum Query — Immutable",
  difficulty: "Easy",
  tagline: "Answer many sumRange(l, r) queries on a fixed array.",
  patternId: "prefix-sum",
  constraint: "Array never changes (immutable); many queries.",
  ProblemViz,
  examples: [
    { input: "sumRange(1,3) on [2,4,1,5,3]", result: "10", ok: true },
    { input: "sumRange(0,4)", result: "15", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "This is the foundational prefix-sum move. Build P once (P[i] = sum of the first i values), then any range sum is a single subtraction: sum of nums[l..r] = P[r+1] − P[l]. Each query is O(1) instead of O(n) re-summing — which is exactly why prefix sums exist.",
    code: `class NumArray:
    def __init__(self, nums):
        self.P = [0]
        for x in nums:
            self.P.append(self.P[-1] + x)

    def sumRange(self, l, r):
        return self.P[r + 1] - self.P[l]`,
    codeHighlight: [8],
    codeNote: "range sum = P[r+1] − P[l]",
    cases: [
      { id: "queries", label: "build + queries", result: "O(1)", ok: true, input: NUMS, steps: STEPS },
    ],
  },
};
