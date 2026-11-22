// Reference solution for LeetCode 121: Best Time to Buy and Sell Stock.

export function maxProfit(prices: number[]): number {
  let minPrice = Infinity; // lowest price seen so far
  let best = 0; // best profit seen so far
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    }
    const profit = price - minPrice;
    if (profit > best) {
      best = profit;
    }
  }
  return best;
}
