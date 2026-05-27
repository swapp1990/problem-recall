import { VizStage, VizArray, Pointer, Caption, Output, rowLayout } from "../../viz";

const W = 560;
const H = 300;
const CELL = 54;
const GAP = 10;
const CELL_Y = 100;
const ROWW = 520;

const NUMS = [100, 4, 200, 1, 3, 2];
// The set keeps the same distinct values; we scan it looking for "run starts"
// (a value whose predecessor is absent), then count forward by membership.
const SET = [100, 4, 200, 1, 3, 2];

// `runCells` = values lit green as the current run · `predCell` = the x−1 that
// blocks a start (highlighted red on skips) · `best` = longest run so far.
const STEPS = [
  { i: 0, x: 100, isStart: true, predCell: null, runCells: [100], runLen: 1, best: 1, found: null, status: "100 → is 99 in the set? no → a run starts here · count 100… → length 1" },
  { i: 1, x: 4, isStart: false, predCell: 3, runCells: [], best: 1, found: null, status: "4 → is 3 in the set? yes → 4 is mid-run, not a start → skip" },
  { i: 2, x: 200, isStart: true, predCell: null, runCells: [200], runLen: 1, best: 1, found: null, status: "200 → is 199 in the set? no → start · count 200… → length 1" },
  { i: 3, x: 1, isStart: true, predCell: null, runCells: [1, 2, 3, 4], runLen: 4, best: 4, found: null, status: "1 → is 0 in the set? no → start · 1,2,3,4 all in set → length 4 ✓ new best" },
  { i: 4, x: 3, isStart: false, predCell: 2, runCells: [], best: 4, found: null, status: "3 → is 2 in the set? yes → not a start → skip" },
  { i: 5, x: 2, isStart: false, predCell: 1, runCells: [], best: 4, found: null, status: "2 → is 1 in the set? yes → not a start → skip" },
  { i: -1, x: null, isStart: false, predCell: null, runCells: [1, 2, 3, 4], best: 4, found: 4, done: true, status: "longest consecutive run = 4 (the sequence 1·2·3·4)" },
];

function ProblemViz() {
  const cs = 56;
  const gap = 10;
  const cy = 150;
  const pl = rowLayout({ count: NUMS.length, cellSize: cs, gap, width: 760 });
  const run = new Set([1, 2, 3, 4]);
  const items = NUMS.map((n) => ({ value: n, variant: run.has(n) ? "active" : "default" }));
  return (
    <VizStage width={760} height={320}>
      <Caption joinX={520} cy={56} label="length of the longest run of consecutive ints" value="" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} />
      <text x={380} y={cy + cs + 42} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">
        1, 2, 3, 4 are all present (scattered) → run of length 4
      </text>
      <Caption joinX={330} cy={300} label="return" value="4" fill="#dcfce7" stroke="#15803d" color="#15803d" />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const layout = rowLayout({ count: SET.length, cellSize: CELL, gap: GAP, width: ROWW });
  const run = step.runCells || [];
  return (
    <VizStage width={W} height={H}>
      <text x={28} y={26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">put every value in a set, then scan for run-starts</text>
      <text x={layout.originX - 12} y={CELL_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">set</text>

      {SET.map((v, idx) => {
        const inRun = run.includes(v);
        const isPred = step.predCell === v;
        const isX = step.x === v && !step.done;
        let fill = "none", stroke = "#a8a29e", tcol = "#1a1814";
        if (inRun) { fill = "#dcfce7"; stroke = "#15803d"; tcol = "#15803d"; }
        else if (isPred) { fill = "#fee2e2"; stroke = "#b91c1c"; tcol = "#b91c1c"; }
        else if (isX) { fill = "#fef3e9"; stroke = "#c2410c"; tcol = "#c2410c"; }
        const x = layout.cellX(idx);
        return (
          <g key={idx}>
            <rect x={x} y={CELL_Y} width={CELL} height={CELL} rx={3} fill={fill} stroke={stroke} strokeWidth={1.8} />
            <text x={x + CELL / 2} y={CELL_Y + CELL / 2 + 6} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill={tcol}>{v}</text>
          </g>
        );
      })}

      {step.i >= 0 && !step.done && (
        <Pointer centerX={layout.centerX(step.i)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="x" move={step.i < SET.length - 1 ? "right" : null} />
      )}

      {step.i >= 0 && !step.done && (
        <text x={28} y={206} fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill={step.isStart ? "#15803d" : "#b91c1c"}>
          {step.isStart
            ? `${step.x} − 1 not in set → START · count forward → length ${step.runLen}`
            : `${step.x} − 1 = ${step.x - 1} is in set → ${step.x} isn't a start → skip`}
        </text>
      )}
      {step.done && (
        <text x={28} y={206} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">
          every value is visited once · each run counted from its start → O(n)
        </text>
      )}

      <Output x={28} cy={256} label={step.done ? "longest" : "best so far"} value={step.done ? step.found : step.best} />
    </VizStage>
  );
}

export default {
  id: "longest-consecutive",
  leetcode: 128,
  title: "Longest Consecutive Sequence",
  difficulty: "Medium",
  tagline: "Length of the longest run of consecutive integers, in O(n).",
  patternId: "arrays-hashing",
  constraint: "Unsorted; must run in O(n) — so sorting is off the table.",
  ProblemViz,
  examples: [
    { input: "[100,4,200,1,3,2]", result: "4", ok: true },
    { input: "[0,3,7,2,5,8,4,6,0,1]", result: "9", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Sorting would give O(n log n). Instead drop everything into a hash set, then only start counting a run at a value whose predecessor (x − 1) is ABSENT — that's the true start of a sequence. From there, walk x+1, x+2, … by O(1) set lookups. Each value is visited at most twice, so the whole thing is O(n).",
    code: `def longestConsecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:        # x starts a run
            length = 1
            while x + length in s:
                length += 1
            best = max(best, length)
    return best`,
    codeHighlight: [4, 5, 6, 7, 8, 9],
    codeNote: "only count from a run's start",
    cases: [
      { id: "lcs", label: "[100,4,200,1,3,2]", result: "4", ok: true, input: NUMS, steps: STEPS },
    ],
  },
};
