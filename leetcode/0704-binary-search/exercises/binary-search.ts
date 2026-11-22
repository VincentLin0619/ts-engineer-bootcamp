// LeetCode 704: Binary Search.
//
// Replace the `throw new Error(...)` line with your own code, then run:
// bun test leetcode/0704
//
// `nums` is sorted from small to large and has no repeated numbers.
// Return the position of `target` in `nums`, or -1 when it is not there.
// Do not check the numbers one by one: look at the middle and throw away
// the half that cannot contain `target`, again and again.
//
// search([3, 9, 14, 20, 27, 31, 38, 45, 52, 60], 38) -> 6
// search([3, 9, 14, 20, 27, 31, 38, 45, 52, 60], 10) -> -1
// search([7], 7)                                     -> 0
export function search(nums: readonly number[], target: number): number {
  // TODO: keep a range from `left` to `right` and halve it in a while loop
  throw new Error("TODO：尚未完成 search");
}
