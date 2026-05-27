import { AnimatePresence } from "framer-motion";
import { VizStage, VizArray, Pointer, Arc, Caption, rowLayout, convergingVariant } from "../../viz";

const W = 800;
const H = 280;
const CELL = 70;
const GAP = 8;
const CELL_Y = 92;

const PASS = [1, 3, 4, 5, 7, 11];
const FAIL = [1, 3, 4, 5];

// Pass: target reachable — pointers shrink asymmetrically until the pair is
// found. Each comparison step carries a `move` hint showing which pointer is
// about to slide inward (left → screen-right, right → screen-left).
const PASS_STEPS = [
  { left: 0, right: 5, status: "Initialize: left at 0, right at 5.  target = 9.", show: false, found: false },
  { left: 0, right: 5, status: "1 + 11 = 12  >  9   →  too big, move right inward", show: true, found: false, move: { right: "left" } },
  { left: 0, right: 4, status: "1 + 7 = 8  <  9   →  too small, move left inward", show: true, found: false, move: { left: "right" } },
  { left: 1, right: 4, status: "3 + 7 = 10  >  9   →  too big, move right inward", show: true, found: false, move: { right: "left" } },
  { left: 1, right: 3, status: "3 + 5 = 8  <  9   →  too small, move left inward", show: true, found: false, move: { left: "right" } },
  { left: 2, right: 3, status: "4 + 5 = 9  ==  target   →  return [3, 4]", show: true, found: true },
];

// Fail: target unreachable — pointers meet without ever finding a pair.
const FAIL_STEPS = [
  { left: 0, right: 3, status: "Initialize: left at 0, right at 3.  target = 20.", show: false, found: false },
  { left: 0, right: 3, status: "1 + 5 = 6  <  20   →  too small, move left inward", show: true, found: false, move: { left: "right" } },
  { left: 1, right: 3, status: "3 + 5 = 8  <  20   →  too small, move left inward", show: true, found: false, move: { left: "right" } },
  { left: 2, right: 3, status: "4 + 5 = 9  <  20   →  too small, move left inward", show: true, found: false, move: { left: "right" } },
  { left: 3, right: 3, status: "left meets right, no pair found → return []", show: false, found: false },
];

// Problem-specific: sorted array + target, the answer pair highlighted.
function ProblemViz() {
  const cs = 64;
  const gap = 10;
  const cy = 150;
  const pl = rowLayout({ count: PASS.length, cellSize: cs, gap, width: 800 });
  const items = PASS.map((n, i) => ({ value: n, variant: i === 2 || i === 3 ? "active" : "default" }));
  return (
    <VizStage width={800} height={360}>
      <Caption joinX={540} cy={48} label="sorted array · find a pair summing to" value="9" />

      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />

      <Arc x1={pl.centerX(2)} x2={pl.centerX(3)} y={cy + cs + 6} depth={42} color="#15803d" label="4 + 5 = 9  ✓" />

      <Caption joinX={360} cy={322} label="return" value="[3, 4]" fill="#dcfce7" stroke="#15803d" color="#15803d" />
      <text x={450} y={322} dominantBaseline="central" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="12" fill="#a8a29e">1-indexed</text>
    </VizStage>
  );
}

// Solution scene: pointers move asymmetrically based on sum vs target.
function SolutionViz({ data, step }) {
  const input = data.input;
  const target = data.target;
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: W });
  const items = input.map((n, i) => ({ value: n, variant: convergingVariant(i, step.left, step.right) }));
  const sum = input[step.left] + input[step.right];
  const color = step.found ? "#15803d" : "#c2410c";
  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={28} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">target = {target}</text>
      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      <Pointer centerX={layout.centerX(step.left)} labelY={50} tipY={CELL_Y - 5} label={step.left === step.right ? "left = right" : "left"} move={step.move?.left} />
      {step.left !== step.right && <Pointer centerX={layout.centerX(step.right)} labelY={50} tipY={CELL_Y - 5} label="right" move={step.move?.right} />}
      <AnimatePresence>
        {step.show && (
          <Arc
            key={`${step.left}-${step.right}`}
            x1={layout.centerX(step.left)}
            x2={layout.centerX(step.right)}
            y={CELL_Y + CELL + 4}
            depth={52}
            color={color}
            label={`${input[step.left]} + ${input[step.right]} = ${sum}`}
          />
        )}
      </AnimatePresence>
    </VizStage>
  );
}

export default {
  id: "two-sum-ii",
  leetcode: 167,
  title: "Two Sum II — Sorted Array",
  difficulty: "Medium",
  tagline: "Find two numbers in a sorted array that add up to a target.",
  patternId: "two-pointers",
  ProblemViz,
  examples: [
    { input: "[1,3,4,5,7,11], t=9", result: "[3,4]", ok: true },
    { input: "[1,3,4,5], t=20", result: "[]", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    code: `def twoSum(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        total = numbers[left] + numbers[right]
        if total == target:
            return [left + 1, right + 1]
        if total < target:
            left += 1
        else:
            right -= 1
    return []`,
    codeHighlight: [3, 4, 5, 6, 7, 8, 9, 10],
    codeNote: "two pointers converge",
    cases: [
      { id: "pass", label: "target 9", result: "[3, 4]", ok: true, input: PASS, target: 9, steps: PASS_STEPS },
      { id: "fail", label: "target 20", result: "[]", ok: false, input: FAIL, target: 20, steps: FAIL_STEPS },
    ],
  },
};
