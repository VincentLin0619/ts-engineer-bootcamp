// Exercise 02: template literals and number arithmetic.
//
// The function "shells" are already written for you. Functions are covered
// on Day 03. For now, only replace the `throw new Error(...)` line inside
// each one with a line that starts with `return`.
//
// Example of a finished function:
//
//   export function double(value: number): number {
//     return value * 2;
//   }

// Build the sentence "<courseName> 共 <days> 天" with a template literal.
// describeCourse("TypeScript 入門", 14) -> "TypeScript 入門 共 14 天"
export function describeCourse(courseName: string, days: number): string {
  // TODO: return the sentence
  throw new Error("TODO：尚未完成 describeCourse");
}

// Convert hours and minutes into a total number of minutes.
// toTotalMinutes(1, 30) -> 90
export function toTotalMinutes(hours: number, minutes: number): number {
  // TODO: return the total number of minutes
  throw new Error("TODO：尚未完成 toTotalMinutes");
}

// The text "2" and the text "3" should be added as numbers, not joined.
// addAsNumbers("2", "3") -> 5
export function addAsNumbers(first: string, second: string): number {
  // TODO: convert both values with Number(...), then add them
  throw new Error("TODO：尚未完成 addAsNumbers");
}
