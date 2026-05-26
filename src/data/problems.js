// Problems are per-problem. Each links to a shared pattern by `patternId`.
// `problem` holds Problem-card viz data; `solution` drives the Solution-card
// step-through. Pattern content lives in patterns.js, authored once.
export const problems = {
  "valid-palindrome": {
    id: "valid-palindrome",
    leetcode: 125,
    title: "Valid Palindrome",
    difficulty: "Easy",
    tagline: "Reads the same forwards and backwards (letters & digits only).",
    patternId: "two-pointers",
    problem: {
      normalized: "amanaplanacanalpanama",
      pivotIndex: 10,
    },
    solution: {
      word: ["r", "a", "c", "e", "c", "a", "r"],
      result: "true",
      steps: [
        { left: 0, right: 6, status: "Initialize: left at 0, right at 6.", compare: false, match: null },
        { left: 0, right: 6, status: 's[0]="r"  ==  s[6]="r"  ✓  match', compare: true, match: true },
        { left: 1, right: 5, status: 's[1]="a"  ==  s[5]="a"  ✓  match', compare: true, match: true },
        { left: 2, right: 4, status: 's[2]="c"  ==  s[4]="c"  ✓  match', compare: true, match: true },
        { left: 3, right: 3, status: "Pointers meet. All matched → return true.", compare: false, match: "done" },
      ],
    },
  },
};

export const defaultProblemId = "valid-palindrome";

export const getProblem = (id) => problems[id];

// Reverse lookup: every problem that uses a given pattern. Drives future
// "other problems with this pattern" cross-linking and the pick-a-problem index.
export const problemsByPattern = (patternId) =>
  Object.values(problems).filter((p) => p.patternId === patternId);
