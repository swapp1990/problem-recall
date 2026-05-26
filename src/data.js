// Deck steps shown in the header progress + nav button labels.
export const steps = [
  { name: "Problem", nextLabel: "Show the Pattern" },
  { name: "Pattern", nextLabel: "Show the Solution" },
  { name: "Solution", nextLabel: "Drill complete" },
];

// Solution walkthrough across "racecar".
export const word = ["r", "a", "c", "e", "c", "a", "r"];

export const animSteps = [
  { left: 0, right: 6, status: "Initialize: left at 0, right at 6.", compare: false, match: null },
  { left: 0, right: 6, status: 's[0]="r"  ==  s[6]="r"  ✓  match', compare: true, match: true },
  { left: 1, right: 5, status: 's[1]="a"  ==  s[5]="a"  ✓  match', compare: true, match: true },
  { left: 2, right: 4, status: 's[2]="c"  ==  s[4]="c"  ✓  match', compare: true, match: true },
  { left: 3, right: 3, status: "Pointers meet. All matched → return true.", compare: false, match: "done" },
];

// Normalized string shown in the Problem card mirror viz, with the pivot index.
export const normalized = "amanaplanacanalpanama";
export const pivotIndex = 10;
