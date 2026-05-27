import { VizStage, VizArray, Pointer, Window, Caption, Output, rowLayout, windowVariant } from "../../viz";

const CELL = 64;
const GAP = 8;
const CELL_Y = 100;
const H = 280;
// viewBox tightly bounds the 6-cell row so cells fill the width on mobile.
const W = 6 * CELL + 5 * GAP + 48;

const A = "abcdce".split("");
const B = "pwwkew".split("");

// ATOMIC steps — each step moves exactly one pointer by one cell, so every
// movement is explicit (no bundled multi-cell jumps). `mark` highlights the
// duplicate pair so it's clear *why* the left pointer keeps shrinking. `move`
// telegraphs the next move (right = expand, left = shrink).
//
// "abcdce": adding the second "c" (index 4) duplicates the "c" at index 2, so
// left must shrink THREE times (drop a, b, c) to clear it.
const A_STEPS = [
  { left: 0, right: 0, best: 1, status: 'right → 0: add "a". window "a", best = 1', move: { right: "right" } },
  { left: 0, right: 1, best: 2, status: 'expand right: add "b". window "ab", best = 2', move: { right: "right" } },
  { left: 0, right: 2, best: 3, status: 'expand right: add "c". window "abc", best = 3', move: { right: "right" } },
  { left: 0, right: 3, best: 4, status: 'expand right: add "d". window "abcd", best = 4', move: { right: "right" } },
  { left: 0, right: 4, best: 4, status: 'expand right: add "c" — duplicates "c" at index 2. window invalid', move: { left: "right" }, mark: [2, 4] },
  { left: 1, right: 4, best: 4, status: 'shrink left: drop "a", left → 1. still duplicated', move: { left: "right" }, mark: [2, 4] },
  { left: 2, right: 4, best: 4, status: 'shrink left: drop "b", left → 2. still duplicated', move: { left: "right" }, mark: [2, 4] },
  { left: 3, right: 4, best: 4, status: 'shrink left: drop "c", left → 3. duplicate cleared, window "dc"', move: { right: "right" } },
  { left: 3, right: 5, best: 4, status: 'expand right: add "e". window "dce". longest = 4' },
];

// "pwwkew": one 2-shrink (drop p, w) then later a 1-shrink.
const B_STEPS = [
  { left: 0, right: 0, best: 1, status: 'right → 0: add "p". window "p", best = 1', move: { right: "right" } },
  { left: 0, right: 1, best: 2, status: 'expand right: add "w". window "pw", best = 2', move: { right: "right" } },
  { left: 0, right: 2, best: 2, status: 'expand right: add "w" — duplicates "w" at index 1. invalid', move: { left: "right" }, mark: [1, 2] },
  { left: 1, right: 2, best: 2, status: 'shrink left: drop "p", left → 1. still duplicated', move: { left: "right" }, mark: [1, 2] },
  { left: 2, right: 2, best: 2, status: 'shrink left: drop "w", left → 2. cleared, window "w"', move: { right: "right" } },
  { left: 2, right: 3, best: 2, status: 'expand right: add "k". window "wk", best = 2', move: { right: "right" } },
  { left: 2, right: 4, best: 3, status: 'expand right: add "e". window "wke", best = 3', move: { right: "right" } },
  { left: 2, right: 5, best: 3, status: 'expand right: add "w" — duplicates "w" at index 2. invalid', move: { left: "right" }, mark: [2, 5] },
  { left: 3, right: 5, best: 3, status: 'shrink left: drop "w", left → 3. cleared, window "kew". longest = 3' },
];

function ProblemViz() {
  const cs = 56;
  const gap = 8;
  const cy = 160;
  const S = "abcdce".split("");
  const pl = rowLayout({ count: S.length, cellSize: cs, gap, width: 800 });
  const items = S.map((ch, i) => ({ value: ch, variant: i <= 3 ? "default" : "muted" }));
  const wx = pl.cellX(0);
  const ww = pl.cellX(3) + cs - wx;
  return (
    <VizStage width={800} height={360}>
      <text x="400" y="60" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16" fill="#57534e">
        length of the longest substring with all-unique characters
      </text>

      <Window x={wx} width={ww} y={cy - 8} height={cs + 16} />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={wx + ww / 2} y={cy + cs + 40} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#c2410c">
        "abcd" — longest unique run, length 4
      </text>

      <Caption joinX={360} cy={322} label="return" value="4" fill="#dcfce7" stroke="#15803d" color="#15803d" />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const input = data.input;
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: W });
  const items = input.map((ch, i) => {
    let variant = windowVariant(i, step.left, step.right);
    if (step.mark && step.mark.includes(i)) variant = "active";
    return { value: ch, variant };
  });
  const wx = layout.cellX(step.left);
  const ww = layout.cellX(step.right) + CELL - wx;
  const merged = step.left === step.right;
  return (
    <VizStage width={W} height={H}>
      <Output x={W - 168} cy={28} label="longest" value={step.best} />
      <Window x={wx} width={ww} y={CELL_Y - 8} height={CELL + 16} />
      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      <Pointer
        centerX={layout.centerX(step.left)}
        labelY={54}
        tipY={CELL_Y - 5}
        label={merged ? "l = r" : "left"}
        move={merged ? step.move?.left ?? step.move?.right : step.move?.left}
      />
      {!merged && <Pointer centerX={layout.centerX(step.right)} labelY={54} tipY={CELL_Y - 5} label="right" move={step.move?.right} />}
    </VizStage>
  );
}

export default {
  id: "longest-substring",
  leetcode: 3,
  title: "Longest Substring Without Repeating Characters",
  difficulty: "Medium",
  tagline: "Length of the longest substring with no repeated character.",
  patternId: "sliding-window",
  ProblemViz,
  examples: [
    { input: '"abcdce"', result: "4", ok: true },
    { input: '"pwwkew"', result: "3", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    code: `def lengthOfLongestSubstring(s):
    seen = set()
    left = best = 0
    for right in range(len(s)):
        while s[right] in seen:
            seen.remove(s[left])
            left += 1
        seen.add(s[right])
        best = max(best, right - left + 1)
    return best`,
    codeHighlight: [4, 5, 6, 7, 8, 9],
    codeNote: "expand right · shrink left",
    cases: [
      { id: "abcdce", label: '"abcdce"', result: "4", ok: true, input: A, steps: A_STEPS },
      { id: "pwwkew", label: '"pwwkew"', result: "3", ok: true, input: B, steps: B_STEPS },
    ],
  },
};
