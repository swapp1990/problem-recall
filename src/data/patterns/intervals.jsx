import { VizStage, Interval, useDemoLoop } from "../../viz";

// Generic illustration — NOT tied to a problem. Auto-loops the merge sweep:
// sort by start, then walk left→right; an interval that overlaps the running
// one extends it, a gap emits the running one and starts fresh.
const W = 640;
const H = 230;
const LO = 0, HI = 10;
const AXIS_X0 = 60, AXIS_X1 = 580;
const sx = (v) => AXIS_X0 + ((v - LO) / (HI - LO)) * (AXIS_X1 - AXIS_X0);

const INPUT = [[1, 3], [2, 5], [7, 9]];
const LANE_Y = [64, 92, 120];

// running = current merged interval · result = already-emitted · note colored
const DEMO = [
  { i: 0, running: [1, 3], result: [], note: "take the first interval [1, 3]", kind: "take" },
  { i: 1, running: [1, 5], result: [], note: "[2,5]: 2 ≤ 3 → overlaps → extend to [1, 5]", kind: "merge" },
  { i: 2, running: [7, 9], result: [[1, 5]], note: "[7,9]: 7 > 5 → gap → emit [1,5], start [7,9]", kind: "emit" },
  { i: 3, running: null, result: [[1, 5], [7, 9]], note: "no overlaps left → [1,5], [7,9]", kind: "take" },
];

export default function IntervalsViz({ active = true }) {
  const k = useDemoLoop(DEMO.length, { interval: 1300, enabled: active });
  const s = DEMO[k];

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={30} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        sort by start, then sweep: overlap → merge, gap → emit
      </text>

      {/* number line */}
      <line x1={AXIS_X0} y1={156} x2={AXIS_X1} y2={156} stroke="#d6d3d1" strokeWidth={1.5} />
      {Array.from({ length: HI - LO + 1 }, (_, v) => (
        <g key={v}>
          <line x1={sx(v)} y1={153} x2={sx(v)} y2={159} stroke="#d6d3d1" strokeWidth={1} />
          <text x={sx(v)} y={172} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#a8a29e">{v}</text>
        </g>
      ))}

      {/* input intervals, one lane each */}
      {INPUT.map(([a, b], idx) => {
        const variant = idx === s.i ? "active" : idx < s.i ? "done" : "default";
        return <Interval key={idx} x1={sx(a)} x2={sx(b)} y={LANE_Y[idx]} height={20} label={`[${a},${b}]`} variant={variant} />;
      })}

      {/* merged result on its own track below the axis */}
      <text x={AXIS_X0 - 12} y={206} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">merged</text>
      {s.result.map(([a, b], idx) => (
        <Interval key={"r" + idx} x1={sx(a)} x2={sx(b)} y={194} height={22} label={`[${a},${b}]`} variant="result" />
      ))}
      {s.running && <Interval x1={sx(s.running[0])} x2={sx(s.running[1])} y={194} height={22} label={`[${s.running[0]},${s.running[1]}]`} variant="merged" />}

      <text x={W / 2} y={H - 8} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill={s.kind === "emit" ? "#c2410c" : s.kind === "merge" ? "#15803d" : "#57534e"}>
        {s.note}
      </text>
    </VizStage>
  );
}
