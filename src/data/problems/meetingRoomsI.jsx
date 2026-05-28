import { VizStage, Interval, Caption } from "../../viz";

const W = 760;
const H = 290;
const LO = 0, HI = 18;
const AX0 = 64, AX1 = 712;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

// Two cases:
//   pass: no overlap → can attend all
//   fail: [5,10] and [8,12] overlap → return false on first overlap
const IV_PASS = { A: [0, 5], B: [5, 10], C: [10, 15] };
const IV_FAIL = { A: [0, 5], B: [5, 10], C: [8, 12], D: [13, 16] };
const GIVEN_PASS = ["B", "A", "C"];
const SORTED_PASS = ["A", "B", "C"];
const GIVEN_FAIL = ["C", "A", "D", "B"];
const SORTED_FAIL = ["A", "B", "C", "D"];

const lbl = (iv) => `[${iv[0]},${iv[1]})`;

// Each step carries an `order` (list of meeting keys in display order) +
// `cur` (index into that order being examined) + `prev` (the meeting we just
// confirmed) + `mark` (a tick/comparison drawn on the axis). `clash` flags
// the failing pair so we can render the overlap in red.
const STEPS_PASS = [
  { phase: "given", order: GIVEN_PASS, cur: -1, status: "given: 3 meetings · can one person attend all of them?" },
  { phase: "sort", order: SORTED_PASS, cur: -1, status: "sort by start time · now any clash is between NEIGHBOURS" },
  { phase: "scan", order: SORTED_PASS, cur: 1, prev: 0, mark: { start: 5, prevEnd: 5 }, status: "B starts at 5 · A ends at 5 → 5 ≥ 5 ok, no overlap (B starts exactly when A ends)" },
  { phase: "scan", order: SORTED_PASS, cur: 2, prev: 1, mark: { start: 10, prevEnd: 10 }, status: "C starts at 10 · B ends at 10 → 10 ≥ 10 ok, no overlap" },
  { phase: "done", order: SORTED_PASS, cur: -1, done: true, ok: true, status: "scan reached the end with no overlap · return true" },
];

const STEPS_FAIL = [
  { phase: "given", order: GIVEN_FAIL, cur: -1, status: "given: 4 meetings · can one person attend all of them?" },
  { phase: "sort", order: SORTED_FAIL, cur: -1, status: "sort by start time · now any clash is between NEIGHBOURS" },
  { phase: "scan", order: SORTED_FAIL, cur: 1, prev: 0, mark: { start: 5, prevEnd: 5 }, status: "B starts at 5 · A ends at 5 → 5 ≥ 5 ok" },
  { phase: "clash", order: SORTED_FAIL, cur: 2, prev: 1, mark: { start: 8, prevEnd: 10 }, clash: true, status: "C starts at 8 · B ends at 10 → 8 < 10 · OVERLAP → return false" },
  { phase: "done", order: SORTED_FAIL, cur: 2, prev: 1, done: true, ok: false, status: "stopped early at the first clash · one person can't attend both B and C" },
];

function Axis({ y }) {
  return (
    <>
      <line x1={AX0} y1={y} x2={AX1} y2={y} stroke="#d6d3d1" strokeWidth={1.5} />
      {Array.from({ length: 10 }, (_, t) => {
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

// A vertical tick on the axis with a numeric label — used to point out the
// concrete values being compared (B.start vs A.end). Color differentiates
// the current meeting (orange) from the previous one (slate).
function Tick({ x, y, value, color = "#57534e", labelAbove = false }) {
  return (
    <g>
      <line x1={x} y1={y - 7} x2={x} y2={y + 7} stroke={color} strokeWidth={2} />
      <text x={x} y={labelAbove ? y - 11 : y + 20} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="600" fill={color}>{value}</text>
    </g>
  );
}

function ProblemViz() {
  const MEETINGS = [[0, 5], [5, 10], [8, 12], [13, 16]];
  const laneY = [56, 78, 100, 122];
  return (
    <VizStage width={W} height={300}>
      <text x={W / 2} y={28} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        can one person attend every meeting? (any two overlap → no)
      </text>
      <text x={AX0 - 12} y={laneY[1] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">meetings</text>
      {MEETINGS.map((iv, idx) => {
        // [5,10] and [8,12] overlap — flag them red on the problem card so the
        // question shows what "any two overlap" actually means visually.
        const overlap = idx === 1 || idx === 2;
        return <Interval key={idx} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={16} label={lbl(iv)} variant={overlap ? "active" : "default"} />;
      })}
      <Axis y={158} />
      <text x={W / 2} y={206} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">
        [5,10) and [8,12) share the slot 8–10 → can't attend both
      </text>
      <Caption joinX={300} cy={254} label="return" value="false" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ step, ivMap }) {
  const lanesY = [50, 72, 94, 116];
  const AXIS_Y = 152;
  const titleByPhase = {
    given: "given — meetings in arrival order",
    sort: "sort by start time so neighbouring meetings are the only ones that can clash",
    scan: "scan left→right · each meeting's start must be ≥ previous meeting's end",
    clash: "overlap found · one person can't be in both at once",
    done: step.ok ? "no overlap anywhere · return true" : "first overlap → return false (no need to keep scanning)",
  };

  return (
    <VizStage width={W} height={228}>
      <text x={W / 2} y={22} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#1a1814">
        {titleByPhase[step.phase]}
      </text>

      <text x={AX0 - 12} y={lanesY[1] + 12} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">meetings</text>

      {step.order.map((key, idx) => {
        const iv = ivMap[key];
        let variant = "default";
        if (step.phase === "scan" || step.phase === "clash") {
          if (idx === step.cur) variant = step.clash ? "pop" : "active";
          else if (idx === step.prev) variant = "merged";
          else if (idx < step.cur) variant = "done";
        } else if (step.phase === "done") {
          if (!step.ok && idx === step.cur) variant = "pop";
          else if (!step.ok && idx === step.prev) variant = "pop";
          else variant = step.ok ? "result" : "done";
        }
        return (
          <Interval
            key={key}
            x1={sx(iv[0])}
            x2={sx(iv[1])}
            y={lanesY[idx]}
            height={18}
            label={`${key} ${lbl(iv)}`}
            variant={variant}
          />
        );
      })}

      <Axis y={AXIS_Y} />

      {/* Ticks on the axis call out the two values being compared.
          prevEnd (slate) vs start (orange/red). On a clash they're both red
          so the eye reads "start < prevEnd → overlap". */}
      {step.mark && (
        <>
          <Tick x={sx(step.mark.prevEnd)} y={AXIS_Y} value={`prev.end ${step.mark.prevEnd}`} color="#57534e" labelAbove />
          <Tick x={sx(step.mark.start)} y={AXIS_Y} value={`start ${step.mark.start}`} color={step.clash ? "#b91c1c" : "#c2410c"} />
        </>
      )}

      {step.phase === "done" && (
        <Caption
          joinX={W / 2}
          cy={206}
          label="return"
          value={step.ok ? "true" : "false"}
          fill={step.ok ? "#dcfce7" : "#fee2e2"}
          stroke={step.ok ? "#15803d" : "#b91c1c"}
          color={step.ok ? "#15803d" : "#b91c1c"}
          labelSize={16}
          height={28}
        />
      )}
    </VizStage>
  );
}

export default {
  id: "meeting-rooms-i",
  leetcode: 252,
  title: "Meeting Rooms",
  difficulty: "Easy",
  tagline: "Can one person attend every meeting? — any overlap means no.",
  patternId: "intervals",
  constraint: "Meetings are half-open intervals [start, end); a meeting ending at t and another starting at t do NOT overlap.",
  ProblemViz,
  examples: [
    { input: "[[0,30],[5,10],[15,20]]", result: "false", ok: true },
    { input: "[[7,10],[2,4]]", result: "true", ok: true },
  ],
  solution: {
    Viz: ({ step, data }) => (
      <SolutionViz step={step} ivMap={data.id === "fail" ? IV_FAIL : IV_PASS} />
    ),
    note: "Sort by start, then one left→right pass: for each meeting, check that its start is ≥ the previous meeting's end. The moment it isn't, return false. Sorting makes overlaps strictly local — you only ever have to compare to the immediate predecessor. O(n log n) for the sort, O(n) for the sweep.",
    code: `def canAttendMeetings(intervals):
    intervals.sort(key=lambda iv: iv[0])
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]:
            return False
    return True`,
    codeHighlight: [2, 3, 4, 5, 6],
    codeNote: "sort · sweep · clash → false",
    cases: [
      { id: "pass", label: "3 back-to-back meetings → true", result: "true", ok: true, steps: STEPS_PASS },
      { id: "fail", label: "4 meetings, B & C overlap → false", result: "false", ok: true, steps: STEPS_FAIL },
    ],
  },
};
