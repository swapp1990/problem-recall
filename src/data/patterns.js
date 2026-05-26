import TwoPointersViz from "./patterns/twoPointers.jsx";

// Patterns are SHARED across problems. A pattern owns its name, complexity, and
// a problem-agnostic visualization. Many problems link here by id.
export const patterns = {
  "two-pointers": {
    id: "two-pointers",
    name: "Two Pointers",
    subtitle: "Converging from both ends, comparing as they meet.",
    complexity: { time: "O(n)", space: "O(1)" },
    Viz: TwoPointersViz,
  },
};

export const getPattern = (id) => patterns[id];
