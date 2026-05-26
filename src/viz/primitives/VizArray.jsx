import Cell from "./Cell.jsx";

// Lays out a row of Cells from `items` ([{ value, variant }]) using a layout
// object from rowLayout(). Convenience over hand-positioning each Cell.
export default function VizArray({ items, layout, y, cellSize, showIndices = false }) {
  return (
    <g>
      {items.map((it, i) => (
        <Cell
          key={i}
          x={layout.cellX(i)}
          y={y}
          size={cellSize}
          value={it.value}
          variant={it.variant}
          index={i}
          showIndex={showIndices}
        />
      ))}
    </g>
  );
}
