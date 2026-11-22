// Reference solution for exercise 01, file 1 of 2.

export type CartItem = {
  name: string;
  unitPrice: number;
  quantity: number;
};

// A cart whose total is this amount or more is shipped for free.
export const FREE_SHIPPING_THRESHOLD = 500;

export function formatPrice(amount: number): string {
  return `NT$${amount}`;
}

export function lineTotal(item: CartItem): number {
  return item.unitPrice * item.quantity;
}
