import { useVizTheme } from "../context.js";

// Renders a hashmap as a dict literal — `name = { key: value, ... }` — so it
// reads unmistakably as a map. `keyLabel`/`valLabel` spell out what the columns
// mean. The row whose key === highlightKey is boxed in accent with a caller-
// supplied `annotation` (e.g. "← prefix − k") to show the lookup landing.
export default function Table({ x, y, name = "map", rows = [], highlightKey, highlightKeys, annotation, keyLabel, valLabel, rowH = 28 }) {
  const theme = useVizTheme();
  const t = theme.colors;
  const mono = theme.font.mono;
  const hi = new Set(highlightKeys ?? (highlightKey != null ? [highlightKey] : []));
  return (
    <g fontFamily={mono}>
      {(keyLabel || valLabel) && (
        <text x={x} y={y - 16} fontSize="11" letterSpacing="0.5" fill={t.inkSoft}>
          {keyLabel} → {valLabel}
        </text>
      )}
      <text x={x} y={y} fontSize="15" fontWeight="700" fill={t.ink}>{`${name} = {`}</text>
      {rows.map((r, i) => {
        const ry = y + (i + 1) * rowH;
        const isHi = hi.has(r.k);
        const rowText = `${r.k}: ${r.v}`;
        const boxW = Math.max(96, rowText.length * 8.8 + 16); // adapt to content (list values)
        return (
          <g key={i}>
            {isHi && <rect x={x + 16} y={ry - 19} width={boxW} height={26} rx={5} fill={t.accentSoft} stroke={t.accent} strokeWidth="1.5" />}
            <text x={x + 30} y={ry} fontSize="15" fontWeight={isHi ? 700 : 500} fill={isHi ? t.accent : t.ink}>
              {rowText}
            </text>
            {isHi && annotation && (
              <text x={x + boxW + 14} y={ry} fontSize="12" fontStyle="italic" fontFamily={theme.font.serif} fill={t.accent}>
                {annotation}
              </text>
            )}
          </g>
        );
      })}
      <text x={x} y={y + (rows.length + 1) * rowH} fontSize="15" fontWeight="700" fill={t.ink}>{`}`}</text>
    </g>
  );
}
