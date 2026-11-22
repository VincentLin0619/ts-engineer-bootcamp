import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import type { Shape } from "./01-shapes.ts";

const { Rectangle, describeShape, makeTriangle, totalArea } =
  await loadExercise<typeof import("./01-shapes.ts")>(
    import.meta.dir,
    "01-shapes",
  );

// A shape the exercise file has never heard of. Functions written against
// the Shape interface must handle it too.
class Square implements Shape {
  readonly name = "正方形";
  #side: number;

  constructor(side: number) {
    this.#side = side;
  }

  area(): number {
    return this.#side * this.#side;
  }
}

describe("練習 01：介面與多型 Shape", () => {
  test("Rectangle 實作 Shape", () => {
    const rectangle: Shape = new Rectangle(3, 4);
    expect(rectangle.name).toBe("長方形");
    expect(rectangle.area()).toBe(12);
    expect(new Rectangle(10, 2).area()).toBe(20);
  });

  test("Rectangle 的寬與高是 # 私有欄位", () => {
    expect(Object.keys(new Rectangle(3, 4))).toEqual(["name"]);
  });

  test("makeTriangle 回傳一個三角形", () => {
    const triangle = makeTriangle(6, 4);
    expect(triangle.name).toBe("三角形");
    expect(triangle.area()).toBe(12);
    expect(makeTriangle(5, 3).area()).toBe(7.5);
  });

  test("describeShape 對任何 Shape 都有效", () => {
    expect(describeShape(new Rectangle(3, 4))).toBe("長方形，面積 12");
    expect(describeShape(makeTriangle(6, 4))).toBe("三角形，面積 12");
    expect(describeShape(new Square(5))).toBe("正方形，面積 25");
  });

  test("totalArea 把每個圖形的面積加起來", () => {
    expect(totalArea([])).toBe(0);
    expect(totalArea([new Rectangle(3, 4)])).toBe(12);
    expect(
      totalArea([new Rectangle(3, 4), makeTriangle(6, 4), new Square(5)]),
    ).toBe(49);
  });
});
