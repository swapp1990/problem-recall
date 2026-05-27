import { useVizTheme } from "../context.js";
import Badge from "./Badge.jsx";

// A label with an optional trailing value badge, aligned on a shared vertical
// center (`cy`). The label is END-anchored at `joinX` and the badge begins at
// joinX + gap — so the label's right edge and the badge's left edge are always
// adjacent regardless of label length or font (no width measurement, no magic
// offsets). Fixes the common "text and value box don't line up" problem at the
// engine level for every diagram.
export default function Caption({ joinX, cy, label, value, gap = 12, labelSize = 13, labelColor, ...badgeProps }) {
  const theme = useVizTheme();
  return (
    <g>
      <text
        x={joinX}
        y={cy}
        textAnchor="end"
        dominantBaseline="central"
        fontFamily={theme.font.mono}
        fontSize={labelSize}
        letterSpacing="1.5"
        fill={labelColor ?? theme.colors.inkSoft}
      >
        {label}
      </text>
      {value != null && <Badge x={joinX + gap} cy={cy} value={value} fontSize={labelSize + 1} {...badgeProps} />}
    </g>
  );
}
