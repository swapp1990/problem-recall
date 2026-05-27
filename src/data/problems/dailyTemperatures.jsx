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

// The stack holds INDICES of days still waiting for a warmer one, kept in
// DECREASING temperature. When today (i) is warmer than the top day (j), pop
// j (one pop per frame, flashed red) and set ans[j] = i − j, then push i.
// Names match the code: i = current index, j = popped index, t = temps[i].
// `compare.test` = the while-condition with values · `compare.ans` = ans[j]=i−j.
const STEPS = [
  { i: -1, stack: [], popping: null, pushed: null, ans: [null, null, null, null, null], resolved: [], compare: null, status: "stack holds indices of days still waiting — kept in decreasing temperature" },
  { i: 0, stack: [0], popping: null, pushed: 0, ans: [null, null, null, null, null], resolved: [], compare: { kind: "push", test: "stack empty → push i = 0" }, status: "push i=0" },
  { i: 1, stack: [0], popping: 0, pushed: null, ans: [1, null, null, null, null], resolved: [0], compare: { kind: "pop", test: "t=74 > temps[j]=73 → pop j=0", ans: "ans[j] = i − j = 1 − 0 = 1" }, status: "today beats day 0" },
  { i: 1, stack: [1], popping: null, pushed: 1, ans: [1, null, null, null, null], resolved: [], compare: { kind: "push", test: "stack empty → push i = 1" }, status: "push i=1" },
  { i: 2, stack: [1], popping: 1, pushed: null, ans: [1, 1, null, null, null], resolved: [1], compare: { kind: "pop", test: "t=75 > temps[j]=74 → pop j=1", ans: "ans[j] = i − j = 2 − 1 = 1" }, status: "today beats day 1" },
  { i: 2, stack: [2], popping: null, pushed: 2, ans: [1, 1, null, null, null], resolved: [], compare: { kind: "push", test: "stack empty → push i = 2" }, status: "push i=2" },
  { i: 3, stack: [2, 3], popping: null, pushed: 3, ans: [1, 1, null, null, null], resolved: [], compare: { kind: "push", test: "t=71 < temps[j]=75 → push i = 3 · stack stays ↓" }, status: "71 can't resolve 75 → push i=3" },
  { i: 4, stack: [2, 3], popping: 3, pushed: null, ans: [1, 1, null, 1, null], resolved: [3], compare: { kind: "pop", test: "t=76 > temps[j]=71 → pop j=3", ans: "ans[j] = i − j = 4 − 3 = 1" }, status: "today beats day 3" },
  { i: 4, stack: [2], popping: 2, pushed: null, ans: [1, 1, 2, 1, null], resolved: [2], compare: { kind: "pop", test: "t=76 > temps[j]=75 → pop j=2", ans: "ans[j] = i − j = 4 − 2 = 2" }, status: "today beats day 2" },
  { i: 4, stack: [4], popping: null, pushed: 4, ans: [1, 1, 2, 1, null], resolved: [], compare: { kind: "push", test: "stack empty → push i = 4" }, status: "push i=4" },
  { i: 5, done: true, stack: [4], popping: null, pushed: null, ans: [1, 1, 2, 1, 0], resolved: [4], compare: null, status: "i=4 never gets warmer → ans[4] = 0.  answer = [1, 1, 2, 1, 0]" },
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
      <Caption joinX={300} cy={300} label="return" value="[1, 1, 2, 1, 0]" fill="#dcfce7" stroke="#15803d" color="#15803d" />
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
  // Stack stores INDICES (code: stack.append(i)). Show the index as the cell's
  // value; the temp it maps to is the small label — so "temps decreasing"
  // reads off the labels (75°, 71°) while the cell is honestly an index.
  const stackItems = step.stack.map((idx) => ({
    value: idx,
    label: temps[idx] + "°",
    variant: idx === step.popping ? "pop" : idx === step.pushed ? "new" : "default",
  }));

  return (
    <VizStage width={W} height={H}>
      <text x={layout.originX - 12} y={TEMP_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">temps</text>
      <VizArray items={tempItems} layout={layout} y={TEMP_Y} cellSize={CELL} showIndices />
      {step.i >= 0 && !step.done && <Pointer centerX={layout.centerX(step.i)} labelY={TEMP_Y - 24} tipY={TEMP_Y - 4} label="i" move={step.i < temps.length - 1 ? "right" : null} />}

      <text x={layout.originX - 12} y={ANS_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">ans</text>
      <VizArray items={ansItems} layout={layout} y={ANS_Y} cellSize={CELL} showIndices />

      <text x={STACK_X} y={TEMP_Y - 14} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">stack of indices — temps decreasing</text>
      <Deque x={STACK_X} y={TEMP_Y + 6} items={stackItems} cellW={48} cellH={48} frontLabel="bottom" backLabel="top ↓" emptyLabel="(empty)" />
      <text x={STACK_X} y={TEMP_Y + 6 + 48 + 18} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#a8a29e">top = smallest → it pops first</text>

      {step.compare && (
        <text x={40} y={ANS_Y + CELL + 34} fontFamily="JetBrains Mono, monospace" fontSize="13.5" fontWeight="700" fill={step.compare.kind === "pop" ? "#b91c1c" : "#15803d"}>
          {step.compare.test}
        </text>
      )}
      {step.compare && step.compare.ans && (
        <text x={40} y={ANS_Y + CELL + 58} fontFamily="JetBrains Mono, monospace" fontSize="13.5" fontWeight="700" fill="#15803d">
          {step.compare.ans}
        </text>
      )}
      <text x={40} y={H - 14} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#a8a29e">i = today's index (pointer) · j = the index being resolved</text>
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
