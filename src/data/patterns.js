import TwoPointersViz from "./patterns/twoPointers.jsx";
import SlidingWindowViz from "./patterns/slidingWindow.jsx";

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
  "sliding-window": {
    id: "sliding-window",
    name: "Sliding Window",
    subtitle: "A contiguous window that grows and shrinks to stay valid.",
    complexity: { time: "O(n)", space: "O(k)" },
    Viz: SlidingWindowViz,
  },
};

export const getPattern = (id) => patterns[id];
