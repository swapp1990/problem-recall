import { VizStage, VizArray, Table, Output, rowLayout } from "../../viz";

const W = 660;
const H = 300;
const CELL = 52;
const GAP = 10;
const CELL_Y = 120;
const TABLE_X = 420;

// Each step is one operation on the structure. `vals` = the backing array,
// `map` = value → its index in that array. remove() swaps the last value into
// the hole and pops, so the array stays gap-free and every op is O(1).
const STEPS = [
  { op: "insert(1)", vals: [1], map: [{ k: 1, v: 0 }], hi: 0, found: null, status: "insert(1): append at the end, record its index → map{1: 0}" },
  { op: "insert(2)", vals: [1, 2], map: [{ k: 1, v: 0 }, { k: 2, v: 1 }], hi: 1, found: null, status: "insert(2): append → map{2: 1}" },
  { op: "remove(1)", vals: [2], map: [{ k: 2, v: 0 }], hi: 0, swap: { fromVal: 2, toIdx: 0 }, found: null, status: "remove(1): copy the LAST value (2) into slot 0, pop the tail, fix map → {2: 0}" },
  { op: "insert(3)", vals: [2, 3], map: [{ k: 2, v: 0 }, { k: 3, v: 1 }], hi: 1, found: null, status: "insert(3): append → map{3: 1}" },
  { op: "getRandom()", vals: [2, 3], map: [{ k: 2, v: 0 }, { k: 3, v: 1 }], hi: null, found: 2, done: true, status: "getRandom(): pick a uniform index in 0…1 → value 2 (or 3), each with p = 1/2" },
];

function ProblemViz() {
  return (
    <VizStage width={680} height={300}>
      <text x={340} y={40} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        insert · remove · getRandom — all in O(1) average
      </text>
      <text x={60} y={96} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">array</text>
      <text x={60} y={120} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#1a1814">[ a, b, c, … ]</text>
      <text x={60} y={150} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="12" fill="#a8a29e">contiguous → O(1) random by index</text>

      <text x={60} y={196} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">map</text>
      <text x={60} y={220} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#1a1814">{`{ value : index }`}</text>
      <text x={60} y={250} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="12" fill="#a8a29e">→ O(1) find-and-remove (swap with last)</text>

      <text x={420} y={150} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">array gives random;<tspan x="420" dy="20">map gives lookup</tspan></text>
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const layout = rowLayout({ count: Math.max(step.vals.length, 1), cellSize: CELL, gap: GAP, width: 320 });
  const lastIdx = step.vals.length - 1;
  const items = step.vals.map((n, idx) => ({
    value: n,
    variant: step.swap && idx === step.swap.toIdx ? "active" : idx === step.hi ? "active" : "default",
  }));

  return (
    <VizStage width={W} height={H}>
      <text x={32} y={26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">operation</text>
      <text x={32} y={50} fontFamily="JetBrains Mono, monospace" fontSize="18" fontWeight="700" fill="#c2410c">{step.op}</text>

      <text x={layout.originX - 12} y={CELL_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">array</text>
      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />

      {step.swap && (
        <text x={layout.originX} y={CELL_Y + CELL + 34} fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#c2410c">
          last value ({step.swap.fromVal}) → slot {step.swap.toIdx}, then pop — no hole left
        </text>
      )}

      {step.done && <Output x={32} cy={CELL_Y + CELL + 54} label="getRandom" value={step.found} />}

      <Table
        x={TABLE_X}
        y={70}
        name="idx"
        keyLabel="value"
        valLabel="index"
        rows={step.map}
        highlightKey={step.swap ? step.swap.fromVal : null}
        annotation={step.swap ? "← reindexed" : null}
      />
    </VizStage>
  );
}

export default {
  id: "insert-delete-getrandom",
  leetcode: 380,
  title: "Insert Delete GetRandom O(1)",
  difficulty: "Medium",
  tagline: "A set supporting insert, remove, and uniform getRandom in O(1).",
  patternId: "arrays-hashing",
  constraint: "All three operations must be O(1) average; getRandom uniform.",
  ProblemViz,
  examples: [
    { input: "insert,insert,remove,insert,getRandom", result: "2 or 3", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "getRandom needs an array (random index in O(1)); remove needs to find a value fast (a hash map value→index). The trick that keeps both O(1): to delete, overwrite the slot with the LAST array element, fix that element's index in the map, then pop the tail — so the array never has a hole and stays perfectly indexable.",
    code: `class RandomizedSet:
    def __init__(self):
        self.vals, self.idx = [], {}
    def insert(self, x):
        if x in self.idx: return False
        self.idx[x] = len(self.vals); self.vals.append(x)
        return True
    def remove(self, x):
        if x not in self.idx: return False
        i, last = self.idx[x], self.vals[-1]
        self.vals[i] = last; self.idx[last] = i
        self.vals.pop(); del self.idx[x]
        return True
    def getRandom(self):
        return random.choice(self.vals)`,
    codeHighlight: [10, 11, 12, 13],
    codeNote: "swap-with-last keeps the array gap-free",
    cases: [
      { id: "rset", label: "insert/remove/random", result: "2 or 3", ok: true, steps: STEPS },
    ],
  },
};
