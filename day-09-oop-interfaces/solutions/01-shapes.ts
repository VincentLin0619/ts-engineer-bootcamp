// Reference solution for exercise 01.

export interface Shape {
  readonly name: string;
  area(): number;
}

export class Rectangle implements Shape {
  readonly name = "長方形";
  #width: number;
  #height: number;

  constructor(width: number, height: number) {
    this.#width = width;
    this.#height = height;
  }

  area(): number {
    return this.#width * this.#height;
  }
}

// Not exported: the outside world only ever sees it as a Shape.
class Triangle implements Shape {
  readonly name = "三角形";
  #base: number;
  #height: number;

  constructor(base: number, height: number) {
    this.#base = base;
    this.#height = height;
  }

  area(): number {
    return (this.#base * this.#height) / 2;
  }
}

export function makeTriangle(base: number, height: number): Shape {
  return new Triangle(base, height);
}

export function describeShape(shape: Shape): string {
  return `${shape.name}，面積 ${shape.area()}`;
}

export function totalArea(shapes: readonly Shape[]): number {
  // The same call, shape.area(), runs a different method for each class.
  return shapes.reduce((sum, shape) => sum + shape.area(), 0);
}
