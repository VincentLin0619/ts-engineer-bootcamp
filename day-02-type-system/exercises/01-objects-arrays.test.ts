import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const exercise = await loadExercise<typeof import("./01-objects-arrays.ts")>(
  import.meta.dir,
  "01-objects-arrays",
);

describe("練習 01：物件型別與陣列", () => {
  test("myPet 有 name、age、vaccinated 三個屬性", () => {
    // `unknown` keeps this file type-checking before `vaccinated` is added.
    expect<unknown>(exercise.myPet).toEqual({
      name: "麻糬",
      age: 3,
      vaccinated: true,
    });
  });

  test("readingList 依序放了三本書", () => {
    expect(exercise.readingList).toEqual([
      "原子習慣",
      "小王子",
      "被討厭的勇氣",
    ]);
  });

  test("describeBook 用書的屬性組出一句話", () => {
    expect(exercise.describeBook({ title: "小王子", pages: 96 })).toBe(
      "《小王子》共 96 頁",
    );
    expect(exercise.describeBook({ title: "原子習慣", pages: 320 })).toBe(
      "《原子習慣》共 320 頁",
    );
  });

  test("countTitles 回傳陣列裡有幾個標題", () => {
    expect(exercise.countTitles(["原子習慣", "小王子"])).toBe(2);
    expect(exercise.countTitles([])).toBe(0);
  });

  test("lastTitle 回傳最後一個標題，空陣列回傳 undefined", () => {
    expect(exercise.lastTitle(["原子習慣", "小王子"])).toBe("小王子");
    expect(exercise.lastTitle(["被討厭的勇氣"])).toBe("被討厭的勇氣");
    expect(exercise.lastTitle([])).toBeUndefined();
  });
});
