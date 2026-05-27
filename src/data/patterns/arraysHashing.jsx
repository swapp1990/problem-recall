import { VizStage, VizArray, Pointer, Table, rowLayout, useDemoLoop } from "../../viz";

// Generic illustration — NOT tied to a problem. Auto-loops a left→right scan
// that records what it's seen in a hash map (here, value → count). The whole
// family is "remember what you've seen so a later lookup is O(1)".
const VALUES = [4, 2, 7, 2, 4];
const CELL = 56;
const GAP = 8;
const H = 280;
const ARRAY_ZONE = 380;
const W = 760;

const layout = rowLayout({ count: VALUES.length, cellSize: CELL, gap: GAP, width: ARRAY_ZONE });

const DEMO = [
  { i: 0, seen: [{ k: 4, v: 1 }] },
  { i: 1, seen: [{ k: 4, v: 1 }, { k: 2, v: 1 }] },
  { i: 2, seen: [{ k: 4, v: 1 }, { k: 2, v: 1 }, { k: 7, v: 1 }] },
  { i: 3, seen: [{ k: 4, v: 1 }, { k: 2, v: 2 }, { k: 7, v: 1 }] },
  { i: 4, seen: [{ k: 4, v: 2 }, { k: 2, v: 2 }, { k: 7, v: 1 }] },
];

export default function ArraysHashingViz({ active = true }) {
  const i = useDemoLoop(DEMO.length, { interval: 1100, enabled: active });
  const s = DEMO[i];
  const items = VALUES.map((v, k) => ({ value: v, variant: k < s.i ? "matched" : k === s.i ? "active" : "muted" }));

  return (
    <VizStage width={W} height={H}>
      <text x={ARRAY_ZONE / 2} y={36} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        remember what you've seen in a hash map → O(1) lookup
      </text>

      <VizArray items={items} layout={layout} y={116} cellSize={CELL} showIndices />
      <Pointer centerX={layout.centerX(s.i)} labelY={90} tipY={111} label="scan" move={i < DEMO.length - 1 ? "right" : null} />

      <Table x={470} y={96} name="seen" keyLabel="value" valLabel="count" rows={s.seen} />
    </VizStage>
  );
}
