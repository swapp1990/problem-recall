// Map a two-pointer window state to cell variants. Cells at the pointers are
// "active"; cells outside [left, right] are "matched" (eliminated/locked);
// cells still in play are "default". Generic across converging two-pointer
// scenes (palindrome, sorted two-sum, etc.).
export function convergingVariant(i, left, right) {
  if (i === left || i === right) return "active";
  if (i < left || i > right) return "matched";
  return "default";
}

// Sliding-window state → variants. Cells before the window are "matched"
// (consumed/slid past), cells after it are "muted" (not yet reached), cells
// inside are "default" (the window band conveys membership). Generic across
// sliding-window scenes.
export function windowVariant(i, left, right) {
  if (i < left) return "matched";
  if (i > right) return "muted";
  return "default";
}
