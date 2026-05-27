// Public surface of the viz engine. Import everything from here so that when
// this directory is extracted into a standalone package, host code only needs
// its import path updated (e.g. "../viz" → "@swapp/viz").
export { default as VizStage } from "./VizStage.jsx";
export { default as VizArray } from "./primitives/VizArray.jsx";
export { default as Cell } from "./primitives/Cell.jsx";
export { default as Pointer } from "./primitives/Pointer.jsx";
export { default as Arc } from "./primitives/Arc.jsx";
export { default as Badge } from "./primitives/Badge.jsx";
export { default as Caption } from "./primitives/Caption.jsx";
export { default as Window } from "./primitives/Window.jsx";
export { rowLayout } from "./layout.js";
export { convergingVariant, windowVariant } from "./variants.js";
export { defaultTheme } from "./theme.js";
export { transitions, cellVisual } from "./motion.js";
