// Run from the project root:
//   bun run day-02-type-system/examples/02-union-literal.ts

// Union type: the value may be a string OR a number.
type ProductCode = string | number;

let code: ProductCode = "A-100";
console.log(code, typeof code);

code = 2024;
console.log(code, typeof code);

// Literal type: a type that allows exactly one value, such as "S".
// A union of literal types is a list of the values that are allowed.
type Size = "S" | "M" | "L";

let cupSize: Size = "M";
console.log(cupSize);

cupSize = "L";
console.log(cupSize);

// A union can be the type of a property.
type Drink = {
  name: string;
  size: Size;
};

const tea: Drink = { name: "紅茶", size: "L" };
console.log(`${tea.name}（${tea.size}）`);

// Inference: `const` keeps the exact value as the type, `let` widens it.
const fixedSize = "S"; // inferred as the literal type "S"
let anyText = "S"; // inferred as string, because it may change later
anyText = "任何文字都可以";
console.log(fixedSize, anyText);

// Try it: delete the `@ts-expect-error` line below, then run
//   bun check day-02-type-system/examples/02-union-literal.ts
// to read the real error message. Put the line back when you are done.

// @ts-expect-error -- TS2322: Type '"XL"' is not assignable to type 'Size'.
cupSize = "XL";

// `bun run` does not check types, so the wrong value gets through.
console.log(cupSize);
