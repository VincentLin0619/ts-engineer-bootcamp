import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { addAsNumbers, describeCourse, toTotalMinutes } = await loadExercise<
  typeof import("./02-sentences.ts")
>(import.meta.dir, "02-sentences");

describe("練習 02：樣板字串與數字運算", () => {
  test("describeCourse 組出課程說明", () => {
    expect(describeCourse("TypeScript 入門", 14)).toBe(
      "TypeScript 入門 共 14 天",
    );
    expect(describeCourse("CRUD", 3)).toBe("CRUD 共 3 天");
  });

  test("toTotalMinutes 把小時與分鐘換算成總分鐘數", () => {
    expect(toTotalMinutes(1, 30)).toBe(90);
    expect(toTotalMinutes(0, 45)).toBe(45);
    expect(toTotalMinutes(3, 0)).toBe(180);
  });

  test("addAsNumbers 把文字當成數字相加", () => {
    expect(addAsNumbers("2", "3")).toBe(5);
    expect(addAsNumbers("10", "0.5")).toBe(10.5);
  });
});
