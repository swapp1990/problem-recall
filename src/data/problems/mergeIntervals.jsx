import { VizStage, Interval, Caption } from "../../viz";

const W = 760;
const H = 320;
const LO = 0, HI = 19;
const AX0 = 64, AX1 = 712;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

const INPUT = [[1, 3], [2, 6], [8, 10], [15, 18]];

// `i` = interval being examined · `running` = current merged interval ·
// `result` = already-emitted intervals · `overlap` = did i overlap running?
const STEPS = [
  { i: 0, running: [1, 3], result: [], overlap: null, status: "sorted by start · take [1,3] as the running interval" },
  { i: 1, running: [1, 6], result: [], overlap: true, status: "[2,6]: 2 ≤ 3 → overlaps → extend end to 6 → [1,6]" },
  { i: 2, running: [8, 10], result: [[1, 6]], overlap: false, status: "[8,10]: 8 > 6 → gap → emit [1,6], start [8,10]" },
  { i: 3, running: [15, 18], result: [[1, 6], [8, 10]], overlap: false, status: "[15,18]: 15 > 10 → gap → emit [8,10], start [15,18]" },
  { i: 4, running: null, result: [[1, 6], [8, 10], [15, 18]], overlap: null, done: true, status: "no more → emit [15,18].  4 intervals merged into 3" },
];

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

function SolutionViz({ data, step }) {
  const input = data.input;
  const laneY = [60, 86, 112, 138];
  return (
    <VizStage width={W} height={H}>
      <text x={40} y={32} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">sort by start, then sweep left → right</text>

      <text x={AX0 - 12} y={laneY[1] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">input</text>
      {input.map((iv, idx) => {
        const variant = idx === step.i ? "active" : idx < step.i ? "done" : "default";
        return <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={20} label={lbl(iv)} variant={variant} />;
      })}

      <Axis y={180} />

      <text x={AX0 - 12} y={218} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">merged</text>
      {step.result.map((iv, idx) => (
        <Interval key={"r" + idx} x1={sx(iv[0])} x2={sx(iv[1])} y={204} height={24} label={lbl(iv)} variant="result" />
      ))}
      {step.running && (
        <Interval x1={sx(step.running[0])} x2={sx(step.running[1])} y={204} height={24} label={lbl(step.running)} variant="merged" />
      )}

      {step.overlap === true && (
        <text x={40} y={H - 16} fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill="#15803d">overlap → merge (extend the running interval)</text>
      )}
      {step.overlap === false && (
        <text x={40} y={H - 16} fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill="#c2410c">gap → emit the running interval, start a new one</text>
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
