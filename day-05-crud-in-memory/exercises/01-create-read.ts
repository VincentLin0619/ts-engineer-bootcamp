// Exercise 01: Create and Read on a reading list kept in memory.
//
// The pattern is the same as the Todo functions in examples/01-create-read.ts,
// but the data is a list of books. Replace each `throw new Error(...)` line,
// then run: bun test day-05
//
// Keep the `export` keyword: it lets the test file use your code.
// (`export` is explained on Day 06.)
//
// Rule for the whole file: never change the array you receive.

export type Book = {
  id: number;
  title: string;
  read: boolean;
};

// Work out the id for the next book: the largest id so far, plus 1.
// nextBookId([]) -> 1
// nextBookId([{ id: 2, ... }, { id: 5, ... }]) -> 6
export function nextBookId(books: readonly Book[]): number {
  // TODO: find the largest id with a loop, then return it plus 1
  throw new Error("TODO：尚未完成 nextBookId");
}

// C = Create. Return a NEW array with one more book at the end.
// The new book gets its id from nextBookId, and `read` starts as false.
// addBook([], "原子習慣") -> [{ id: 1, title: "原子習慣", read: false }]
export function addBook(books: readonly Book[], title: string): Book[] {
  // TODO: build the new book, then return a new array that ends with it
  throw new Error("TODO：尚未完成 addBook");
}

// R = Read. Return the book with this id, or undefined when there is none.
// findBookById(books, 1) -> { id: 1, title: "原子習慣", read: false }
// findBookById(books, 99) -> undefined
export function findBookById(
  books: readonly Book[],
  id: number,
): Book | undefined {
  // TODO: return the matching book
  throw new Error("TODO：尚未完成 findBookById");
}

// Describe one book as a sentence. Use findBookById, and check for undefined
// before using the result.
// describeBook(books, 1) -> "《原子習慣》未讀"   (read is false)
// describeBook(books, 2) -> "《被討厭的勇氣》已讀" (read is true)
// describeBook(books, 99) -> "找不到 id 為 99 的書"
export function describeBook(books: readonly Book[], id: number): string {
  // TODO: return one of the three sentences above
  throw new Error("TODO：尚未完成 describeBook");
}
