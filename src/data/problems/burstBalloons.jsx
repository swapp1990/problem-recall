import { VizStage, Interval, Caption } from "../../viz";

const W = 760;
const LO = 0, HI = 18;
const AX0 = 64, AX1 = 712;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

// Two cases, each its own balloon set + given/sorted order + step trace.
// They share the SolutionViz — case data flows via the `data` prop.
//
// Case "main": 4 balloons that pair up — each arrow takes out 2 → answer 2.
// Case "big-cover": a big [1,10] balloon hides among small ones; sorting by
//   END reorders it to the back, and the FIRST arrow (at the earliest small
//   end) bursts the big one for free → answer 3 (not 4).

const CASES = {
  main: {
    balloons: { A: [10, 16], B: [2, 8], C: [1, 6], D: [7, 12] },
    given: ["A", "B", "C", "D"],
    sorted: ["C", "B", "D", "A"],                    // ends: 6, 8, 12, 16
    steps: [
      { phase: "given", order: ["A", "B", "C", "D"], arrow: null, burst: [], armed: null, status: "given: 4 balloons spanning x-ranges · burst all with the fewest arrows" },
      { phase: "sort", order: ["C", "B", "D", "A"], arrow: null, burst: [], armed: "C", status: "sort by END (right edge) · earliest-ending balloon goes first" },
      { phase: "aim", order: ["C", "B", "D", "A"], arrow: null, burst: [], armed: "C", arrowAt: 6, status: "aim at C's right edge (x=6) — that's the latest x that still bursts C" },
      { phase: "shoot", order: ["C", "B", "D", "A"], arrow: 6, burst: ["C", "B"], armed: null, arrows: 1, status: "shoot at x=6 → bursts C [1,6] (right edge) AND B [2,8] (2 ≤ 6 ≤ 8) · arrows = 1" },
      { phase: "aim", order: ["C", "B", "D", "A"], arrow: 6, burst: ["C", "B"], armed: "D", arrowAt: 12, arrows: 1, status: "next unburst is D [7,12] · aim at x=12" },
      { phase: "shoot", order: ["C", "B", "D", "A"], arrow: 12, burst: ["C", "B", "D", "A"], armed: null, arrows: 2, status: "shoot at x=12 → bursts D [7,12] (right edge) AND A [10,16] (10 ≤ 12 ≤ 16) · arrows = 2" },
      { phase: "done", order: ["C", "B", "D", "A"], arrow: 12, burst: ["C", "B", "D", "A"], armed: null, arrows: 2, done: true, status: "every balloon burst with 2 arrows · return 2" },
    ],
    result: "2",
    label: "4 balloons → 2 arrows (each fells 2)",
  },
  "big-cover": {
    // A is huge — if sorted by START it'd lead, tempting an arrow at x=10
    // that only bursts A. Sorted by END it goes LAST · the first arrow
    // (aimed at B's end x=3) bursts both B and A in one shot.
    balloons: { A: [1, 10], B: [2, 3], C: [5, 6], D: [7, 8] },
    given: ["A", "B", "C", "D"],
    sorted: ["B", "C", "D", "A"],                    // ends: 3, 6, 8, 10
    steps: [
      { phase: "given", order: ["A", "B", "C", "D"], arrow: null, burst: [], armed: null, status: "given: a huge balloon A=[1,10] and three small ones B, C, D · A overlaps everything" },
      { phase: "sort", order: ["B", "C", "D", "A"], arrow: null, burst: [], armed: "B", status: "sort by END · the BIG balloon A (end=10) moves to the back · the smallest end (B, 3) leads" },
      { phase: "aim", order: ["B", "C", "D", "A"], arrow: null, burst: [], armed: "B", arrowAt: 3, status: "aim at B's right edge x=3 · note A still reaches up to x=10 (1 ≤ 3 ≤ 10) — the arrow will hit it for FREE" },
      { phase: "shoot", order: ["B", "C", "D", "A"], arrow: 3, burst: ["B", "A"], armed: null, arrows: 1, freebie: "A", status: "shoot at x=3 → bursts B [2,3] (anchor) AND A [1,10] (huge — caught for free) · arrows = 1" },
      { phase: "aim", order: ["B", "C", "D", "A"], arrow: 3, burst: ["B", "A"], armed: "C", arrowAt: 6, arrows: 1, status: "next unburst is C [5,6] · aim at x=6" },
      { phase: "shoot", order: ["B", "C", "D", "A"], arrow: 6, burst: ["B", "A", "C"], armed: null, arrows: 2, status: "shoot at x=6 → bursts C alone (D starts at 7 > 6) · arrows = 2" },
      { phase: "aim", order: ["B", "C", "D", "A"], arrow: 6, burst: ["B", "A", "C"], armed: "D", arrowAt: 8, arrows: 2, status: "next unburst is D [7,8] · aim at x=8" },
      { phase: "shoot", order: ["B", "C", "D", "A"], arrow: 8, burst: ["B", "A", "C", "D"], armed: null, arrows: 3, status: "shoot at x=8 → bursts D · arrows = 3" },
      { phase: "done", order: ["B", "C", "D", "A"], arrow: 8, burst: ["B", "A", "C", "D"], armed: null, arrows: 3, done: true, status: "3 arrows · sort-by-end paid for itself — the first arrow alone bursts a SMALL+BIG pair (B+A)" },
    ],
    result: "3",
    label: "huge balloon + 3 small → 3 arrows (NOT 4 — sort-by-end pays off)",
  },
};

const lbl = (key, iv) => `${key} [${iv[0]},${iv[1]}]`;

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
function Arrow({ x, yTop, yBottom, label, color = "#b91c1c" }) {
  return (
    <g>
      <line x1={x} y1={yTop} x2={x} y2={yBottom} stroke={color} strokeWidth={2.5} strokeDasharray="6 4" />
      <polygon points={`${x - 4},${yTop + 3} ${x + 4},${yTop + 3} ${x},${yTop - 5}`} fill={color} />
      {label && (
        <text x={x} y={yTop - 9} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill={color}>
          {label}
        </text>
      )}
    </g>
  );
}

function ProblemViz() {
  const { balloons, sorted } = CASES.main;
  const laneY = [56, 78, 100, 122];
  return (
    <VizStage width={W} height={300}>
      <text x={W / 2} y={28} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        burst every balloon — one arrow flies up at x and pops every balloon spanning that x
      </text>
      <text x={AX0 - 12} y={laneY[1] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">balloons</text>
      {sorted.map((k, idx) => (
        <Interval key={k} x1={sx(balloons[k][0])} x2={sx(balloons[k][1])} y={laneY[idx]} height={16} label={lbl(k, balloons[k])} variant="default" />
      ))}
      <Axis y={158} />
      <Arrow x={sx(6)} yTop={48} yBottom={158} label="↑ x=6" />
      <Arrow x={sx(12)} yTop={48} yBottom={158} label="↑ x=12" />
      <Caption joinX={W / 2} cy={252} label="return" value="2" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ step, data }) {
  const caseData = CASES[data.id] || CASES.main;
  const { balloons } = caseData;
  const laneY = [50, 72, 94, 116];
  const AXIS_Y = 148;

  const titleByPhase = {
    given: "given — balloons in arbitrary order",
    sort: "sort by RIGHT edge so the earliest-ending balloon goes first",
    aim: "aim at the right edge of the earliest unburst balloon (latest x that still bursts it)",
    shoot: step.freebie
      ? `fire — the anchor pops AND ${step.freebie}'s span reaches over the arrow, so ${step.freebie} bursts for free`
      : "fire — this arrow bursts the anchor AND every balloon whose start ≤ arrow x",
    done: `${step.arrows} arrow${step.arrows === 1 ? "" : "s"} burst every balloon`,
  };

  return (
    <VizStage width={W} height={236}>
      <text x={W / 2} y={22} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#1a1814">
        {titleByPhase[step.phase]}
      </text>

      <text x={AX0 - 12} y={laneY[1] + 12} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">balloons</text>
      {step.order.map((k, idx) => {
        const iv = balloons[k];
        let variant = "default";
        if (step.burst.includes(k)) variant = "pop";
        else if (k === step.armed) variant = "active";
        // The "freebie" balloon — popped same step as the anchor without being
        // the anchor — gets a brief merged/yellow flash so the eye catches the
        // bonus. After the shoot frame it falls back to pop (red).
        if (step.phase === "shoot" && step.freebie === k) variant = "merged";
        return <Interval key={k} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={18} label={lbl(k, iv)} variant={variant} />;
      })}

      <Axis y={AXIS_Y} />

      {step.phase === "aim" && step.arrowAt != null && (
        <Arrow x={sx(step.arrowAt)} yTop={40} yBottom={AXIS_Y} label={`aim x=${step.arrowAt}`} />
      )}
      {step.phase === "shoot" && step.arrow != null && (
        <Arrow x={sx(step.arrow)} yTop={40} yBottom={AXIS_Y} label={`fire x=${step.arrow}`} />
      )}

      {(step.arrows ?? 0) > 0 && (
        <g>
          <rect x={W - 130} y={AXIS_Y + 22} width={110} height={26} rx={6} fill="#fee2e2" stroke="#b91c1c" strokeWidth={1.5} />
          <text x={W - 75} y={AXIS_Y + 40} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#b91c1c">
            arrows = {step.arrows}
          </text>
        </g>
      )}

      {step.phase === "done" && (
        <Caption joinX={W / 2} cy={214} label="return" value={String(step.arrows)} fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={16} height={28} />
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
    { input: "[[1,10],[2,3],[5,6],[7,8]]", result: "3", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Sort by right edge. Take the leftmost (earliest-ending) balloon and fire an arrow at its right edge — this is the latest position that still bursts it, and so the position that overlaps the MOST later balloons. Skip every balloon the arrow also bursts (start ≤ arrow), then repeat on the first balloon left standing. O(n log n).\n\nWhy by right edge, not left? Try the big-balloon case: a wide balloon [1,10] tempts you to fire at x=10 if it leads the input. Sorting by END puts [1,10] LAST, so the first arrow (aimed at a small balloon's right edge) reaches into the big balloon for free.",
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
      { id: "main", label: CASES.main.label, result: CASES.main.result, ok: true, steps: CASES.main.steps },
      { id: "big-cover", label: CASES["big-cover"].label, result: CASES["big-cover"].result, ok: true, steps: CASES["big-cover"].steps },
    ],
  },
};
