import { useVizTheme } from "../context.js";

// A rounded value box with text centered both horizontally and vertically
// (via dominantBaseline, so no magic baseline offsets). Auto-sizes to the
// value assuming a monospace advance. `x` is the left edge; `cy` is the
// vertical CENTER, so it aligns cleanly with anything else centered at cy.
export default function Badge({ x, cy, value, fontSize = 14, padX = 12, height = 26, fill, stroke, color, weight = 700 }) {
  const theme = useVizTheme();
  const text = String(value);
  const charW = fontSize * 0.6; // monospace advance width
  const width = Math.max(height, text.length * charW + padX * 2);
  return (
    <g>
      <rect
        x={x}
        y={cy - height / 2}
        width={width}
        height={height}
        rx={theme.cell.radius}
        fill={fill ?? theme.colors.accentSoft}
        stroke={stroke ?? theme.colors.accent}
        strokeWidth="1.5"
      />
      <text
        x={x + width / 2}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={theme.font.mono}
        fontSize={fontSize}
        fontWeight={weight}
        fill={color ?? stroke ?? theme.colors.accent}
      >
        {text}
      </text>
    </g>
  );
}
