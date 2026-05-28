import { VizStage, Interval, useDemoLoop } from "../../viz";

// Generic illustration — NOT tied to a problem. The crux every interval problem
// shares: sort by start, then a single left→right sweep where the ONLY question
// at each neighbor is "does the next start fall at/before the current end?"
// → overlap or gap. What you DO with that (merge, count rooms, drop one) is
// problem-specific; the recognition + the overlap test are the pattern.
const W = 640;
const H = 262;
const LO = 0, HI = 11;
const AX0 = 60, AX1 = 588;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

const INTERVALS = [[1, 3], [2, 5], [7, 9], [8, 10]];
const LANE_Y = [54, 78, 102, 126];

// Sweep adjacent pairs (sorted by start). `a` = current, `b` = next. Compare
// b's start to a's end. overlap when start ≤ end.
const DEMO = [
  { a: 0, b: 1, overlap: true, test: "[2,5] start 2  ≤  [1,3] end 3   →   OVERLAP" },
  { a: 1, b: 2, overlap: false, test: "[7,9] start 7  >  [2,5] end 5   →   GAP" },
  { a: 2, b: 3, overlap: true, test: "[8,10] start 8  ≤  [7,9] end 9   →   OVERLAP" },
  { a: null, b: null, overlap: null, test: "one pass · each neighbor is an OVERLAP or a GAP" },
];

export default function IntervalsViz({ active = true }) {
  const k = useDemoLoop(DEMO.length, { interval: 1500, enabled: active });
  const s = DEMO[k];
  const endX = s.a != null ? sx(INTERVALS[s.a][1]) : null; // the "current end" line

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={24} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="13.5" fill="#57534e">
        sort by start, then ask one thing per neighbor: next start ≤ current end?
      </text>

      {/* the "current end" boundary — overlap is just: does the next start land left of it */}
      {endX != null && (
        <line x1={endX} y1={42} x2={endX} y2={150} stroke={s.overlap ? "#15803d" : "#b91c1c"} strokeWidth={1.5} strokeDasharray="4 4" />
      )}

      {/* number line */}
      <line x1={AX0} y1={156} x2={AX1} y2={156} stroke="#d6d3d1" strokeWidth={1.5} />
      {Array.from({ length: HI - LO + 1 }, (_, v) => (
        <g key={v}>
          <line x1={sx(v)} y1={153} x2={sx(v)} y2={159} stroke="#d6d3d1" strokeWidth={1} />
          <text x={sx(v)} y={172} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#a8a29e">{v}</text>
        </g>
      ))}

      {/* intervals (already sorted by start), the current pair highlighted */}
      {INTERVALS.map(([a, b], idx) => {
        let variant = "default";
        if (idx === s.a) variant = "active"; // current
        else if (idx === s.b) variant = s.overlap ? "merged" : "default"; // next: green if it overlaps
        return <Interval key={idx} x1={sx(a)} x2={sx(b)} y={LANE_Y[idx]} height={18} label={`[${a},${b}]`} variant={variant} />;
      })}

      <text x={W / 2} y={200} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12.5" fontWeight="700" fill={s.overlap === false ? "#b91c1c" : s.overlap ? "#15803d" : "#57534e"}>
        {s.test}
      </text>
      <text x={W / 2} y={H - 14} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="12" fill="#a8a29e">
        what you do with an overlap is the problem — merge · count rooms · drop one
      </text>
    </VizStage>
  );
}
