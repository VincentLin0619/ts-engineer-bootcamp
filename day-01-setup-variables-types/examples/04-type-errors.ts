// Run from the project root:
//   bun run day-01-setup-variables-types/examples/04-type-errors.ts
//
// This file contains a deliberate type error. `bun run` still executes it,
// because running a program does not check its types.

let completedDays = 0; // inferred as number

// Try it: delete the `@ts-expect-error` line below, then run
//   bun check day-01-setup-variables-types/examples/04-type-errors.ts
// to read the real error message. Put the line back when you are done.

// @ts-expect-error -- TS2322: Type 'string' is not assignable to type 'number'.
completedDays = "three";

// The program keeps going with a value of the wrong type.
// "three" + 1 joins text instead of adding numbers.
console.log(completedDays + 1); // prints "three1", not a number
