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
  // nums2 drawn as bars (height = value) so "greater" reads at a glance: the
  // next greater is the first TALLER bar to the right.
  const barW = 48, gap = 26, unit = 27;
  const baseX = 148, baseY = 238;
  const x = (i) => baseX + i * (barW + gap);
  const cx = (i) => x(i) + barW / 2;
  const top = (i) => baseY - NUMS2[i] * unit;
  const queryIdx = new Set([0, 2, 3]); // nums1 values 1,4,2 inside nums2
  return (
    <VizStage width={560} height={324}>
      <text x={280} y={36} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        next greater = first taller bar to the right →
      </text>
      <defs>
        <marker id="ngArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#15803d" />
        </marker>
      </defs>

      {NUMS2.map((v, i) => {
        const q = queryIdx.has(i);
        return (
          <g key={i}>
            <rect x={x(i)} y={top(i)} width={barW} height={v * unit} rx={3}
              fill={q ? "#fef3e9" : "#f5f5f4"} stroke={q ? "#c2410c" : "#d6d3d1"} strokeWidth={q ? 2 : 1.2} />
            <text x={cx(i)} y={top(i) - 8} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill={q ? "#c2410c" : "#57534e"}>{v}</text>
            <text x={cx(i)} y={baseY + 16} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#a8a29e">{i}</text>
          </g>
        );
      })}
      <line x1={baseX - 8} y1={baseY} x2={x(NUMS2.length - 1) + barW + 8} y2={baseY} stroke="#d6d3d1" strokeWidth={1.5} />

      {/* query 1 (bar 0) → first taller bar to the right is 3 (bar 1) */}
      <path d={`M ${cx(0)} ${top(0) - 12} Q ${(cx(0) + cx(1)) / 2} ${top(1) - 34} ${cx(1)} ${top(1) - 12}`}
        stroke="#15803d" strokeWidth={2.5} fill="none" markerEnd="url(#ngArrow)" />
      {/* queries 4 (bar 2) and 2 (bar 3) → nothing taller to the right */}
      <text x={cx(2)} y={top(2) - 32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="17" fontWeight="700" fill="#b91c1c">−1</text>
      <text x={cx(3)} y={top(3) - 32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="17" fontWeight="700" fill="#b91c1c">−1</text>

      <text x={280} y={baseY + 42} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#c2410c">ask for nums1 = [4, 1, 2]</text>

      <Caption joinX={232} cy={300} label="return" value="[-1, 3, -1]" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
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
