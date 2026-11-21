// Exercise 02: loops and functions.
//
// Replace the `throw new Error(...)` line inside each function with your
// own code, then run: bun test day-03

// Use a `for` loop with a counter. Add up every whole number from 1 to
// `limit`.
// sumTo(4) -> 10   (1 + 2 + 3 + 4)
// sumTo(0) -> 0
export function sumTo(limit: number): number {
  // TODO: create a total before the loop, add to it inside, return it after
  throw new Error("TODO：尚未完成 sumTo");
}

// Use `for...of`, `if` and `push`. Collect the scores that are 60 or
// higher into a new array, in the same order.
// keepPassing([80, 45, 60]) -> [80, 60]
// keepPassing([10]) -> []
export function keepPassing(scores: number[]): number[] {
  // TODO: start with an empty `number[]`, push the passing scores, return it
  throw new Error("TODO：尚未完成 keepPassing");
}

// Use `while`. You save `perDay` every day. Return how many days it takes
// until the savings reach `target`.
// daysToSave(500, 150) -> 4   (150, 300, 450, 600)
// daysToSave(300, 100) -> 3
// daysToSave(0, 100) -> 0
export function daysToSave(target: number, perDay: number): number {
  // TODO: keep adding `perDay` while the savings are less than `target`
  throw new Error("TODO：尚未完成 daysToSave");
}

// An arrow function. Return true when the title has at least `minLength`
// characters.
// isLongTitle("買牛奶", 3) -> true
// isLongTitle("運動", 3) -> false
export const isLongTitle = (title: string, minLength: number): boolean => {
  // TODO: return the result of the comparison
  throw new Error("TODO：尚未完成 isLongTitle");
};

// Count the titles that have at least `minLength` characters.
// Call `isLongTitle` inside the loop instead of comparing again here.
//
// TODO: `minLength` is a default parameter. Change its default value
// from 0 to 4.
//
// countLongTitles(["買牛奶", "整理房間", "運動"], 3) -> 2
// countLongTitles(["買牛奶", "整理房間", "運動"]) -> 1   (uses the default, 4)
export function countLongTitles(
  titles: string[],
  minLength: number = 0,
): number {
  // TODO: loop over the titles and count the long ones
  throw new Error("TODO：尚未完成 countLongTitles");
}
