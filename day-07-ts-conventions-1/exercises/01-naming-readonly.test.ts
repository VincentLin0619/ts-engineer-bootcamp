import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { loadExercise } from "../../support/load-exercise.ts";

const { kindLabel, priceOf, totalPrice, tuesdayPrice, withBookingFee } =
  await loadExercise<typeof import("./01-naming-readonly.ts")>(
    import.meta.dir,
    "01-naming-readonly",
  );

// The text of the file being tested, to check what cannot be observed by
// calling functions: names and leftover suppression comments.
const source = await Bun.file(
  join(
    import.meta.dir,
    process.env.SOLUTIONS ? "../solutions" : ".",
    "01-naming-readonly.ts",
  ),
).text();
const lines = source.split("\n").map((line) => line.trim());
const codeLines = lines.filter((line) => !line.startsWith("//"));

describe("練習 01：命名與不可修改", () => {
  test("沒有留下 biome-ignore 或 @ts-expect-error 註解", () => {
    const suppressions = lines.filter(
      (line) =>
        line.startsWith("// biome-ignore") ||
        line.startsWith("// @ts-expect-error"),
    );
    expect(suppressions).toEqual([]);
  });

  test("程式裡沒有底線命名的型別、常數、參數", () => {
    const snakeCaseLines = codeLines.filter((line) => line.includes("ticket_"));
    expect(snakeCaseLines).toEqual([]);
  });

  test("priceOf 回傳票價", () => {
    expect(priceOf("adult")).toBe(300);
    expect(priceOf("student")).toBe(250);
    expect(priceOf("senior")).toBe(150);
  });

  test("tuesdayPrice 每次呼叫都回傳相同的結果", () => {
    expect(tuesdayPrice("student")).toBe(200);
    expect(tuesdayPrice("student")).toBe(200);
    expect(tuesdayPrice("adult")).toBe(250);
  });

  test("tuesdayPrice 不會改變原本的票價", () => {
    tuesdayPrice("senior");
    expect(priceOf("senior")).toBe(150);
  });

  test("totalPrice 是單價乘以張數", () => {
    expect(totalPrice("adult", 2)).toBe(600);
    expect(totalPrice("senior", 3)).toBe(450);
  });

  test("kindLabel 三種票都有名稱", () => {
    expect(kindLabel("adult")).toBe("全票");
    expect(kindLabel("student")).toBe("學生票");
    expect(kindLabel("senior")).toBe("敬老票");
  });

  test("withBookingFee 回傳加上手續費的新陣列", () => {
    expect(withBookingFee([300, 250])).toEqual([300, 250, 20]);
    expect(withBookingFee([])).toEqual([20]);
  });

  test("withBookingFee 不修改傳入的陣列", () => {
    const prices = [300, 250];
    const result = withBookingFee(prices);
    expect(prices).toEqual([300, 250]);
    expect(result).not.toBe(prices);
  });
});
