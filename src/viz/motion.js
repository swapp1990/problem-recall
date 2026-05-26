// Shared motion presets — the heart of the "design language". Every primitive
// pulls its timing from here so animations feel consistent across diagrams.
export const transitions = {
  // Pointers travel between positions with a settling spring (Manim-ish "ease").
  pointer: { type: "spring", stiffness: 260, damping: 26, mass: 0.9 },
  // Cell state changes (fill/stroke/scale) cross-fade smoothly.
  cell: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
  // Arcs "write on" like a drawn stroke, then fade out.
  draw: { duration: 0.55, ease: "easeInOut" },
  fade: { duration: 0.25, ease: "easeOut" },
};

// Cell variant → animated visual state. Primitives map a semantic variant name
// to these target values; colors are injected from the theme at render time.
export function cellVisual(variant, colors) {
  switch (variant) {
    case "active":
      return { fill: colors.accentSoft, stroke: colors.accent, strokeWidth: 2.5, text: colors.accent, weight: 700, scale: 1.06 };
    case "matched":
      return { fill: colors.muted, stroke: colors.inkFaint, strokeWidth: 1.5, text: colors.inkFaint, weight: 400, scale: 1 };
    case "muted":
      return { fill: "none", stroke: colors.inkFaint, strokeWidth: 1.5, text: colors.inkFaint, weight: 400, scale: 1 };
    default:
      return { fill: "none", stroke: colors.ink, strokeWidth: 1.5, text: colors.ink, weight: 500, scale: 1 };
  }
}
