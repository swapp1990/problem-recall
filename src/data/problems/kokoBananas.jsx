import { VizStage, VizArray, Pointer, Output, rowLayout } from "../../viz";

const W = 660;
const H = 300;
const CELL = 44;
const GAP = 8;
const CELL_Y = 120;

const PILES = [3, 6, 7, 11];
const H_HOURS = 8;
const MAXP = 11; // max pile = upper bound on speed
const SPEEDS = Array.from({ length: MAXP }, (_, i) => i + 1); // 1..11 (the answer space)

// Binary search on the ANSWER: the cells are candidate speeds, not array values.
// At each mid speed we run a feasibility check (hours needed ≤ h?). `while
// left < right` with right = mid (keep mid) on feasible, left = mid+1 on too-slow.
const STEPS = [
  { l: 1, r: 11, mid: null, found: null, status: "search the eating speed in [1, 11].  h = 8 hours" },
  { l: 1, r: 11, mid: 6, found: null, status: "speed 6 → 1+1+2+2 = 6 hrs ≤ 8 ✓ feasible → try slower, right = 6", move: { right: "left" } },
  { l: 1, r: 6, mid: 3, found: null, status: "speed 3 → 1+2+3+4 = 10 hrs > 8 ✗ too slow → faster, left = 4", move: { left: "right" } },
  { l: 4, r: 6, mid: 5, found: null, status: "speed 5 → 1+2+2+3 = 8 hrs ≤ 8 ✓ → try slower, right = 5", move: { right: "left" } },
  { l: 4, r: 5, mid: 4, found: null, status: "speed 4 → 1+2+2+3 = 8 hrs ≤ 8 ✓ → try slower, right = 4", move: { right: "left" } },
  { l: 4, r: 4, mid: null, found: 4, done: true, status: "left = right = 4 → minimum eating speed = 4" },
];

// Hours Koko needs at each speed 1..11 for piles [3,6,7,11]
// (sum of ceil(pile / speed)). The point: it only ever DROPS as speed rises.
const HOURS_AT = SPEEDS.map((sp) => PILES.reduce((acc, p) => acc + Math.ceil(p / sp), 0));
const ANSWER_SPEED = 4; // leftmost speed whose hours ≤ 8

function ProblemViz() {
  const sp = ANSWER_SPEED;               // demo speed = 4 bananas/hour
  const col = rowLayout({ count: PILES.length, cellSize: 70, gap: 58, width: 700 });
  const boxW = 30;
  const boxH = 12;
  const groupGap = 6;                    // gap between hour-blocks of 4
  const yBase = 232;                     // stacks grow upward from here

  // feasibility strip
  const cs = 36;
  const gap = 7;
  const stripY = 316;
  const pl = rowLayout({ count: SPEEDS.length, cellSize: cs, gap, width: 700 });

  return (
    <VizStage width={700} height={388}>
      <text x={350} y={26} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        speed 4 = eat up to 4 bananas an hour, from one pile only
      </text>
      <text x={350} y={47} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">
        leftover capacity (dashed) is wasted — you can't start the next pile in the same hour
      </text>

      {PILES.map((b, i) => {
        const hours = Math.ceil(b / sp);
        const slots = hours * sp;          // padded up to a whole number of hour-blocks
        const cx = col.cellX(i) + 35;
        const x = cx - boxW / 2;
        const topY = yBase - boxH * slots - groupGap * (hours - 1);
        return (
          <g key={"pile" + i}>
            {Array.from({ length: slots }, (_, s) => {
              const g = Math.floor(s / sp);
              const y = yBase - boxH * (s + 1) - groupGap * g;
              const filled = s < b;
              return (
                <rect key={s} x={x} y={y} width={boxW} height={boxH} rx={2}
                  fill={filled ? "#fbbf24" : "none"}
                  stroke={filled ? "#b45309" : "#d6d3d1"} strokeWidth={1}
                  strokeDasharray={filled ? undefined : "3 2"} />
              );
            })}
            <text x={cx} y={topY - 7} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#1a1814">{b}</text>
            <text x={cx} y={yBase + 18} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#15803d">{hours} hr{hours > 1 ? "s" : ""}</text>
          </g>
        );
      })}

      <text x={40} y={yBase + 18} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">hrs:</text>
      <text x={350} y={yBase + 40} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#15803d">
        1 + 2 + 2 + 3 = 8 hrs ≤ 8 ✓
      </text>

      {/* feasibility strip: sweep every speed */}
      <text x={pl.originX - 12} y={stripY - cs / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#57534e">hrs needed</text>
      {SPEEDS.map((spd, i) => {
        const feasible = HOURS_AT[i] <= H_HOURS;
        return (
          <text key={"h" + spd} x={pl.cellX(i) + cs / 2} y={stripY - cs / 2 + 4} textAnchor="middle"
            fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight={feasible ? 700 : 400}
            fill={feasible ? "#15803d" : "#b91c1c"}>
            {HOURS_AT[i]}
          </text>
        );
      })}

      <text x={pl.originX - 12} y={stripY + cs / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">speed</text>
      {SPEEDS.map((spd, i) => {
        const feasible = HOURS_AT[i] <= H_HOURS;
        const isAnswer = spd === ANSWER_SPEED;
        return (
          <g key={"c" + spd}>
            <rect x={pl.cellX(i)} y={stripY} width={cs} height={cs} rx={3}
              fill={feasible ? "#dcfce7" : "#fee2e2"}
              stroke={isAnswer ? "#15803d" : feasible ? "#86efac" : "#fca5a5"}
              strokeWidth={isAnswer ? 3 : 1.5} />
            <text x={pl.cellX(i) + cs / 2} y={stripY + cs * 0.46} textAnchor="middle"
              fontFamily="JetBrains Mono, monospace" fontSize="15" fontWeight="700"
              fill={feasible ? "#15803d" : "#b91c1c"}>{spd}</text>
            <text x={pl.cellX(i) + cs / 2} y={stripY + cs * 0.82} textAnchor="middle"
              fontFamily="JetBrains Mono, monospace" fontSize="12"
              fill={feasible ? "#15803d" : "#b91c1c"}>{feasible ? "✓" : "✗"}</text>
          </g>
        );
      })}

      <text x={pl.cellX(ANSWER_SPEED - 1) + cs / 2} y={stripY + cs + 22} textAnchor="middle"
        fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#15803d">↑ slowest ✓ = 4</text>
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const layout = rowLayout({ count: SPEEDS.length, cellSize: CELL, gap: GAP, width: W });
  const items = SPEEDS.map((sp) => ({
    value: sp,
    variant: sp < step.l || sp > step.r ? "matched" : sp === step.mid ? "active" : "default",
  }));
  return (
    <VizStage width={W} height={H}>
      <text x={40} y={26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">piles = [3,6,7,11] · h = 8</text>
      <text x={layout.originX - 12} y={CELL_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">speed</text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} />

      {step.l <= step.r && <Pointer centerX={layout.centerX(step.l - 1)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="left" move={step.move?.left} />}
      {step.l <= step.r && step.r !== step.l && <Pointer centerX={layout.centerX(step.r - 1)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="right" move={step.move?.right} />}
      {step.mid != null && (
        <text x={layout.centerX(step.mid - 1)} y={CELL_Y + CELL + 30} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#c2410c">↑ try speed {step.mid}</text>
      )}

      <Output x={W / 2 - 70} cy={250} label="min speed" value={step.found ?? "?"} />
    </VizStage>
  );
}

export default {
  id: "koko-bananas",
  leetcode: 875,
  title: "Koko Eating Bananas",
  difficulty: "Medium",
  tagline: "Smallest eating speed to finish all banana piles within h hours.",
  patternId: "binary-search",
  constraint: "Answer (speed) lies in [1, max pile]; feasibility is monotonic.",
  ProblemViz,
  examples: [
    { input: "piles=[3,6,7,11], h=8", result: "4", ok: true },
    { input: "piles=[30,11,23,4,20], h=5", result: "30", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "There's no array to search — we binary-search the ANSWER. Speeds 1..max(piles) are the candidates, and 'can finish in h hours?' is monotonic: if a speed works, every faster speed works too. So we binary-search for the smallest speed that's still feasible.",
    code: `import math
def minEatingSpeed(piles, h):
    left, right = 1, max(piles)
    while left < right:
        mid = (left + right) // 2
        hours = sum(math.ceil(p / mid) for p in piles)
        if hours <= h:
            right = mid          # feasible → try slower
        else:
            left = mid + 1       # too slow → faster
    return left`,
    codeHighlight: [5, 6, 7, 8, 9, 10],
    codeNote: "binary-search the answer (speed)",
    cases: [{ id: "koko", label: "piles=[3,6,7,11], h=8", result: "4", ok: true, input: PILES, steps: STEPS }],
  },
};
