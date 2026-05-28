import { motion } from "framer-motion";
import { useVizTheme } from "../context.js";
import { transitions } from "../motion.js";

// A binary heap drawn as a tree from an array · children of index i are at 2i+1
// and 2i+2, parent is (i-1)/2. Nodes are positioned by level — each level
// halves the per-slot width, so the layout fans out like a tournament bracket.
//
// `kind` ("max" | "min") controls the root marker glyph + heap-label colour;
// the algorithm rules are the same.
//
// Variants per node (passed via `items`):
//   default   — quiet
//   active    — the node currently being examined (bubbling up/down)
//   compare   — the parent / child being compared against
//   swap      — both ends of the swap-pair flash this together for one frame
//   pop       — extracted / discarded (red)
//   result    — kept (solid green)
//   ghost     — placeholder slot (dashed, no fill) — used when a node was
//               just removed and the swap-in hasn't landed yet
//
// `pointerIndex` (optional) renders a small "i" pointer above that node, used
// to label the index being walked in sift-up / sift-down.
export default function Heap({
  items,
  width = 600,
  height = 220,
  x0 = 0,
  y0 = 0,
  cellSize = 36,
  showIndices = false,
  kind = "max",
  pointerIndex = null,
  pointerLabel = "i",
  label,
}) {
  const theme = useVizTheme();
  const n = items.length;
  // Depth (number of levels): floor(log2(n)) + 1, min 1.
  const depth = Math.max(1, Math.floor(Math.log2(Math.max(n, 1))) + 1);
  const levelH = (height - 20) / depth;

  // Position of node at array index i.
  const pos = (i) => {
    const level = Math.floor(Math.log2(i + 1));
    const slotsOnLevel = 1 << level;        // 2^level
    const indexInLevel = i + 1 - slotsOnLevel;
    const slotW = width / slotsOnLevel;
    const cx = x0 + slotW * (indexInLevel + 0.5);
    const cy = y0 + 16 + level * levelH + cellSize / 2;
    return { cx, cy };
  };

  // Edges first so cells sit on top.
  const edges = [];
  for (let i = 0; i < n; i++) {
    const l = 2 * i + 1, r = 2 * i + 2;
    const p = pos(i);
    if (l < n) edges.push({ from: p, to: pos(l), key: `e${i}-${l}` });
    if (r < n) edges.push({ from: p, to: pos(r), key: `e${i}-${r}` });
  }

  const variantFill = (variant) => {
    switch (variant) {
      case "active":  return { fill: theme.colors.accentSoft, stroke: theme.colors.accent,    text: theme.colors.accent,    sw: 2.5, weight: 700 };
      case "compare": return { fill: "#dbeafe",                 stroke: "#1d4ed8",             text: "#1d4ed8",             sw: 2,   weight: 700 };
      case "swap":    return { fill: "#fef9c3",                 stroke: "#a16207",             text: "#a16207",             sw: 2.5, weight: 700 };
      case "pop":     return { fill: theme.colors.redSoft,      stroke: theme.colors.red,      text: theme.colors.red,      sw: 2,   weight: 700 };
      case "result":  return { fill: theme.colors.greenSoft,    stroke: theme.colors.green,    text: theme.colors.green,    sw: 2,   weight: 700 };
      case "ghost":   return { fill: "none",                    stroke: theme.colors.inkFaint, text: theme.colors.inkFaint, sw: 1.2, weight: 400, dash: "4 3" };
      default:        return { fill: "#fff",                    stroke: theme.colors.ink,      text: theme.colors.ink,      sw: 1.5, weight: 500 };
    }
  };

  // Scale label fonts with cellSize so they stay readable when the SVG is
  // scaled down on mobile (where a 36px cell only renders ~18px effective).
  const labelSize = Math.max(13, Math.round(cellSize * 0.34));
  const crownSize = Math.max(12, Math.round(cellSize * 0.30));
  const indexSize = Math.max(11, Math.round(cellSize * 0.26));

  return (
    <g>
      {label && (
        <text x={x0} y={y0 + 10} fontFamily={theme.font.mono} fontSize={labelSize} fontWeight={700} fill={kind === "max" ? theme.colors.accent : "#1d4ed8"}>
          {label}
        </text>
      )}
      {/* edges — drawn first so nodes overlap the line endpoints */}
      {edges.map(({ from, to, key }) => (
        <line key={key} x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy} stroke={theme.colors.inkFaint} strokeWidth={1.2} />
      ))}
      {items.map((item, i) => {
        const { cx, cy } = pos(i);
        const v = variantFill(item.variant || "default");
        const isRoot = i === 0;
        return (
          <g key={`n${i}`} style={{ transform: `translate(${cx}px, ${cy}px)`, transition: "transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
            <motion.rect
              x={-cellSize / 2}
              y={-cellSize / 2}
              width={cellSize}
              height={cellSize}
              rx={6}
              initial={false}
              animate={{ fill: v.fill, stroke: v.stroke, strokeWidth: v.sw }}
              strokeDasharray={v.dash}
              transition={transitions.cell}
            />
            <motion.text
              x={0}
              y={4}
              textAnchor="middle"
              fontFamily={theme.font.mono}
              fontSize={cellSize * 0.42}
              fontWeight={v.weight}
              initial={false}
              animate={{ fill: v.text }}
              transition={transitions.cell}
            >
              {item.value}
            </motion.text>
            {/* root crown — small mark so the heap kind reads at a glance */}
            {isRoot && (
              <text x={0} y={-cellSize / 2 - 4} textAnchor="middle" fontFamily={theme.font.mono} fontSize={crownSize} fontWeight={700} fill={kind === "max" ? theme.colors.accent : "#1d4ed8"}>
                {kind === "max" ? "▲ max" : "▼ min"}
              </text>
            )}
            {showIndices && (
              <text x={cellSize / 2 + 4} y={cellSize / 2 - 2} fontFamily={theme.font.mono} fontSize={indexSize} fill={theme.colors.inkFaint}>
                {i}
              </text>
            )}
            {pointerIndex === i && (
              <text x={0} y={cellSize / 2 + 18} textAnchor="middle" fontFamily={theme.font.mono} fontSize={crownSize} fontWeight={700} fill={theme.colors.accent}>
                ↑ {pointerLabel}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
