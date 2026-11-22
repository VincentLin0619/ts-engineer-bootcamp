// Exercise 01, file 1 of 2: a module for another file to import from.
//
// Right now only the type is exported, so 01-cart.ts cannot use the constant
// or the two functions.
//
// TODO: add `export` in front of the constant and the two functions.
// Do not change anything else in this file.

export type CartItem = {
  name: string;
  unitPrice: number;
  quantity: number;
};

// A cart whose total is this amount or more is shipped for free.
const FREE_SHIPPING_THRESHOLD = 500;

// formatPrice(170) -> "NT$170"
function formatPrice(amount: number): string {
  return `NT$${amount}`;
}

// lineTotal({ name: "牛奶", unitPrice: 65, quantity: 2 }) -> 130
function lineTotal(item: CartItem): number {
  return item.unitPrice * item.quantity;
}
