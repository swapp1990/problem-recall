import { VizStage, Interval, Caption } from "../../viz";

const W = 760;
const H = 300;
const LO = 0, HI = 17;
const AX0 = 64, AX1 = 712;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

const INTERVALS = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]];
const NEW0 = [4, 8];

// Three phases mirror the code:
//   1. push intervals strictly before new (ends < new.start)
//   2. merge any that overlap: new = [min(new.s, iv.s), max(new.e, iv.e)]
//   3. push the merged new, then the rest as-is
// `cur` = index being examined · `nw` = current newInterval (may have grown) ·
// `out` = finalized so far · `phase` styles the action.
const STEPS = [
  { phase: "given", cur: -1, nw: NEW0, out: [], status: "given: 5 sorted, non-overlapping intervals · insert the orange interval [4, 8]" },
  { phase: "before", cur: 0, nw: NEW0, out: [[1, 2]], action: "push-before", status: "[1,2] ends at 2 < new.start 4 → push as-is, doesn't touch new" },
  { phase: "merge", cur: 1, nw: [3, 8], out: [[1, 2]], action: "extend-start", status: "[3,5] overlaps · new = [min(4,3), max(8,5)] = [3, 8] (start grew left)" },
  { phase: "merge", cur: 2, nw: [3, 8], out: [[1, 2]], action: "contain", status: "[6,7] sits INSIDE new · new = [min(3,6), max(8,7)] = [3, 8] (stays)" },
  { phase: "merge", cur: 3, nw: [3, 10], out: [[1, 2]], action: "extend-end", status: "[8,10] overlaps · new = [min(3,8), max(8,10)] = [3, 10] (end grew right)" },
  { phase: "emit", cur: 4, nw: [3, 10], out: [[1, 2], [3, 10]], action: "stop-emit", status: "[12,16] starts at 12 > new.end 10 → stop merging · emit new [3, 10]" },
  { phase: "after", cur: 4, nw: [3, 10], out: [[1, 2], [3, 10], [12, 16]], action: "push-after", status: "[12,16] comes after new → push as-is" },
  { phase: "done", cur: -1, nw: [3, 10], out: [[1, 2], [3, 10], [12, 16]], done: true, status: "done — inserted and merged · 3 intervals" },
];

const lbl = ([a, b]) => `[${a},${b}]`;

function Axis({ y }) {
  return (
    <>
      <line x1={AX0} y1={y} x2={AX1} y2={y} stroke="#d6d3d1" strokeWidth={1.5} />
      {Array.from({ length: 9 }, (_, t) => {
        const v = t * 2;
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
  const laneY = [50, 70, 90, 110, 130];
  const RESULT = [[1, 2], [3, 10], [12, 16]];
  return (
    <VizStage width={W} height={310}>
      <text x={W / 2} y={28} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        insert one new interval into a sorted, non-overlapping list — merge where it touches
      </text>
      <text x={AX0 - 12} y={laneY[2] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">intervals</text>
      {INTERVALS.map((iv, idx) => (
        <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={16} label={lbl(iv)} variant="default" />
      ))}
      <text x={AX0 - 12} y={166} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">new</text>
      <Interval x1={sx(NEW0[0])} x2={sx(NEW0[1])} y={156} height={20} label={lbl(NEW0)} variant="active" />
      <Axis y={188} />
      <text x={AX0 - 12} y={222} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">result</text>
      {RESULT.map((iv, idx) => (
        <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={210} height={22} label={lbl(iv)} variant="result" />
      ))}
      <Caption joinX={300} cy={278} label="return" value="[[1,2],[3,10],[12,16]]" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={18} height={32} />
    </VizStage>
  );
}

function SolutionViz({ step }) {
  const laneY = [42, 62, 82, 102, 122];
  const NEW_Y = 144;
  const AXIS_Y = 172;
  const OUT_Y = 196;
  const sweeping = step.phase !== "given" && step.phase !== "done";
  const preEmit = step.phase === "given" || step.phase === "before" || step.phase === "merge";
  const lastOutIdx = step.out.length - 1;
  const titleByPhase = {
    given: "given — a sorted list + one new interval to insert",
    before: "push intervals that end BEFORE new starts",
    merge: "any interval that overlaps the new one → merge into it (take min start, max end)",
    emit: "stop merging · drop new into the result",
    after: "push the rest as-is",
    done: "done",
  };

  return (
    <VizStage width={W} height={296}>
      <text x={W / 2} y={22} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#1a1814">
        {titleByPhase[step.phase]}
      </text>

      {/* input intervals (sorted, non-overlapping) */}
      <text x={AX0 - 12} y={laneY[2] + 12} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">intervals</text>
      {INTERVALS.map((iv, idx) => {
        let variant = "default";
        if (idx === step.cur) variant = "active";
        else if (sweeping && idx < step.cur) variant = "done";
        else if (step.phase === "done") variant = "done";
        return <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={16} label={lbl(iv)} variant={variant} />;
      })}

      {/* the new interval — orange while we're still merging into it */}
      {preEmit && (
        <>
          <text x={AX0 - 12} y={NEW_Y + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">new</text>
          <Interval x1={sx(step.nw[0])} x2={sx(step.nw[1])} y={NEW_Y} height={20} label={lbl(step.nw)} variant="active" />
        </>
      )}

      <Axis y={AXIS_Y} />

      {/* result — earlier bars solid green; the most recently appended one
          is the "still open" light green (since outside the merge zone the
          last entry can still extend if a later iteration overlapped — but
          for insert it won't; rendered lighter just to mark "just added") */}
      <text x={AX0 - 12} y={OUT_Y + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">result</text>
      {step.out.map((iv, idx) => {
        const isLast = idx === lastOutIdx;
        const variant = step.phase === "done" ? "result" : isLast && (step.action === "push-before" || step.action === "stop-emit" || step.action === "push-after") ? "merged" : "result";
        return <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={OUT_Y} height={22} label={lbl(iv)} variant={variant} />;
      })}
    </VizStage>
  );
}

export default {
  id: "insert-interval",
  leetcode: 57,
  title: "Insert Interval",
  difficulty: "Medium",
  tagline: "Insert a new interval into a sorted, non-overlapping list — merge what it touches.",
  patternId: "intervals",
  constraint: "Input list is already sorted by start and has no internal overlaps; merge only happens against the new interval.",
  ProblemViz,
  examples: [
    { input: "intervals=[[1,2],[3,5],[6,7],[8,10],[12,16]], new=[4,8]", result: "[[1,2],[3,10],[12,16]]", ok: true },
    { input: "intervals=[[1,3],[6,9]], new=[2,5]", result: "[[1,5],[6,9]]", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "One left→right pass through the (already sorted) list in three phases. (1) push everything that ends before new starts. (2) merge each interval that overlaps new — new keeps growing: take min(new.s, iv.s) and max(new.e, iv.e). (3) emit the (possibly grown) new, then push the rest. O(n).",
    code: `def insert(intervals, new):
    out = []
    i, n = 0, len(intervals)
    # 1. before new
    while i < n and intervals[i][1] < new[0]:
        out.append(intervals[i]); i += 1
    # 2. merge overlapping into new
    while i < n and intervals[i][0] <= new[1]:
        new = [min(new[0], intervals[i][0]),
               max(new[1], intervals[i][1])]
        i += 1
    out.append(new)
    # 3. after new
    while i < n:
        out.append(intervals[i]); i += 1
    return out`,
    codeHighlight: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    codeNote: "before · merge into new · after",
    cases: [
      { id: "ins", label: "5 intervals (covers all 3 phases)", result: "[[1,2],[3,10],[12,16]]", ok: true, input: INTERVALS, steps: STEPS },
    ],
  },
};
