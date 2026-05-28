import { useVizTheme } from "../context.js";

// A horizontal interval bar placed on a shared number line — the SCENE maps
// values → x (a linear scale) and passes pixel endpoints x1/x2. This is the
// design-language element for interval problems (ranges, meetings, sweeps):
// overlap reads as bars whose x-spans intersect.
//
// `variant`: default (untouched) | active (being examined) | done (already
// consumed) | merged (the running merged interval) | result (a finalized
// output interval). `label` is centered on the bar (e.g. "[1,6]").
const VARIANTS = (t) => ({
  default: { fill: "none", stroke: t.inkFaint, text: t.ink, sw: 1.5 },
  active: { fill: t.accentSoft, stroke: t.accent, text: t.accent, sw: 2.5 },
  done: { fill: t.muted, stroke: t.inkFaint, text: t.inkFaint, sw: 1.5 },
  merged: { fill: t.greenSoft, stroke: t.green, text: t.green, sw: 2.5 },
  result: { fill: t.green, stroke: t.green, text: t.surface, sw: 2 },
});

export default function Interval({ x1, x2, y, height = 24, label, variant = "default" }) {
  const theme = useVizTheme();
  const v = VARIANTS(theme.colors)[variant] || VARIANTS(theme.colors).default;
  const w = Math.max(3, x2 - x1);
  return (
    <g>
      <rect x={x1} y={y} width={w} height={height} rx={4} fill={v.fill} stroke={v.stroke} strokeWidth={v.sw} />
      {label != null && (
        <text x={x1 + w / 2} y={y + height / 2 + 5} textAnchor="middle" fontFamily={theme.font.mono} fontSize="13" fontWeight="700" fill={v.text}>
          {label}
        </text>
      )}
    </g>
  );
}
