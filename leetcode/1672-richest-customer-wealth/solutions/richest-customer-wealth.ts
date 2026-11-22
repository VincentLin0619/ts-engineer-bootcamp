// Reference solution for LeetCode 1672: Richest Customer Wealth.

export function maximumWealth(accounts: number[][]): number {
  let richest = 0;
  for (const customer of accounts) {
    const wealth = customer.reduce((total, money) => total + money, 0);
    if (wealth > richest) {
      richest = wealth;
    }
  }
  return richest;
}
