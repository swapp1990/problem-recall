import { useVizTheme } from "../context.js";

// A labeled arrow that points at a column. Positioned by a CSS transform on the
// group — framer-motion writes `x` as an SVG *attribute*, which a <g> ignores,
// so we use `transform: translateX` (works on SVG groups and transitions
// smoothly across browsers).
//
// `move` ("left" | "right" | null) is a MOVE HINT: a chevron beside the label
// that telegraphs the pointer's next move *during* the current step, so a step
// visualizes its own conclusion. It's positioned with a real SVG `x` attribute
// (reliable) and animated with a CSS keyframe — NOT framer's `x`, which it
// silently drops on SVG elements (leaving the chevron stuck at x=0). Part of
// the design language.
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

export default function Pointer({ centerX, labelY, tipY, label, color, move }) {
  const theme = useVizTheme();
  const c = color || theme.colors.accent;
  const dir = move === "left" ? -1 : move === "right" ? 1 : 0;

  return (
    <g style={{ transform: `translateX(${centerX}px)`, transition: `transform 0.5s ${EASE}` }}>
      <text x={0} y={labelY} textAnchor="middle" fontFamily={theme.font.mono} fontSize="14" fontWeight="700" fill={c}>
        {label}
      </text>
      <path d={`M 0 ${labelY + 10} L 0 ${tipY}`} stroke={c} strokeWidth="2.5" fill="none" markerEnd="url(#viz-arrow-down)" />
      {dir !== 0 && (
        <text
          className={dir > 0 ? "viz-movehint-r" : "viz-movehint-l"}
          x={dir * 26}
          y={labelY}
          textAnchor="middle"
          fontFamily={theme.font.mono}
          fontSize="22"
          fontWeight="700"
          fill={c}
        >
          {dir > 0 ? "›" : "‹"}
        </text>
      )}
    </g>
  );
}
