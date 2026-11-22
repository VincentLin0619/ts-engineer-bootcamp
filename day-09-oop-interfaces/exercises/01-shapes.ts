// Exercise 01: an interface as a contract, `implements`, and polymorphism.
//
// Replace every `throw new Error(...)` line, then run: bun test day-09

// The contract. It is complete: do not change it.
export interface Shape {
  readonly name: string;
  area(): number;
}

// Part 1: finish this class. `implements Shape` is already written, so
// `bun check` tells you when the class does not match the contract.
//
//   const rectangle = new Rectangle(3, 4);
//   rectangle.name    -> "長方形"
//   rectangle.area()  -> 12
export class Rectangle implements Shape {
  readonly name = "長方形";
  // TODO: declare two private fields for the width and the height

  constructor(width: number, height: number) {
    // TODO: store both values
    throw new Error("TODO：尚未完成 Rectangle 的建構子");
  }

  area(): number {
    // TODO: width times height
    throw new Error("TODO：尚未完成 Rectangle 的 area");
  }
}

// Part 2: write a class named Triangle yourself, starting from an empty
// line.
// - It implements Shape.
// - Its name is "三角形".
// - Its constructor takes (base: number, height: number).
// - Its area is base * height / 2.
// Then make makeTriangle return a new Triangle.
//
//   const triangle = makeTriangle(6, 4);
//   triangle.name    -> "三角形"
//   triangle.area()  -> 12

// TODO: write `class Triangle implements Shape { ... }` here

export function makeTriangle(base: number, height: number): Shape {
  // TODO: return a new Triangle
  throw new Error("TODO：尚未完成 makeTriangle");
}

// Part 3: two functions written against the interface. They must work for
// ANY Shape, including shapes that somebody else writes later.

// "<name>，面積 <area>"
// describeShape(new Rectangle(3, 4)) -> "長方形，面積 12"
export function describeShape(shape: Shape): string {
  // TODO: use only what the Shape contract offers
  throw new Error("TODO：尚未完成 describeShape");
}

// The areas of all the shapes added together. An empty array gives 0.
// totalArea([new Rectangle(3, 4), makeTriangle(6, 4)]) -> 24
export function totalArea(shapes: readonly Shape[]): number {
  // TODO: call area() on every shape
  throw new Error("TODO：尚未完成 totalArea");
}
