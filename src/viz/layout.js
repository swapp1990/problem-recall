// Pure geometry helpers — no React, no DOM. Compute cell positions for a
// horizontal row, centered within a given width.
export function rowLayout({ count, cellSize, gap, width }) {
  const total = count * cellSize + Math.max(0, count - 1) * gap;
  const originX = (width - total) / 2;
  const cellX = (i) => originX + i * (cellSize + gap);
  const centerX = (i) => cellX(i) + cellSize / 2;
  return { originX, total, cellX, centerX };
}
