import { useVizTheme } from "../context.js";

// Renders a hash SET as a set literal — `name = { a, b, c }`, one member per
// row — mirroring Table's dict-literal style so set-based hashing reads the
// same as map-based hashing across a problem family. `highlight` (array) boxes
// members in green ("found / in the run"); `block` boxes one member in red
// ("the reason this fails"). `annotation` labels the first highlighted row.
export default function HashSet({ x, y, name = "set", rows = [], highlight = [], block, annotation, label, rowH = 28 }) {
  const theme = useVizTheme();
  const t = theme.colors;
  const mono = theme.font.mono;
  const hi = new Set(highlight);
  const firstHiIdx = rows.findIndex((v) => hi.has(v));
  return (
    <g fontFamily={mono}>
      {label && (
        <text x={x} y={y - 16} fontSize="11" letterSpacing="0.5" fill={t.inkSoft}>{label}</text>
      )}
      <text x={x} y={y} fontSize="15" fontWeight="700" fill={t.ink}>{`${name} = {`}</text>
      {rows.map((v, i) => {
        const ry = y + (i + 1) * rowH;
        const isHi = hi.has(v);
        const isBlock = block === v;
        const boxW = Math.max(60, String(v).length * 9 + 26);
        const fill = isHi ? t.greenSoft : isBlock ? "#fee2e2" : "none";
        const stroke = isHi ? t.green : isBlock ? "#b91c1c" : "none";
        const tcol = isHi ? t.green : isBlock ? "#b91c1c" : t.ink;
        return (
          <g key={i}>
            {(isHi || isBlock) && (
              <rect x={x + 16} y={ry - 19} width={boxW} height={26} rx={5} fill={fill} stroke={stroke} strokeWidth="1.5" />
            )}
            <text x={x + 30} y={ry} fontSize="15" fontWeight={isHi || isBlock ? 700 : 500} fill={tcol}>{v}</text>
            {isHi && annotation && i === firstHiIdx && (
              <text x={x + 30 + boxW} y={ry} fontSize="12" fontStyle="italic" fontFamily={theme.font.serif} fill={t.green}>{annotation}</text>
            )}
          </g>
        );
      })}
      <text x={x} y={y + (rows.length + 1) * rowH} fontSize="15" fontWeight="700" fill={t.ink}>{`}`}</text>
    </g>
  );
}
