import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const exercise = await loadExercise<typeof import("./01-variables.ts")>(
  import.meta.dir,
  "01-variables",
);

describe("練習 01：變數", () => {
  test("learnerName 是一段非空的文字", () => {
    expect(typeof exercise.learnerName).toBe("string");
    expect(exercise.learnerName.length).toBeGreaterThan(0);
  });

  test("courseDays 是 14", () => {
    expect(exercise.courseDays).toBe(14);
  });

  test("hasRunFirstProgram 是 true", () => {
    expect(exercise.hasRunFirstProgram).toBe(true);
  });

  test("hoursPerDay 重新指派後是 3", () => {
    expect(exercise.finalHoursPerDay).toBe(3);
  });
});
