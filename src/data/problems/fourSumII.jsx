import { VizStage, VizArray, Table, Caption, Output, rowLayout } from "../../viz";

const W = 560;
const H = 320;
const CELL = 46;
const GAP = 10;
const ROWW = 200;
const ROW_A = 78;
const ROW_B = 138;
const TABLE_X = 320;

const A = [1, 2];
const B = [-2, -1];
const C = [-1, 2];
const D = [0, 2];

// Phase 'build': tally every a+b sum into a hashmap. Phase 'count': for each
// c+d, the partner sum we need is −(c+d); map[need] tuples complete to zero.
const STEPS = [
  { phase: "build", ai: 0, bi: 0, sum: -1, map: [{ k: -1, v: 1 }], status: "build: 1 + (−2) = −1 → map[−1] = 1" },
  { phase: "build", ai: 0, bi: 1, sum: 0, map: [{ k: -1, v: 1 }, { k: 0, v: 1 }], status: "build: 1 + (−1) = 0 → map[0] = 1" },
  { phase: "build", ai: 1, bi: 0, sum: 0, map: [{ k: -1, v: 1 }, { k: 0, v: 2 }], status: "build: 2 + (−2) = 0 → map[0] = 2" },
  { phase: "build", ai: 1, bi: 1, sum: 1, map: [{ k: -1, v: 1 }, { k: 0, v: 2 }, { k: 1, v: 1 }], status: "build: 2 + (−1) = 1 → map[1] = 1.  all a+b sums tallied" },
  { phase: "count", ci: 0, di: 0, sum: -1, need: 1, hit: 1, count: 1, map: [{ k: -1, v: 1 }, { k: 0, v: 2 }, { k: 1, v: 1 }], status: "count: −1 + 0 = −1 → need 1 → map[1] = 1 → count = 1" },
  { phase: "count", ci: 0, di: 1, sum: 1, need: -1, hit: 1, count: 2, map: [{ k: -1, v: 1 }, { k: 0, v: 2 }, { k: 1, v: 1 }], status: "count: −1 + 2 = 1 → need −1 → map[−1] = 1 → count = 2" },
  { phase: "count", ci: 1, di: 0, sum: 2, need: -2, hit: 0, count: 2, map: [{ k: -1, v: 1 }, { k: 0, v: 2 }, { k: 1, v: 1 }], status: "count: 2 + 0 = 2 → need −2 → not in map → count = 2" },
  { phase: "count", ci: 1, di: 1, sum: 4, need: -4, hit: 0, count: 2, found: 2, done: true, map: [{ k: -1, v: 1 }, { k: 0, v: 2 }, { k: 1, v: 1 }], status: "count: 2 + 2 = 4 → need −4 → not in map.  total tuples = 2" },
];

const fmt = (n) => (n < 0 ? `(${n})` : `${n}`);

function ProblemViz() {
  const cs = 44;
  const gap = 8;
  const rows = [
    { label: "A", arr: A, y: 70 },
    { label: "B", arr: B, y: 124 },
    { label: "C", arr: C, y: 178 },
    { label: "D", arr: D, y: 232 },
  ];
  return (
    <VizStage width={620} height={320}>
      <text x={310} y={32} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        count tuples (a, b, c, d) with a + b + c + d = 0
      </text>
      {rows.map(({ label, arr, y }) => {
        const pl = rowLayout({ count: arr.length, cellSize: cs, gap, width: 300 });
        const items = arr.map((n) => ({ value: n, variant: "default" }));
        return (
          <g key={label}>
            <text x={pl.originX - 14} y={y + cs / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#c2410c">{label}</text>
            <VizArray items={items} layout={pl} y={y} cellSize={cs} />
          </g>
        );
      })}
      <text x={430} y={150} fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#15803d">1 + (−2) + (−1) + 2 = 0</text>
      <text x={430} y={172} fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#15803d">2 + (−1) + (−1) + 0 = 0</text>
      <Caption joinX={280} cy={300} label="return" value="2" fill="#dcfce7" stroke="#15803d" color="#15803d" />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const build = step.phase === "build";
  const top = build ? { label1: "A", arr1: A, i1: step.ai, label2: "B", arr2: B, i2: step.bi }
                     : { label1: "C", arr1: C, i1: step.ci, label2: "D", arr2: D, i2: step.di };
  const layout = rowLayout({ count: 2, cellSize: CELL, gap: GAP, width: ROWW });
  const items1 = top.arr1.map((n, idx) => ({ value: n, variant: idx === top.i1 ? "active" : "default" }));
  const items2 = top.arr2.map((n, idx) => ({ value: n, variant: idx === top.i2 ? "active" : "default" }));
  const v1 = top.arr1[top.i1];
  const v2 = top.arr2[top.i2];

  return (
    <VizStage width={W} height={H}>
      <text x={32} y={26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">
        {build ? "phase 1 — tally every a + b sum" : "phase 2 — for each c + d, look up the partner −(c + d)"}
      </text>

      <text x={layout.originX - 12} y={ROW_A + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#c2410c">{top.label1}</text>
      <VizArray items={items1} layout={layout} y={ROW_A} cellSize={CELL} />
      <text x={layout.originX - 12} y={ROW_B + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#c2410c">{top.label2}</text>
      <VizArray items={items2} layout={layout} y={ROW_B} cellSize={CELL} />

      {build ? (
        <text x={32} y={224} fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#1a1814">
          {fmt(v1)} + {fmt(v2)} = <tspan fontWeight="700" fill="#c2410c">{step.sum}</tspan>
          <tspan fill="#57534e">  → map[{step.sum}]++</tspan>
        </text>
      ) : (
        <>
          <text x={32} y={224} fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#1a1814">
            {fmt(v1)} + {fmt(v2)} = <tspan fontWeight="700" fill="#c2410c">{step.sum}</tspan>
            <tspan fill="#57534e">  → need </tspan><tspan fontWeight="700" fill="#1d4ed8">{-step.sum}</tspan>
          </text>
          <text x={32} y={250} fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill={step.hit ? "#15803d" : "#a8a29e"}>
            {step.hit ? `✓ map[${-step.sum}] = ${step.hit} → count += ${step.hit}` : `✗ ${-step.sum} not in map → count += 0`}
          </text>
          <Output x={32} cy={288} label="tuples" value={step.count} />
        </>
      )}

      <Table
        x={TABLE_X}
        y={64}
        name="sums"
        keyLabel="a+b"
        valLabel="count"
        rows={step.map}
        highlightKey={build ? step.sum : step.hit ? -step.sum : null}
        annotation={build ? "← tallied" : "← partner"}
      />
    </VizStage>
  );
}

export default {
  id: "four-sum-ii",
  leetcode: 454,
  title: "4Sum II",
  difficulty: "Medium",
  tagline: "Count tuples (a,b,c,d), one from each array, summing to zero.",
  patternId: "arrays-hashing",
  constraint: "Four arrays of equal length n; count index tuples, not values.",
  ProblemViz,
  examples: [
    { input: "A=[1,2] B=[-2,-1] C=[-1,2] D=[0,2]", result: "2", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Brute force tries all four loops — O(n⁴). Split in half: tally every a+b sum from the first two arrays into a hash map (O(n²)). Then for each c+d, the rest must equal −(c+d) — and map[−(c+d)] says how many (a,b) pairs complete the zero. Two O(n²) passes → O(n²) total.",
    code: `def fourSumCount(A, B, C, D):
    cnt = {}
    for a in A:
        for b in B:
            cnt[a + b] = cnt.get(a + b, 0) + 1
    total = 0
    for c in C:
        for d in D:
            total += cnt.get(-(c + d), 0)
    return total`,
    codeHighlight: [2, 3, 4, 5, 8, 9, 10],
    codeNote: "tally a+b · look up −(c+d)",
    cases: [
      { id: "4sum", label: "sum to 0", result: "2", ok: true, steps: STEPS },
    ],
  },
};
