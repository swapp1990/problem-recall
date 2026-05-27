import TwoPointersViz from "./patterns/twoPointers.jsx";
import SlidingWindowViz from "./patterns/slidingWindow.jsx";
import PrefixSumViz from "./patterns/prefixSum.jsx";

// Patterns are SHARED across problems. A pattern owns its name, complexity, and
// a problem-agnostic visualization. Many problems link here by id. `related`
// lists sibling patterns (same family / common confusions) surfaced as
// cross-links on the card.
export const patterns = {
  "two-pointers": {
    id: "two-pointers",
    name: "Two Pointers",
    subtitle: "Converging from both ends, comparing as they meet.",
    complexity: { time: "O(n)", space: "O(1)" },
    Viz: TwoPointersViz,
    related: ["sliding-window"],
  },
  "sliding-window": {
    id: "sliding-window",
    name: "Sliding Window",
    subtitle: "A contiguous window that grows and shrinks to stay valid.",
    complexity: { time: "O(n)", space: "O(k)" },
    Viz: SlidingWindowViz,
    related: ["two-pointers", "prefix-sum"],
  },
  "prefix-sum": {
    id: "prefix-sum",
    name: "Prefix Sum",
    subtitle: "Running cumulative totals turn range-sum questions into O(1) lookups.",
    complexity: { time: "O(n)", space: "O(n)" },
    Viz: PrefixSumViz,
    related: ["sliding-window"],
  },
};

export const getPattern = (id) => patterns[id];
