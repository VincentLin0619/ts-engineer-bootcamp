// Reference solution for exercise 01.

export type Pet = {
  name: string;
  age: number;
  vaccinated: boolean;
};

export const myPet: Pet = {
  name: "麻糬",
  age: 3,
  vaccinated: true,
};

export const readingList: string[] = ["原子習慣", "小王子", "被討厭的勇氣"];

export type Book = {
  title: string;
  pages: number;
};

export function describeBook(book: Book): string {
  return `《${book.title}》共 ${book.pages} 頁`;
}

export function countTitles(titles: string[]): number {
  return titles.length;
}

export function lastTitle(titles: string[]): string | undefined {
  // Reading by index already gives `string | undefined`, which is exactly
  // the return type, so no check is needed here.
  return titles[titles.length - 1];
}
