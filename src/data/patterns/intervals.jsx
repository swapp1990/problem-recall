import { VizStage, Interval, useDemoLoop } from "../../viz";

// Generic illustration — NOT tied to a problem. The crux: after sorting by
// start, you carry ONE "running" interval and only ever compare the next
// interval's START against the running END (the "frontier"). start ≤ frontier
// → overlap (push the frontier right); start > frontier → gap (emit, restart).
const W = 640;
const H = 250;
const LO = 0, HI = 10;
const AX0 = 70, AX1 = 580;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

const INPUT = [[1, 3], [2, 5], [7, 9]];
const LANE_Y = [56, 82, 108];

// Each decision is split into COMPARE (next start vs the frontier) then APPLY
// (extend, or emit + restart), so the dashed frontier line always shows the
// exact number the note is talking about. cur = interval being compared ·
// running = current merged interval · frontier = the line's value · result = emitted.
const DEMO = [
  { cur: null, done: 1, running: [1, 3], frontier: 3, result: [], cmp: "take [1,3] as the running interval · frontier = 3", kind: "take" },
  { cur: 1, done: 1, running: [1, 3], frontier: 3, result: [], cmp: "[2,5]: start 2  ≤  frontier 3  →  overlap", kind: "merge" },
  { cur: 1, done: 1, running: [1, 5], frontier: 5, result: [], cmp: "extend the frontier to 5  →  running = [1,5]", kind: "merge" },
  { cur: 2, done: 2, running: [1, 5], frontier: 5, result: [], cmp: "[7,9]: start 7  >  frontier 5  →  gap", kind: "emit" },
  { cur: 2, done: 2, running: [7, 9], frontier: 9, result: [[1, 5]], cmp: "emit [1,5], restart the run at [7,9]", kind: "emit" },
  { cur: null, done: 3, running: null, frontier: null, result: [[1, 5], [7, 9]], cmp: "nothing left → result is [1,5], [7,9]", kind: "take" },
];

export default function IntervalsViz({ active = true }) {
  const k = useDemoLoop(DEMO.length, { interval: 1400, enabled: active });
  const s = DEMO[k];
  const frontierX = s.frontier != null ? sx(s.frontier) : null;

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={26} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        sorted by start → compare each next start against the running end (frontier)
      </text>

      {/* the frontier: a vertical line at the running interval's END */}
      {frontierX != null && (
        <g>
          <line x1={frontierX} y1={44} x2={frontierX} y2={196} stroke="#15803d" strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={frontierX} y={40} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#15803d">frontier {s.frontier}</text>
        </g>
      )}

      {/* number line */}
      <line x1={AX0} y1={150} x2={AX1} y2={150} stroke="#d6d3d1" strokeWidth={1.5} />
      {Array.from({ length: HI - LO + 1 }, (_, v) => (
        <g key={v}>
          <line x1={sx(v)} y1={147} x2={sx(v)} y2={153} stroke="#d6d3d1" strokeWidth={1} />
          <text x={sx(v)} y={166} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#a8a29e">{v}</text>
        </g>
      ))}

      {/* input intervals, one lane each (the one being compared is highlighted) */}
      {INPUT.map(([a, b], idx) => {
        const variant = idx === s.cur ? "active" : idx < s.done ? "done" : "default";
        return <Interval key={idx} x1={sx(a)} x2={sx(b)} y={LANE_Y[idx]} height={18} label={`[${a},${b}]`} variant={variant} />;
      })}

      {/* the running merged interval + already-emitted results, below the axis */}
      <text x={AX0 - 12} y={194} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#15803d">merged</text>
      {s.result.map(([a, b], idx) => (
        <Interval key={"r" + idx} x1={sx(a)} x2={sx(b)} y={182} height={22} label={`[${a},${b}]`} variant="result" />
      ))}
      {s.running && <Interval x1={sx(s.running[0])} x2={sx(s.running[1])} y={182} height={22} label={`[${s.running[0]},${s.running[1]}]`} variant="merged" />}

      <text x={W / 2} y={H - 8} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill={s.kind === "emit" ? "#c2410c" : s.kind === "merge" ? "#15803d" : "#57534e"}>
        {s.cmp}
      </text>
    </VizStage>
  );
}
