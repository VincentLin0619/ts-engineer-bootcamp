// Reference solution for LeetCode 1480: Running Sum of 1d Array.

export function runningSum(nums: number[]): number[] {
  const sums: number[] = [];
  let total = 0;
  for (const value of nums) {
    total += value;
    sums.push(total);
  }
  return sums;
}
