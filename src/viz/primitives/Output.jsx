import { useVizTheme } from "../context.js";

// Marks the value being accumulated AS THE ANSWER (what gets returned), visually
// distinct from working variables (pointers, prefix, sum — which use outlined
// Caption badges). The output is a SOLID-filled green pill with an "↩ ANSWER"
// tag, so the goal of the computation reads differently from scratch state.
// Part of the design language. `x`/`cy` is the left edge / vertical center.
export default function Output({ x, cy, label, value }) {
  const theme = useVizTheme();
  const t = theme.colors;
  const mono = theme.font.mono;
  const labelStr = label ? `${label} =` : "";
  const labelW = labelStr.length * 8.4;
  const valStr = String(value);
  const vw = Math.max(34, valStr.length * 11 + 22);
  const boxX = x + (labelStr ? labelW + 8 : 0);
  return (
    <g>
      <text x={x} y={cy - 17} fontFamily={mono} fontSize="9" letterSpacing="2" fill={t.green}>↩ ANSWER</text>
      {labelStr && (
        <text x={x} y={cy + 6} fontFamily={mono} fontSize="14" fill={t.inkSoft}>{labelStr}</text>
      )}
      <rect x={boxX} y={cy - 15} width={vw} height={30} rx={4} fill={t.green} />
      <text x={boxX + vw / 2} y={cy + 6} textAnchor="middle" fontFamily={mono} fontSize="16" fontWeight="700" fill={t.surface}>
        {valStr}
      </text>
    </g>
  );
}
