import { VizStage, VizArray, Pointer, Caption, Deque, Output, rowLayout } from "../../viz";

const W = 820;
const H = 300;
const CELL = 56;
const GAP = 8;
const CELL_Y = 80;

// Prefix sums P (length n+1). A subarray (j, i] has sum P[i] − P[j].
const A_NUMS = [3, -2, 5];
const A_P = [0, 3, 1, 6];
const B_NUMS = [1, 2];
const B_P = [0, 1, 3];

// Atomic deque steps. `dq` = indices into P currently held (front→back).
// `pushed` marks the index just appended (green); pops shrink the deque.
const A_STEPS = [
  { i: 0, dq: [0], best: null, pushed: 0, status: "i=0 (P=0): deque empty → push index 0" },
  { i: 1, dq: [0, 1], best: null, pushed: 1, status: "i=1 (P=3): 3−P[0]=3 < 4 · P[0]=0 < 3 → push 1" },
  { i: 2, dq: [0], best: null, pushed: null, status: "i=2 (P=1): P[back=1]=3 ≥ 1 → pop back (keep P increasing)" },
  { i: 2, dq: [0, 2], best: null, pushed: 2, status: "P[0]=0 < 1 → push 2" },
  { i: 3, dq: [2], best: 3, pushed: null, status: "i=3 (P=6): 6−P[0]=6 ≥ 4 → window 3−0 = 3, best=3, pop front" },
  { i: 3, dq: [], best: 1, pushed: null, status: "6−P[2]=5 ≥ 4 → window 3−2 = 1, best=1, pop front" },
  { i: 3, dq: [3], best: 1, pushed: 3, status: "push 3" },
  { i: 3, dq: [3], best: 1, pushed: null, status: "done → shortest = 1" },
];

const B_STEPS = [
  { i: 0, dq: [0], best: null, pushed: 0, status: "i=0 (P=0): push 0" },
  { i: 1, dq: [0, 1], best: null, pushed: 1, status: "i=1 (P=1): 1−P[0]=1 < 4 · P[0]=0 < 1 → push 1" },
  { i: 2, dq: [0, 1, 2], best: null, pushed: 2, status: "i=2 (P=3): 3−P[0]=3 < 4 · P[1]=1 < 3 → push 2" },
  { i: 2, dq: [0, 1, 2], best: null, pushed: null, status: "done → no window reaches 4 → return −1" },
];

function ProblemViz() {
  const cs = 64;
  const gap = 10;
  const cy = 150;
  const pl = rowLayout({ count: A_NUMS.length, cellSize: cs, gap, width: 800 });
  const items = A_NUMS.map((n, idx) => ({ value: n, variant: idx === 2 ? "default" : "muted" }));
  return (
    <VizStage width={800} height={340}>
      <Caption joinX={486} cy={56} label="shortest subarray with sum ≥" value="4" />
      <text x={400} y={92} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#57534e">
        negatives allowed — a sliding window won't work
      </text>
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={pl.cellX(2) + cs / 2} y={cy + cs + 40} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">
        [5] = 5 ≥ 4, length 1
      </text>
      <Caption joinX={360} cy={300} label="return" value="1" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const P = data.prefix;
  const k = data.k;
  const layout = rowLayout({ count: P.length, cellSize: CELL, gap: GAP, width: W });
  const items = P.map((p, idx) => ({ value: p, variant: idx === step.i ? "active" : "default" }));
  const dqItems = step.dq.map((idx) => ({ value: P[idx], label: idx, variant: idx === step.pushed ? "new" : "default" }));
  const dqX = (W - (step.dq.length * (CELL + GAP) - GAP)) / 2;
  return (
    <VizStage width={W} height={H}>
      <text x={40} y={28} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">k = {k}</text>
      <Output x={W - 168} cy={26} label="shortest" value={step.best ?? "—"} />

      <text x={layout.originX - 12} y={CELL_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">P</text>
      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      {step.i >= 0 && <Pointer centerX={layout.centerX(step.i)} labelY={CELL_Y - 28} tipY={CELL_Y - 5} label="i" move={null} />}

      <text x={W / 2} y={184} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">
        deque — indices, shown by their P value
      </text>
      <Deque x={dqX} y={206} items={dqItems} />
    </VizStage>
  );
}

export default {
  id: "shortest-subarray-k",
  leetcode: 862,
  title: "Shortest Subarray with Sum at Least K",
  difficulty: "Hard",
  tagline: "Shortest subarray with sum ≥ k — but values can be negative.",
  patternId: "monotonic-deque",
  constraint: "Values may be negative.",
  ProblemViz,
  examples: [
    { input: "[3,-2,5], k=4", result: "1", ok: true },
    { input: "[1,2], k=4", result: "-1", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    note: "The #209 sliding window breaks here because negatives can lower the sum, so the window can't safely shrink. Working on prefix sums P (sum of (j,i] is P[i]−P[j]), a monotonic deque keeps candidate starts j with increasing P[j]: the front gives the shortest valid window, and a smaller P[i] evicts larger ones from the back.",
    code: `from collections import deque
def shortestSubarray(nums, k):
    n, P = len(nums), [0]
    for x in nums:
        P.append(P[-1] + x)
    best, dq = n + 1, deque()
    for i in range(n + 1):
        while dq and P[i] - P[dq[0]] >= k:
            best = min(best, i - dq.popleft())
        while dq and P[dq[-1]] >= P[i]:
            dq.pop()
        dq.append(i)
    return best if best <= n else -1`,
    codeHighlight: [8, 9, 10, 11, 12],
    codeNote: "pop front (valid) · pop back (monotonic)",
    cases: [
      { id: "reaches", label: "k = 4", result: "1", ok: true, input: A_NUMS, k: 4, prefix: A_P, steps: A_STEPS },
      { id: "none", label: "k = 4 (no subarray)", result: "-1", ok: false, input: B_NUMS, k: 4, prefix: B_P, steps: B_STEPS },
    ],
  },
};
