// Reference solution for LeetCode 283: Move Zeroes.

export function moveZeroes(nums: number[]): void {
  let write = 0; // next position for a non-zero value
  for (const value of nums) {
    if (value !== 0) {
      nums[write] = value;
      write++;
    }
  }
  for (let i = write; i < nums.length; i++) {
    nums[i] = 0;
  }
}
