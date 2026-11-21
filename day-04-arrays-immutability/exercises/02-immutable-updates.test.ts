import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import type { Product } from "./02-immutable-updates.ts";

const {
  addProduct,
  describeProduct,
  markSoldOut,
  removeByName,
  sortByPrice,
  withPrice,
} = await loadExercise<typeof import("./02-immutable-updates.ts")>(
  import.meta.dir,
  "02-immutable-updates",
);

const pencil: Product = { name: "鉛筆", price: 10, inStock: true };
const notebook: Product = { name: "筆記本", price: 45, inStock: true };
const backpack: Product = { name: "書包", price: 890, inStock: true };
const eraser: Product = { name: "橡皮擦", price: 8, inStock: true };

describe("練習 02：展開、解構與不可變更新", () => {
  test("describeProduct 組出商品說明", () => {
    expect(describeProduct(pencil)).toBe("鉛筆：10 元");
    expect(describeProduct(backpack)).toBe("書包：890 元");
  });

  test("addProduct 回傳多了一個商品的新陣列", () => {
    const products: readonly Product[] = [pencil, notebook];
    const result = addProduct(products, backpack);
    expect(result).toEqual([pencil, notebook, backpack]);
    expect(result).not.toBe(products);
  });

  test("addProduct 不會改動原本的陣列", () => {
    const products: Product[] = [pencil, notebook];
    addProduct(products, backpack);
    expect(products).toEqual([pencil, notebook]);
  });

  test("removeByName 回傳少了指定商品的新陣列", () => {
    const products: Product[] = [pencil, notebook, backpack];
    expect(removeByName(products, "筆記本")).toEqual([pencil, backpack]);
    expect(removeByName(products, "不存在")).toEqual(products);
    expect(products).toEqual([pencil, notebook, backpack]);
  });

  test("withPrice 回傳價格不同的新物件，原物件不變", () => {
    const original: Product = { name: "鉛筆", price: 10, inStock: true };
    const result = withPrice(original, 12);
    expect(result).toEqual({ name: "鉛筆", price: 12, inStock: true });
    expect(result).not.toBe(original);
    expect(original.price).toBe(10);
  });

  test("markSoldOut 只把指定商品換成缺貨的新物件", () => {
    const first: Product = { name: "鉛筆", price: 10, inStock: true };
    const second: Product = { name: "筆記本", price: 45, inStock: true };
    const products: Product[] = [first, second];

    const result = markSoldOut(products, "筆記本");

    expect(result).toEqual([
      { name: "鉛筆", price: 10, inStock: true },
      { name: "筆記本", price: 45, inStock: false },
    ]);
    // The untouched product is the same object, the changed one is new.
    expect(result[0]).toBe(first);
    expect(result[1]).not.toBe(second);
  });

  test("markSoldOut 不會改動原本的陣列與物件", () => {
    const second: Product = { name: "筆記本", price: 45, inStock: true };
    const products: Product[] = [pencil, second];
    markSoldOut(products, "筆記本");
    expect(second.inStock).toBe(true);
    expect(products).toEqual([pencil, second]);
  });

  test("sortByPrice 回傳由便宜到貴的新陣列", () => {
    const products: Product[] = [notebook, backpack, eraser, pencil];
    const result = sortByPrice(products);
    expect(result).toEqual([eraser, pencil, notebook, backpack]);
    expect(result).not.toBe(products);
  });

  test("sortByPrice 不會改動原本的順序", () => {
    const products: Product[] = [notebook, backpack, eraser, pencil];
    sortByPrice(products);
    expect(products).toEqual([notebook, backpack, eraser, pencil]);
  });
});
