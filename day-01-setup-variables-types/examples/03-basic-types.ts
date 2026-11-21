// Run from the project root:
//   bun run day-01-setup-variables-types/examples/03-basic-types.ts

// Type annotation: `name: type = value`
const title: string = "買牛奶";
const estimatedMinutes: number = 15;
const done: boolean = false;
console.log(title, estimatedMinutes, done);

// Type inference: no annotation, TypeScript works out the type from the value.
let attempts = 0; // inferred as number
attempts = attempts + 1;
console.log(attempts);

// typeof reports the type of a value while the program runs.
console.log(typeof title); // "string"
console.log(typeof estimatedMinutes); // "number"
console.log(typeof done); // "boolean"

// Template literal: backticks, with ${...} replaced by the value inside.
const summary = `${title}（預估 ${estimatedMinutes} 分鐘，完成：${done}）`;
console.log(summary);

// Number arithmetic
const totalMinutes = estimatedMinutes * 2 + 5;
console.log(totalMinutes); // 35

// Converting between types
const textFromUser = "42";
const parsedNumber = Number(textFromUser); // string -> number
console.log(parsedNumber + 1); // 43

const textAgain = String(parsedNumber); // number -> string
console.log(typeof textAgain); // "string"
