import { VizStage, VizArray, Pointer, Caption, Table, Output, rowLayout } from "../../viz";

const W = 520;
const H = 300;
const CELL = 50;
const GAP = 8;
const S_Y = 64;
const T_Y = 132;
const ARRAY_ZONE = 200;
const TABLE_X = 250;

const C1_S = ["c", "a", "t"];
const C1_T = ["a", "c", "t"];
const C2_S = ["r", "a", "t"];
const C2_T = ["c", "a", "r"];

// Phase 'count' adds each letter of s (++); phase 'scan' subtracts each letter
// of t (−−). If a count goes below zero, or any is non-zero at the end, not an
// anagram. `row` = which string the pointer is on; `idx` its position.
const C1_STEPS = [
  { phase: "count", row: "s", idx: 0, count: [{ k: "c", v: 1 }], status: "count s: 'c' → c = 1" },
  { phase: "count", row: "s", idx: 1, count: [{ k: "c", v: 1 }, { k: "a", v: 1 }], status: "count s: 'a' → a = 1" },
  { phase: "count", row: "s", idx: 2, count: [{ k: "c", v: 1 }, { k: "a", v: 1 }, { k: "t", v: 1 }], status: "count s: 't' → t = 1" },
  { phase: "scan", row: "t", idx: 0, hot: "a", count: [{ k: "c", v: 1 }, { k: "a", v: 0 }, { k: "t", v: 1 }], status: "scan t: 'a' → a−− → 0" },
  { phase: "scan", row: "t", idx: 1, hot: "c", count: [{ k: "c", v: 0 }, { k: "a", v: 0 }, { k: "t", v: 1 }], status: "scan t: 'c' → c−− → 0" },
  { phase: "scan", row: "t", idx: 2, hot: "t", count: [{ k: "c", v: 0 }, { k: "a", v: 0 }, { k: "t", v: 0 }], status: "scan t: 't' → t−− → 0", found: "true", done: true },
];

const C2_STEPS = [
  { phase: "count", row: "s", idx: 0, count: [{ k: "r", v: 1 }], status: "count s: 'r' → r = 1" },
  { phase: "count", row: "s", idx: 1, count: [{ k: "r", v: 1 }, { k: "a", v: 1 }], status: "count s: 'a' → a = 1" },
  { phase: "count", row: "s", idx: 2, count: [{ k: "r", v: 1 }, { k: "a", v: 1 }, { k: "t", v: 1 }], status: "count s: 't' → t = 1" },
  { phase: "scan", row: "t", idx: 0, hot: "c", count: [{ k: "r", v: 1 }, { k: "a", v: 1 }, { k: "t", v: 1 }], status: "scan t: 'c' is not in s (count would go < 0)", found: "false", done: true },
];

function ProblemViz() {
  const cs = 56;
  const gap = 8;
  const pl = rowLayout({ count: 3, cellSize: cs, gap, width: 720 });
  const s = ["c", "a", "t"].map((c) => ({ value: c, variant: "default" }));
  const t = ["a", "c", "t"].map((c) => ({ value: c, variant: "default" }));
  return (
    <VizStage width={720} height={320}>
      <Caption joinX={470} cy={50} label="are these anagrams?" value="" />
      <text x={pl.originX - 14} y={120 + cs / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#57534e">s</text>
      <VizArray items={s} layout={pl} y={120} cellSize={cs} />
      <text x={pl.originX - 14} y={196 + cs / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#57534e">t</text>
      <VizArray items={t} layout={pl} y={196} cellSize={cs} />
      <text x={360} y={268} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#57534e">same letters, same counts</text>
      <Caption joinX={330} cy={300} label="return" value="true" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ data, step }) {
  const sArr = data.s;
  const tArr = data.t;
  const layout = rowLayout({ count: Math.max(sArr.length, tArr.length), cellSize: CELL, gap: GAP, width: ARRAY_ZONE });
  const onS = step.row === "s";
  const sItems = sArr.map((c, idx) => ({ value: c, variant: onS && idx === step.idx ? "active" : onS && idx < step.idx ? "matched" : step.phase === "scan" ? "matched" : onS ? "muted" : "matched" }));
  const tItems = tArr.map((c, idx) => ({ value: c, variant: !onS && idx === step.idx ? "active" : !onS && idx < step.idx ? "matched" : "muted" }));
  return (
    <VizStage width={W} height={H}>
      <text x={40} y={26} fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e">{step.phase === "count" ? "phase 1 — count s (++)" : "phase 2 — scan t (−−)"}</text>

      <text x={layout.originX - 12} y={S_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">s</text>
      <VizArray items={sItems} layout={layout} y={S_Y} cellSize={CELL} />
      {onS && <Pointer centerX={layout.centerX(step.idx)} labelY={S_Y - 22} tipY={S_Y - 4} label="ch" move={step.idx < sArr.length - 1 ? "right" : null} />}

      <text x={layout.originX - 12} y={T_Y + CELL / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">t</text>
      <VizArray items={tItems} layout={layout} y={T_Y} cellSize={CELL} />
      {!onS && !step.done && <Pointer centerX={layout.centerX(step.idx)} labelY={T_Y - 22} tipY={T_Y - 4} label="ch" move={step.idx < tArr.length - 1 ? "right" : null} />}
      {!onS && step.done && <Pointer centerX={layout.centerX(step.idx)} labelY={T_Y - 22} tipY={T_Y - 4} label="ch" />}

      <Output x={40} cy={232} label="anagram" value={step.found ?? "?"} />

      <Table x={TABLE_X} y={64} name="count" keyLabel="letter" valLabel="count" rows={step.count} highlightKey={step.hot} annotation={step.phase === "scan" ? "← t's letter" : null} />
    </VizStage>
  );
}

export default {
  id: "valid-anagram",
  leetcode: 242,
  title: "Valid Anagram",
  difficulty: "Easy",
  tagline: "Do two strings use exactly the same letters, the same number of times?",
  patternId: "arrays-hashing",
  constraint: "Lowercase letters; anagram = same multiset of characters.",
  ProblemViz,
  examples: [
    { input: '"cat", "act"', result: "true", ok: true },
    { input: '"rat", "car"', result: "false", ok: false },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Anagrams are the same multiset of letters. Tally s's letters in a count map, then subtract t's letters. If every letter cancels to zero (and none goes negative), they match — O(n) with one map instead of sorting both strings.",
    code: `def isAnagram(s, t):
    if len(s) != len(t):
        return False
    count = {}
    for ch in s:
        count[ch] = count.get(ch, 0) + 1
    for ch in t:
        count[ch] = count.get(ch, 0) - 1
        if count[ch] < 0:
            return False
    return True`,
    codeHighlight: [5, 6, 7, 8, 9, 10],
    codeNote: "count s, then subtract t",
    cases: [
      { id: "yes", label: '"cat" / "act"', result: "true", ok: true, input: null, s: C1_S, t: C1_T, steps: C1_STEPS },
      { id: "no", label: '"rat" / "car"', result: "false", ok: false, input: null, s: C2_S, t: C2_T, steps: C2_STEPS },
    ],
  },
};
