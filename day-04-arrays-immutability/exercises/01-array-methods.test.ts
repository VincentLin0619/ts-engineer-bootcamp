import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import type { Product } from "./01-array-methods.ts";

const {
  allInStock,
  findByName,
  getInStock,
  getNames,
  hasPriceOver,
  totalPrice,
} = await loadExercise<typeof import("./01-array-methods.ts")>(
  import.meta.dir,
  "01-array-methods",
);

const pencil: Product = { name: "鉛筆", price: 10, inStock: true };
const notebook: Product = { name: "筆記本", price: 45, inStock: false };
const backpack: Product = { name: "書包", price: 890, inStock: true };
const products: Product[] = [pencil, notebook, backpack];

describe("練習 01：陣列方法", () => {
  test("getNames 取出每個商品的名稱", () => {
    expect(getNames(products)).toEqual(["鉛筆", "筆記本", "書包"]);
    expect(getNames([])).toEqual([]);
  });

  test("getInStock 只留下有庫存的商品", () => {
    expect(getInStock(products)).toEqual([pencil, backpack]);
    expect(getInStock([notebook])).toEqual([]);
  });

  test("findByName 找到名稱相符的商品", () => {
    expect(findByName(products, "筆記本")).toBe(notebook);
  });

  test("findByName 找不到時回傳 undefined", () => {
    expect(findByName(products, "橡皮擦")).toBeUndefined();
  });

  test("hasPriceOver 判斷有沒有商品超過指定價格", () => {
    expect(hasPriceOver(products, 500)).toBe(true);
    expect(hasPriceOver(products, 890)).toBe(false);
    expect(hasPriceOver([], 0)).toBe(false);
  });

  test("allInStock 判斷是否全部都有庫存", () => {
    expect(allInStock(products)).toBe(false);
    expect(allInStock([pencil, backpack])).toBe(true);
  });

  test("totalPrice 把所有價格加起來", () => {
    expect(totalPrice(products)).toBe(945);
    expect(totalPrice([])).toBe(0);
  });

  test("這些函式都不會改動傳進來的陣列", () => {
    const original: Product[] = [pencil, notebook, backpack];
    getNames(original);
    getInStock(original);
    totalPrice(original);
    expect(original).toEqual([pencil, notebook, backpack]);
  });
});
