import { VizStage, VizArray, Pointer, Caption, Table, Output, rowLayout } from "../../viz";

const W = 820;
const H = 300;
const CELL = 56;
const GAP = 10;
const CELL_Y = 96;
const ARRAY_ZONE = 440;
const TABLE_X = 540;

const C1 = [3, 2, 4];

// One pass with a hash map value → index. For each x, check whether its
// complement (target − x) is already in the map. `seen` is the map at lookup
// time (before storing the current value).
const C1_STEPS = [
  { i: -1, need: null, foundIdx: null, found: null, seen: [], status: "seen = {} (value → index).  target = 6" },
  { i: 0, need: 3, foundIdx: null, found: null, seen: [], status: "x = 3. need 6 − 3 = 3 → not in seen → store 3 → 0" },
  { i: 1, need: 4, foundIdx: null, found: null, seen: [{ k: 3, v: 0 }], status: "x = 2. need 6 − 2 = 4 → not in seen → store 2 → 1" },
  { i: 2, need: 2, foundIdx: 1, found: "[1, 2]", done: true, seen: [{ k: 3, v: 0 }, { k: 2, v: 1 }], status: "x = 4. need 6 − 4 = 2 → seen at index 1 → return [1, 2]" },
];

const C2 = [3, 2, 4];
const C2_STEPS = [
  { i: -1, need: null, foundIdx: null, found: null, seen: [], status: "seen = {}.  target = 10" },
  { i: 0, need: 7, foundIdx: null, found: null, seen: [], status: "x = 3. need 10 − 3 = 7 → not in seen → store 3 → 0" },
  { i: 1, need: 8, foundIdx: null, found: null, seen: [{ k: 3, v: 0 }], status: "x = 2. need 8 → not in seen → store 2 → 1" },
  { i: 2, need: 6, foundIdx: null, found: null, seen: [{ k: 3, v: 0 }, { k: 2, v: 1 }], status: "x = 4. need 6 → not in seen → store 4 → 2" },
  { i: 3, done: true, need: null, foundIdx: null, found: "none", seen: [{ k: 3, v: 0 }, { k: 2, v: 1 }, { k: 4, v: 2 }], status: "no pair sums to 10" },
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
      <Caption joinX={330} cy={300} label="return" value="[1, 2]" fill="#dcfce7" stroke="#15803d" color="#15803d" />
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
      <text x={40} y={28} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">target = {target}</text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      {step.i >= 0 && !step.done && <Pointer centerX={layout.centerX(step.i)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="x" move={step.i < input.length - 1 ? "right" : null} />}

      {step.need != null && (
        <text x={40} y={186} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">
          need = target − x = {target} − {input[step.i]} = <tspan fontWeight="700" fill="#c2410c">{step.need}</tspan>
          {step.foundIdx != null ? <tspan fill="#15803d" fontWeight="700">  → at index {step.foundIdx}</tspan> : <tspan fill="#a8a29e">  → not in seen</tspan>}
        </text>
      )}

      <Output x={40} cy={240} label="result" value={step.found ?? "?"} />

      <Table
        x={TABLE_X}
        y={70}
        name="seen"
        keyLabel="value"
        valLabel="index"
        rows={step.seen}
        highlightKey={step.foundIdx != null ? step.need : null}
        annotation="← the complement"
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
