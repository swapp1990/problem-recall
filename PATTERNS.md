# FAANG patterns → problems

The roadmap of patterns the app teaches. Problems are grouped by the **technique
you recognize**, not by data structure. Each pattern lists its recognition cue
(the signal that tells you "use this") and representative FAANG problems.

✅ = live in the app · ⬜ = planned

Live now: **7 patterns, 18 problems**.

---

## Family 1 — Linear scan & pointers

### ✅ Two Pointers
*Cue:* sorted array, palindrome, or a pair taken from both ends; pointers usually start apart and converge.
- ✅ Valid Palindrome (#125)
- ✅ Two Sum II — Input Array Is Sorted (#167)
- ⬜ 3Sum (#15)
- ⬜ Container With Most Water (#11)
- ⬜ Remove Duplicates from Sorted Array (#26)

### ✅ Sliding Window
*Cue:* longest/shortest **contiguous** subarray or substring satisfying a constraint; both pointers move the same direction.
- ✅ Longest Substring Without Repeating Characters (#3)
- ✅ Minimum Size Subarray Sum (#209)
- ⬜ Longest Repeating Character Replacement (#424)
- ⬜ Permutation in String (#567) / Find All Anagrams (#438)
- ⬜ Max Consecutive Ones III (#1004)

### ✅ Prefix Sum
*Cue:* range sums / subarray sums asked repeatedly; "count/longest subarray with sum = / divisible by …". Works with negatives.
- ✅ Subarray Sum Equals K (#560) — prefix + hashmap counting
- ✅ Range Sum Query — Immutable (#303) — the foundational range query
- ✅ Contiguous Array (#525) — first-index map, longest balanced run
- ✅ Subarray Sums Divisible by K (#974) — remainder counting
- ⬜ Product of Array Except Self (#238) — prefix/suffix products

### ⬜ Fast & Slow Pointers
*Cue:* cycle detection, middle of a list, "happy number".
- ⬜ Linked List Cycle (#141)
- ⬜ Find the Duplicate Number (#287)
- ⬜ Middle of the Linked List (#876)

---

## Family 2 — Search, sort & order

### ✅ Binary Search
*Cue:* sorted input, or "minimize/maximize a value" (binary search on the answer).
- ✅ Binary Search (#704) — the foundation: check mid, discard a half
- ✅ Search in Rotated Sorted Array (#33) — find the sorted half, is target in it?
- ✅ Koko Eating Bananas (#875) — binary search on the answer space
- ⬜ Median of Two Sorted Arrays (#4)

### ⬜ Intervals
*Cue:* overlapping ranges, meetings, merge/sweep.
- ⬜ Merge Intervals (#56)
- ⬜ Insert Interval (#57)
- ⬜ Meeting Rooms II (#253)

### ⬜ Cyclic Sort
*Cue:* array of 1..n; find the missing/duplicate in place.
- ⬜ Missing Number (#268)
- ⬜ Find All Duplicates in an Array (#442)

---

## Family 3 — Hashing & stacks

### ✅ Arrays & Hashing
*Cue:* frequency counts, dedupe, O(1) lookup.
- ✅ Two Sum (#1) — one-pass map, look up the complement
- ✅ Group Anagrams (#49) — bucket by sorted-letters key
- ✅ Top K Frequent Elements (#347) — frequency map → pick k highest
- ✅ Valid Anagram (#242) — count s, subtract t

### ✅ Monotonic Stack
*Cue:* "next greater/smaller", spans, histogram.
- ✅ Daily Temperatures (#739) — stack of indices, resolve on a warmer day
- ✅ Next Greater Element (#496) — stack builds a next-greater map
- ⬜ Largest Rectangle in Histogram (#84) — needs a histogram/bars primitive

### ✅ Monotonic Deque
*Cue:* shortest/longest subarray with a sum/range constraint **with negatives**; sliding-window max/min.
- ✅ Shortest Subarray with Sum at Least K (#862)
- ⬜ Sliding Window Maximum (#239)

---

## Family 4 — Linked lists & trees

### ⬜ Linked List (in-place reversal)
*Cue:* reverse or reorder nodes without extra space.
- ⬜ Reverse Linked List (#206)
- ⬜ Reorder List (#143)
- ⬜ Reverse Nodes in k-Group (#25)

### ⬜ Tree DFS
*Cue:* root-to-leaf paths, recursion over subtrees.
- ⬜ Maximum Depth of Binary Tree (#104)
- ⬜ Path Sum (#112)
- ⬜ Validate BST (#98)
- ⬜ Lowest Common Ancestor (#236)

### ⬜ Tree BFS
*Cue:* level-order, shortest path in a tree.
- ⬜ Binary Tree Level Order Traversal (#102)
- ⬜ Binary Tree Right Side View (#199)

### ⬜ Trie
*Cue:* prefix lookups, word dictionaries.
- ⬜ Implement Trie (#208)
- ⬜ Word Search II (#212)

---

## Family 5 — Choices & priority

### ⬜ Heap / Top-K
*Cue:* "k largest/smallest", streaming median, merge k.
- ⬜ Kth Largest Element in an Array (#215)
- ⬜ Merge k Sorted Lists (#23)
- ⬜ Find Median from Data Stream (#295)

### ⬜ Backtracking
*Cue:* enumerate all subsets / permutations / combinations.
- ⬜ Subsets (#78)
- ⬜ Permutations (#46)
- ⬜ Combination Sum (#39)
- ⬜ Word Search (#79)
- ⬜ N-Queens (#51)

---

## Family 6 — Graphs

### ⬜ Graph BFS/DFS
*Cue:* grids, connected components, flood fill.
- ⬜ Number of Islands (#200)
- ⬜ Clone Graph (#133)
- ⬜ Rotting Oranges (#994)

### ⬜ Union-Find
*Cue:* connectivity, "are these in the same group".
- ⬜ Number of Connected Components (#323)
- ⬜ Redundant Connection (#684)

### ⬜ Topological Sort
*Cue:* ordering with prerequisites/dependencies.
- ⬜ Course Schedule I / II (#207 / #210)
- ⬜ Alien Dictionary (#269)

---

## Family 7 — Optimization

### ⬜ Dynamic Programming
*Cue:* overlapping subproblems; "count ways / min cost / longest".
- ⬜ Climbing Stairs (#70)
- ⬜ House Robber (#198)
- ⬜ Coin Change (#322)
- ⬜ Longest Increasing Subsequence (#300)
- ⬜ Edit Distance (#72)

### ⬜ Greedy
*Cue:* local optimal → global; intervals/jumps.
- ⬜ Jump Game (#55)
- ⬜ Gas Station (#134)
- ⬜ Partition Labels (#763)

---

## Family 8 — Misc

### ⬜ Bit Manipulation
*Cue:* XOR tricks, single number, bit counting.
- ⬜ Single Number (#136)
- ⬜ Number of 1 Bits (#191)

### ⬜ Math / Geometry
*Cue:* matrix rotation, spiral traversal, number theory.
- ⬜ Rotate Image (#48)
- ⬜ Spiral Matrix (#54)

---

## Notes

- Patterns are intentionally kept **distinct by recognition cue**, even when they
  share a substrate. e.g. Two Pointers vs Sliding Window (converge vs slide),
  and Prefix Sum vs Monotonic Deque (#560 counts prefixes with a map; #862 needs
  a monotonic deque because negatives break the window). Related patterns are
  cross-linked on the pattern card via the `related` field.
- Visualization readiness drives build order. Reuse the existing `viz/`
  primitives where possible; new families need new primitives:
  - **reuse now** (cells + pointers + window + map + deque + span): Sliding
    Window, Binary Search, Monotonic Stack, Cyclic Sort, Prefix Sum.
  - **need a `Node`/`Edge` primitive**: Linked List, Trees, Graphs, Trie, Heap.
  - **need a grid primitive**: DP, Matrix/Math.
