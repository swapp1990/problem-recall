import TwoPointersViz from "./patterns/twoPointers.jsx";
import SlidingWindowViz from "./patterns/slidingWindow.jsx";
import PrefixSumViz from "./patterns/prefixSum.jsx";
import MonotonicDequeViz from "./patterns/monotonicDeque.jsx";
import BinarySearchViz from "./patterns/binarySearch.jsx";
import ArraysHashingViz from "./patterns/arraysHashing.jsx";
import MonotonicStackViz from "./patterns/monotonicStack.jsx";
import IntervalsViz from "./patterns/intervals.jsx";
import HeapTopKViz from "./patterns/heapTopK.jsx";
import BacktrackingViz from "./patterns/backtracking.jsx";
import RecursiveDescentViz from "./patterns/recursiveDescent.jsx";

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
  "intervals": {
    id: "intervals",
    name: "Intervals",
    subtitle: "Given a pile of ranges, sort them by start — now any overlap is a neighbour, so a single left→right pass handles them.",
    complexity: { time: "O(n log n)", space: "O(n)" },
    Viz: IntervalsViz,
    related: ["two-pointers"],
  },
  "arrays-hashing": {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    subtitle: "Trade space for time: a hash map turns 'have I seen this?' into an O(1) lookup.",
    complexity: { time: "O(n)", space: "O(n)" },
    Viz: ArraysHashingViz,
    related: ["prefix-sum"],
  },
  "heap-topk": {
    id: "heap-topk",
    name: "Heap / Top-K",
    subtitle: "A heap keeps one extreme on top: a max-heap the largest, a min-heap the smallest. Inserting bubbles the new item up until the heap order holds — toggle to compare the two.",
    complexity: { time: "O(n log k)", space: "O(k)" },
    Viz: HeapTopKViz,
    related: ["arrays-hashing"],
  },
  "monotonic-stack": {
    id: "monotonic-stack",
    name: "Monotonic Stack",
    subtitle: "A stack kept sorted; each new value pops everything it resolves, so each element is pushed and popped once — O(n).",
    complexity: { time: "O(n)", space: "O(n)" },
    Viz: MonotonicStackViz,
    related: ["monotonic-deque", "arrays-hashing"],
  },
  "backtracking": {
    id: "backtracking",
    name: "Backtracking",
    subtitle: "Build a candidate one choice at a time, exploring every branch of the decision tree. When a path is complete (or dead), un-choose the last step and try the next — a DFS that always cleans up after itself.",
    complexity: { time: "O(n · 2ⁿ)", space: "O(n)" },
    Viz: BacktrackingViz,
    related: ["arrays-hashing", "recursive-descent"],
  },
  "recursive-descent": {
    id: "recursive-descent",
    name: "Recursive Descent",
    subtitle: "Parse a structured string top-down: each grammar rule is a function, and one lookahead character tells you which to call next. Nesting is handled by recursion, and — unlike backtracking — a choice is never undone, because the next character is always enough to decide.",
    complexity: { time: "O(n)", space: "O(d)" },
    Viz: RecursiveDescentViz,
    related: ["backtracking", "monotonic-stack"],
  },
};

export const getPattern = (id) => patterns[id];
