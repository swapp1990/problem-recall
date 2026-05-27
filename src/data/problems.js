import validPalindrome from "./problems/validPalindrome.jsx";
import twoSumII from "./problems/twoSumII.jsx";
import longestSubstring from "./problems/longestSubstring.jsx";
import minSubarraySum from "./problems/minSubarraySum.jsx";

// Each problem owns its own Problem viz + Solution scene (see the files above)
// and links to a shared pattern by `patternId`. Pattern content lives in
// patterns.js, authored once.
export const problems = {
  [validPalindrome.id]: validPalindrome,
  [twoSumII.id]: twoSumII,
  [longestSubstring.id]: longestSubstring,
  [minSubarraySum.id]: minSubarraySum,
};

export const allProblems = Object.values(problems);

export const defaultProblemId = "valid-palindrome";

export const getProblem = (id) => problems[id];

// Reverse lookup: every problem that uses a given pattern. Drives the
// "problems using this pattern" cross-links on the Pattern card.
export const problemsByPattern = (patternId) =>
  allProblems.filter((p) => p.patternId === patternId);
