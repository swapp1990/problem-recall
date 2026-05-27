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
  // ---- top half: what the pile numbers mean, sliced into 1-hour bites ----
  const sp = ANSWER_SPEED;       // demo speed = 4 bananas/hour
  const unitW = 13;              // px per banana
  const barX = 250;              // where every bar starts
  const barTop = 86;
  const rowH = 22;
  const rowStep = 30;

  // ---- bottom half: the feasibility strip ----
  const cs = 38;
  const gap = 7;
  const stripY = 274;
  const pl = rowLayout({ count: SPEEDS.length, cellSize: cs, gap, width: 700 });

  return (
    <VizStage width={700} height={392}>
      <text x={350} y={24} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        piles = [3, 6, 7, 11] — eat every banana within h = 8 hours
      </text>
      <text x={350} y={45} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">
        each number = bananas in that pile · speed = bananas eaten per hour (one pile at a time)
      </text>
      <text x={48} y={68} fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#c2410c">
        at speed 4 → slice each pile into 1-hour bites of 4 bananas:
      </text>

      {PILES.map((b, i) => {
        const hours = Math.ceil(b / sp);
        const y = barTop + i * rowStep;
        const chunks = [];
        for (let k = 0; k < hours; k++) chunks.push(Math.min(sp, b - k * sp));
        let cx = barX;
        return (
          <g key={"pile" + i}>
            <text x={barX - 12} y={y + rowH * 0.72} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#1a1814">
              {b} bananas
            </text>
            {chunks.map((w, k) => {
              const rx = cx;
              cx += w * unitW + 2;
              return (
                <g key={k}>
                  <rect x={rx} y={y} width={w * unitW} height={rowH} rx={2}
                    fill={k % 2 === 0 ? "#fde9d9" : "#fef3e9"} stroke="#c2410c" strokeWidth={1} />
                  <text x={rx + (w * unitW) / 2} y={y + rowH * 0.7} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#c2410c">1h</text>
                </g>
              );
            })}
            <text x={cx + 8} y={y + rowH * 0.72} fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#15803d">
              = {hours} hr{hours > 1 ? "s" : ""}
            </text>
          </g>
        );
      })}

      <text x={350} y={barTop + 4 * rowStep + 4} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#15803d">
        total = 1 + 2 + 2 + 3 = 8 hrs ≤ 8 ✓
      </text>

      {/* ---- the feasibility strip ---- */}
      <text x={350} y={236} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#1a1814">
        so which speeds finish in ≤ 8 hrs? check them all:
      </text>

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
        fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#15803d">↑ first ✓ — the answer = 4</text>

      <text x={350} y={stripY + cs + 44} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="12" fill="#57534e">
        faster speed ⇒ fewer hours, so the row goes ✗…✗ ✓…✓ and never flips back — that's what we binary-search
      </text>
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
