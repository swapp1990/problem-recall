import { allProblems } from "./problems.js";
import { patterns } from "./patterns.js";

const N = allProblems.length;
const M = Object.keys(patterns).length;

export const faqItems = [
  {
    q: "What is Problem Recall?",
    a: "Problem Recall is a visual flashcard drill for FAANG LeetCode problems. See the problem, recognize the pattern, watch the solution animate. No walls of text — the motion is the explanation.",
  },
  {
    q: "How does a drill work?",
    a: "Every problem has three stages: the problem, the pattern and the solution. Step through them with the Back and Next buttons or the ← and → arrow keys; Escape resets to the start.",
  },
  {
    q: "Which problems are included?",
    a: `${N} LeetCode problems grouped into ${M} patterns. They're all listed on this page, each with its own drill.`,
  },
  {
    q: "Do I need an account?",
    a: "No. There's no sign-up: open any problem and start the drill.",
  },
  {
    q: "Can I share a single problem?",
    a: "Yes. Every problem has its own link (/p/ followed by the problem name), so you can bookmark or share it.",
  },
];
