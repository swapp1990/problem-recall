import { useMemo } from "react";
import { VizContext } from "./context.js";
import { defaultTheme } from "./theme.js";

// Root of any diagram. Owns the SVG coordinate space, shared <defs> (arrow
// markers), and the theme provider. Consumers render primitives as children.
export default function VizStage({ width = 800, height = 280, theme, children }) {
  const merged = useMemo(
    () => ({
      ...defaultTheme,
      ...theme,
      colors: { ...defaultTheme.colors, ...(theme?.colors || {}) },
      cell: { ...defaultTheme.cell, ...(theme?.cell || {}) },
      font: { ...defaultTheme.font, ...(theme?.font || {}) },
    }),
    [theme]
  );

  return (
    <VizContext.Provider value={merged}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="viz-arrow-down" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={merged.colors.accent} transform="rotate(90 5 5)" />
          </marker>
        </defs>
        {children}
      </svg>
    </VizContext.Provider>
  );
}
