import { VizStage, Interval, useDemoLoop } from "../../viz";

// Generic illustration — NOT tied to a problem. The crux of EVERY interval
// problem: the input is a pile of ranges; sort them by start and any overlap
// becomes a neighbor, so one left→right pass is enough (no all-pairs check).
const W = 640;
const H = 250;
const LO = 0, HI = 11;
const AX0 = 60, AX1 = 588;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

// Four intervals by id; we just reorder which lane each sits in.
const IV = { A: [1, 3], B: [2, 5], C: [7, 9], D: [8, 10] };
const GIVEN = ["C", "B", "A", "D"];   // as handed to you — scattered
const SORTED = ["A", "B", "C", "D"];  // by start
const LANE_Y = [50, 78, 106, 134];

// overlapping neighbours once sorted: A–B (2≤3) and C–D (8≤9); B–C is a gap.
const OVERLAP_IDS = new Set(["A", "B", "C", "D"]);

const DEMO = [
  { order: GIVEN, note: "given: a pile of ranges in any order", hi: false, sweep: false, kind: "plain" },
  { order: SORTED, note: "step 1 — sort by start (here they line up left → right)", hi: false, sweep: false, kind: "sort" },
  { order: SORTED, note: "now any overlap is a NEIGHBOUR — no need to check all pairs", hi: true, sweep: false, kind: "ok" },
  { order: SORTED, note: "step 2 — one left → right pass does the work", hi: false, sweep: true, kind: "sweep" },
];

export default function IntervalsViz({ active = true }) {
  const k = useDemoLoop(DEMO.length, { interval: 1600, enabled: active });
  const s = DEMO[k];

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={24} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        sort the ranges by start, then sweep once
      </text>

      {/* number line */}
      <line x1={AX0} y1={170} x2={AX1} y2={170} stroke="#d6d3d1" strokeWidth={1.5} />
      {Array.from({ length: HI - LO + 1 }, (_, v) => (
        <g key={v}>
          <line x1={sx(v)} y1={167} x2={sx(v)} y2={173} stroke="#d6d3d1" strokeWidth={1} />
          <text x={sx(v)} y={186} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#a8a29e">{v}</text>
        </g>
      ))}

      {/* the sweep arrow on step 2 */}
      {s.sweep && (
        <g>
          <line x1={AX0} y1={40} x2={AX1 - 8} y2={40} stroke="#c2410c" strokeWidth={1.5} markerEnd="url(#ivSweep)" />
          <defs>
            <marker id="ivSweep" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="#c2410c" />
            </marker>
          </defs>
        </g>
      )}

      {/* intervals, placed by their value on x and by the current order on y */}
      {s.order.map((id, lane) => {
        const [a, b] = IV[id];
        const variant = s.hi && OVERLAP_IDS.has(id) ? "merged" : "default";
        return (
          <Interval key={id} x1={sx(a)} x2={sx(b)} y={LANE_Y[lane]} height={18} label={`[${a},${b}]`} variant={variant} />
        );
      })}

      <text x={W / 2} y={H - 14} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12.5" fontWeight="700" fill={s.kind === "sort" ? "#c2410c" : s.kind === "ok" ? "#15803d" : "#57534e"}>
        {s.note}
      </text>
    </VizStage>
  );
}
