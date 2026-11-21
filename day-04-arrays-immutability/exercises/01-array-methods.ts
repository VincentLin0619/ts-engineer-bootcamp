// Exercise 01: array methods.
//
// Replace the `throw new Error(...)` line inside each function with your
// own code, then run: bun test day-04
//
// Each function can be written as a single `return` line with the array
// method named in its comment. Do not use `for` loops today.
//
// The parameters are `readonly Product[]`: these functions only read the
// array, they never change it.

export type Product = {
  name: string;
  price: number;
  inStock: boolean;
};

// Use map. Return the name of every product, in the same order.
// With 鉛筆, 筆記本 and 書包 in the list:
// getNames(products) -> ["鉛筆", "筆記本", "書包"]
export function getNames(products: readonly Product[]): string[] {
  // TODO: return the names
  throw new Error("TODO：尚未完成 getNames");
}

// Use filter. Return only the products that are in stock.
export function getInStock(products: readonly Product[]): Product[] {
  // TODO: return the products whose `inStock` is true
  throw new Error("TODO：尚未完成 getInStock");
}

// Use find. Return the product with the given name, or undefined when
// there is no such product.
// findByName(products, "筆記本") -> { name: "筆記本", price: 45, inStock: false }
// findByName(products, "橡皮擦") -> undefined
export function findByName(
  products: readonly Product[],
  name: string,
): Product | undefined {
  // TODO: return the first product with this name
  throw new Error("TODO：尚未完成 findByName");
}

// Use some. Return true when at least one product costs more than `limit`.
// With prices 10, 45 and 890:
// hasPriceOver(products, 500) -> true
// hasPriceOver(products, 1000) -> false
export function hasPriceOver(
  products: readonly Product[],
  limit: number,
): boolean {
  // TODO: return whether any price is greater than the limit
  throw new Error("TODO：尚未完成 hasPriceOver");
}

// Use every. Return true when all products are in stock.
export function allInStock(products: readonly Product[]): boolean {
  // TODO: return whether every product is in stock
  throw new Error("TODO：尚未完成 allInStock");
}

// Use reduce. Return the sum of all prices. An empty list gives 0.
// With prices 10, 45 and 890:
// totalPrice(products) -> 945
export function totalPrice(products: readonly Product[]): number {
  // TODO: return the total, starting the reduce at 0
  throw new Error("TODO：尚未完成 totalPrice");
}
