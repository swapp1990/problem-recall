import { VizStage, VizArray, Pointer, Caption, Table, Output, rowLayout } from "../../viz";

const W = 760;
const H = 300;
const CELL = 56;
const GAP = 10;
const CELL_Y = 110;
const ARRAY_ZONE = 400;
const TABLE_X = 430;

const WORDS = ["eat", "tea", "tan", "ate", "nat", "bat"];

// Key each word by its SORTED letters — anagrams collapse to the same key — and
// bucket words into a map key → list. `map` snapshots include the current word
// already appended; `key` is the bucket it joined.
const STEPS = [
  { i: -1, key: null, map: [], status: "group words sharing the same sorted letters" },
  { i: 0, key: "aet", map: [{ k: "aet", v: "eat" }], status: 'eat → sorted "aet" → new group' },
  { i: 1, key: "aet", map: [{ k: "aet", v: "eat, tea" }], status: 'tea → "aet" → join group' },
  { i: 2, key: "ant", map: [{ k: "aet", v: "eat, tea" }, { k: "ant", v: "tan" }], status: 'tan → "ant" → new group' },
  { i: 3, key: "aet", map: [{ k: "aet", v: "eat, tea, ate" }, { k: "ant", v: "tan" }], status: 'ate → "aet" → join group' },
  { i: 4, key: "ant", map: [{ k: "aet", v: "eat, tea, ate" }, { k: "ant", v: "tan, nat" }], status: 'nat → "ant" → join group' },
  { i: 5, key: "abt", map: [{ k: "aet", v: "eat, tea, ate" }, { k: "ant", v: "tan, nat" }, { k: "abt", v: "bat" }], status: 'bat → "abt" → new group' },
  { i: 6, done: true, key: null, map: [{ k: "aet", v: "eat, tea, ate" }, { k: "ant", v: "tan, nat" }, { k: "abt", v: "bat" }], status: "done → 3 groups" },
];

function ProblemViz() {
  const cs = 64;
  const gap = 12;
  const cy = 120;
  const pl = rowLayout({ count: WORDS.length, cellSize: cs, gap, width: 800 });
  const items = WORDS.map((w) => ({ value: w, variant: "default" }));
  return (
    <VizStage width={800} height={320}>
      <Caption joinX={460} cy={56} label="group the anagrams together" value="" />
      <VizArray items={items} layout={pl} y={cy} cellSize={cs} showIndices />
      <text x={400} y={cy + cs + 42} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">
        [eat, tea, ate] · [tan, nat] · [bat] — 3 groups
      </text>
      <Caption joinX={330} cy={300} label="return" value="3 groups" fill="#dcfce7" stroke="#15803d" color="#15803d" />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const input = data.input;
  const layout = rowLayout({ count: input.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });
  const variantFor = (idx) => (step.i < 0 ? "muted" : idx === step.i ? "active" : idx < step.i ? "matched" : "muted");
  const items = input.map((w, idx) => ({ value: w, variant: variantFor(idx) }));
  return (
    <VizStage width={W} height={H}>
      <text x={40} y={28} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">words</text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />
      {step.i >= 0 && !step.done && <Pointer centerX={layout.centerX(step.i)} labelY={CELL_Y - 26} tipY={CELL_Y - 5} label="w" move={step.i < input.length - 1 ? "right" : null} />}

      {step.key != null && (
        <text x={40} y={206} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">
          sort "{input[step.i]}" → key <tspan fontWeight="700" fill="#c2410c">"{step.key}"</tspan>
        </text>
      )}

      <Output x={40} cy={252} label="groups" value={step.done ? step.map.length : step.map.length || "—"} />

      <Table x={TABLE_X} y={64} name="groups" keyLabel="sorted key" valLabel="words" rows={step.map} highlightKey={step.key} annotation="← this group" />
    </VizStage>
  );
}

export default {
  id: "group-anagrams",
  leetcode: 49,
  title: "Group Anagrams",
  difficulty: "Medium",
  tagline: "Group together the strings that are anagrams of one another.",
  patternId: "arrays-hashing",
  constraint: "Lowercase letters; anagrams share the same sorted letters.",
  ProblemViz,
  examples: [
    { input: "[eat,tea,tan,ate,nat,bat]", result: "3 groups", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Anagrams produce the same string once sorted, so the sorted word is a perfect group key. Bucket every word into a hash map keyed by its sorted letters — one pass, O(n·k log k) — and the map's values are the groups.",
    code: `def groupAnagrams(strs):
    groups = {}
    for w in strs:
        key = "".join(sorted(w))
        groups.setdefault(key, []).append(w)
    return list(groups.values())`,
    codeHighlight: [3, 4, 5],
    codeNote: "key = sorted letters",
    cases: [{ id: "groups", label: "6 words", result: "3 groups", ok: true, input: WORDS, steps: STEPS }],
  },
};
