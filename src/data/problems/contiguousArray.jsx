import { VizStage, VizArray, Pointer, Caption, Table, Span, Output, rowLayout } from "../../viz";

const W = 860;
const H = 308;
const CELL = 50;
const GAP = 8;
const ARRAY_ZONE = 470;
const TABLE_X = 540;

const C1 = [0, 1, 0, 0, 1, 1, 0];
const C2 = [1, 1, 1];

// Map 0 → −1 so a balanced subarray (equal 0s and 1s) has running sum 0. The map
// stores the FIRST index each balance was seen; if a balance repeats, the span
// between is balanced. `foundIdx` = stored index when balance is already in the
// map (→ length i − foundIdx); otherwise we store this balance at index i.
const C1_STEPS = [
  { i: -1, balance: 0, seen: [{ k: 0, v: -1 }], foundIdx: null, best: 0, status: "start: seen = {0: -1} (balance 0 before the array), best = 0" },
  { i: 0, balance: -1, seen: [{ k: 0, v: -1 }], foundIdx: null, best: 0, status: "0 → −1. balance −1 is new → store at index 0" },
  { i: 1, balance: 0, seen: [{ k: 0, v: -1 }, { k: -1, v: 0 }], foundIdx: -1, best: 2, status: "1 → +1. balance 0 seen at −1 → length 1 − (−1) = 2. best = 2" },
  { i: 2, balance: -1, seen: [{ k: 0, v: -1 }, { k: -1, v: 0 }], foundIdx: 0, best: 2, status: "0 → −1. balance −1 seen at 0 → length 2 − 0 = 2. best = 2" },
  { i: 3, balance: -2, seen: [{ k: 0, v: -1 }, { k: -1, v: 0 }], foundIdx: null, best: 2, status: "0 → −1. balance −2 is new → store at index 3" },
  { i: 4, balance: -1, seen: [{ k: 0, v: -1 }, { k: -1, v: 0 }, { k: -2, v: 3 }], foundIdx: 0, best: 4, status: "1 → +1. balance −1 seen at 0 → length 4 − 0 = 4. best = 4" },
  { i: 5, balance: 0, seen: [{ k: 0, v: -1 }, { k: -1, v: 0 }, { k: -2, v: 3 }], foundIdx: -1, best: 6, status: "1 → +1. balance 0 seen at −1 → length 5 − (−1) = 6. best = 6" },
  { i: 6, balance: -1, seen: [{ k: 0, v: -1 }, { k: -1, v: 0 }, { k: -2, v: 3 }], foundIdx: 0, best: 6, status: "0 → −1. balance −1 seen at 0 → length 6 − 0 = 6. best = 6" },
  { i: 7, done: true, balance: -1, seen: [{ k: 0, v: -1 }, { k: -1, v: 0 }, { k: -2, v: 3 }], foundIdx: null, best: 6, status: "done → longest balanced subarray = 6" },
];

const C2_STEPS = [
  { i: -1, balance: 0, seen: [{ k: 0, v: -1 }], foundIdx: null, best: 0, status: "start: seen = {0: -1}, best = 0" },
  { i: 0, balance: 1, seen: [{ k: 0, v: -1 }], foundIdx: null, best: 0, status: "1 → +1. balance 1 is new → store at index 0" },
  { i: 1, balance: 2, seen: [{ k: 0, v: -1 }, { k: 1, v: 0 }], foundIdx: null, best: 0, status: "1 → +1. balance 2 is new → store at index 1" },
  { i: 2, balance: 3, seen: [{ k: 0, v: -1 }, { k: 1, v: 0 }, { k: 2, v: 1 }], foundIdx: null, best: 0, status: "1 → +1. balance 3 is new → store at index 2" },
  { i: 3, done: true, balance: 3, seen: [{ k: 0, v: -1 }, { k: 1, v: 0 }, { k: 2, v: 1 }, { k: 3, v: 2 }], foundIdx: null, best: 0, status: "done → no balance ever repeats → 0" },
];

function ProblemViz() {
  const nums = C1;
  const cs = 54;
  const gap = 8;
  const cy = 120;
  const pl = rowLayout({ count: nums.length, cellSize: cs, gap, width: 800 });
  const items = nums.map((n, idx) => ({ value: n, variant: idx <= 5 ? "default" : "muted" }));
  return (
    <VizStage width={800} height={340}>
      <Caption joinX={520} cy={56} label="longest subarray with equal 0s and 1s" value="" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <Span x1={pl.cellX(0)} x2={pl.cellX(5) + cs} y={cy + cs + 26} label="three 0s · three 1s — length 6" />
      <Caption joinX={360} cy={300} label="return" value="6" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const input = data.input;
  const balances = input.reduce((acc, v, idx) => (acc.push((acc[idx - 1] || 0) + (v === 1 ? 1 : -1)), acc), []);
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });
  const variantFor = (idx) => (step.i < 0 ? "muted" : idx === step.i ? "active" : idx < step.i ? "matched" : "muted");
  const nums = input.map((n, idx) => ({ value: n, variant: variantFor(idx) }));
  const bals = balances.map((b, idx) => ({ value: idx <= step.i ? b : "", variant: variantFor(idx) }));
  const found = step.foundIdx != null;
  const len = found ? step.i - step.foundIdx : null;
  const NUMS_Y = 58;
  const BAL_Y = 124;

  return (
    <VizStage width={W} height={H}>
      <text x={40} y={26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">map 0 → −1, 1 → +1</text>

      <text x={layout.originX - 12} y={NUMS_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">nums</text>
      <VizArray items={nums} layout={layout} y={NUMS_Y} cellSize={CELL} />
      {step.i >= 0 && !step.done && (
        <Pointer centerX={layout.centerX(step.i)} labelY={NUMS_Y - 26} tipY={NUMS_Y - 5} label="i" move={step.i < input.length - 1 ? "right" : null} />
      )}

      <text x={layout.originX - 12} y={BAL_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">balance</text>
      <VizArray items={bals} layout={layout} y={BAL_Y} cellSize={CELL} showIndices />
      {step.i >= 0 && !step.done && (
        <text x={layout.centerX(step.i)} y={BAL_Y + CELL + 32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#c2410c">↑ balance = {step.balance}</text>
      )}

      {found && (
        <text x={40} y={236} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">
          balance {step.balance} first seen at index <tspan fontWeight="700" fill="#c2410c">{step.foundIdx}</tspan> → length {step.i} − {step.foundIdx} = <tspan fontWeight="700" fill="#15803d">{len}</tspan>
        </text>
      )}

      <Output x={40} cy={278} label="longest" value={step.best} />

      <Table
        x={TABLE_X}
        y={64}
        name="seen"
        keyLabel="balance"
        valLabel="first index"
        rows={step.seen}
        highlightKey={found ? step.balance : null}
        annotation="← first seen here"
      />
    </VizStage>
  );
}

export default {
  id: "contiguous-array",
  leetcode: 525,
  title: "Contiguous Array",
  difficulty: "Medium",
  tagline: "Longest contiguous subarray with an equal number of 0s and 1s.",
  patternId: "prefix-sum",
  constraint: "Only 0s and 1s.",
  ProblemViz,
  examples: [
    { input: "[0,1,0,0,1,1,0]", result: "6", ok: true },
    { input: "[1,1,1]", result: "0", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Map 0 → −1 so 'equal 0s and 1s' becomes 'running sum 0'. Store the FIRST index each balance was seen (not a count): if the same balance reappears at index i, everything between cancels out, so the subarray (firstIdx, i] is balanced — length i − firstIdx. Keep the longest.",
    code: `def findMaxLength(nums):
    seen = {0: -1}
    balance = best = 0
    for i, x in enumerate(nums):
        balance += 1 if x == 1 else -1
        if balance in seen:
            best = max(best, i - seen[balance])
        else:
            seen[balance] = i
    return best`,
    codeHighlight: [5, 6, 7, 8, 9],
    codeNote: "balance + first-index map",
    cases: [
      { id: "balanced", label: "[0,1,0,0,1,1,0]", result: "6", ok: true, input: C1, steps: C1_STEPS },
      { id: "none", label: "[1,1,1] (none)", result: "0", ok: false, input: C2, steps: C2_STEPS },
    ],
  },
};
