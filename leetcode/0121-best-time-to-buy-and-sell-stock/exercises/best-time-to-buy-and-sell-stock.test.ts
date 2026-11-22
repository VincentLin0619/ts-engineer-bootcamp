import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../../support/load-exercise.ts";

const { maxProfit } = await loadExercise<
  typeof import("./best-time-to-buy-and-sell-stock.ts")
>(import.meta.dir, "best-time-to-buy-and-sell-stock");

describe("LeetCode 121：Best Time to Buy and Sell Stock", () => {
  test("題目的範例：2 買進、7 賣出", () => {
    expect(maxProfit([8, 3, 6, 2, 7])).toBe(5);
  });

  test("價格一路下跌，賺不到錢時回傳 0", () => {
    expect(maxProfit([9, 7, 5, 2])).toBe(0);
  });

  test("最短的輸入：只有一天", () => {
    expect(maxProfit([5])).toBe(0);
  });

  test("每天價格都一樣", () => {
    expect(maxProfit([4, 4, 4])).toBe(0);
  });

  test("最高價出現在最低價之前，不能先賣後買", () => {
    expect(maxProfit([10, 1, 3])).toBe(2);
  });

  test("最低價出現之後，前面算過的獲利不會消失", () => {
    expect(maxProfit([3, 9, 1, 4])).toBe(6);
  });

  test("價格可以是 0", () => {
    expect(maxProfit([6, 0, 5])).toBe(5);
  });

  test("不會改動傳進來的陣列", () => {
    const prices = [8, 3, 6, 2, 7];
    maxProfit(prices);
    expect(prices).toEqual([8, 3, 6, 2, 7]);
  });

  test("稍大的輸入：10000 天", () => {
    // Prices go 10000, 9999, ..., 1, then jump to 20000 on the last day.
    const prices: number[] = [];
    for (let price = 10000; price >= 1; price--) {
      prices.push(price);
    }
    prices.push(20000);
    expect(maxProfit(prices)).toBe(19999);
  });
});
