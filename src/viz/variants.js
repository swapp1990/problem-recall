// Map a two-pointer window state to cell variants. Cells at the pointers are
// "active"; cells outside [left, right] are "matched" (eliminated/locked);
// cells still in play are "default". Generic across converging two-pointer
// scenes (palindrome, sorted two-sum, etc.).
export function convergingVariant(i, left, right) {
  if (i === left || i === right) return "active";
  if (i < left || i > right) return "matched";
  return "default";
}
