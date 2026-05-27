import { VizStage, VizArray, Pointer, Caption, Window, Output, rowLayout } from "../../viz";

const W = 720;
const H = 340;
const CELL = 62;
const GAP = 10;
const CELL_Y = 110;

// Pivot sits LEFT of the first mid, so the first step's sorted half is the
// RIGHT one (indices 3–6) — exercising the "right half sorted" branch.
const NUMS = [5, 6, 7, 0, 1, 2, 4];

// `sorted` = [a,b] index range of the half that's in order this step (one half
// always is). `range` = its value span; `cond` = the in-range test with values
// plugged in; `inHalf` = whether the target falls inside that sorted half.
const PASS_STEPS = [
  { l: 0, r: 6, mid: null, found: null, status: "rotated sorted array · target = 4 · left = 0, right = 6" },
  { l: 0, r: 6, mid: 3, sorted: [3, 6], range: "0 … 4", cond: "0 < 4 ≤ 4", inHalf: true, found: null, status: "mid = index 3 (value 0) ≠ 4 · left half isn't sorted, so the RIGHT half is", move: { left: "right" } },
  { l: 4, r: 6, mid: 5, sorted: [4, 5], range: "1 … 2", cond: "1 ≤ 4 < 2", inHalf: false, found: null, status: "mid = index 5 (value 2) ≠ 4 · left half [4–5] is sorted", move: { left: "right" } },
  { l: 6, r: 6, mid: 6, found: 6, done: true, status: "mid = index 6 (value 4) = target → return 6" },
];

// A different rotation amount: the pivot (min = 10) sits at index 5, far from
// the middle. First mid (index 3) is in the left sorted run; the pivot only
// shows up on the second step's right half.
const NUMS_P5 = [30, 40, 50, 60, 70, 10, 20];

const PIVOT5_STEPS = [
  { l: 0, r: 6, mid: null, found: null, status: "rotated at index 5 · target = 20 · left = 0, right = 6" },
  { l: 0, r: 6, mid: 3, sorted: [0, 3], range: "30 … 60", cond: "30 ≤ 20 < 60", inHalf: false, found: null, status: "mid = index 3 (value 60) ≠ 20 · left half [0–3] is sorted", move: { left: "right" } },
  { l: 4, r: 6, mid: 5, sorted: [5, 6], range: "10 … 20", cond: "10 < 20 ≤ 20", inHalf: true, found: null, status: "mid = index 5 (value 10) ≠ 20 · the pivot is here → right half [5–6] is sorted", move: { left: "right" } },
  { l: 6, r: 6, mid: 6, found: 6, done: true, status: "mid = index 6 (value 20) = target → return 6" },
];

const FAIL_STEPS = [
  { l: 0, r: 6, mid: null, found: null, status: "rotated sorted array · target = 8 · left = 0, right = 6" },
  { l: 0, r: 6, mid: 3, sorted: [3, 6], range: "0 … 4", cond: "0 < 8 ≤ 4", inHalf: false, found: null, status: "mid = index 3 (value 0) ≠ 8 · the RIGHT half is the sorted one", move: { right: "left" } },
  { l: 0, r: 2, mid: 1, sorted: [0, 1], range: "5 … 6", cond: "5 ≤ 8 < 6", inHalf: false, found: null, status: "mid = index 1 (value 6) ≠ 8 · left half [0–1] is sorted", move: { left: "right" } },
  { l: 2, r: 2, mid: 2, sorted: [2, 2], range: "7 … 7", cond: "7 ≤ 8 < 7", inHalf: false, found: null, status: "mid = index 2 (value 7) ≠ 8", move: { left: "right" } },
  { l: 3, r: 2, mid: null, found: -1, done: true, status: "left (3) > right (2) → not found → return −1" },
];

function ProblemViz() {
  const cs = 62;
  const gap = 10;
  const cy = 150;
  const pl = rowLayout({ count: NUMS.length, cellSize: cs, gap, width: 720 });
  const items = NUMS.map((n, i) => ({ value: n, variant: i === 6 ? "active" : "default" }));
  return (
    <VizStage width={720} height={320}>
      <Caption joinX={430} cy={56} label="rotated sorted — find index of" value="4" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={pl.cellX(3) + cs / 2} y={cy - 14} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="12" fill="#a8a29e">↑ rotation pivot (wraps here)</text>
      <text x={pl.cellX(6) + cs / 2} y={cy + cs + 40} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">4 is at index 6</text>
      <Caption joinX={330} cy={300} label="return" value="6" fill="#dcfce7" stroke="#15803d" color="#15803d" />
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
  const sortedX = step.sorted ? layout.cellX(step.sorted[0]) : 0;
  const sortedW = step.sorted ? layout.cellX(step.sorted[1]) + CELL - sortedX : 0;
  return (
    <VizStage width={W} height={H}>
      <text x={40} y={28} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">target = {target}</text>

      {step.sorted && <Window x={sortedX} width={sortedW} y={CELL_Y - 8} height={CELL + 16} color="#15803d" />}

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />

      {step.l <= step.r && <Pointer centerX={layout.centerX(step.l)} labelY={CELL_Y - 36} tipY={CELL_Y - 5} label="left" move={step.move?.left} />}
      {step.l <= step.r && <Pointer centerX={layout.centerX(step.r)} labelY={CELL_Y - 36} tipY={CELL_Y - 5} label="right" move={step.move?.right} />}
      {step.mid != null && (
        <text x={layout.centerX(step.mid)} y={CELL_Y + CELL + 30} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#c2410c">↑ mid = {input[step.mid]}</text>
      )}

      {step.sorted && (
        <>
          <text x={40} y={250} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#15803d">
            the green half is sorted → values {step.range}
          </text>
          <text x={40} y={278} fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#57534e">
            is target here?  {step.cond} →{" "}
            <tspan fontWeight="700" fill={step.inHalf ? "#15803d" : "#b91c1c"}>
              {step.inHalf ? "✓ yes — search this half" : "✗ no — search the other half"}
            </tspan>
          </text>
        </>
      )}

      <Output x={W / 2 - 60} cy={314} label="result" value={step.found ?? "?"} />
    </VizStage>
  );
}

export default {
  id: "search-rotated",
  leetcode: 33,
  title: "Search in Rotated Sorted Array",
  difficulty: "Medium",
  tagline: "Find a target's index in a sorted array that's been rotated.",
  patternId: "binary-search",
  constraint: "Distinct values; the array is a sorted array rotated at one pivot.",
  ProblemViz,
  examples: [
    { input: "[5,6,7,0,1,2,4], t=4", result: "6", ok: true },
    { input: "t=8", result: "-1", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Even rotated, one half [left..mid] or [mid..right] is always still in order. Find that sorted half and check whether the target lies within its value range: if so, search it; if not, the target must be in the other half. Still O(log n).",
    code: `def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[left] <= nums[mid]:           # left half sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:                                  # right half sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1`,
    codeHighlight: [7, 8, 9, 10, 11, 12, 13, 14],
    codeNote: "find the sorted half · is target in its range?",
    cases: [
      { id: "found", label: "pivot @ index 3", result: "6", ok: true, input: NUMS, target: 4, steps: PASS_STEPS },
      { id: "pivot5", label: "pivot @ index 5", result: "6", ok: true, input: NUMS_P5, target: 20, steps: PIVOT5_STEPS },
      { id: "missing", label: "target 8 (missing)", result: "-1", ok: false, input: NUMS, target: 8, steps: FAIL_STEPS },
    ],
  },
};
