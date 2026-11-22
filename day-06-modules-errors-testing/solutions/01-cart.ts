// Reference solution for exercise 01, file 2 of 2.

import type { CartItem } from "./01-cart-pricing.ts";
import {
  FREE_SHIPPING_THRESHOLD,
  formatPrice,
  lineTotal,
} from "./01-cart-pricing.ts";

const SHIPPING_FEE = 60;

export function cartTotal(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function shippingFee(items: readonly CartItem[]): number {
  return cartTotal(items) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function cartSummary(items: readonly CartItem[]): string {
  const subtotal = cartTotal(items);
  const fee = shippingFee(items);
  const total = subtotal + fee;
  return `共 ${items.length} 項，小計 ${formatPrice(subtotal)}，運費 ${formatPrice(fee)}，總計 ${formatPrice(total)}`;
}
