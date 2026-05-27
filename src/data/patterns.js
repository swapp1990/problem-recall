import TwoPointersViz from "./patterns/twoPointers.jsx";
import SlidingWindowViz from "./patterns/slidingWindow.jsx";
import PrefixSumViz from "./patterns/prefixSum.jsx";
import MonotonicDequeViz from "./patterns/monotonicDeque.jsx";
import BinarySearchViz from "./patterns/binarySearch.jsx";

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
    related: ["sliding-window", "monotonic-deque"],
  },
  "monotonic-deque": {
    id: "monotonic-deque",
    name: "Monotonic Deque",
    subtitle: "A deque kept sorted by popping the back — the front is always the best candidate.",
    complexity: { time: "O(n)", space: "O(n)" },
    Viz: MonotonicDequeViz,
    related: ["prefix-sum", "sliding-window"],
  },
  "binary-search": {
    id: "binary-search",
    name: "Binary Search",
    subtitle: "Halve the search space each step — check the middle, keep the half that can hold the answer.",
    complexity: { time: "O(log n)", space: "O(1)" },
    Viz: BinarySearchViz,
    related: ["two-pointers"],
  },
};

export const getPattern = (id) => patterns[id];
