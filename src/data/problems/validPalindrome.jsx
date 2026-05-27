import { AnimatePresence } from "framer-motion";
import { VizStage, VizArray, Pointer, Arc, rowLayout, convergingVariant } from "../../viz";

const W = 800;
const H = 280;
const CELL = 70;
const GAP = 8;
const CELL_Y = 90;

const PASS = ["r", "a", "c", "e", "c", "a", "r"]; // "racecar"
const FAIL = ["r", "a", "c", "e", "a", "c", "a", "r"]; // "race a car" normalized

// On a match, both pointers move inward — the `move` hint shows it during the
// step (left → screen-right, right → screen-left). A mismatch ends the run, so
// no hint there.
const PASS_STEPS = [
  { left: 0, right: 6, status: "Initialize: left at 0, right at 6.", compare: false },
  { left: 0, right: 6, status: 's[0]="r"  ==  s[6]="r"  ✓  match', compare: true, match: true, move: { left: "right", right: "left" } },
  { left: 1, right: 5, status: 's[1]="a"  ==  s[5]="a"  ✓  match', compare: true, match: true, move: { left: "right", right: "left" } },
  { left: 2, right: 4, status: 's[2]="c"  ==  s[4]="c"  ✓  match', compare: true, match: true, move: { left: "right", right: "left" } },
  { left: 3, right: 3, status: "Pointers meet. All matched → return true.", compare: false },
];

const FAIL_STEPS = [
  { left: 0, right: 7, status: "Initialize: left at 0, right at 7.", compare: false },
  { left: 0, right: 7, status: 's[0]="r"  ==  s[7]="r"  ✓  match', compare: true, match: true, move: { left: "right", right: "left" } },
  { left: 1, right: 6, status: 's[1]="a"  ==  s[6]="a"  ✓  match', compare: true, match: true, move: { left: "right", right: "left" } },
  { left: 2, right: 5, status: 's[2]="c"  ==  s[5]="c"  ✓  match', compare: true, match: true, move: { left: "right", right: "left" } },
  { left: 3, right: 4, status: 's[3]="e"  ≠  s[4]="a"  ✗  mismatch → return false', compare: true, match: false },
];

// Problem-specific input/normalize/mirror diagram (the passing example).
function ProblemViz() {
  return (
    <svg viewBox="0 0 800 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <text x="60" y="50" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e" letterSpacing="2">INPUT  s =</text>

      <g fontFamily="JetBrains Mono, monospace" fontSize="24" fill="#1a1814">
        <text x="180" y="55" fontWeight="600">"A man, a plan, a canal: Panama"</text>
      </g>

      <g stroke="#a8a29e" strokeWidth="1.5" fill="none" strokeDasharray="3,4">
        <path d="M 400 80 L 400 130" markerEnd="url(#arrowGray)" />
      </g>
      <text x="420" y="110" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#57534e">strip non-alphanumeric, lowercase</text>

      <g fontFamily="JetBrains Mono, monospace" fontSize="20" fill="#1a1814">
        <g transform="translate(80, 160)">
          {"amanaplanacanalpanama".split("").map((ch, i) => {
            const x = i * 30;
            const pivot = i === 10;
            return (
              <g key={i}>
                <rect x={x} y="0" width="30" height="40" fill={pivot ? "#fef3e9" : "none"} stroke={pivot ? "#c2410c" : "#1a1814"} strokeWidth={pivot ? "2" : "1.5"} />
                <text x={x + 15} y="27" textAnchor="middle" fill={pivot ? "#c2410c" : undefined} fontWeight={pivot ? "700" : undefined}>{ch}</text>
              </g>
            );
          })}
        </g>
      </g>

      <g stroke="#c2410c" strokeWidth="2" fill="none">
        <path d="M 80 215 L 80 230 L 380 230 L 380 215" />
        <path d="M 410 215 L 410 230 L 710 230 L 710 215" />
      </g>
      <g fontFamily="Fraunces, serif" fontSize="14" fontStyle="italic" fill="#c2410c">
        <text x="230" y="252" textAnchor="middle">left half</text>
        <text x="560" y="252" textAnchor="middle">right half (reversed)</text>
      </g>
      <text x="395" y="225" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#a8a29e">pivot</text>

      <g stroke="#15803d" strokeWidth="1.5" fill="none">
        <path d="M 95 280 Q 395 320 695 280" markerEnd="url(#arrowGreen)" markerStart="url(#arrowGreenStart)" />
      </g>
      <text x="395" y="335" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">mirror match</text>

      <g transform="translate(80, 350)">
        <text x="0" y="0" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e" letterSpacing="2">RETURN</text>
        <rect x="100" y="-18" width="80" height="26" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" rx="3" />
        <text x="140" y="1" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#15803d">true</text>
      </g>

      <defs>
        <marker id="arrowGray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#a8a29e" />
        </marker>
        <marker id="arrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#15803d" />
        </marker>
        <marker id="arrowGreenStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 10 0 L 0 5 L 10 10 z" fill="#15803d" />
        </marker>
      </defs>
    </svg>
  );
}

// Solution scene: symmetric convergence. Arc turns red on a mismatch.
function SolutionViz({ data, step }) {
  const input = data.input;
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: W });
  const merged = step.left === step.right;
  const items = input.map((ch, i) => ({ value: ch, variant: convergingVariant(i, step.left, step.right) }));
  const mismatch = step.match === false;
  return (
    <VizStage width={W} height={H}>
      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      <Pointer centerX={layout.centerX(step.left)} labelY={48} tipY={CELL_Y - 5} label={merged ? "left = right" : "left"} move={step.move?.left} />
      {!merged && <Pointer centerX={layout.centerX(step.right)} labelY={48} tipY={CELL_Y - 5} label="right" move={step.move?.right} />}
      <AnimatePresence>
        {step.compare && (
          <Arc
            key={`${step.left}-${step.right}`}
            x1={layout.centerX(step.left)}
            x2={layout.centerX(step.right)}
            y={CELL_Y + CELL + 4}
            depth={55}
            color={mismatch ? "#b91c1c" : "#15803d"}
            label={mismatch ? "mismatch ✗" : undefined}
          />
        )}
      </AnimatePresence>
    </VizStage>
  );
}

export default {
  id: "valid-palindrome",
  leetcode: 125,
  title: "Valid Palindrome",
  difficulty: "Easy",
  tagline: "Reads the same forwards and backwards (letters & digits only).",
  patternId: "two-pointers",
  ProblemViz,
  examples: [
    { input: '"racecar"', result: "true", ok: true },
    { input: '"race a car"', result: "false", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    cases: [
      { id: "pass", label: '"racecar"', result: "true", ok: true, input: PASS, steps: PASS_STEPS },
      { id: "fail", label: '"race a car"', result: "false", ok: false, input: FAIL, steps: FAIL_STEPS },
    ],
  },
};
