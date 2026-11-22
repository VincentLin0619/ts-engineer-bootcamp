// Exercise 01, file 2 of 2: import from another module.
//
// Step 1: open 01-cart-pricing.ts and add the missing `export` keywords.
// Step 2: write the import line marked TODO below.
// Step 3: replace each `throw new Error(...)` line. Use the imported
//         constant and functions. Do not write them again in this file.
// Then run: bun test day-06

// The type import is already written. Note the word `type`.
import type { CartItem } from "./01-cart-pricing.ts";

// TODO: import FREE_SHIPPING_THRESHOLD, formatPrice and lineTotal
//       from "./01-cart-pricing.ts"

const SHIPPING_FEE = 60;

// Add up lineTotal(item) for every item in the cart.
// For a cart with 牛奶 (65 x 2) and 吐司 (40 x 1):
// cartTotal(items) -> 170
// cartTotal([]) -> 0
export function cartTotal(items: readonly CartItem[]): number {
  // TODO: return the sum of every line total
  throw new Error("TODO：尚未完成 cartTotal");
}

// 0 when the cart total is FREE_SHIPPING_THRESHOLD or more.
// Otherwise SHIPPING_FEE.
// shippingFee(items) -> 60   (the total is 170)
export function shippingFee(items: readonly CartItem[]): number {
  // TODO: return the shipping fee
  throw new Error("TODO：尚未完成 shippingFee");
}

// One line that sums up the cart. Format every amount with formatPrice.
// cartSummary(items) -> "共 2 項，小計 NT$170，運費 NT$60，總計 NT$230"
export function cartSummary(items: readonly CartItem[]): string {
  // TODO: return the summary line
  throw new Error("TODO：尚未完成 cartSummary");
}
