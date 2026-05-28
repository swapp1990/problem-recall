import { VizStage, VizArray, Pointer, Caption, Deque, Table, Output, rowLayout } from "../../viz";

const W = 880;
const H = 300;
const CELL = 50;
const GAP = 8;
const ROW_Y = 104;   // first row (nums2 / nums1) — leaves room for the pointer above
const ANS_Y = 200;   // second row (stack / answer)
const ARRAY_ZONE = 380;
const TABLE_X = 470;
const STACK_X = 470;

// The two LeetCode examples. The problem card uses example 1.
const NUMS2 = [1, 3, 4, 2];
const NUMS1 = [4, 1, 2];

// Phase 'build': one monotonic-stack pass over nums2. The stack holds values
// still waiting for a bigger one. When a bigger value arrives it pops every
// smaller value it beats (one pop per frame, flashed red) — that popped value's
// next-greater IS this value — then is pushed. Phase 'answer': O(1) map lookups.
// `popping`/`pushed` drive the Deque red/green; `hot` highlights the map row.

// ---- Example 1: nums1=[4,1,2], nums2=[1,3,4,2] → [-1,3,-1] ----
const A_M = [{ k: 1, v: 3 }, { k: 3, v: 4 }];
const A_MF = [...A_M, { k: 4, v: -1 }, { k: 2, v: -1 }];
const STEPS_A = [
  { phase: "build", i: 0, stack: [1], pushed: 1, map: [], status: "1 → push (nothing bigger yet)" },
  { phase: "build", i: 1, stack: [1], popping: 1, map: [{ k: 1, v: 3 }], hot: 1, status: "3 > 1 → pop · next greater of 1 is 3" },
  { phase: "build", i: 1, stack: [3], pushed: 3, map: [{ k: 1, v: 3 }], status: "3 → push" },
  { phase: "build", i: 2, stack: [3], popping: 3, map: A_M, hot: 3, status: "4 > 3 → pop · next greater of 3 is 4" },
  { phase: "build", i: 2, stack: [4], pushed: 4, map: A_M, status: "4 → push" },
  { phase: "build", i: 3, stack: [4, 2], pushed: 2, map: A_M, status: "2 < 4 → push (still waiting)" },
  { phase: "build", i: 4, stack: [4, 2], map: A_MF, status: "scan done · 4 and 2 still waiting → no next greater → −1" },
  { phase: "answer", j: 0, lookup: 4, ans: [-1, null, null], map: A_MF, hot: 4, status: "nums1[0] = 4 → map[4] = −1" },
  { phase: "answer", j: 1, lookup: 1, ans: [-1, 3, null], map: A_MF, hot: 1, status: "nums1[1] = 1 → map[1] = 3" },
  { phase: "answer", j: 2, lookup: 2, ans: [-1, 3, -1], done: true, map: A_MF, hot: 2, status: "nums1[2] = 2 → map[2] = −1.  answer = [−1, 3, −1]" },
];

// ---- Example 2: nums1=[2,4], nums2=[1,2,3,4] → [3,-1] ----
const B_NUMS2 = [1, 2, 3, 4];
const B_NUMS1 = [2, 4];
const B_M = [{ k: 1, v: 2 }, { k: 2, v: 3 }, { k: 3, v: 4 }];
const B_MF = [...B_M, { k: 4, v: -1 }];
const STEPS_B = [
  { phase: "build", i: 0, stack: [1], pushed: 1, map: [], status: "1 → push" },
  { phase: "build", i: 1, stack: [1], popping: 1, map: [{ k: 1, v: 2 }], hot: 1, status: "2 > 1 → pop · next greater of 1 is 2" },
  { phase: "build", i: 1, stack: [2], pushed: 2, map: [{ k: 1, v: 2 }], status: "2 → push" },
  { phase: "build", i: 2, stack: [2], popping: 2, map: [{ k: 1, v: 2 }, { k: 2, v: 3 }], hot: 2, status: "3 > 2 → pop · next greater of 2 is 3" },
  { phase: "build", i: 2, stack: [3], pushed: 3, map: [{ k: 1, v: 2 }, { k: 2, v: 3 }], status: "3 → push" },
  { phase: "build", i: 3, stack: [3], popping: 3, map: B_M, hot: 3, status: "4 > 3 → pop · next greater of 3 is 4" },
  { phase: "build", i: 3, stack: [4], pushed: 4, map: B_M, status: "4 → push" },
  { phase: "build", i: 4, stack: [4], map: B_MF, status: "scan done · 4 still waiting → no next greater → −1" },
  { phase: "answer", j: 0, lookup: 2, ans: [3, null], map: B_MF, hot: 2, status: "nums1[0] = 2 → map[2] = 3" },
  { phase: "answer", j: 1, lookup: 4, ans: [3, -1], done: true, map: B_MF, hot: 4, status: "nums1[1] = 4 → map[4] = −1.  answer = [3, −1]" },
];

function ProblemViz() {
  // nums2 drawn as bars (height = value) so "greater" reads at a glance: the
  // next greater is the first TALLER bar to the right.
  const barW = 46, gap = 24, unit = 27;
  const baseX = 152, baseY = 238;
  const x = (i) => baseX + i * (barW + gap);
  const cx = (i) => x(i) + barW / 2;
  const top = (i) => baseY - NUMS2[i] * unit;
  const queryIdx = new Set([0, 2, 3]); // nums1 values 4,1,2 inside nums2 (idx 2,0,3)
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

      {/* 1 (bar 0) → its next greater is 3 (bar 1) */}
      <path d={`M ${cx(0)} ${top(0) - 12} Q ${(cx(0) + cx(1)) / 2} ${Math.min(top(0), top(1)) - 30} ${cx(1)} ${top(1) - 12}`}
        stroke="#15803d" strokeWidth={2.5} fill="none" markerEnd="url(#ngArrow)" />
      {/* 4 (bar 2) and 2 (bar 3) have nothing bigger to their right */}
      <text x={cx(2)} y={top(2) - 32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="17" fontWeight="700" fill="#b91c1c">−1</text>
      <text x={cx(3)} y={top(3) - 32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="17" fontWeight="700" fill="#b91c1c">−1</text>

      <text x={280} y={baseY + 42} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#c2410c">ask for nums1 = [4, 1, 2]</text>

      <Caption joinX={232} cy={300} label="return" value="[-1, 3, -1]" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const nums2 = data.nums2;
  const nums1 = data.nums1;
  const build = step.phase === "build";
  const layout = rowLayout({ count: nums2.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });
  const layout1 = rowLayout({ count: nums1.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });

  const n2Items = nums2.map((n, idx) => ({ value: n, variant: build ? (idx === step.i ? "active" : idx < step.i ? "matched" : "muted") : "matched" }));
  const n1Items = nums1.map((n, idx) => ({ value: n, variant: !build && idx === step.j ? "active" : !build && idx < step.j ? "matched" : "muted" }));
  const stackItems = build ? step.stack.map((v) => ({ value: v, variant: v === step.popping ? "pop" : v === step.pushed ? "new" : "default" })) : [];
  const ansItems = (step.ans || []).map((v, idx) => ({ value: v == null ? "" : v, variant: v == null ? "muted" : idx === step.j ? "active" : "matched" }));

  return (
    <VizStage width={W} height={H}>
      <text x={40} y={34} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">{build ? "phase 1 — build next-greater map (stack over nums2)" : "phase 2 — answer nums1 by O(1) lookup"}</text>

      {build ? (
        <>
          <text x={layout.originX - 12} y={ROW_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">nums2</text>
          <VizArray items={n2Items} layout={layout} y={ROW_Y} cellSize={CELL} showIndices />
          {step.i < nums2.length && <Pointer centerX={layout.centerX(step.i)} labelY={ROW_Y - 24} tipY={ROW_Y - 4} label="x" move={step.i < nums2.length - 1 ? "right" : null} />}
          <text x={40} y={ANS_Y + 30} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">stack ↓</text>
          <Deque x={120} y={ANS_Y + 6} items={stackItems} cellW={46} cellH={46} frontLabel="bottom" backLabel="top ↓" emptyLabel="(empty)" />
        </>
      ) : (
        <>
          <text x={layout1.originX - 12} y={ROW_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">nums1</text>
          <VizArray items={n1Items} layout={layout1} y={ROW_Y} cellSize={CELL} showIndices />
          <Pointer centerX={layout1.centerX(step.j)} labelY={ROW_Y - 24} tipY={ROW_Y - 4} label="x" move={step.j < nums1.length - 1 ? "right" : null} />
          <text x={layout1.originX - 12} y={ANS_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">answer</text>
          <VizArray items={ansItems} layout={layout1} y={ANS_Y} cellSize={CELL} />
        </>
      )}

      <Table x={TABLE_X} y={88} name="next" keyLabel="value" valLabel="next greater" rows={step.map} highlightKey={step.hot} annotation={build ? "← resolved" : "← lookup"} />
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
  examples: [
    { input: "nums1=[4,1,2], nums2=[1,3,4,2]", result: "[-1,3,-1]", ok: true },
    { input: "nums1=[2,4], nums2=[1,2,3,4]", result: "[3,-1]", ok: true },
  ],
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
    cases: [
      { id: "ex1", label: "nums2=[1,3,4,2]", result: "[-1, 3, -1]", ok: true, nums2: NUMS2, nums1: NUMS1, steps: STEPS_A },
      { id: "ex2", label: "nums2=[1,2,3,4]", result: "[3, -1]", ok: true, nums2: B_NUMS2, nums1: B_NUMS1, steps: STEPS_B },
    ],
  },
};
