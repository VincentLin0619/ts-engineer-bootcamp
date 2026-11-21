// Reference solution for exercise 01.

export type Product = {
  name: string;
  price: number;
  inStock: boolean;
};

export function getNames(products: readonly Product[]): string[] {
  return products.map((product) => product.name);
}

export function getInStock(products: readonly Product[]): Product[] {
  // `inStock` is already a boolean, so it can be returned as the answer.
  return products.filter((product) => product.inStock);
}

export function findByName(
  products: readonly Product[],
  name: string,
): Product | undefined {
  return products.find((product) => product.name === name);
}

export function hasPriceOver(
  products: readonly Product[],
  limit: number,
): boolean {
  return products.some((product) => product.price > limit);
}

export function allInStock(products: readonly Product[]): boolean {
  return products.every((product) => product.inStock);
}

export function totalPrice(products: readonly Product[]): number {
  // The 0 is the starting total. Without it, an empty array would throw.
  return products.reduce((total, product) => total + product.price, 0);
}
