import { useVizTheme } from "../context.js";

// A bracket under a horizontal range [x1, x2] at y, with a label to the right.
// Marks a subarray / range beneath a row of cells. Reusable wherever a span of
// the array needs calling out (qualifying subarrays, matched ranges, etc.).
export default function Span({ x1, x2, y, label, color, depth = 7 }) {
  const theme = useVizTheme();
  const c = color || theme.colors.green;
  return (
    <g>
      <path
        d={`M ${x1} ${y} L ${x1} ${y + depth} L ${x2} ${y + depth} L ${x2} ${y}`}
        stroke={c}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      {label != null && (
        <text x={x2 + 12} y={y + depth + 4} fontFamily={theme.font.mono} fontSize="12.5" fill={c}>
          {label}
        </text>
      )}
    </g>
  );
}
