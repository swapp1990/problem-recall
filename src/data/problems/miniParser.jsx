import { VizStage, VizArray, Pointer, Caption, Deque, Output, rowLayout } from "../../viz";

const W = 760;
const H = 320;
const CELL = 40;
const GAP = 5;
const STR_Y = 150;
const STACK_X = 520;

const INPUT = "[12,[34]]";
const CHARS = INPUT.split("");

// ---- Problem viz: the QUESTION, not the method. The flat string on top, the
// nested structure it denotes below — method-free.
function ProblemViz() {
  const cs = 44;
  const gap = 5;
  const cy = 110;
  const chars = "[123,[456,789]]".split("");
  const pl = rowLayout({ count: chars.length, cellSize: cs, gap, width: 720 });
  const items = chars.map((c) => ({ value: c }));
  return (
    <VizStage width={760} height={320}>
      <Caption joinX={380} cy={50} label="deserialize the string" value="" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} />
      <text x={380} y={cy + cs + 40} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#57534e">
        a list whose elements are integers or other lists
      </text>
      <text x={380} y={cy + cs + 76} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="18" fontWeight="600" fill="#15803d">
        [ 123, [ 456, 789 ] ]
      </text>
      <Caption joinX={300} cy={300} label="depth" value="up to 2 levels" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={16} height={30} />
    </VizStage>
  );
}

// ---- Solution steps: recursive descent over the string. `i` is the cursor,
// `stack` is the call stack (one "list" frame per open '['), `built` is the
// structure assembled so far.
const L = { value: "list" };
const STEPS = [
  { i: 0, stack: [{ ...L, variant: "new" }], built: "[ ]", kind: "open", status: "'[' → start a list, recurse into parse_list" },
  { i: 1, stack: [L], built: "[ 12 ]", kind: "read", status: "digits → read the integer 12, add to the list" },
  { i: 3, stack: [L], built: "[ 12 ]", kind: "read", status: "',' → separator, move to the next element" },
  { i: 4, stack: [L, { ...L, variant: "new" }], built: "[ 12, [ ] ]", kind: "open", status: "'[' → nested list, recurse one level deeper" },
  { i: 5, stack: [L, L], built: "[ 12, [ 34 ] ]", kind: "read", status: "digits → read the integer 34, add to the inner list" },
  { i: 7, stack: [L, { ...L, variant: "pop" }], built: "[ 12, [ 34 ] ]", kind: "close", status: "']' → close the inner list, return up one level" },
  { i: 8, stack: [{ ...L, variant: "pop" }], built: "[ 12, [ 34 ] ]", kind: "close", status: "']' → close the outer list", done: true },
];

function SolutionViz({ data, step }) {
  const chars = data.input.split("");
  const layout = rowLayout({ count: chars.length, cellSize: CELL, gap: GAP, width: 420 });
  const items = chars.map((c, idx) => ({
    value: c,
    variant: idx === step.i ? "active" : idx < step.i ? "matched" : "muted",
  }));
  const color = step.kind === "close" ? "#b91c1c" : step.kind === "open" ? "#15803d" : "#1a1814";

  return (
    <VizStage width={W} height={H}>
      <text x={40} y={28} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">recursive descent — one lookahead char picks the branch</text>

      <text x={40} y={STR_Y - 46} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">input</text>
      <VizArray items={items} layout={layout} y={STR_Y} cellSize={CELL} showIndices />
      <Pointer centerX={layout.centerX(step.i)} labelY={STR_Y - 22} tipY={STR_Y - 4} label="i" move={!step.done ? "right" : null} />

      <text x={STACK_X} y={STR_Y - 46} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">call stack</text>
      <Deque x={STACK_X} y={STR_Y} items={step.stack} cellW={54} cellH={46} frontLabel="outer" backLabel="current" emptyLabel="returned" />

      <text x={40} y={252} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">built so far</text>
      <text x={40} y={278} fontFamily="JetBrains Mono, monospace" fontSize="18" fontWeight="600" fill="#1a1814">{step.built}</text>

      {step.done && <Output x={430} cy={270} label="result" value={step.built} />}

      <text x={40} y={H - 14} fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill={color}>{step.status}</text>
    </VizStage>
  );
}

export default {
  id: "mini-parser",
  leetcode: 385,
  title: "Mini Parser",
  difficulty: "Medium",
  tagline: "Deserialize a string like \"[123,[456,789]]\" into its nested-integer structure.",
  patternId: "recursive-descent",
  constraint: "The string is a valid nested-list encoding; integers may be negative.",
  ProblemViz,
  examples: [
    { input: "\"324\"", result: "324", ok: true },
    { input: "\"[123,[456,789]]\"", result: "[123, [456, 789]]", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Walk the string with a single cursor. parse_list() consumes the opening '[', then loops on the lookahead character: '[' means a nested list (recurse), a digit (or '-') means read an integer, ',' is a separator to skip, and ']' closes the current list and returns. The cursor only ever moves forward — the next character always decides the branch, so there is no backtracking. Recursion depth tracks the nesting depth: O(n) time, O(d) stack.",
    code: `def deserialize(s):
    if s[0] != "[":
        return NestedInteger(int(s))   # a bare integer

    i = 0

    def parse_list():
        nonlocal i
        ni = NestedInteger()
        i += 1                          # consume '['
        while s[i] != "]":
            if s[i] == "[":
                ni.add(parse_list())    # nested list -> recurse
            elif s[i] == ",":
                i += 1                  # skip the separator
            else:
                start = i               # read an integer
                if s[i] == "-":
                    i += 1
                while s[i].isdigit():
                    i += 1
                ni.add(NestedInteger(int(s[start:i])))
        i += 1                          # consume ']'
        return ni

    return parse_list()`,
    codeHighlight: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    codeNote: "lookahead char picks the branch · '[' recurses · ']' returns · cursor only moves forward",
    cases: [
      { id: "nested", label: "[12, [34]]", result: "[12, [34]]", ok: true, input: INPUT, steps: STEPS },
    ],
  },
};
