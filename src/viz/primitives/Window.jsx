import { useVizTheme } from "../context.js";

// A translucent band spanning a contiguous range of columns — the sliding
// window. Positioned by a CSS transform (translateX) on the group and sized via
// the CSS `width` geometry property, both transitioned — so it travels and
// resizes smoothly as the window's bounds change. (framer-motion writes SVG
// geometry as attributes, which don't transition reliably here, so we use CSS.)
// Render it BEFORE the cells so the cells sit on top.
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

export default function Window({ x, width, y, height, color }) {
  const theme = useVizTheme();
  const c = color || theme.colors.accent;
  return (
    <g style={{ transform: `translateX(${x}px)`, transition: `transform 0.5s ${EASE}` }}>
      <rect
        x={0}
        y={y}
        height={height}
        rx={8}
        style={{ width: `${width}px`, transition: `width 0.5s ${EASE}` }}
        fill={c}
        fillOpacity={0.1}
        stroke={c}
        strokeOpacity={0.55}
        strokeWidth={2}
      />
    </g>
  );
}
