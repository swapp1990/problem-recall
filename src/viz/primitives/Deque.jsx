import { useVizTheme } from "../context.js";

// A horizontal double-ended queue. `items` are front (left) → back (right),
// each { value, label?, variant? }. variant: "new" (just pushed, green) |
// "pop" (about to be removed, red) | default. Shows front/back labels. Generic
// across monotonic-deque / sliding-window-maximum scenes.
export default function Deque({ x, y, items = [], cellW = 56, cellH = 56, gap = 8, emptyLabel = "deque empty", frontLabel = "front", backLabel = "back" }) {
  const theme = useVizTheme();
  if (!items.length) {
    return (
      <text x={x} y={y + cellH * 0.6} fontFamily={theme.font.mono} fontSize="14" fontStyle="italic" fill={theme.colors.inkFaint}>
        {emptyLabel}
      </text>
    );
  }
  const lastX = x + (items.length - 1) * (cellW + gap);
  return (
    <g>
      <text x={x + cellW / 2} y={y - 12} textAnchor="middle" fontFamily={theme.font.mono} fontSize="10" letterSpacing="1" fill={theme.colors.inkSoft}>{frontLabel}</text>
      {items.length > 1 && <text x={lastX + cellW / 2} y={y - 12} textAnchor="middle" fontFamily={theme.font.mono} fontSize="10" letterSpacing="1" fill={theme.colors.inkSoft}>{backLabel}</text>}
      {items.map((it, i) => {
        const ix = x + i * (cellW + gap);
        const isNew = it.variant === "new";
        const isPop = it.variant === "pop";
        const fill = isNew ? theme.colors.greenSoft : isPop ? theme.colors.redSoft : theme.colors.surface;
        const stroke = isNew ? theme.colors.green : isPop ? theme.colors.red : theme.colors.ink;
        const txt = isNew ? theme.colors.green : isPop ? theme.colors.red : theme.colors.ink;
        return (
          <g key={i}>
            <rect x={ix} y={y} width={cellW} height={cellH} rx={3} fill={fill} stroke={stroke} strokeWidth={isNew || isPop ? 2.5 : 1.5} />
            <text x={ix + cellW / 2} y={y + cellH * 0.46} textAnchor="middle" fontFamily={theme.font.mono} fontSize="20" fontWeight="700" fill={txt}>
              {it.value}
            </text>
            {it.label != null && (
              <text x={ix + cellW / 2} y={y + cellH * 0.82} textAnchor="middle" fontFamily={theme.font.mono} fontSize="10" fill={theme.colors.inkFaint}>
                {it.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
