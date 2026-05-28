import { VizStage, Interval, Caption } from "../../viz";

const W = 760;
const H = 320;
const LO = 0, HI = 19;
const AX0 = 64, AX1 = 712;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

// 5 intervals identified by id so we can reorder lanes during the sort step.
// Includes a CONTAINED case ([9,11] inside [8,14]) so the max() in the merge
// step is visible — the bar's end stays at 14 instead of shrinking to 11.
const IV = { A: [1, 3], B: [2, 6], C: [8, 14], D: [9, 11], E: [15, 18] };
const GIVEN = ["C", "A", "D", "E", "B"];   // shuffled: 8, 1, 9, 15, 2
const SORTED = ["A", "B", "C", "D", "E"];   // by start: 1, 2, 8, 9, 15
const INPUT = SORTED.map((id) => IV[id]);

// `out` is the merged list so far. The LAST bar in `out` is "still open" (it
// can still grow); earlier bars are finalized. Each sweep frame either grows
// the last bar (because the current input overlaps it) or appends a new bar
// (because there's a gap). The visual change IS the explanation.
// Each sweep step is split into COMPARE (mark start of current + end of last
// merged) and APPLY (the bar grows / stays / a fresh one starts) so both the
// "start vs prev end" check AND the "max(prev end, current end)" mutation are
// each their own visible frame. `mark` carries the values being highlighted
// on the axis as ticks.
const STEPS = [
  { phase: "given", order: GIVEN, cur: null, out: [], mark: null, status: "the input as given — not yet sorted" },
  { phase: "sort", order: SORTED, cur: null, out: [], mark: null, status: "step 1 · sort by start" },
  { phase: "sweep", order: SORTED, cur: "A", out: [[1, 3]], mark: null, action: "first", status: "start: take the first interval [1, 3]" },

  // B = [2,6]: start 2 ≤ prev end 3 → overlap · max(3, 6) = 6 → bar extends
  { phase: "sweep", order: SORTED, cur: "B", out: [[1, 3]], mark: { kind: "compare", start: 2, prevEnd: 3 }, action: "compare-merge", status: "[2,6]: start 2 is BEFORE prev end 3 → they overlap" },
  { phase: "sweep", order: SORTED, cur: "B", out: [[1, 6]], mark: { kind: "max", oldEnd: 3, candidate: 6, newEnd: 6 }, action: "apply-extend", status: "new end = max(3, 6) = 6 → bar grows to [1, 6]" },

  // C = [8,14]: start 8 > prev end 6 → gap
  { phase: "sweep", order: SORTED, cur: "C", out: [[1, 6]], mark: { kind: "compare", start: 8, prevEnd: 6 }, action: "compare-gap", status: "[8,14]: start 8 is AFTER prev end 6 → gap" },
  { phase: "sweep", order: SORTED, cur: "C", out: [[1, 6], [8, 14]], mark: null, action: "apply-new", status: "no overlap — start a fresh bar [8, 14]" },

  // D = [9,11]: start 9 ≤ prev end 14 → overlap · max(14, 11) = 14 → bar STAYS (contained)
  { phase: "sweep", order: SORTED, cur: "D", out: [[1, 6], [8, 14]], mark: { kind: "compare", start: 9, prevEnd: 14 }, action: "compare-merge", status: "[9,11]: start 9 is BEFORE prev end 14 → they overlap" },
  { phase: "sweep", order: SORTED, cur: "D", out: [[1, 6], [8, 14]], mark: { kind: "max", oldEnd: 14, candidate: 11, newEnd: 14 }, action: "apply-contain", status: "new end = max(14, 11) = 14 → bar STAYS [8, 14] · [9,11] sat inside" },

  // E = [15,18]: start 15 > prev end 14 → gap
  { phase: "sweep", order: SORTED, cur: "E", out: [[1, 6], [8, 14]], mark: { kind: "compare", start: 15, prevEnd: 14 }, action: "compare-gap", status: "[15,18]: start 15 is AFTER prev end 14 → gap" },
  { phase: "sweep", order: SORTED, cur: "E", out: [[1, 6], [8, 14], [15, 18]], mark: null, action: "apply-new", status: "no overlap — start a fresh bar [15, 18]" },

  { phase: "done", order: SORTED, cur: null, out: [[1, 6], [8, 14], [15, 18]], mark: null, action: "done", done: true, status: "done — 5 input intervals merged into 3" },
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
  const laneY = [54, 76, 98, 120, 142];
  const overlapping = new Set([0, 1, 2, 3]); // [1,3]&[2,6] overlap · [8,14] contains [9,11]
  const RESULT = [[1, 6], [8, 14], [15, 18]];
  return (
    <VizStage width={W} height={332}>
      <text x={W / 2} y={28} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        merge every group of overlapping intervals into one
      </text>
      <text x={AX0 - 12} y={laneY[2] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">input</text>
      {INPUT.map((iv, idx) => (
        <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={18} label={lbl(iv)} variant={overlapping.has(idx) ? "active" : "default"} />
      ))}
      <Axis y={180} />
      <text x={AX0 - 12} y={216} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">merged</text>
      {RESULT.map((iv, idx) => (
        <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={204} height={22} label={lbl(iv)} variant="result" />
      ))}
      <Caption joinX={300} cy={290} label="return" value="[[1,6],[8,14],[15,18]]" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={18} height={32} />
    </VizStage>
  );
}

// A labelled tick anchored on the axis — used to mark a value being compared.
function Tick({ x, axisY, color, label, labelY, weight = 700, dashed = false, mark }) {
  return (
    <g>
      <line x1={x} y1={axisY - 8} x2={x} y2={axisY + 8} stroke={color} strokeWidth={dashed ? 1.5 : 2.5} strokeDasharray={dashed ? "3 3" : "0"} />
      <text x={x} y={labelY} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight={weight} fill={color}>{label}</text>
      {mark && <text x={x + 14} y={labelY} fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill={color}>{mark}</text>}
    </g>
  );
}

function SolutionViz({ step }) {
  const laneY = [42, 62, 82, 102, 122];
  const AXIS_Y = 168;
  const sweeping = step.phase === "sweep";
  const curLane = step.cur ? SORTED_IDX[step.cur] : -1;
  const lastIdx = step.out.length - 1;
  const titleByPhase = {
    given: "the input — not yet sorted",
    sort: "step 1 · sort by start",
    sweep: "step 2 · check current start vs the previous end; on merge take max(prev end, current end)",
    done: "merged result",
  };

  return (
    <VizStage width={W} height={298}>
      <text x={W / 2} y={22} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#1a1814">
        {titleByPhase[step.phase]}
      </text>

      <text x={AX0 - 12} y={laneY[2] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">input</text>
      {step.order.map((id, lane) => {
        const [a, b] = IV[id];
        let variant = "default";
        if (id === step.cur) variant = "active";
        else if (sweeping && lane < curLane) variant = "done";
        else if (step.phase === "done") variant = "done";
        return (
          <Interval key={id} x1={sx(a)} x2={sx(b)} y={laneY[lane]} height={16} label={lbl([a, b])} variant={variant} />
        );
      })}

      {/* COMPARE ticks — show the two values being tested side by side */}
      {step.mark?.kind === "compare" && (
        <>
          <Tick x={sx(step.mark.start)} axisY={AXIS_Y} color="#c2410c" label={`start = ${step.mark.start}`} labelY={150} />
          <Tick x={sx(step.mark.prevEnd)} axisY={AXIS_Y} color="#15803d" label={`prev end = ${step.mark.prevEnd}`} labelY={162} />
        </>
      )}
      {/* MAX ticks — show both candidates; the winner (= newEnd) is solid+✓, the loser is dashed/grey */}
      {step.mark?.kind === "max" && (
        <>
          <Tick x={sx(step.mark.oldEnd)} axisY={AXIS_Y}
            color={step.mark.oldEnd === step.mark.newEnd ? "#15803d" : "#a8a29e"}
            dashed={step.mark.oldEnd !== step.mark.newEnd}
            label={`prev end ${step.mark.oldEnd}`} mark={step.mark.oldEnd === step.mark.newEnd ? "✓" : ""}
            labelY={150} />
          <Tick x={sx(step.mark.candidate)} axisY={AXIS_Y}
            color={step.mark.candidate === step.mark.newEnd ? "#15803d" : "#a8a29e"}
            dashed={step.mark.candidate !== step.mark.newEnd}
            label={`current end ${step.mark.candidate}`} mark={step.mark.candidate === step.mark.newEnd ? "✓" : ""}
            labelY={162} />
        </>
      )}

      <Axis y={AXIS_Y} />

      {/* the merged result — the LAST bar is still open (light green); earlier
          ones are finalized (solid green). The shape change between frames is
          the story: bar grows (extend), stays (contained), or a new one appears. */}
      <text x={AX0 - 12} y={216} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">merged</text>
      {step.out.map((iv, idx) => {
        const variant = step.phase === "done" || idx < lastIdx ? "result" : "merged";
        return <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={204} height={22} label={lbl(iv)} variant={variant} />;
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
    { input: "[[1,3],[2,6],[8,14],[9,11],[15,18]]", result: "[[1,6],[8,14],[15,18]]", ok: true },
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
      { id: "merge", label: "5 intervals (incl. a contained one)", result: "[[1,6],[8,14],[15,18]]", ok: true, input: INPUT, steps: STEPS },
    ],
  },
};
