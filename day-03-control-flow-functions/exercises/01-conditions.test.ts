import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { canRide, isValidTitle, passLabel, sizeToMl, ticketPrice } =
  await loadExercise<typeof import("./01-conditions.ts")>(
    import.meta.dir,
    "01-conditions",
  );

describe("練習 01：條件判斷", () => {
  test("passLabel 60 分以上及格", () => {
    expect(passLabel(72)).toBe("及格");
    expect(passLabel(60)).toBe("及格");
    expect(passLabel(59)).toBe("不及格");
  });

  test("ticketPrice 依年齡決定票價", () => {
    expect(ticketPrice(5)).toBe(0);
    expect(ticketPrice(6)).toBe(150);
    expect(ticketPrice(17)).toBe(150);
    expect(ticketPrice(18)).toBe(300);
    expect(ticketPrice(70)).toBe(300);
  });

  test("isValidTitle 標題長度要在 1 到 20 個字之間", () => {
    expect(isValidTitle("買牛奶")).toBe(true);
    expect(isValidTitle("a")).toBe(true);
    expect(isValidTitle("12345678901234567890")).toBe(true);
    expect(isValidTitle("")).toBe(false);
    expect(isValidTitle("123456789012345678901")).toBe(false);
  });

  test("canRide 身高夠或有大人陪同就可以搭乘", () => {
    expect(canRide(130, false)).toBe(true);
    expect(canRide(120, false)).toBe(true);
    expect(canRide(100, true)).toBe(true);
    expect(canRide(100, false)).toBe(false);
  });

  test("sizeToMl 把尺寸換成容量", () => {
    expect(sizeToMl("S")).toBe(350);
    expect(sizeToMl("M")).toBe(500);
    expect(sizeToMl("L")).toBe(700);
  });
});
