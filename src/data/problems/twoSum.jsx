import { VizStage, VizArray, Pointer, Caption, Table, Output, rowLayout } from "../../viz";

const W = 640;
const H = 290;
const CELL = 60;
const GAP = 12;
const CELL_Y = 92;
const ARRAY_ZONE = 360;
const TABLE_X = 400;

const C1 = [3, 2, 4];

// One pass with a hash map value → index. For each x, check whether its
// complement (target − x) is already in the map. `seen` is the map at lookup
// time (before storing the current value).
const C1_STEPS = [
  { i: -1, need: null, foundIdx: null, found: null, seen: [], status: "seen = {} (value → index).  target = 6" },
  { i: 0, need: 3, foundIdx: null, found: null, seen: [], status: "x = 3 → complement not in the map yet → store it" },
  { i: 1, need: 4, foundIdx: null, found: null, seen: [{ k: 3, v: 0 }], status: "x = 2 → complement not in the map yet → store it" },
  { i: 2, need: 2, foundIdx: 1, found: "[1, 2]", done: true, seen: [{ k: 3, v: 0 }, { k: 2, v: 1 }], status: "x = 4 → complement 2 is in the map → return [1, 2]" },
];

const C2 = [3, 2, 4];
const C2_STEPS = [
  { i: -1, need: null, foundIdx: null, found: null, seen: [], status: "seen = {}.  target = 10" },
  { i: 0, need: 7, foundIdx: null, found: null, seen: [], status: "x = 3 → complement not in the map → store it" },
  { i: 1, need: 8, foundIdx: null, found: null, seen: [{ k: 3, v: 0 }], status: "x = 2 → complement not in the map → store it" },
  { i: 2, need: 6, foundIdx: null, found: null, seen: [{ k: 3, v: 0 }, { k: 2, v: 1 }], status: "x = 4 → complement not in the map → store it" },
  { i: 3, done: true, need: null, foundIdx: null, found: "none", seen: [{ k: 3, v: 0 }, { k: 2, v: 1 }, { k: 4, v: 2 }], status: "scanned everything, no complement ever matched → no pair sums to 10" },
];

function ProblemViz() {
  const cs = 62;
  const gap = 10;
  const cy = 150;
  const pl = rowLayout({ count: C1.length, cellSize: cs, gap, width: 760 });
  const items = C1.map((n, i) => ({ value: n, variant: i === 1 || i === 2 ? "active" : "default" }));
  return (
    <VizStage width={760} height={320}>
      <Caption joinX={470} cy={56} label="find two indices summing to" value="6" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={(pl.cellX(1) + pl.cellX(2) + cs) / 2} y={cy + cs + 40} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">
        nums[1] + nums[2] = 2 + 4 = 6
      </text>
      <Caption joinX={330} cy={300} label="return" value="[1, 2]" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const input = data.input;
  const target = data.target;
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });
  const variantFor = (idx) => (step.i < 0 ? "muted" : idx === step.i ? "active" : idx < step.i ? "matched" : "muted");
  const items = input.map((n, idx) => ({ value: n, variant: variantFor(idx) }));
  return (
    <VizStage width={W} height={H}>
      <text x={32} y={26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">target = {target}</text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      {step.i >= 0 && !step.done && <Pointer centerX={layout.centerX(step.i)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="x" move={step.i < input.length - 1 ? "right" : null} />}

      {/* the complement computation, visualized: target − x = need, then probe the map */}
      {step.need != null && (() => {
        const by = 168, bh = 46, bw = 50;
        const tx = 40, xx = 112, nx = 184;          // box left edges
        const hit = step.foundIdx != null;
        const ay = by + bh / 2;
        const ax0 = nx + bw + 10;
        const ax1 = TABLE_X - 16;
        const box = (bx, val, fill, stroke, tcol, lbl) => (
          <g>
            <text x={bx + bw / 2} y={by - 9} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#a8a29e">{lbl}</text>
            <rect x={bx} y={by} width={bw} height={bh} rx={4} fill={fill} stroke={stroke} strokeWidth={1.8} />
            <text x={bx + bw / 2} y={by + bh / 2 + 6} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="18" fontWeight="700" fill={tcol}>{val}</text>
          </g>
        );
        return (
          <>
            <defs>
              <marker id="tsArrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={hit ? "#15803d" : "#a8a29e"} />
              </marker>
            </defs>
            {box(tx, target, "#fdfbf6", "#a8a29e", "#1a1814", "target")}
            <text x={tx + bw + 9} y={ay + 7} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="20" fill="#57534e">−</text>
            {box(xx, input[step.i], "#fef3e9", "#c2410c", "#c2410c", "x")}
            <text x={xx + bw + 9} y={ay + 6} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="18" fill="#57534e">=</text>
            {box(nx, step.need, hit ? "#dcfce7" : "#fef3e9", hit ? "#15803d" : "#c2410c", hit ? "#15803d" : "#c2410c", "need")}

            <line x1={ax0} y1={ay} x2={ax1} y2={ay} stroke={hit ? "#15803d" : "#a8a29e"} strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#tsArrow)" />
            <text x={(ax0 + ax1) / 2} y={ay - 9} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="12" fill="#57534e">is need in seen?</text>
            <text x={(ax0 + ax1) / 2} y={ay + 22} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill={hit ? "#15803d" : "#a8a29e"}>
              {hit ? `✓ yes — at index ${step.foundIdx}` : `✗ no — store ${input[step.i]} → ${step.i}`}
            </text>
          </>
        );
      })()}

      <Output x={32} cy={252} label="result" value={step.found ?? "?"} />

      <Table
        x={TABLE_X}
        y={64}
        name="seen"
        keyLabel="value"
        valLabel="index"
        rows={step.seen}
        highlightKey={step.need}
        annotation="← match!"
      />
    </VizStage>
  );
}

export default {
  id: "two-sum",
  leetcode: 1,
  title: "Two Sum",
  difficulty: "Easy",
  tagline: "Return indices of the two numbers that add up to a target.",
  patternId: "arrays-hashing",
  constraint: "Exactly one solution; can't use the same element twice.",
  ProblemViz,
  examples: [
    { input: "[3,2,4], target=6", result: "[1,2]", ok: true },
    { input: "[3,2,4], target=10", result: "none", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    note: "The brute-force pair check is O(n²). Instead, store each value's index as you go; for the current x, its partner must equal target − x — and a hash map answers 'have I seen target − x?' in O(1). One pass, O(n).",
    code: `def twoSum(nums, target):
    seen = {}                 # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i`,
    codeHighlight: [4, 5, 6, 7],
    codeNote: "look up the complement",
    cases: [
      { id: "found", label: "target 6", result: "[1, 2]", ok: true, input: C1, target: 6, steps: C1_STEPS },
      { id: "none", label: "target 10 (none)", result: "none", ok: false, input: C2, target: 10, steps: C2_STEPS },
    ],
  },
};
