// Run from the project root:
//   bun run day-03-control-flow-functions/examples/03-loops.ts

const titles: string[] = ["買牛奶", "寫作業", "運動"];

// for...of: visit every item of an array, one at a time.
for (const title of titles) {
  console.log(`待辦：${title}`);
}

// for: repeat a fixed number of times, with a counter.
// `i++` means "add 1 to i".
for (let i = 1; i <= 3; i++) {
  console.log(`第 ${i} 圈`);
}

// The counter can be used as an index. Reading by index gives
// `string | undefined` (Day 02), so narrow before using the value.
for (let i = 0; i < titles.length; i++) {
  const title = titles[i];
  if (title !== undefined) {
    console.log(`${i + 1}. ${title}`);
  }
}

// Accumulate: create a variable before the loop, update it inside.
// `total += value` means "total = total + value".
const minutes: number[] = [15, 60, 30];
let total = 0;

for (const value of minutes) {
  total += value;
}

console.log(`總共 ${total} 分鐘`);

// Collect: start with an empty array, `push` adds a value to its end.
const longTasks: number[] = [];

for (const value of minutes) {
  if (value >= 30) {
    longTasks.push(value);
  }
}

console.log(longTasks);

// while: keep going as long as the condition is true.
// Use it when you cannot tell in advance how many rounds are needed.
let saved = 0;
let days = 0;

while (saved < 500) {
  saved += 150;
  days++;
}

console.log(`第 ${days} 天存到 ${saved} 元`);
