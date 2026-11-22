// Exercise 01: a first class with properties, a constructor, methods and
// `this`.
//
// Replace every `throw new Error(...)` line, then run: bun test day-08
//
// A Book remembers how far you have read:
//
//   const book = new Book("原子習慣", 320);
//   book.currentPage    -> 0
//   book.read(120);
//   book.currentPage    -> 120
//   book.describe()     -> "《原子習慣》120/320 頁"
//   book.isFinished()   -> false
//   book.read(500);     // reading never goes past the last page
//   book.currentPage    -> 320
//   book.isFinished()   -> true

export class Book {
  title: string;
  totalPages: number;
  currentPage: number;

  constructor(title: string, totalPages: number) {
    // TODO: store title and totalPages on `this`, and start currentPage at 0
    throw new Error("TODO：尚未完成 Book 的建構子");
  }

  // Move forward by `pages` pages. If that would go past totalPages,
  // stop at totalPages.
  read(pages: number): void {
    // TODO: update this.currentPage
    throw new Error("TODO：尚未完成 read");
  }

  // True once currentPage has reached totalPages.
  isFinished(): boolean {
    // TODO: return true or false
    throw new Error("TODO：尚未完成 isFinished");
  }

  // "《<title>》<currentPage>/<totalPages> 頁"
  describe(): string {
    // TODO: return the line with a template literal
    throw new Error("TODO：尚未完成 describe");
  }
}
