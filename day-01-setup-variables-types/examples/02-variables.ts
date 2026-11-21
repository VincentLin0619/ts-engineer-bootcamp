// Run from the project root:
//   bun run day-01-setup-variables-types/examples/02-variables.ts

// const: this name always points to the same value.
const courseName = "TypeScript 入門";

// let: this name can be pointed at a new value later.
let completedDays = 0;
console.log(courseName, completedDays);

// Reassignment: no `let` here, the variable already exists.
completedDays = 1;
console.log(completedDays);

// The right side is calculated first (1 + 1), then stored back into the name.
completedDays = completedDays + 1;
console.log(`已完成 ${completedDays} 天`);

// Try it: remove the `//` on the next line, then run `bun check`.
// You will see error TS2588 because a const cannot be reassigned.
// courseName = "另一門課";
