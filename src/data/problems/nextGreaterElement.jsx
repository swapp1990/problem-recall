import { VizStage, VizArray, Pointer, Caption, Deque, Table, Output, rowLayout } from "../../viz";

const W = 880;
const H = 300;
const CELL = 50;
const GAP = 8;
const ROW_Y = 60;
const ANS_Y = 132;
const ARRAY_ZONE = 380;
const TABLE_X = 470;
const STACK_X = 470;

const NUMS2 = [1, 3, 4, 2];
const NUMS1 = [4, 1, 2];

// Phase 'build': one monotonic-stack pass over nums2 records each value's next
// greater into a map. Phase 'answer': each nums1 value is an O(1) map lookup.
const STEPS = [
  { phase: "build", i: 0, stack: [1], map: [], status: "1 → push (waiting for something bigger)" },
  { phase: "build", i: 1, stack: [3], map: [{ k: 1, v: 3 }], status: "3 > 1 → next greater of 1 is 3 · push 3", hot: 1 },
  { phase: "build", i: 2, stack: [4], map: [{ k: 1, v: 3 }, { k: 3, v: 4 }], status: "4 > 3 → next greater of 3 is 4 · push 4", hot: 3 },
  { phase: "build", i: 3, stack: [4, 2], map: [{ k: 1, v: 3 }, { k: 3, v: 4 }], status: "2 < 4 → push (waiting)" },
  { phase: "build", i: 4, stack: [], map: [{ k: 1, v: 3 }, { k: 3, v: 4 }, { k: 4, v: -1 }, { k: 2, v: -1 }], status: "nothing left → 4 and 2 have no next greater → −1" },
  { phase: "answer", j: 0, lookup: 4, ans: [-1, null, null], map: [{ k: 1, v: 3 }, { k: 3, v: 4 }, { k: 4, v: -1 }, { k: 2, v: -1 }], status: "nums1[0] = 4 → map[4] = −1", hot: 4 },
  { phase: "answer", j: 1, lookup: 1, ans: [-1, 3, null], map: [{ k: 1, v: 3 }, { k: 3, v: 4 }, { k: 4, v: -1 }, { k: 2, v: -1 }], status: "nums1[1] = 1 → map[1] = 3", hot: 1 },
  { phase: "answer", j: 2, lookup: 2, ans: [-1, 3, -1], done: true, map: [{ k: 1, v: 3 }, { k: 3, v: 4 }, { k: 4, v: -1 }, { k: 2, v: -1 }], status: "nums1[2] = 2 → map[2] = −1.  answer = [−1, 3, −1]", hot: 2 },
];

function ProblemViz() {
  const cs = 56;
  const gap = 10;
  const pl = rowLayout({ count: NUMS2.length, cellSize: cs, gap, width: 720 });
  const pl1 = rowLayout({ count: NUMS1.length, cellSize: cs, gap, width: 720 });
  const n2 = NUMS2.map((n) => ({ value: n, variant: "default" }));
  const n1 = NUMS1.map((n) => ({ value: n, variant: "active" }));
  return (
    <VizStage width={720} height={320}>
      <Caption joinX={520} cy={48} label="for each of nums1, its next greater in nums2" value="" />
      <text x={pl.originX - 14} y={100 + cs / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#57534e">nums2</text>
      <VizArray items={n2} layout={pl} y={100} cellSize={cs} />
      <text x={pl1.originX - 14} y={196 + cs / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#c2410c">nums1</text>
      <VizArray items={n1} layout={pl1} y={196} cellSize={cs} />
      <Caption joinX={320} cy={300} label="return" value="[-1, 3, -1]" fill="#dcfce7" stroke="#15803d" color="#15803d" />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const build = step.phase === "build";
  const layout = rowLayout({ count: NUMS2.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });
  const layout1 = rowLayout({ count: NUMS1.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });

  const n2Items = NUMS2.map((n, idx) => ({ value: n, variant: build ? (idx === step.i ? "active" : idx < step.i ? "matched" : "muted") : "matched" }));
  const n1Items = NUMS1.map((n, idx) => ({ value: n, variant: !build && idx === step.j ? "active" : !build && idx < step.j ? "matched" : "muted" }));
  const stackItems = build ? step.stack.map((v) => ({ value: v, variant: v === NUMS2[step.i] ? "new" : "default" })) : [];
  const ansItems = (step.ans || []).map((v, idx) => ({ value: v == null ? "" : v, variant: v == null ? "muted" : idx === step.j ? "active" : "matched" }));

  return (
    <VizStage width={W} height={H}>
      <text x={40} y={26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">{build ? "phase 1 — build next-greater map (stack over nums2)" : "phase 2 — answer nums1 by O(1) lookup"}</text>

      {build ? (
        <>
          <text x={layout.originX - 12} y={ROW_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">nums2</text>
          <VizArray items={n2Items} layout={layout} y={ROW_Y} cellSize={CELL} showIndices />
          {!step.done && <Pointer centerX={layout.centerX(step.i)} labelY={ROW_Y - 24} tipY={ROW_Y - 4} label="x" move={step.i < NUMS2.length - 1 ? "right" : null} />}
          <text x={40} y={ANS_Y + 30} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">stack</text>
          <Deque x={120} y={ANS_Y + 6} items={stackItems} cellW={46} cellH={46} frontLabel="bottom" backLabel="top" emptyLabel="(empty)" />
        </>
      ) : (
        <>
          <text x={layout1.originX - 12} y={ROW_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">nums1</text>
          <VizArray items={n1Items} layout={layout1} y={ROW_Y} cellSize={CELL} showIndices />
          <Pointer centerX={layout1.centerX(step.j)} labelY={ROW_Y - 24} tipY={ROW_Y - 4} label="x" move={step.j < NUMS1.length - 1 ? "right" : null} />
          <text x={layout1.originX - 12} y={ANS_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">answer</text>
          <VizArray items={ansItems} layout={layout1} y={ANS_Y} cellSize={CELL} />
        </>
      )}

      <Table x={TABLE_X} y={64} name="next" keyLabel="value" valLabel="next greater" rows={step.map} highlightKey={step.hot} annotation={build ? "← resolved" : "← lookup"} />
    </VizStage>
  );
}

export default {
  id: "next-greater-element",
  leetcode: 496,
  title: "Next Greater Element I",
  difficulty: "Easy",
  tagline: "For each value in nums1, find its next greater element in nums2.",
  patternId: "monotonic-stack",
  constraint: "nums1 is a subset of nums2; values are distinct.",
  ProblemViz,
  examples: [{ input: "nums1=[4,1,2], nums2=[1,3,4,2]", result: "[-1,3,-1]", ok: true }],
  solution: {
    Viz: SolutionViz,
    note: "One monotonic-stack pass over nums2 finds every value's next greater (each value is resolved when a bigger one appears) and stores it in a map. Then each nums1 query is an O(1) lookup — the stack does the work once, the map reuses it.",
    code: `def nextGreaterElement(nums1, nums2):
    nxt, stack = {}, []
    for x in nums2:
        while stack and x > stack[-1]:
            nxt[stack.pop()] = x
        stack.append(x)
    return [nxt.get(x, -1) for x in nums1]`,
    codeHighlight: [3, 4, 5, 6],
    codeNote: "stack builds the map · then look up",
    cases: [{ id: "ng", label: "nums1=[4,1,2]", result: "[-1, 3, -1]", ok: true, input: NUMS2, steps: STEPS }],
  },
};
