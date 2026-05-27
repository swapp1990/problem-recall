import { VizStage, VizArray, Pointer, Window, Caption, Output, rowLayout, windowVariant } from "../../viz";

const CELL = 64;
const GAP = 8;
const CELL_Y = 100;
const H = 280;
// viewBox tightly bounds the 6-cell row so cells fill the width on mobile.
const W = 6 * CELL + 5 * GAP + 48;

const PASS = [2, 3, 1, 2, 4, 3];
const FAIL = [1, 2, 3];

// ATOMIC steps — grow the window right until sum ≥ target (valid), then shrink
// left while it stays valid, recording the shortest length. `valid` turns the
// window green; `move` telegraphs the next move (right = grow, left = shrink).
const PASS_STEPS = [
  { left: 0, right: 0, sum: 2, best: null, valid: false, status: "right → 0: add 2. sum = 2 < 7", move: { right: "right" } },
  { left: 0, right: 1, sum: 5, best: null, valid: false, status: "grow right: add 3. sum = 5 < 7", move: { right: "right" } },
  { left: 0, right: 2, sum: 6, best: null, valid: false, status: "grow right: add 1. sum = 6 < 7", move: { right: "right" } },
  { left: 0, right: 3, sum: 8, best: 4, valid: true, status: "grow right: add 2. sum = 8 ≥ 7 ✓ length 4. best = 4", move: { left: "right" } },
  { left: 1, right: 3, sum: 6, best: 4, valid: false, status: "shrink: drop 2, left → 1. sum = 6 < 7", move: { right: "right" } },
  { left: 1, right: 4, sum: 10, best: 4, valid: true, status: "grow right: add 4. sum = 10 ≥ 7 ✓ length 4. best = 4", move: { left: "right" } },
  { left: 2, right: 4, sum: 7, best: 3, valid: true, status: "shrink: drop 3, left → 2. sum = 7 ≥ 7 ✓ length 3. best = 3", move: { left: "right" } },
  { left: 3, right: 4, sum: 6, best: 3, valid: false, status: "shrink: drop 1, left → 3. sum = 6 < 7", move: { right: "right" } },
  { left: 3, right: 5, sum: 9, best: 3, valid: true, status: "grow right: add 3. sum = 9 ≥ 7 ✓ length 3. best = 3", move: { left: "right" } },
  { left: 4, right: 5, sum: 7, best: 2, valid: true, status: "shrink: drop 2, left → 4. sum = 7 ≥ 7 ✓ length 2. best = 2", move: { left: "right" } },
  { left: 5, right: 5, sum: 3, best: 2, valid: false, status: "shrink: drop 4, left → 5. sum = 3 < 7. shortest = 2" },
];

const FAIL_STEPS = [
  { left: 0, right: 0, sum: 1, best: null, valid: false, status: "right → 0: add 1. sum = 1 < 7", move: { right: "right" } },
  { left: 0, right: 1, sum: 3, best: null, valid: false, status: "grow right: add 2. sum = 3 < 7", move: { right: "right" } },
  { left: 0, right: 2, sum: 6, best: null, valid: false, status: "grow right: add 3. sum = 6 < 7 — target never reached → return 0" },
];

function ProblemViz() {
  const cs = 56;
  const gap = 8;
  const cy = 160;
  const pl = rowLayout({ count: PASS.length, cellSize: cs, gap, width: 800 });
  const items = PASS.map((n) => ({ value: n, variant: "default" }));
  const wx = pl.cellX(4);
  const ww = pl.cellX(5) + cs - wx;
  return (
    <VizStage width={800} height={360}>
      <Caption joinX={524} cy={56} label="shortest subarray with sum ≥" value="7" />
      <Window x={wx} width={ww} y={cy - 8} height={cs + 16} color="#15803d" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={wx + ww / 2} y={cy + cs + 40} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">
        4 + 3 = 7 ≥ 7, length 2
      </text>
      <Caption joinX={360} cy={322} label="return" value="2" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const input = data.input;
  const target = data.target;
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: W });
  const items = input.map((n, i) => ({ value: n, variant: windowVariant(i, step.left, step.right) }));
  const wx = layout.cellX(step.left);
  const ww = layout.cellX(step.right) + CELL - wx;
  const merged = step.left === step.right;
  const winColor = step.valid ? "#15803d" : "#c2410c";
  return (
    <VizStage width={W} height={H}>
      <text x={40} y={28} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">target = {target}</text>
      <Output x={W - 168} cy={26} label="shortest" value={step.best ?? "—"} />
      <Window x={wx} width={ww} y={CELL_Y - 8} height={CELL + 16} color={winColor} />
      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      <Pointer
        centerX={layout.centerX(step.left)}
        labelY={54}
        tipY={CELL_Y - 5}
        label={merged ? "l = r" : "left"}
        move={merged ? step.move?.left ?? step.move?.right : step.move?.left}
      />
      {!merged && <Pointer centerX={layout.centerX(step.right)} labelY={54} tipY={CELL_Y - 5} label="right" move={step.move?.right} />}
      <text x={wx + ww / 2} y={CELL_Y + CELL + 40} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill={winColor}>
        sum = {step.sum}
      </text>
    </VizStage>
  );
}

export default {
  id: "min-subarray-sum",
  leetcode: 209,
  title: "Minimum Size Subarray Sum",
  difficulty: "Medium",
  tagline: "Shortest contiguous subarray whose sum is at least the target.",
  patternId: "sliding-window",
  constraint: "All numbers are positive (1 ≤ nums[i]).",
  ProblemViz,
  examples: [
    { input: "[2,3,1,2,4,3], t=7", result: "2", ok: true },
    { input: "[1,2,3], t=7", result: "0", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Works only because every number is positive: each shrink lowers the sum, so the window can never pass left over right (sum hits 0 < target first). Zeros or negatives break this — see #862, which needs prefix sums + a monotonic deque.",
    code: `def minSubArrayLen(target, nums):
    left = total = 0
    best = len(nums) + 1
    for right in range(len(nums)):
        total += nums[right]
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best > len(nums) else best`,
    codeHighlight: [4, 5, 6, 7, 8, 9],
    codeNote: "shrink while valid",
    cases: [
      { id: "reach", label: "target 7", result: "2", ok: true, input: PASS, target: 7, steps: PASS_STEPS },
      { id: "miss", label: "target 7 (unreachable)", result: "0", ok: false, input: FAIL, target: 7, steps: FAIL_STEPS },
    ],
  },
};
