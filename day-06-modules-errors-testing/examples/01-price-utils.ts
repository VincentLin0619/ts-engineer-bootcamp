// Run from the project root:
//   bun run day-06-modules-errors-testing/examples/01-price-utils.ts
//
// Running this file prints nothing: it only defines things. It is a module
// that other files import from. See 02-import.ts for the file that uses it.

// `export` makes a name available to other files.
export const TAX_RATE = 0.05;

// Types can be exported too.
export type Product = {
  name: string;
  price: number;
};

// No `export`: this function can only be used inside this file.
// Math.round rounds to the nearest whole number: 68.25 -> 68.
function roundToInteger(amount: number): number {
  return Math.round(amount);
}

export function priceWithTax(price: number): number {
  return roundToInteger(price * (1 + TAX_RATE));
}

export function formatPrice(amount: number): string {
  return `NT$${amount}`;
}
