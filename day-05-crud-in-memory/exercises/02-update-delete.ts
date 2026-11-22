// Exercise 02: Update and Delete on a reading list kept in memory.
//
// Replace each `throw new Error(...)` line, then run: bun test day-05
//
// Rule for the whole file: never change the array or the objects you
// receive. Always return a new array.

export type Book = {
  id: number;
  title: string;
  read: boolean;
};

// Every property is optional: the caller passes only what should change.
export type BookChanges = { title?: string; read?: boolean };

// U = Update. Return a NEW array in which the book with this id is replaced
// by a copy that has the changes applied. Other books stay as they are.
// When no book has this id, return an array with the same contents.
//
// updateBook(books, 1, { title: "原子習慣（新版）" })
//   -> same list, but book 1 has the new title
export function updateBook(
  books: readonly Book[],
  id: number,
  changes: BookChanges,
): Book[] {
  // TODO: use map, and spread both the book and the changes
  throw new Error("TODO：尚未完成 updateBook");
}

// Mark one book as read. Reuse updateBook instead of writing map again.
// markAsRead(books, 1) -> same list, but book 1 has read: true
export function markAsRead(books: readonly Book[], id: number): Book[] {
  // TODO: call updateBook
  throw new Error("TODO：尚未完成 markAsRead");
}

// D = Delete. Return a NEW array without the book that has this id.
// When no book has this id, return an array with the same contents.
// removeBook(books, 1) -> the list without book 1
export function removeBook(books: readonly Book[], id: number): Book[] {
  // TODO: use filter
  throw new Error("TODO：尚未完成 removeBook");
}
