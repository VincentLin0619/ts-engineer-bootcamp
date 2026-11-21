// Run from the project root:
//   bun run day-03-control-flow-functions/examples/01-conditions.ts

// if / else: two paths, and exactly one of them runs.
const score: number = 72;

if (score >= 60) {
  console.log("及格");
} else {
  console.log("不及格");
}

// else if: conditions are checked from top to bottom, the first match wins.
const temperature: number = 31;

if (temperature >= 30) {
  console.log("很熱");
} else if (temperature >= 20) {
  console.log("舒適");
} else {
  console.log("有點冷");
}

// Comparison operators: the result is always a boolean.
console.log(score === 72); // equal
console.log(score !== 72); // not equal
console.log(score > 72); // greater than
console.log(score >= 72); // greater than or equal
console.log(score < 100); // less than
console.log(score <= 60); // less than or equal

// Logical operators combine booleans.
const age: number = 20;
const hasTicket: boolean = true;

console.log(age >= 18 && hasTicket); // AND: both sides must be true
console.log(age < 12 || age >= 65); // OR: at least one side must be true
console.log(!hasTicket); // NOT: flips true and false

if (age >= 18 && hasTicket) {
  console.log("可以入場");
}

// A boolean is already a condition: no need to compare it with true.
const done: boolean = false;

if (!done) {
  console.log("還沒完成");
}

// Ternary operator: pick one of two values in a single expression.
const mark = done ? "x" : " ";
console.log(`[${mark}] 買牛奶`);

const result = score >= 60 ? "及格" : "不及格";
console.log(`${score} 分：${result}`);
