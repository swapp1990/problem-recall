import { VizStage, VizArray, Cell, Pointer, Caption, Output, rowLayout } from "../../viz";

const W = 720;
const H = 340;
const CELL = 50;
const GAP = 8;

const NUMS = [1, 2, 3];

// ---- Problem viz: the QUESTION, not the method. nums on top, the full power
// set (2³ = 8 subsets) laid out below — what "all subsets" means, method-free.
const POWER_SET = ["[ ]", "[1]", "[2]", "[3]", "[1,2]", "[1,3]", "[2,3]", "[1,2,3]"];

function ProblemViz() {
  const cs = 56;
  const gap = 8;
  const cy = 96;
  const pl = rowLayout({ count: NUMS.length, cellSize: cs, gap, width: 760 });
  const items = NUMS.map((n) => ({ value: n }));
  return (
    <VizStage width={760} height={320}>
      <Caption joinX={380} cy={44} label="every subset of" value="[1, 2, 3]" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={380} y={cy + cs + 40} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#57534e">
        pick any combination — including none and all
      </text>
      {POWER_SET.map((s, k) => (
        <text
          key={k}
          x={120 + (k % 4) * 150}
          y={cy + cs + 78 + Math.floor(k / 4) * 30}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="16"
          fontWeight="600"
          fill="#15803d"
        >
          {s}
        </text>
      ))}
      <Caption joinX={340} cy={300} label="count" value="2³ = 8" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={18} height={32} />
    </VizStage>
  );
}

// ---- Solution steps: DFS over nums. `path` is state AFTER the action; `res`
// snapshots the accumulated subsets; `i` drives the pointer on choose frames.
const r = (...subs) => subs;
const S = (path, res, kind, status, i = null) => ({ path, res, kind, status, i });

const STEPS = [
  S([], r("[]"), "record", "record the empty subset → []"),
  S([1], r("[]"), "choose", "choose nums[0] = 1", 0),
  S([1], r("[]", "[1]"), "record", "record [1]"),
  S([1, 2], r("[]", "[1]"), "choose", "go deeper → choose nums[1] = 2", 1),
  S([1, 2], r("[]", "[1]", "[1,2]"), "record", "record [1, 2]"),
  S([1, 2, 3], r("[]", "[1]", "[1,2]"), "choose", "go deeper → choose nums[2] = 3", 2),
  S([1, 2, 3], r("[]", "[1]", "[1,2]", "[1,2,3]"), "record", "record [1, 2, 3]"),
  S([1, 2], r("[]", "[1]", "[1,2]", "[1,2,3]"), "unchoose", "no choices left → un-choose 3"),
  S([1], r("[]", "[1]", "[1,2]", "[1,2,3]"), "unchoose", "un-choose 2 → back up"),
  S([1, 3], r("[]", "[1]", "[1,2]", "[1,2,3]"), "choose", "try the next → choose nums[2] = 3", 2),
  S([1, 3], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]"), "record", "record [1, 3]"),
  S([1], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]"), "unchoose", "un-choose 3"),
  S([], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]"), "unchoose", "un-choose 1 → back to the start"),
  S([2], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]"), "choose", "choose nums[1] = 2", 1),
  S([2], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]", "[2]"), "record", "record [2]"),
  S([2, 3], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]", "[2]"), "choose", "go deeper → choose nums[2] = 3", 2),
  S([2, 3], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]", "[2]", "[2,3]"), "record", "record [2, 3]"),
  S([2], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]", "[2]", "[2,3]"), "unchoose", "un-choose 3"),
  S([], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]", "[2]", "[2,3]"), "unchoose", "un-choose 2"),
  S([3], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]", "[2]", "[2,3]"), "choose", "choose nums[2] = 3", 2),
  S([3], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]", "[2]", "[2,3]", "[3]"), "record", "record [3]"),
  S([], r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]", "[2]", "[2,3]", "[3]"), "unchoose", "un-choose 3 → every branch explored"),
  { path: [], res: r("[]", "[1]", "[1,2]", "[1,2,3]", "[1,3]", "[2]", "[2,3]", "[3]"), kind: "done", status: "all 2³ = 8 subsets found", done: true },
];

function SolutionViz({ data, step }) {
  const nums = data.input;
  const choosing = step.kind === "choose";
  const layout = rowLayout({ count: nums.length, cellSize: CELL, gap: GAP, width: 280 });
  const numItems = nums.map((n, idx) => ({
    value: n,
    variant: choosing && idx === step.i ? "active" : "default",
  }));

  const pathX = 40;
  const pathY = 184;
  const color = step.kind === "unchoose" ? "#b91c1c" : step.kind === "record" || step.kind === "done" ? "#15803d" : "#1a1814";

  return (
    <VizStage width={W} height={H}>
      <text x={40} y={28} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">DFS over nums — choose · record · un-choose</text>

      <text x={40} y={70} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">nums</text>
      <VizArray items={numItems} layout={layout} y={86} cellSize={CELL} showIndices />
      {choosing && (
        <Pointer centerX={layout.centerX(step.i)} labelY={86 - 26} tipY={86 - 5} label="i" />
      )}

      <text x={pathX} y={pathY - 14} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">path</text>
      {step.path.length === 0 ? (
        <text x={pathX + 6} y={pathY + CELL * 0.64} fontFamily="JetBrains Mono, monospace" fontSize="22" fill="#a8a29e">∅</text>
      ) : (
        step.path.map((v, k) => (
          <Cell
            key={k}
            x={pathX + k * (CELL + GAP)}
            y={pathY}
            size={CELL}
            value={v}
            variant={k === step.path.length - 1 && choosing ? "active" : "matched"}
          />
        ))
      )}

      <Output x={388} cy={266} label="subsets found" value={step.res.length} />

      <text x={388} y={70} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">results</text>
      {step.res.map((s, k) => {
        const isLatest = k === step.res.length - 1 && step.kind === "record";
        return (
          <text
            key={k}
            x={388 + (k % 2) * 150}
            y={86 + Math.floor(k / 2) * 26}
            fontFamily="JetBrains Mono, monospace"
            fontSize="15"
            fontWeight={isLatest ? 700 : 500}
            fill={isLatest ? "#15803d" : "#1a1814"}
          >
            {s}
          </text>
        );
      })}

      <text x={40} y={H - 18} fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill={color}>{step.status}</text>
    </VizStage>
  );
}

export default {
  id: "subsets",
  leetcode: 78,
  title: "Subsets",
  difficulty: "Medium",
  tagline: "Return every possible subset (the power set) of a list of distinct integers.",
  patternId: "backtracking",
  constraint: "All numbers are distinct; the answer may be returned in any order.",
  ProblemViz,
  examples: [
    { input: "[1,2,3]", result: "[[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]", ok: true },
    { input: "[0]", result: "[[], [0]]", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Walk a decision tree: at each index, you either include nums[i] in the current path or not. backtrack(start) first RECORDS the path as a finished subset, then for every remaining index it CHOOSES that number, recurses, and UN-CHOOSES (pops) before trying the next. The pop is what lets one shared `path` array explore every branch. 2ⁿ subsets, each up to length n → O(n · 2ⁿ).",
    code: `def subsets(nums):
    res = []
    path = []

    def backtrack(start):
        res.append(path[:])            # record the current subset
        for i in range(start, len(nums)):
            path.append(nums[i])       # choose nums[i]
            backtrack(i + 1)           # explore with the rest
            path.pop()                 # un-choose, try the next

    backtrack(0)
    return res`,
    codeHighlight: [6, 7, 8, 9, 10],
    codeNote: "record on entry · choose → recurse → un-choose for each remaining index",
    cases: [
      { id: "subsets123", label: "[1, 2, 3]", result: "8 subsets", ok: true, input: NUMS, steps: STEPS },
    ],
  },
};
