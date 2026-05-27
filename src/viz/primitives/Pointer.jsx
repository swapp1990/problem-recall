import { motion } from "framer-motion";
import { useVizTheme } from "../context.js";
import { transitions } from "../motion.js";

// A labeled arrow that points at a column. The whole group is translated to
// `centerX`, so when the target changes the pointer *travels* there with a
// spring — the signature motion of the engine.
//
// `move` ("left" | "right" | null) is a MOVE HINT: an animated chevron beside
// the label that telegraphs the pointer's next move *during* the current step,
// so a step visualizes its own conclusion ("…→ move left inward") instead of
// only describing it in text. Part of the engine's design language — reuse it
// for any algorithm where a pointer's next move is the lesson.
export default function Pointer({ centerX, labelY, tipY, label, color, move }) {
  const theme = useVizTheme();
  const c = color || theme.colors.accent;
  const dir = move === "left" ? -1 : move === "right" ? 1 : 0;

  return (
    <motion.g initial={false} animate={{ x: centerX }} transition={transitions.pointer}>
      <text x={0} y={labelY} textAnchor="middle" fontFamily={theme.font.mono} fontSize="14" fontWeight="700" fill={c}>
        {label}
      </text>
      <path d={`M 0 ${labelY + 10} L 0 ${tipY}`} stroke={c} strokeWidth="2.5" fill="none" markerEnd="url(#viz-arrow-down)" />
      {dir !== 0 && (
        <motion.text
          y={labelY}
          textAnchor="middle"
          fontFamily={theme.font.mono}
          fontSize="20"
          fontWeight="700"
          fill={c}
          initial={false}
          animate={{ x: [dir * 24, dir * 34, dir * 24], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
        >
          {dir > 0 ? "›" : "‹"}
        </motion.text>
      )}
    </motion.g>
  );
}
