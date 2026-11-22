import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { describePrice, findPriceOrZero, totalPrice } = await loadExercise<
  typeof import("./01-async-await.ts")
>(import.meta.dir, "01-async-await");

describe("練習 01：async／await 與 Promise.all", () => {
  test("describePrice 等到價格後組出文字", async () => {
    expect(await describePrice("拿鐵")).toBe("拿鐵：120 元");
    expect(await describePrice("紅茶")).toBe("紅茶：40 元");
  });

  test("describePrice 遇到不認識的飲料時，Promise 是 rejected", async () => {
    await expect(describePrice("可樂")).rejects.toThrow("菜單上沒有「可樂」");
  });

  test("findPriceOrZero 回傳價格", async () => {
    expect(await findPriceOrZero("紅茶")).toBe(40);
  });

  test("findPriceOrZero 遇到不認識的飲料時回傳 0，不會失敗", async () => {
    expect(await findPriceOrZero("可樂")).toBe(0);
  });

  test("totalPrice 加總所有價格", async () => {
    expect(await totalPrice(["拿鐵", "紅茶"])).toBe(160);
    expect(await totalPrice([])).toBe(0);
  });

  test("totalPrice 同時查價：5 杯飲料不可以花到 150 毫秒", async () => {
    const start = Date.now();
    const total = await totalPrice(["拿鐵", "紅茶", "美式", "可可", "抹茶"]);
    const elapsed = Date.now() - start;

    expect(total).toBe(460);
    // One by one would take 5 x 40 = 200 ms. At the same time: about 40 ms.
    expect(elapsed).toBeLessThan(150);
  });

  test("totalPrice 只要有一杯查不到，整個 Promise 就是 rejected", async () => {
    await expect(totalPrice(["拿鐵", "可樂"])).rejects.toThrow(
      "菜單上沒有「可樂」",
    );
  });
});
