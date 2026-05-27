import { motion } from "framer-motion";
import { useVizTheme } from "../context.js";
import { transitions } from "../motion.js";

// A translucent band spanning a contiguous range of columns — the sliding
// window. It travels and resizes with a spring as the window's bounds change,
// so growth (right edge) and shrink (left edge) read as continuous motion.
// Render it BEFORE the cells so the cells sit on top. Part of the design
// language for any windowed-scan technique.
export default function Window({ x, width, y, height, color }) {
  const theme = useVizTheme();
  const c = color || theme.colors.accent;
  return (
    <motion.g initial={false} animate={{ x }} transition={transitions.pointer}>
      <motion.rect
        x={0}
        y={y}
        height={height}
        rx={8}
        initial={false}
        animate={{ width }}
        transition={transitions.pointer}
        fill={c}
        fillOpacity={0.1}
        stroke={c}
        strokeOpacity={0.55}
        strokeWidth={2}
      />
    </motion.g>
  );
}
