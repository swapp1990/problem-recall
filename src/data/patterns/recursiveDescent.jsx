import { VizStage, VizArray, Pointer, Deque, rowLayout, useDemoLoop } from "../../viz";

const W = 760;
const H = 290;
const CELL = 44;
const GAP = 6;
const STR_Y = 110;
const STACK_X = 470;

// Generic illustration — NOT tied to a problem. Parses an arithmetic expression,
// the textbook recursive-descent example. A cursor scans the input once, left to
// right. At each position the SINGLE next character unambiguously decides what to
// parse — a digit reads a number, '(' opens a group (recurse into parse_expr,
// push a call frame), ')' closes (return, pop a frame), an operator keeps the
// current expression going. There is no trying-and-undoing: the lookahead is
// always enough. That's what makes it RECURSIVE DESCENT (predictive parsing),
// not backtracking. (A specific grammar — JSON, nested lists — lives on its
// SOLUTION card; the mechanics are the same.)
const STR = "2*(3+4)";
const CHARS = STR.split("");
const layout = rowLayout({ count: CHARS.length, cellSize: CELL, gap: GAP, width: 360 });

const L = { value: "expr" };
const FRAMES = [
  { i: 0, stack: [{ ...L, variant: "new" }], cap: "start → call parse_expr, read 2", kind: "open" },
  { i: 1, stack: [L], cap: "'*' operator → keep parsing the expression", kind: "read" },
  { i: 2, stack: [L, { ...L, variant: "new" }], cap: "'(' → group · recurse into parse_expr", kind: "open" },
  { i: 3, stack: [L, L], cap: "digit → read the number 3", kind: "read" },
  { i: 4, stack: [L, L], cap: "'+' operator → keep parsing", kind: "read" },
  { i: 5, stack: [L, L], cap: "digit → read the number 4", kind: "read" },
  { i: 6, stack: [{ ...L, variant: "pop" }], cap: "')' → close group · return up one level", kind: "close" },
];

export default function RecursiveDescentViz({ active = true }) {
  const k = useDemoLoop(FRAMES.length, { interval: 1300, enabled: active });
  const f = FRAMES[k];
  const items = CHARS.map((c, idx) => ({
    value: c,
    variant: idx === f.i ? "active" : idx < f.i ? "matched" : "muted",
  }));
  const color = f.kind === "close" ? "#b91c1c" : f.kind === "open" ? "#15803d" : "#1a1814";

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={30} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        the next character alone decides what to parse — recurse on nesting, never undo
      </text>

      <text x={40} y={STR_Y - 46} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">input</text>
      <VizArray items={items} layout={layout} y={STR_Y} cellSize={CELL} showIndices />
      <Pointer centerX={layout.centerX(f.i)} labelY={STR_Y - 22} tipY={STR_Y - 4} label="scan" move={k < FRAMES.length - 1 ? "right" : null} />

      <text x={STACK_X} y={STR_Y - 46} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">call stack — one frame per nested group</text>
      <Deque x={STACK_X} y={STR_Y} items={f.stack} cellW={56} cellH={48} frontLabel="outer" backLabel="current" emptyLabel="returned — done" />

      <text x={W / 2} y={H - 18} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill={color}>
        {f.cap}
      </text>
    </VizStage>
  );
}
