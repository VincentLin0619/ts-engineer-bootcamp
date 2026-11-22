// Reference solution for exercise 01.

export type Book = {
  id: number;
  title: string;
  read: boolean;
};

export function nextBookId(books: readonly Book[]): number {
  let maxId = 0;
  for (const book of books) {
    if (book.id > maxId) {
      maxId = book.id;
    }
  }
  return maxId + 1;
}

export function addBook(books: readonly Book[], title: string): Book[] {
  const book: Book = { id: nextBookId(books), title: title, read: false };
  // Spread the old books into a new array instead of calling books.push().
  return [...books, book];
}

export function findBookById(
  books: readonly Book[],
  id: number,
): Book | undefined {
  return books.find((book) => book.id === id);
}

export function describeBook(books: readonly Book[], id: number): string {
  const book = findBookById(books, id);
  // Handle "not found" first. After this `if`, `book` is a Book.
  if (book === undefined) {
    return `找不到 id 為 ${id} 的書`;
  }
  return book.read ? `《${book.title}》已讀` : `《${book.title}》未讀`;
}
