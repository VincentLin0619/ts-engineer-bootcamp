// Reference solution for exercise 02.

export type Product = {
  name: string;
  price: number;
  inStock: boolean;
};

export function describeProduct(product: Product): string {
  const { name, price } = product;
  return `${name}：${price} 元`;
}

export function addProduct(
  products: readonly Product[],
  product: Product,
): Product[] {
  return [...products, product];
}

export function removeByName(
  products: readonly Product[],
  name: string,
): Product[] {
  return products.filter((product) => product.name !== name);
}

export function withPrice(product: Product, price: number): Product {
  // `price: price` is written after the spread, so it replaces the copy.
  return { ...product, price: price };
}

export function markSoldOut(
  products: readonly Product[],
  name: string,
): Product[] {
  // A new object for the match, the very same object for everything else.
  return products.map((product) =>
    product.name === name ? { ...product, inStock: false } : product,
  );
}

export function sortByPrice(products: readonly Product[]): Product[] {
  return products.toSorted((a, b) => a.price - b.price);
}
