import { VizStage, Cell, rowLayout, useDemoLoop } from "../../viz";

const W = 620;
const H = 300;
const CELL = 44;
const GAP = 8;
const PATH_Y = 96;
const PATH_X = 40;

// Generic illustration — NOT tied to a problem. Auto-loops the three motions
// every backtracking solution shares:
//
//   choose    — append a candidate to the path, go deeper
//   record    — the current path is one complete answer
//   un-choose — pop the last candidate, back up, try the next branch
//
// The example walks the full power set of [1, 2] so the rhythm is visible end to
// end: the path GROWS as we choose and SHRINKS as we un-choose, while results
// accumulate. (How a specific problem prunes branches lives on its SOLUTION card.)
const RESULTS = ["[]", "[1]", "[1, 2]", "[2]"];

const FRAMES = [
  { path: [], shown: 1, caption: "record the current path → []", kind: "record" },
  { path: [{ value: 1, variant: "active" }], shown: 2, caption: "choose 1 → record [1]", kind: "choose" },
  { path: [{ value: 1 }, { value: 2, variant: "active" }], shown: 3, caption: "go deeper → choose 2 → record [1, 2]", kind: "choose" },
  { path: [{ value: 1 }], shown: 3, caption: "no choices left → un-choose 2, back up", kind: "unchoose" },
  { path: [], shown: 3, caption: "un-choose 1 → back to the start", kind: "unchoose" },
  { path: [{ value: 2, variant: "active" }], shown: 4, caption: "try the next branch → choose 2 → record [2]", kind: "choose" },
  { path: [], shown: 4, caption: "un-choose 2 → every branch explored", kind: "unchoose" },
];

export default function BacktrackingViz({ active = true }) {
  const i = useDemoLoop(FRAMES.length, { interval: 1300, enabled: active });
  const f = FRAMES[i];
  const layout = rowLayout({ count: 2, cellSize: CELL, gap: GAP, width: 200 });
  const color = f.kind === "unchoose" ? "#b91c1c" : f.kind === "record" ? "#15803d" : "#1a1814";

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={30} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        build a path one choice at a time; un-choose to try the next
      </text>

      <text x={PATH_X} y={PATH_Y - 16} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">path</text>
      {f.path.length === 0 ? (
        <text x={PATH_X + 6} y={PATH_Y + CELL * 0.64} fontFamily="JetBrains Mono, monospace" fontSize="20" fill="#a8a29e">∅</text>
      ) : (
        f.path.map((c, k) => (
          <Cell key={k} x={PATH_X + k * (CELL + GAP)} y={PATH_Y} size={CELL} value={c.value} variant={c.variant || "matched"} />
        ))
      )}

      <text x={360} y={PATH_Y - 16} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">results — the power set of [1, 2]</text>
      {RESULTS.map((r, k) => {
        const recorded = k < f.shown;
        const isLatest = k === f.shown - 1;
        return (
          <text
            key={k}
            x={368}
            y={PATH_Y + 8 + k * 24}
            fontFamily="JetBrains Mono, monospace"
            fontSize="15"
            fontWeight={isLatest ? 700 : 500}
            fill={recorded ? (isLatest ? "#15803d" : "#1a1814") : "#d6d3d1"}
          >
            {r}
          </text>
        );
      })}

      <text x={W / 2} y={H - 20} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill={color}>
        {f.caption}
      </text>
    </VizStage>
  );
}
