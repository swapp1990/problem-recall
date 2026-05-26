import { motion } from "framer-motion";
import { useVizTheme } from "../context.js";
import { transitions, cellVisual } from "../motion.js";

// A single labeled box. `variant` ('default' | 'active' | 'matched' | 'muted')
// drives an animated visual state. Optionally shows an index label below.
export default function Cell({ x, y, size, value, variant = "default", index, showIndex = false }) {
  const theme = useVizTheme();
  const v = cellVisual(variant, theme.colors);
  const cx = x + size / 2;

  return (
    <g>
      <motion.rect
        x={x}
        y={y}
        width={size}
        height={size}
        rx={theme.cell.radius}
        style={{ originX: `${cx}px`, originY: `${y + size / 2}px` }}
        initial={false}
        animate={{ fill: v.fill, stroke: v.stroke, strokeWidth: v.strokeWidth, scale: v.scale }}
        transition={transitions.cell}
      />
      <motion.text
        x={cx}
        y={y + size * 0.62}
        textAnchor="middle"
        fontFamily={theme.font.mono}
        fontSize={size * 0.34}
        fontWeight={v.weight}
        initial={false}
        animate={{ fill: v.text }}
        transition={transitions.cell}
      >
        {value}
      </motion.text>
      {showIndex && (
        <text x={cx} y={y + size + 16} textAnchor="middle" fontFamily={theme.font.mono} fontSize="10" fill={theme.colors.inkFaint}>
          {index}
        </text>
      )}
    </g>
  );
}
