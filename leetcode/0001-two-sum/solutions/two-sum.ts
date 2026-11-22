// Reference solution for LeetCode 1: Two Sum.

export function twoSum(nums: readonly number[], target: number): number[] {
  const seen = new Map<number, number>(); // value -> index
  for (const [i, value] of nums.entries()) {
    const need = target - value;
    const j = seen.get(need);
    if (j !== undefined) {
      return [j, i];
    }
    seen.set(value, i);
  }
  return [];
}
