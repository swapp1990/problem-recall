import { VizStage, Interval, Caption } from "../../viz";

const W = 760;
const H = 320;
const LO = 0, HI = 19;
const AX0 = 64, AX1 = 712;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

// 4 intervals identified by id so we can reorder lanes during the sort step.
const IV = { A: [1, 3], B: [2, 6], C: [8, 10], D: [15, 18] };
const GIVEN = ["B", "C", "A", "D"];   // the input as handed to you (NOT sorted)
const SORTED = ["A", "B", "C", "D"];  // by start: 1, 2, 8, 15
const INPUT = SORTED.map((id) => IV[id]);

// `out` is the merged list so far. The LAST bar in `out` is "still open" (it
// can still grow); earlier bars are finalized. Each sweep frame either grows
// the last bar (because the current input overlaps it) or appends a new bar
// (because there's a gap). The visual change IS the explanation.
const STEPS = [
  { phase: "given", order: GIVEN, cur: null, out: [], status: "the input as given — not yet sorted" },
  { phase: "sort", order: SORTED, cur: null, out: [], status: "step 1 · sort by start" },
  { phase: "sweep", order: SORTED, cur: "A", out: [[1, 3]], action: "first", status: "start with the first interval [1, 3]" },
  { phase: "sweep", order: SORTED, cur: "B", out: [[1, 6]], action: "merge", status: "[2,6] reaches into [1,3] → they touch · grow the green bar to [1, 6]" },
  { phase: "sweep", order: SORTED, cur: "C", out: [[1, 6], [8, 10]], action: "new", status: "[8,10] doesn't touch [1,6] → gap · start a fresh green bar" },
  { phase: "sweep", order: SORTED, cur: "D", out: [[1, 6], [8, 10], [15, 18]], action: "new", status: "[15,18] doesn't touch [8,10] → gap · start a fresh green bar" },
  { phase: "done", order: SORTED, cur: null, out: [[1, 6], [8, 10], [15, 18]], action: "done", done: true, status: "done — 4 input intervals merged into 3" },
];

const SORTED_IDX = Object.fromEntries(SORTED.map((id, i) => [id, i]));

const lbl = ([a, b]) => `[${a},${b}]`;

function Axis({ y }) {
  return (
    <>
      <line x1={AX0} y1={y} x2={AX1} y2={y} stroke="#d6d3d1" strokeWidth={1.5} />
      {Array.from({ length: 10 }, (_, t) => {
        const v = t * 2 + 1;
        return (
          <g key={v}>
            <line x1={sx(v)} y1={y - 3} x2={sx(v)} y2={y + 3} stroke="#d6d3d1" strokeWidth={1} />
            <text x={sx(v)} y={y + 16} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#a8a29e">{v}</text>
          </g>
        );
      })}
    </>
  );
}

function ProblemViz() {
  const laneY = [62, 90, 118, 146];
  const overlapping = new Set([0, 1]); // [1,3] & [2,6] overlap
  const RESULT = [[1, 6], [8, 10], [15, 18]];
  return (
    <VizStage width={W} height={340}>
      <text x={W / 2} y={32} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        merge every group of overlapping intervals into one
      </text>
      <text x={AX0 - 12} y={laneY[1] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">input</text>
      {INPUT.map((iv, idx) => (
        <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={20} label={lbl(iv)} variant={overlapping.has(idx) ? "active" : "default"} />
      ))}
      <Axis y={188} />
      <text x={AX0 - 12} y={224} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">merged</text>
      {RESULT.map((iv, idx) => (
        <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={212} height={24} label={lbl(iv)} variant="result" />
      ))}
      <text x={sx(2)} y={laneY[0] - 8} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="12" fill="#c2410c">[1,3] &amp; [2,6] overlap → [1,6]</text>
      <Caption joinX={300} cy={300} label="return" value="[[1,6],[8,10],[15,18]]" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={18} height={32} />
    </VizStage>
  );
}

function SolutionViz({ step }) {
  const laneY = [56, 84, 112, 140];
  const sweeping = step.phase === "sweep";
  const curLane = step.cur ? SORTED_IDX[step.cur] : -1;
  const lastIdx = step.out.length - 1;
  const titleByPhase = {
    given: "the input — not yet sorted",
    sort: "step 1 · sort by start",
    sweep: "step 2 · merge what touches, separate what doesn't",
    done: "merged result",
  };

  return (
    <VizStage width={W} height={296}>
      <text x={W / 2} y={28} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#1a1814">
        {titleByPhase[step.phase]}
      </text>

      <text x={AX0 - 12} y={laneY[1] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">input</text>
      {step.order.map((id, lane) => {
        const [a, b] = IV[id];
        let variant = "default";
        if (id === step.cur) variant = "active";
        else if (sweeping && lane < curLane) variant = "done";
        else if (step.phase === "done") variant = "done";
        return (
          <Interval key={id} x1={sx(a)} x2={sx(b)} y={laneY[lane]} height={20} label={lbl([a, b])} variant={variant} />
        );
      })}

      <Axis y={186} />

      {/* the merged result — the LAST bar is still open (light green), the
          earlier ones are finalized (solid green). On merge the last bar grows;
          on gap a fresh light-green bar appears. The shape change IS the story. */}
      <text x={AX0 - 12} y={222} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">merged</text>
      {step.out.map((iv, idx) => {
        const variant = step.phase === "done" || idx < lastIdx ? "result" : "merged";
        return <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={210} height={22} label={lbl(iv)} variant={variant} />;
      })}
    </VizStage>
  );
}

export default {
  id: "merge-intervals",
  leetcode: 56,
  title: "Merge Intervals",
  difficulty: "Medium",
  tagline: "Merge all overlapping intervals and return the non-overlapping set.",
  patternId: "intervals",
  constraint: "Sort by start first; then a single left-to-right sweep merges in place.",
  ProblemViz,
  examples: [
    { input: "[[1,3],[2,6],[8,10],[15,18]]", result: "[[1,6],[8,10],[15,18]]", ok: true },
    { input: "[[1,4],[4,5]]", result: "[[1,5]]", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Sort by start so overlaps can only be adjacent. Sweep left→right keeping one 'running' interval: if the next interval starts at or before the running end, it overlaps — extend the end (merge). Otherwise there's a gap — emit the running interval and start a new one. Sorting dominates: O(n log n).",
    code: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    out = [intervals[0]]
    for s, e in intervals[1:]:
        if s <= out[-1][1]:          # overlaps
            out[-1][1] = max(out[-1][1], e)
        else:                         # gap
            out.append([s, e])
    return out`,
    codeHighlight: [2, 3, 4, 5, 6, 7, 8],
    codeNote: "sort · then merge or emit",
    cases: [
      { id: "merge", label: "4 intervals", result: "[[1,6],[8,10],[15,18]]", ok: true, input: INPUT, steps: STEPS },
    ],
  },
};
