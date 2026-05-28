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

// Names match the code: `out` is the growing list of merged intervals;
// `out[-1]` is its last entry; `out[-1][1]` is that last entry's END; `s, e`
// is the current interval. `running` here = out[-1] (rendered lighter — it's
// still extendable). `result` = out[:-1] (finalized · solid green).
const STEPS = [
  { phase: "given", order: GIVEN, cur: null, running: null, frontier: null, result: [], cmp: null, status: "input as given — NOT sorted by start yet" },
  { phase: "sort", order: SORTED, cur: null, running: null, frontier: null, result: [], cmp: null, status: "intervals.sort(key=lambda x: x[0])  →  now sorted by start" },
  { phase: "sweep", order: SORTED, cur: "A", running: [1, 3], frontier: 3, result: [], cmp: null, status: "out = [intervals[0]]  →  out = [[1, 3]]" },
  { phase: "sweep", order: SORTED, cur: "B", running: [1, 3], frontier: 3, result: [], cmp: { kind: "overlap", text: "s = 2   ≤   out[-1][1] = 3   →   OVERLAP" }, status: "[2,6]: s ≤ out[-1][1]  →  overlap branch" },
  { phase: "sweep", order: SORTED, cur: "B", running: [1, 6], frontier: 6, result: [], cmp: { kind: "overlap", text: "out[-1][1] = max(3, 6) = 6" }, status: "extend the last: out[-1][1] = max(3, 6) = 6  →  out = [[1, 6]]" },
  { phase: "sweep", order: SORTED, cur: "C", running: [1, 6], frontier: 6, result: [], cmp: { kind: "gap", text: "s = 8   >   out[-1][1] = 6   →   GAP" }, status: "[8,10]: s > out[-1][1]  →  gap branch" },
  { phase: "sweep", order: SORTED, cur: "C", running: [8, 10], frontier: 10, result: [[1, 6]], cmp: { kind: "gap", text: "out.append([8, 10])" }, status: "out.append([8, 10])  →  out = [[1, 6], [8, 10]]" },
  { phase: "sweep", order: SORTED, cur: "D", running: [8, 10], frontier: 10, result: [[1, 6]], cmp: { kind: "gap", text: "s = 15   >   out[-1][1] = 10   →   GAP" }, status: "[15,18]: s > out[-1][1]  →  gap branch" },
  { phase: "sweep", order: SORTED, cur: "D", running: [15, 18], frontier: 18, result: [[1, 6], [8, 10]], cmp: { kind: "gap", text: "out.append([15, 18])" }, status: "out.append([15, 18])  →  out = [[1, 6], [8, 10], [15, 18]]" },
  { phase: "done", order: SORTED, cur: null, running: null, frontier: null, result: [[1, 6], [8, 10], [15, 18]], cmp: null, done: true, status: "return out  →  [[1, 6], [8, 10], [15, 18]]" },
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
  const frontierX = step.frontier != null ? sx(step.frontier) : null;

  return (
    <VizStage width={W} height={304}>
      <text x={40} y={28} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">
        {step.phase === "given" ? "input — not yet sorted" : step.phase === "sort" ? "intervals.sort(key=lambda x: x[0])" : "for s, e in intervals[1:]:   test s ≤ out[-1][1]"}
      </text>

      {/* the frontier — a vertical dashed line at the running interval's END.
          The current interval's left edge (its start) compared against this line
          IS the overlap test. Left of line → overlap · right of line → gap. */}
      {frontierX != null && (
        <g>
          <line x1={frontierX} y1={48} x2={frontierX} y2={236} stroke={step.cmp?.kind === "gap" ? "#b91c1c" : "#15803d"} strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={frontierX} y={44} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill={step.cmp?.kind === "gap" ? "#b91c1c" : "#15803d"}>
            out[-1][1] = {step.frontier}
          </text>
        </g>
      )}

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

      <text x={AX0 - 12} y={222} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">out</text>
      {step.result.map((iv, idx) => (
        <Interval key={"r" + idx} x1={sx(iv[0])} x2={sx(iv[1])} y={210} height={22} label={lbl(iv)} variant="result" />
      ))}
      {step.running && (
        <Interval x1={sx(step.running[0])} x2={sx(step.running[1])} y={210} height={22} label={lbl(step.running)} variant="merged" />
      )}

      {step.cmp && (
        <text x={W / 2} y={280} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill={step.cmp.kind === "gap" ? "#b91c1c" : "#15803d"}>
          {step.cmp.text}
        </text>
      )}
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
