import { VizStage, VizArray, Pointer, Arc, rowLayout } from "../../viz";

// Generic illustration of the technique — NOT tied to any one problem.
// Distinct neutral values read as "an array", with left/right converging.
const VALUES = ["a", "b", "c", "d", "e", "f", "g"];
const W = 800;
const H = 280;
const CELL = 70;
const GAP = 8;
const CELL_Y = 92;
const LEFT = 0;
const RIGHT = VALUES.length - 1;

const layout = rowLayout({ count: VALUES.length, cellSize: CELL, gap: GAP, width: W });

export default function TwoPointersViz() {
  const items = VALUES.map((v, i) => ({
    value: v,
    variant: i === LEFT || i === RIGHT ? "active" : "default",
  }));

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={34} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="14" fill="#57534e">
        loop while left &lt; right
      </text>

      <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />

      <Pointer centerX={layout.centerX(LEFT)} labelY={50} tipY={CELL_Y - 5} label="left" />
      <Pointer centerX={layout.centerX(RIGHT)} labelY={50} tipY={CELL_Y - 5} label="right" />

      <Arc
        x1={layout.centerX(LEFT)}
        x2={layout.centerX(RIGHT)}
        y={CELL_Y + CELL + 4}
        depth={52}
        label="compare → if equal, move both inward"
      />
    </VizStage>
  );
}
