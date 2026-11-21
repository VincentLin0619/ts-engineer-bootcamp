import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const exercise = await loadExercise<typeof import("./02-unions-narrowing.ts")>(
  import.meta.dir,
  "02-unions-narrowing",
);

describe("練習 02：union、選用屬性與型別縮小", () => {
  test("largestSize 是 L", () => {
    // `string` keeps this file type-checking before "L" is added to Size.
    expect<string>(exercise.largestSize).toBe("L");
  });

  test("noteOrDefault 有備註就回傳備註，沒有就回傳「無備註」", () => {
    expect(
      exercise.noteOrDefault({ name: "紅茶", price: 30, note: "去冰" }),
    ).toBe("去冰");
    expect(exercise.noteOrDefault({ name: "綠茶", price: 25 })).toBe("無備註");
  });

  test("formatId 幫數字加上 #，文字原樣回傳", () => {
    expect(exercise.formatId(7)).toBe("#7");
    expect(exercise.formatId(120)).toBe("#120");
    expect(exercise.formatId("A-7")).toBe("A-7");
  });

  test("displayName 有暱稱就用暱稱，沒有就用本名", () => {
    expect(exercise.displayName({ name: "王小明", nickname: "小明" })).toBe(
      "小明",
    );
    expect(exercise.displayName({ name: "陳大文", nickname: null })).toBe(
      "陳大文",
    );
  });

  test("firstOrFallback 回傳第一個標題，空陣列回傳替代文字", () => {
    expect(exercise.firstOrFallback(["買牛奶", "運動"], "沒有事項")).toBe(
      "買牛奶",
    );
    expect(exercise.firstOrFallback([], "沒有事項")).toBe("沒有事項");
  });
});
