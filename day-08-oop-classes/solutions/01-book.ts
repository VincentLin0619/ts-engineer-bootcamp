// Reference solution for exercise 01.

export class Book {
  title: string;
  totalPages: number;
  currentPage: number;

  constructor(title: string, totalPages: number) {
    // `this` is the Book being created.
    this.title = title;
    this.totalPages = totalPages;
    this.currentPage = 0;
  }

  read(pages: number): void {
    this.currentPage = this.currentPage + pages;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  isFinished(): boolean {
    return this.currentPage === this.totalPages;
  }

  describe(): string {
    return `《${this.title}》${this.currentPage}/${this.totalPages} 頁`;
  }
}
