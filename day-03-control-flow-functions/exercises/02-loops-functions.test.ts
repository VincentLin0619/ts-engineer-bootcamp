import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { countLongTitles, daysToSave, isLongTitle, keepPassing, sumTo } =
  await loadExercise<typeof import("./02-loops-functions.ts")>(
    import.meta.dir,
    "02-loops-functions",
  );

describe("練習 02：迴圈與函式", () => {
  test("sumTo 把 1 加到指定的數字", () => {
    expect(sumTo(4)).toBe(10);
    expect(sumTo(1)).toBe(1);
    expect(sumTo(100)).toBe(5050);
    expect(sumTo(0)).toBe(0);
  });

  test("keepPassing 只留下 60 分以上的分數", () => {
    expect(keepPassing([80, 45, 60])).toEqual([80, 60]);
    expect(keepPassing([10])).toEqual([]);
    expect(keepPassing([])).toEqual([]);
  });

  test("keepPassing 不會改動傳進來的陣列", () => {
    const scores = [80, 45, 60];
    keepPassing(scores);
    expect(scores).toEqual([80, 45, 60]);
  });

  test("daysToSave 算出存到目標金額要幾天", () => {
    expect(daysToSave(500, 150)).toBe(4);
    expect(daysToSave(300, 100)).toBe(3);
    expect(daysToSave(0, 100)).toBe(0);
  });

  test("isLongTitle 判斷標題是否夠長", () => {
    expect(isLongTitle("買牛奶", 3)).toBe(true);
    expect(isLongTitle("整理房間", 3)).toBe(true);
    expect(isLongTitle("運動", 3)).toBe(false);
  });

  test("countLongTitles 數出夠長的標題有幾個", () => {
    const titles = ["買牛奶", "整理房間", "運動"];
    expect(countLongTitles(titles, 3)).toBe(2);
    expect(countLongTitles(titles, 2)).toBe(3);
    expect(countLongTitles([], 2)).toBe(0);
  });

  test("countLongTitles 沒有傳 minLength 時使用預設值 4", () => {
    expect(countLongTitles(["買牛奶", "整理房間", "運動"])).toBe(1);
  });
});
