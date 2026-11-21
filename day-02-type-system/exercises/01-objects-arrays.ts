// Exercise 01: object types and arrays.
//
// Change the lines marked TODO, then run: bun test day-02
// Keep the `export` keyword: it lets the test file read your work.
// (`export` is explained on Day 06.)

// --- Part 1: an object type and an object value ---------------------------

// TODO: add a third property to this type: `vaccinated`, a boolean.
export type Pet = {
  name: string;
  age: number;
};

// TODO: describe a pet named "麻糬" that is 3 years old and vaccinated.
// Fill in `name` and `age`, then add the `vaccinated` property.
export const myPet: Pet = {
  name: "",
  age: 0,
};

// --- Part 2: an array ------------------------------------------------------

// TODO: put these three titles into the array, in this order:
// "原子習慣", "小王子", "被討厭的勇氣"
export const readingList: string[] = [];

// --- Part 3: read properties and items -------------------------------------
//
// The function "shells" are already written for you. Functions are covered
// on Day 03. For now, only replace the `throw new Error(...)` line inside
// each one with a line that starts with `return`.
//
// Example of a finished function:
//
//   export function bookTitle(book: Book): string {
//     return book.title;
//   }

export type Book = {
  title: string;
  pages: number;
};

// Build the text "《<title>》共 <pages> 頁" from the properties of the book.
// describeBook({ title: "小王子", pages: 96 }) -> "《小王子》共 96 頁"
export function describeBook(book: Book): string {
  // TODO: return the text with a template literal
  throw new Error("TODO：尚未完成 describeBook");
}

// Return how many titles are in the list.
// countTitles(["原子習慣", "小王子"]) -> 2
export function countTitles(titles: string[]): number {
  // TODO: return the number of items
  throw new Error("TODO：尚未完成 countTitles");
}

// Return the last title in the list. An empty list has no last title,
// which is why the return type includes `undefined`.
// lastTitle(["原子習慣", "小王子"]) -> "小王子"
// lastTitle([]) -> undefined
export function lastTitle(titles: string[]): string | undefined {
  // TODO: return the item at the last index
  throw new Error("TODO：尚未完成 lastTitle");
}
