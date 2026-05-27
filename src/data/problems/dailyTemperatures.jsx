import { VizStage, VizArray, Pointer, Caption, Deque, rowLayout } from "../../viz";

const W = 880;
const H = 300;
const CELL = 50;
const GAP = 8;
const TEMP_Y = 60;
const ANS_Y = 128;
const ARRAY_ZONE = 470;
const STACK_X = 548;

const TEMPS = [73, 74, 75, 71, 76];

// Stack holds indices of days still waiting for a warmer one (decreasing temps).
// A warmer day resolves (pops) everyone it beats: answer = i − popped index.
const STEPS = [
  { i: -1, stack: [], ans: [null, null, null, null, null], resolved: [], status: "stack = indices of days still waiting for a warmer one" },
  { i: 0, stack: [0], ans: [null, null, null, null, null], resolved: [], status: "day 0 = 73 → nothing warmer yet → push" },
  { i: 1, stack: [1], ans: [1, null, null, null, null], resolved: [0], status: "day 1 = 74 > 73 → day 0 waited 1 day · push" },
  { i: 2, stack: [2], ans: [1, 1, null, null, null], resolved: [1], status: "day 2 = 75 > 74 → day 1 waited 1 day · push" },
  { i: 3, stack: [2, 3], ans: [1, 1, null, null, null], resolved: [], status: "day 3 = 71 < 75 → push (still waiting)" },
  { i: 4, stack: [4], ans: [1, 1, 2, 1, null], resolved: [2, 3], status: "day 4 = 76 > 71 and 75 → day 3 waited 1, day 2 waited 2 · push" },
  { i: 5, done: true, stack: [4], ans: [1, 1, 2, 1, 0], resolved: [4], status: "day 4 never gets warmer → 0.  answer = [1, 1, 2, 1, 0]" },
];

function ProblemViz() {
  const cs = 56;
  const gap = 8;
  const cy = 110;
  const pl = rowLayout({ count: TEMPS.length, cellSize: cs, gap, width: 760 });
  const items = TEMPS.map((n) => ({ value: n, variant: "default" }));
  const ans = [1, 1, 2, 1, 0].map((n) => ({ value: n, variant: "default" }));
  return (
    <VizStage width={760} height={320}>
      <Caption joinX={470} cy={50} label="days until a warmer temperature" value="" />
      <text x={pl.originX - 14} y={cy + cs / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#57534e">temps</text>
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={pl.originX - 14} y={cy + 86 + cs / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#15803d">answer</text>
      <VizArray items={ans} layout={pl} y={cy + 86} cellSize={cs} />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const temps = data.input;
  const layout = rowLayout({ count: temps.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });
  const tempItems = temps.map((n, idx) => ({ value: n, variant: step.i < 0 ? "default" : idx === step.i ? "active" : "default" }));
  const ansItems = step.ans.map((v, idx) => ({
    value: v == null ? "" : v,
    variant: v == null ? "muted" : step.resolved.includes(idx) ? "active" : "matched",
  }));
  const stackItems = step.stack.map((idx) => ({ value: temps[idx], label: "d" + idx, variant: idx === step.i ? "new" : "default" }));

  return (
    <VizStage width={W} height={H}>
      <text x={layout.originX - 12} y={TEMP_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">temps</text>
      <VizArray items={tempItems} layout={layout} y={TEMP_Y} cellSize={CELL} />
      {step.i >= 0 && !step.done && <Pointer centerX={layout.centerX(step.i)} labelY={TEMP_Y - 24} tipY={TEMP_Y - 4} label="day" move={step.i < temps.length - 1 ? "right" : null} />}

      <text x={layout.originX - 12} y={ANS_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">answer</text>
      <VizArray items={ansItems} layout={layout} y={ANS_Y} cellSize={CELL} showIndices />

      <text x={STACK_X} y={TEMP_Y - 4} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">stack (waiting days)</text>
      <Deque x={STACK_X} y={TEMP_Y + 16} items={stackItems} cellW={48} cellH={48} frontLabel="bottom" backLabel="top" emptyLabel="(empty)" />

      <text x={40} y={H - 26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">{step.status.split(".")[0]}</text>
    </VizStage>
  );
}

export default {
  id: "daily-temperatures",
  leetcode: 739,
  title: "Daily Temperatures",
  difficulty: "Medium",
  tagline: "For each day, how many days until a warmer temperature.",
  patternId: "monotonic-stack",
  constraint: "0 if no warmer day follows.",
  ProblemViz,
  examples: [{ input: "[73,74,75,71,76]", result: "[1,1,2,1,0]", ok: true }],
  solution: {
    Viz: SolutionViz,
    note: "Keep a stack of indices whose answer is still unknown, with decreasing temperatures. When today is warmer than the day on top, that day's wait is resolved (i − its index) — pop it. Each day is pushed and popped at most once, so O(n) instead of O(n²).",
    code: `def dailyTemperatures(temps):
    ans = [0] * len(temps)
    stack = []                       # indices, decreasing temps
    for i, t in enumerate(temps):
        while stack and t > temps[stack[-1]]:
            j = stack.pop()
            ans[j] = i - j
        stack.append(i)
    return ans`,
    codeHighlight: [4, 5, 6, 7, 8],
    codeNote: "pop the days this one resolves",
    cases: [{ id: "warmer", label: "[73,74,75,71,76]", result: "[1,1,2,1,0]", ok: true, input: TEMPS, steps: STEPS }],
  },
};
