import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../../support/load-exercise.ts";

const { fizzBuzz } = await loadExercise<typeof import("./fizz-buzz.ts")>(
  import.meta.dir,
  "fizz-buzz",
);

describe("LeetCode 412：Fizz Buzz", () => {
  test("題目的範例：n = 7", () => {
    expect(fizzBuzz(7)).toEqual(["1", "2", "Fizz", "4", "Buzz", "Fizz", "7"]);
  });

  test("最短的輸入：n = 1", () => {
    expect(fizzBuzz(1)).toEqual(["1"]);
  });

  test("15 同時是 3 和 5 的倍數，要放 FizzBuzz", () => {
    expect(fizzBuzz(16)).toEqual([
      "1",
      "2",
      "Fizz",
      "4",
      "Buzz",
      "Fizz",
      "7",
      "8",
      "Fizz",
      "Buzz",
      "11",
      "Fizz",
      "13",
      "14",
      "FizzBuzz",
      "16",
    ]);
  });

  test("一般的數字要轉成字串，不是 number", () => {
    const answer = fizzBuzz(2);
    expect(answer).toEqual(["1", "2"]);
    expect(typeof answer[0]).toBe("string");
  });

  test("稍大的輸入：n = 100", () => {
    const answer = fizzBuzz(100);
    expect(answer).toHaveLength(100);
    expect(answer[29]).toBe("FizzBuzz"); // 30
    expect(answer[96]).toBe("97");
    expect(answer[98]).toBe("Fizz"); // 99
    expect(answer[99]).toBe("Buzz"); // 100
    expect(answer.filter((word) => word === "FizzBuzz")).toHaveLength(6);
    expect(answer.filter((word) => word === "Fizz")).toHaveLength(27);
    expect(answer.filter((word) => word === "Buzz")).toHaveLength(14);
  });
});
