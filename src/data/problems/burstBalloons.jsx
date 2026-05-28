import { VizStage, Interval, Caption } from "../../viz";

const W = 760;
const H = 320;
const LO = 0, HI = 18;
const AX0 = 64, AX1 = 712;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

// 4 balloons given in arbitrary order — sort by END (rightmost edge) so the
// earliest-ending balloon anchors the first arrow. The greedy insight: any
// arrow that bursts the earliest-ending balloon should be placed at its
// right edge — that maximizes overlap with later balloons.
//
// Sorted-by-end → [[1,6],[2,8],[7,12],[10,16]]
//   arrow at x=6  → bursts [1,6] AND [2,8] (start 2 ≤ 6)
//   arrow at x=12 → bursts [7,12] AND [10,16] (start 10 ≤ 12)
// Answer = 2 arrows.
const BALLOONS = {
  A: [10, 16],
  B: [2, 8],
  C: [1, 6],
  D: [7, 12],
};
const GIVEN = ["A", "B", "C", "D"];                // input order (jumbled)
const SORTED = ["C", "B", "D", "A"];               // sorted by end (6, 8, 12, 16)

const lbl = (key, iv) => `${key} [${iv[0]},${iv[1]}]`;

// `arrow` = x-position of the arrow just fired this step (null otherwise) ·
// `burst` = set of keys popped so far · `armed` = key of the balloon whose end
// will anchor the NEXT arrow (the leftmost unburst end).
const STEPS = [
  { phase: "given", order: GIVEN, arrow: null, burst: [], armed: null, status: "given: 4 balloons spanning x-ranges · burst all with the fewest arrows" },
  { phase: "sort", order: SORTED, arrow: null, burst: [], armed: "C", status: "sort by END (right edge) · earliest-ending balloon goes first" },
  { phase: "aim", order: SORTED, arrow: null, burst: [], armed: "C", arrowAt: 6, status: "aim at C's right edge (x=6) — that's the latest x that still bursts C" },
  { phase: "shoot", order: SORTED, arrow: 6, burst: ["C", "B"], armed: null, arrows: 1, status: "shoot at x=6 → bursts C [1,6] (right edge) AND B [2,8] (2 ≤ 6 ≤ 8) · arrows = 1" },
  { phase: "aim", order: SORTED, arrow: 6, burst: ["C", "B"], armed: "D", arrowAt: 12, arrows: 1, status: "next unburst by sorted-end is D [7,12] · aim at x=12" },
  { phase: "shoot", order: SORTED, arrow: 12, burst: ["C", "B", "D", "A"], armed: null, arrows: 2, status: "shoot at x=12 → bursts D [7,12] (right edge) AND A [10,16] (10 ≤ 12 ≤ 16) · arrows = 2" },
  { phase: "done", order: SORTED, arrow: 12, burst: ["C", "B", "D", "A"], armed: null, arrows: 2, done: true, status: "every balloon burst with 2 arrows · return 2" },
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

// Vertical arrow line — drawn through all lanes the arrow passes through.
function Arrow({ x, yTop, yBottom, label }) {
  return (
    <g>
      <line x1={x} y1={yTop} x2={x} y2={yBottom} stroke="#b91c1c" strokeWidth={2.5} strokeDasharray="6 4" />
      <polygon points={`${x - 4},${yTop + 3} ${x + 4},${yTop + 3} ${x},${yTop - 5}`} fill="#b91c1c" />
      {label && (
        <text x={x} y={yTop - 9} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill="#b91c1c">
          {label}
        </text>
      )}
    </g>
  );
}

function ProblemViz() {
  const laneY = [56, 78, 100, 122];
  return (
    <VizStage width={W} height={300}>
      <text x={W / 2} y={28} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        burst every balloon — one arrow flies up at x and pops every balloon spanning that x
      </text>
      <text x={AX0 - 12} y={laneY[1] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">balloons</text>
      {SORTED.map((k, idx) => (
        <Interval key={k} x1={sx(BALLOONS[k][0])} x2={sx(BALLOONS[k][1])} y={laneY[idx]} height={16} label={lbl(k, BALLOONS[k])} variant="default" />
      ))}
      <Axis y={158} />
      {/* Two arrows showing the answer geometrically on the problem card. */}
      <Arrow x={sx(6)} yTop={48} yBottom={158} label="↑ x=6" />
      <Arrow x={sx(12)} yTop={48} yBottom={158} label="↑ x=12" />
      <Caption joinX={W / 2} cy={252} label="return" value="2" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ step }) {
  const laneY = [50, 72, 94, 116];
  const AXIS_Y = 148;

  const titleByPhase = {
    given: "given — balloons in arbitrary order",
    sort: "sort by RIGHT edge so the earliest-ending balloon goes first",
    aim: "aim at the right edge of the earliest unburst balloon (latest x that still bursts it)",
    shoot: "fire — this arrow bursts the anchor AND every balloon whose start ≤ arrow x",
    done: `${step.arrows} arrow${step.arrows === 1 ? "" : "s"} burst every balloon`,
  };

  return (
    <VizStage width={W} height={232}>
      <text x={W / 2} y={22} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#1a1814">
        {titleByPhase[step.phase]}
      </text>

      <text x={AX0 - 12} y={laneY[1] + 12} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">balloons</text>
      {step.order.map((k, idx) => {
        const iv = BALLOONS[k];
        let variant = "default";
        if (step.burst.includes(k)) variant = "pop";              // burst → red
        else if (k === step.armed) variant = "active";            // anchor for next arrow
        return <Interval key={k} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={18} label={lbl(k, iv)} variant={variant} />;
      })}

      <Axis y={AXIS_Y} />

      {/* Aim arrow — dashed faint while just aiming, solid when shooting. */}
      {step.phase === "aim" && step.arrowAt != null && (
        <Arrow x={sx(step.arrowAt)} yTop={40} yBottom={AXIS_Y} label={`aim x=${step.arrowAt}`} />
      )}
      {step.phase === "shoot" && step.arrow != null && (
        <Arrow x={sx(step.arrow)} yTop={40} yBottom={AXIS_Y} label={`fire x=${step.arrow}`} />
      )}

      {/* Arrow counter — a small badge that grows so the answer being chased
          is visible across steps, not just stated. */}
      {(step.arrows ?? 0) > 0 && (
        <g>
          <rect x={W - 130} y={AXIS_Y + 22} width={110} height={26} rx={6} fill="#fee2e2" stroke="#b91c1c" strokeWidth={1.5} />
          <text x={W - 75} y={AXIS_Y + 40} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#b91c1c">
            arrows = {step.arrows}
          </text>
        </g>
      )}

      {step.phase === "done" && (
        <Caption joinX={W / 2} cy={210} label="return" value={String(step.arrows)} fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={16} height={28} />
      )}
    </VizStage>
  );
}

export default {
  id: "burst-balloons",
  leetcode: 452,
  title: "Minimum Number of Arrows to Burst Balloons",
  difficulty: "Medium",
  tagline: "Min arrows to pop every balloon — sort by right edge, then anchor each arrow to the earliest end.",
  patternId: "intervals",
  constraint: "Balloons are closed intervals [start, end]; an arrow at x bursts every balloon with start ≤ x ≤ end.",
  ProblemViz,
  examples: [
    { input: "[[10,16],[2,8],[1,6],[7,12]]", result: "2", ok: true },
    { input: "[[1,2],[3,4],[5,6],[7,8]]", result: "4", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Sort by right edge. Take the leftmost (earliest-ending) balloon and fire an arrow at its right edge — this is the latest position that still bursts it, and so the position that overlaps the MOST later balloons. Skip every balloon the arrow also bursts (start ≤ arrow), then repeat on the first balloon left standing. O(n log n).",
    code: `def findMinArrowShots(points):
    points.sort(key=lambda p: p[1])      # by right edge
    arrows = 0
    arrow_x = -float('inf')
    for s, e in points:
        if s > arrow_x:                  # not covered by the last arrow
            arrows += 1
            arrow_x = e                  # fire at this balloon's right edge
    return arrows`,
    codeHighlight: [2, 3, 4, 5, 6, 7, 8, 9],
    codeNote: "sort by end · anchor arrows to earliest unburst end",
    cases: [
      { id: "main", label: "4 balloons → 2 arrows (each fells 2)", result: "2", ok: true, steps: STEPS },
    ],
  },
};
