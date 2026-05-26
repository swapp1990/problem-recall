import { motion } from "framer-motion";
import { useVizTheme } from "../context.js";
import { transitions } from "../motion.js";

// A labeled arrow that points at a column. The whole group is translated to
// `centerX`, so when the target changes the pointer *travels* there with a
// spring — the signature motion of the engine.
export default function Pointer({ centerX, labelY, tipY, label, color }) {
  const theme = useVizTheme();
  const c = color || theme.colors.accent;

  return (
    <motion.g initial={false} animate={{ x: centerX }} transition={transitions.pointer}>
      <text x={0} y={labelY} textAnchor="middle" fontFamily={theme.font.mono} fontSize="14" fontWeight="700" fill={c}>
        {label}
      </text>
      <path d={`M 0 ${labelY + 10} L 0 ${tipY}`} stroke={c} strokeWidth="2.5" fill="none" markerEnd="url(#viz-arrow-down)" />
    </motion.g>
  );
}
