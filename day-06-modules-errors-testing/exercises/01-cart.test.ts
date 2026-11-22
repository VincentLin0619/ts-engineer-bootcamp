import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { cartSummary, cartTotal, shippingFee } = await loadExercise<
  typeof import("./01-cart.ts")
>(import.meta.dir, "01-cart");

// Loaded as "any names, unknown values" so the test can check what the
// module really exports.
const pricing = await loadExercise<Record<string, unknown>>(
  import.meta.dir,
  "01-cart-pricing",
);

const smallCart = [
  { name: "牛奶", unitPrice: 65, quantity: 2 },
  { name: "吐司", unitPrice: 40, quantity: 1 },
];

const bigCart = [
  { name: "咖啡豆", unitPrice: 320, quantity: 1 },
  { name: "濾紙", unitPrice: 90, quantity: 2 },
];

describe("練習 01：模組的 export 與 import", () => {
  test("01-cart-pricing.ts 匯出了 FREE_SHIPPING_THRESHOLD", () => {
    expect(pricing.FREE_SHIPPING_THRESHOLD).toBe(500);
  });

  test("01-cart-pricing.ts 匯出了 formatPrice 與 lineTotal", () => {
    expect(typeof pricing.formatPrice).toBe("function");
    expect(typeof pricing.lineTotal).toBe("function");
  });

  test("cartTotal 加總每一項的小計", () => {
    expect(cartTotal(smallCart)).toBe(170);
    expect(cartTotal(bigCart)).toBe(500);
    expect(cartTotal([])).toBe(0);
  });

  test("shippingFee 未達免運門檻時是 60", () => {
    expect(shippingFee(smallCart)).toBe(60);
  });

  test("shippingFee 達到免運門檻時是 0", () => {
    expect(shippingFee(bigCart)).toBe(0);
  });

  test("cartSummary 組出一行摘要", () => {
    expect(cartSummary(smallCart)).toBe(
      "共 2 項，小計 NT$170，運費 NT$60，總計 NT$230",
    );
    expect(cartSummary(bigCart)).toBe(
      "共 2 項，小計 NT$500，運費 NT$0，總計 NT$500",
    );
  });
});
