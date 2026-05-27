import { VizStage, VizArray, Pointer, Window, Caption, rowLayout, windowVariant } from "../../viz";

const W = 800;
const H = 280;
const CELL = 64;
const GAP = 8;
const CELL_Y = 100;

const A = "abcabcbb".split("");
const B = "bbbb".split("");

// Each step is the window state after processing one right index. `move`
// telegraphs the action: expand → right slides right; shrink → left slides
// right. (Both move the same way — the window slides.)
const A_STEPS = [
  { left: 0, right: 0, best: 1, status: 'right=0 "a" → window "a", best = 1', move: { right: "right" } },
  { left: 0, right: 1, best: 2, status: 'add "b" → window "ab", best = 2', move: { right: "right" } },
  { left: 0, right: 2, best: 3, status: 'add "c" → window "abc", best = 3', move: { right: "right" } },
  { left: 1, right: 3, best: 3, status: 'add "a" repeats s[0] → shrink left, window "bca"', move: { left: "right" } },
  { left: 2, right: 4, best: 3, status: 'add "b" repeats → shrink left, window "cab"', move: { left: "right" } },
  { left: 3, right: 5, best: 3, status: 'add "c" repeats → shrink left, window "abc"', move: { left: "right" } },
  { left: 5, right: 6, best: 3, status: 'add "b" repeats → shrink past it, window "cb"', move: { left: "right" } },
  { left: 7, right: 7, best: 3, status: 'add "b" repeats → shrink, window "b". longest = 3' },
];

const B_STEPS = [
  { left: 0, right: 0, best: 1, status: 'right=0 "b" → window "b", best = 1', move: { right: "right" } },
  { left: 1, right: 1, best: 1, status: 'add "b" repeats → shrink left, window "b"', move: { left: "right" } },
  { left: 2, right: 2, best: 1, status: 'add "b" repeats → shrink left, window "b"', move: { left: "right" } },
  { left: 3, right: 3, best: 1, status: 'add "b" repeats → shrink, window "b". longest = 1' },
];

function ProblemViz() {
  const cs = 56;
  const gap = 8;
  const cy = 160;
  const pl = rowLayout({ count: A.length, cellSize: cs, gap, width: 800 });
  const items = A.map((ch, i) => ({ value: ch, variant: i >= 0 && i <= 2 ? "default" : "muted" }));
  const wx = pl.cellX(0);
  const ww = pl.cellX(2) + cs - wx;
  return (
    <VizStage width={800} height={360}>
      <text x="400" y="60" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16" fill="#57534e">
        length of the longest substring with all-unique characters
      </text>

      <Window x={wx} width={ww} y={cy - 8} height={cs + 16} />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={wx + ww / 2} y={cy + cs + 40} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#c2410c">
        "abc" — longest unique run, length 3
      </text>

      <Caption joinX={360} cy={322} label="return" value="3" fill="#dcfce7" stroke="#15803d" color="#15803d" />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const input = data.input;
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: W });
  const items = input.map((ch, i) => ({ value: ch, variant: windowVariant(i, step.left, step.right) }));
  const wx = layout.cellX(step.left);
  const ww = layout.cellX(step.right) + CELL - wx;
  return (
    <VizStage width={W} height={H}>
      <Caption joinX={430} cy={30} label="longest so far" value={step.best} fill="#dcfce7" stroke="#15803d" color="#15803d" />
      <Window x={wx} width={ww} y={CELL_Y - 8} height={CELL + 16} />
      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      <Pointer
        centerX={layout.centerX(step.left)}
        labelY={54}
        tipY={CELL_Y - 5}
        label={step.left === step.right ? "l = r" : "left"}
        move={step.left === step.right ? (step.move?.left ?? step.move?.right) : step.move?.left}
      />
      {step.left !== step.right && <Pointer centerX={layout.centerX(step.right)} labelY={54} tipY={CELL_Y - 5} label="right" move={step.move?.right} />}
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
    { input: '"abcabcbb"', result: "3", ok: true },
    { input: '"bbbb"', result: "1", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    cases: [
      { id: "abc", label: '"abcabcbb"', result: "3", ok: true, input: A, steps: A_STEPS },
      { id: "bbbb", label: '"bbbb"', result: "1", ok: true, input: B, steps: B_STEPS },
    ],
  },
};
