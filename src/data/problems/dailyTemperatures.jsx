import { VizStage, VizArray, Pointer, Caption, Deque, rowLayout } from "../../viz";

const W = 720;
const H = 312;
const CELL = 50;
const GAP = 8;
const TEMP_Y = 58;
const ANS_Y = 126;
const ARRAY_ZONE = 380;
const STACK_X = 452;

const TEMPS = [73, 74, 75, 71, 76];

// The stack holds indices of days still waiting for a warmer one, kept in
// DECREASING temperature. A warmer day pops everyone it beats (one pop per
// frame, flashed red) — answer = i − popped index — then is pushed.
// `popping` = index being popped this frame · `pushed` = index just pushed ·
// `compare` = {text, kind} drives the colored test line.
const STEPS = [
  { i: -1, stack: [], popping: null, pushed: null, ans: [null, null, null, null, null], resolved: [], compare: null, status: "stack = indices of days still waiting — kept in decreasing temperature" },
  { i: 0, stack: [0], popping: null, pushed: 0, ans: [null, null, null, null, null], resolved: [], compare: { text: "73 · stack empty → push day 0", kind: "push" }, status: "push day 0" },
  { i: 1, stack: [0], popping: 0, pushed: null, ans: [1, null, null, null, null], resolved: [0], compare: { text: "74 > 73 → pop day 0 · waited 1−0 = 1", kind: "pop" }, status: "74 beats day 0" },
  { i: 1, stack: [1], popping: null, pushed: 1, ans: [1, null, null, null, null], resolved: [], compare: { text: "stack empty → push day 1", kind: "push" }, status: "push day 1" },
  { i: 2, stack: [1], popping: 1, pushed: null, ans: [1, 1, null, null, null], resolved: [1], compare: { text: "75 > 74 → pop day 1 · waited 2−1 = 1", kind: "pop" }, status: "75 beats day 1" },
  { i: 2, stack: [2], popping: null, pushed: 2, ans: [1, 1, null, null, null], resolved: [], compare: { text: "stack empty → push day 2", kind: "push" }, status: "push day 2" },
  { i: 3, stack: [2, 3], popping: null, pushed: 3, ans: [1, 1, null, null, null], resolved: [], compare: { text: "71 < 75 → push · stack 75,71 stays ↓", kind: "push" }, status: "71 can't resolve 75 → push day 3" },
  { i: 4, stack: [2, 3], popping: 3, pushed: null, ans: [1, 1, null, 1, null], resolved: [3], compare: { text: "76 > 71 → pop day 3 · waited 4−3 = 1", kind: "pop" }, status: "76 beats day 3" },
  { i: 4, stack: [2], popping: 2, pushed: null, ans: [1, 1, 2, 1, null], resolved: [2], compare: { text: "76 > 75 → pop day 2 · waited 4−2 = 2", kind: "pop" }, status: "76 beats day 2" },
  { i: 4, stack: [4], popping: null, pushed: 4, ans: [1, 1, 2, 1, null], resolved: [], compare: { text: "stack empty → push day 4", kind: "push" }, status: "push day 4" },
  { i: 5, done: true, stack: [4], popping: null, pushed: null, ans: [1, 1, 2, 1, 0], resolved: [4], compare: null, status: "day 4 never gets warmer → 0.  answer = [1, 1, 2, 1, 0]" },
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
  const tempItems = temps.map((n, idx) => ({
    value: n,
    variant: step.i < 0 ? "default" : idx === step.i ? "active" : idx === step.popping ? "matched" : "default",
  }));
  const ansItems = step.ans.map((v, idx) => ({
    value: v == null ? "" : v,
    variant: v == null ? "muted" : step.resolved.includes(idx) ? "active" : "matched",
  }));
  const stackItems = step.stack.map((idx) => ({
    value: temps[idx],
    label: "d" + idx,
    variant: idx === step.popping ? "pop" : idx === step.pushed ? "new" : "default",
  }));

  return (
    <VizStage width={W} height={H}>
      <text x={layout.originX - 12} y={TEMP_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">temps</text>
      <VizArray items={tempItems} layout={layout} y={TEMP_Y} cellSize={CELL} />
      {step.i >= 0 && !step.done && <Pointer centerX={layout.centerX(step.i)} labelY={TEMP_Y - 24} tipY={TEMP_Y - 4} label="day" move={step.i < temps.length - 1 ? "right" : null} />}

      <text x={layout.originX - 12} y={ANS_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">answer</text>
      <VizArray items={ansItems} layout={layout} y={ANS_Y} cellSize={CELL} showIndices />

      <text x={STACK_X} y={TEMP_Y - 14} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">stack — temps decreasing</text>
      <Deque x={STACK_X} y={TEMP_Y + 6} items={stackItems} cellW={46} cellH={46} frontLabel="bottom" backLabel="top ↓" emptyLabel="(empty)" />
      <text x={STACK_X} y={TEMP_Y + 6 + 46 + 18} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#a8a29e">top = smallest → it pops first</text>

      {step.compare && (
        <text x={40} y={ANS_Y + CELL + 36} fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill={step.compare.kind === "pop" ? "#b91c1c" : "#15803d"}>
          {step.compare.text}
        </text>
      )}
      <text x={40} y={H - 18} fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#57534e">{step.status.split(".")[0]}</text>
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
