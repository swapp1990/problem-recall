import { useVizTheme } from "../context.js";

// An SVG key→value map panel (e.g. a hashmap). Rendered inside the viz
// coordinate space so it scales with the diagram. Rows are { k, v }. A row whose
// key === highlightKey is emphasized (accent = the key being looked up); a row
// whose key === newKey is tinted green (just inserted). Generic across any scene
// that needs to show a dictionary/frequency map.
export default function Table({ x, y, title, rows = [], highlightKey, newKey, rowH = 30, keyW = 64, valW = 44 }) {
  const theme = useVizTheme();
  const w = keyW + valW;
  return (
    <g>
      {title && (
        <text x={x} y={y - 10} fontFamily={theme.font.mono} fontSize="11" letterSpacing="1" fill={theme.colors.inkSoft}>
          {title}
        </text>
      )}
      {/* header */}
      <g fontFamily={theme.font.mono} fontSize="10" fill={theme.colors.inkFaint}>
        <text x={x + keyW / 2} y={y - 22} textAnchor="middle">key</text>
        <text x={x + keyW + valW / 2} y={y - 22} textAnchor="middle">count</text>
      </g>
      {rows.map((r, i) => {
        const ry = y + i * rowH;
        const isHi = highlightKey != null && r.k === highlightKey;
        const isNew = newKey != null && r.k === newKey;
        const fill = isHi ? theme.colors.accentSoft : isNew ? theme.colors.greenSoft : "none";
        const stroke = isHi ? theme.colors.accent : isNew ? theme.colors.green : theme.colors.inkFaint;
        const sw = isHi || isNew ? 2 : 1;
        const textFill = isHi ? theme.colors.accent : isNew ? theme.colors.green : theme.colors.ink;
        return (
          <g key={i} fontFamily={theme.font.mono} fontSize="14" fontWeight={isHi || isNew ? 700 : 500}>
            <rect x={x} y={ry} width={keyW} height={rowH} fill={fill} stroke={stroke} strokeWidth={sw} />
            <rect x={x + keyW} y={ry} width={valW} height={rowH} fill={fill} stroke={stroke} strokeWidth={sw} />
            <text x={x + keyW / 2} y={ry + rowH * 0.66} textAnchor="middle" fill={textFill}>{r.k}</text>
            <text x={x + keyW + valW / 2} y={ry + rowH * 0.66} textAnchor="middle" fill={textFill}>{r.v}</text>
          </g>
        );
      })}
      {rows.length === 0 && (
        <text x={x + w / 2} y={y + rowH * 0.66} textAnchor="middle" fontFamily={theme.font.mono} fontSize="13" fill={theme.colors.inkFaint}>
          empty
        </text>
      )}
    </g>
  );
}
