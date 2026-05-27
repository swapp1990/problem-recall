import { VizStage, VizArray, Pointer, Caption, Output, rowLayout } from "../../viz";

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

function ProblemViz() {
  const cs = 60;
  const gap = 12;
  const cy = 150;
  const pl = rowLayout({ count: PILES.length, cellSize: cs, gap, width: 700 });
  const items = PILES.map((n) => ({ value: n, variant: "default" }));
  return (
    <VizStage width={700} height={320}>
      <Caption joinX={470} cy={56} label="eat all piles within h =" value="8" />
      <text x={350} y={96} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#57534e">piles (bananas)</text>
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} />
      <text x={350} y={cy + cs + 44} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">
        at speed 4: 1+2+2+3 = 8 hrs ≤ 8 — and 3 is too slow
      </text>
      <Caption joinX={300} cy={300} label="slowest speed =" value="4" fill="#dcfce7" stroke="#15803d" color="#15803d" />
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
