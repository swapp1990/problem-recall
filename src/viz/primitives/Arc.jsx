import { motion } from "framer-motion";
import { useVizTheme } from "../context.js";
import { transitions } from "../motion.js";

// A quadratic arc between two columns that "writes on" (pathLength 0 → 1) and
// fades out on exit. Wrap in <AnimatePresence> to get the draw/erase lifecycle.
export default function Arc({ x1, x2, y, depth = 60, color, label }) {
  const theme = useVizTheme();
  const c = color || theme.colors.green;
  const midX = (x1 + x2) / 2;
  const d = `M ${x1} ${y} Q ${midX} ${y + depth} ${x2} ${y}`;

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transitions.fade}>
      <motion.path
        d={d}
        stroke={c}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        exit={{ pathLength: 0 }}
        transition={transitions.draw}
      />
      {label && (
        <text x={midX} y={y + depth + 4} textAnchor="middle" fontFamily={theme.font.serif} fontStyle="italic" fontSize="15" fill={c}>
          {label}
        </text>
      )}
    </motion.g>
  );
}
