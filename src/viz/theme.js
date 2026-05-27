// Design tokens for the viz engine. Self-contained on purpose: the engine must
// NOT read from the host app's CSS variables, so it can be extracted as a
// standalone package. Consumers override by passing a partial theme through
// <VizStage theme={...}> (merged in VizStage).
export const defaultTheme = {
  colors: {
    ink: "#1a1814",
    inkSoft: "#57534e",
    inkFaint: "#a8a29e",
    accent: "#c2410c",
    accentSoft: "#fef3e9",
    green: "#15803d",
    greenSoft: "#dcfce7",
    red: "#b91c1c",
    redSoft: "#fee2e2",
    surface: "#fdfbf6",
    muted: "#f5f5f4",
  },
  cell: { size: 70, gap: 8, radius: 3 },
  font: {
    mono: "'JetBrains Mono', monospace",
    serif: "'Fraunces', serif",
  },
};
