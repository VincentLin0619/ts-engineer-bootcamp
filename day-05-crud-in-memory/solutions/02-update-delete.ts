// Reference solution for exercise 02.

export type Book = {
  id: number;
  title: string;
  read: boolean;
};

export type BookChanges = { title?: string; read?: boolean };

export function updateBook(
  books: readonly Book[],
  id: number,
  changes: BookChanges,
): Book[] {
  // map always builds a new array. The matching book is copied with the
  // changes on top; every other book goes into the new array untouched.
  return books.map((book) => (book.id === id ? { ...book, ...changes } : book));
}

export function markAsRead(books: readonly Book[], id: number): Book[] {
  return updateBook(books, id, { read: true });
}

export function removeBook(books: readonly Book[], id: number): Book[] {
  // Keep every book whose id is different.
  return books.filter((book) => book.id !== id);
}
