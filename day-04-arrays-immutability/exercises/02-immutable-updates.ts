// Exercise 02: spread, destructuring and immutable updates.
//
// Replace the `throw new Error(...)` line inside each function with your
// own code, then run: bun test day-04
//
// Rule for this file: never change what is passed in. Every function
// returns a NEW array or a NEW object. The `readonly` in the parameter
// types helps you: TypeScript reports an error when you try `push` or
// `sort` on those arrays.

export type Product = {
  name: string;
  price: number;
  inStock: boolean;
};

// Use destructuring to pull `name` and `price` out of the product, then
// build the text "<name>：<price> 元".
// describeProduct({ name: "鉛筆", price: 10, inStock: true }) -> "鉛筆：10 元"
export function describeProduct(product: Product): string {
  // TODO: destructure the product, then return the text
  throw new Error("TODO：尚未完成 describeProduct");
}

// Use array spread. Return a new array with `product` added at the end.
export function addProduct(
  products: readonly Product[],
  product: Product,
): Product[] {
  // TODO: return a new array: the old items, then the new one
  throw new Error("TODO：尚未完成 addProduct");
}

// Use filter. Return a new array without the product that has this name.
export function removeByName(
  products: readonly Product[],
  name: string,
): Product[] {
  // TODO: return a new array that keeps every other product
  throw new Error("TODO：尚未完成 removeByName");
}

// Use object spread. Return a new product that is the same as `product`,
// except for its price.
// withPrice({ name: "鉛筆", price: 10, inStock: true }, 12)
//   -> { name: "鉛筆", price: 12, inStock: true }
export function withPrice(product: Product, price: number): Product {
  // TODO: return a new object, do not assign to product.price
  throw new Error("TODO：尚未完成 withPrice");
}

// Use map and object spread. Return a new array in which the product with
// this name has `inStock: false`. Every other product stays as it is.
export function markSoldOut(
  products: readonly Product[],
  name: string,
): Product[] {
  // TODO: return a new array with one product replaced by a new object
  throw new Error("TODO：尚未完成 markSoldOut");
}

// Use toSorted. Return a new array sorted by price, cheapest first.
export function sortByPrice(products: readonly Product[]): Product[] {
  // TODO: return a sorted copy
  throw new Error("TODO：尚未完成 sortByPrice");
}
