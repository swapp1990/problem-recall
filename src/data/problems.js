import validPalindrome from "./problems/validPalindrome.jsx";
import twoSumII from "./problems/twoSumII.jsx";
import longestSubstring from "./problems/longestSubstring.jsx";
import minSubarraySum from "./problems/minSubarraySum.jsx";
import subarraySumK from "./problems/subarraySumK.jsx";
import shortestSubarrayK from "./problems/shortestSubarrayK.jsx";
import rangeSumQuery from "./problems/rangeSumQuery.jsx";
import contiguousArray from "./problems/contiguousArray.jsx";
import subarraySumsDivByK from "./problems/subarraySumsDivByK.jsx";
import binarySearch704 from "./problems/binarySearch704.jsx";
import searchRotated from "./problems/searchRotated.jsx";
import kokoBananas from "./problems/kokoBananas.jsx";
import twoSum from "./problems/twoSum.jsx";
import validAnagram from "./problems/validAnagram.jsx";
import groupAnagrams from "./problems/groupAnagrams.jsx";
import topKFrequent from "./problems/topKFrequent.jsx";
import dailyTemperatures from "./problems/dailyTemperatures.jsx";
import nextGreaterElement from "./problems/nextGreaterElement.jsx";
import longestConsecutive from "./problems/longestConsecutive.jsx";
import fourSumII from "./problems/fourSumII.jsx";
import insertDeleteGetRandom from "./problems/insertDeleteGetRandom.jsx";
import mergeIntervals from "./problems/mergeIntervals.jsx";

// Each problem owns its own Problem viz + Solution scene (see the files above)
// and links to a shared pattern by `patternId`. Pattern content lives in
// patterns.js, authored once.
export const problems = {
  [validPalindrome.id]: validPalindrome,
  [twoSumII.id]: twoSumII,
  [longestSubstring.id]: longestSubstring,
  [minSubarraySum.id]: minSubarraySum,
  [subarraySumK.id]: subarraySumK,
  [shortestSubarrayK.id]: shortestSubarrayK,
  [rangeSumQuery.id]: rangeSumQuery,
  [contiguousArray.id]: contiguousArray,
  [subarraySumsDivByK.id]: subarraySumsDivByK,
  [binarySearch704.id]: binarySearch704,
  [searchRotated.id]: searchRotated,
  [kokoBananas.id]: kokoBananas,
  [twoSum.id]: twoSum,
  [validAnagram.id]: validAnagram,
  [groupAnagrams.id]: groupAnagrams,
  [topKFrequent.id]: topKFrequent,
  [dailyTemperatures.id]: dailyTemperatures,
  [nextGreaterElement.id]: nextGreaterElement,
  [longestConsecutive.id]: longestConsecutive,
  [fourSumII.id]: fourSumII,
  [insertDeleteGetRandom.id]: insertDeleteGetRandom,
  [mergeIntervals.id]: mergeIntervals,
};

export const allProblems = Object.values(problems);

export const defaultProblemId = "valid-palindrome";

export const getProblem = (id) => problems[id];

// Reverse lookup: every problem that uses a given pattern. Drives the
// "problems using this pattern" cross-links on the Pattern card.
export const problemsByPattern = (patternId) =>
  allProblems.filter((p) => p.patternId === patternId);
