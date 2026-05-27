import { VizStage, VizArray, Pointer, Caption, Output, rowLayout } from "../../viz";

const W = 640;
const H = 300;
const CELL = 64;
const GAP = 10;
const CELL_Y = 116;

const NUMS = [-1, 0, 3, 5, 9, 12];

// mid = null on the framing step; otherwise the index being checked. `move`
// telegraphs the bound that jumps next; none on the found / not-found step.
const PASS_STEPS = [
  { l: 0, r: 5, mid: null, found: null, status: "left = 0, right = 5.  target = 9 — search the whole sorted array" },
  { l: 0, r: 5, mid: 2, found: null, status: "mid = (0+5)//2 = 2.  nums[2] = 3 < 9 → search right, left = mid + 1 = 3", move: { left: "right" } },
  { l: 3, r: 5, mid: 4, found: 4, done: true, status: "mid = (3+5)//2 = 4.  nums[4] = 9 = target → return 4" },
];

const FAIL_STEPS = [
  { l: 0, r: 5, mid: null, found: null, status: "left = 0, right = 5.  target = 2" },
  { l: 0, r: 5, mid: 2, found: null, status: "mid = 2.  nums[2] = 3 > 2 → search left, right = mid − 1 = 1", move: { right: "left" } },
  { l: 0, r: 1, mid: 0, found: null, status: "mid = 0.  nums[0] = −1 < 2 → search right, left = mid + 1 = 1", move: { left: "right" } },
  { l: 1, r: 1, mid: 1, found: null, status: "mid = 1.  nums[1] = 0 < 2 → search right, left = 2", move: { left: "right" } },
  { l: 2, r: 1, mid: null, found: -1, done: true, status: "left (2) > right (1) → search space empty → return −1" },
];

function ProblemViz() {
  const cs = 64;
  const gap = 10;
  const cy = 150;
  const pl = rowLayout({ count: NUMS.length, cellSize: cs, gap, width: 760 });
  const items = NUMS.map((n, i) => ({ value: n, variant: i === 4 ? "active" : "default" }));
  return (
    <VizStage width={760} height={320}>
      <Caption joinX={470} cy={56} label="sorted — find the index of" value="9" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={pl.cellX(4) + cs / 2} y={cy + cs + 40} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">
        9 is at index 4
      </text>
      <Caption joinX={360} cy={300} label="return" value="4" fill="#dcfce7" stroke="#15803d" color="#15803d" />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const input = data.input;
  const target = data.target;
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: W });
  const items = input.map((n, idx) => ({
    value: n,
    variant: idx < step.l || idx > step.r ? "matched" : idx === step.mid ? "active" : "default",
  }));
  return (
    <VizStage width={W} height={H}>
      <text x={40} y={28} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">target = {target}</text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />

      {step.l <= step.r && <Pointer centerX={layout.centerX(step.l)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="left" move={step.move?.left} />}
      {step.l <= step.r && <Pointer centerX={layout.centerX(step.r)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="right" move={step.move?.right} />}
      {step.mid != null && (
        <text x={layout.centerX(step.mid)} y={CELL_Y + CELL + 32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#c2410c">↑ mid</text>
      )}

      <Output x={W / 2 - 60} cy={258} label="result" value={step.found ?? "?"} />
    </VizStage>
  );
}

export default {
  id: "binary-search-704",
  leetcode: 704,
  title: "Binary Search",
  difficulty: "Easy",
  tagline: "Find a target's index in a sorted array (or −1).",
  patternId: "binary-search",
  constraint: "Array is sorted ascending; distinct values.",
  ProblemViz,
  examples: [
    { input: "[-1,0,3,5,9,12], t=9", result: "4", ok: true },
    { input: "t=2", result: "-1", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Because the array is sorted, comparing the middle element to the target rules out HALF the array every step: if nums[mid] is too small the answer must be to the right, otherwise to the left. log₂(n) steps instead of n.",
    code: `def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    codeHighlight: [3, 4, 5, 6, 7, 8],
    codeNote: "check mid · discard a half",
    cases: [
      { id: "found", label: "target 9", result: "4", ok: true, input: NUMS, target: 9, steps: PASS_STEPS },
      { id: "missing", label: "target 2 (missing)", result: "-1", ok: false, input: NUMS, target: 2, steps: FAIL_STEPS },
    ],
  },
};
