// Reference solution for LeetCode 704: Binary Search.

export function search(nums: readonly number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = nums[mid];
    if (value === undefined) {
      return -1; // never happens: mid is always between left and right
    }
    if (value === target) {
      return mid;
    }
    if (value < target) {
      left = mid + 1; // target can only be on the right
    } else {
      right = mid - 1; // target can only be on the left
    }
  }
  return -1;
}
