// Run from the project root:
//   bun run day-02-type-system/examples/01-object-types.ts

// `type` gives a name to the shape of an object:
// which properties it has, and the type of each one.
type Book = {
  title: string;
  pages: number;
  finished: boolean;
};

// An object value must have every property listed in the type.
const favoriteBook: Book = {
  title: "原子習慣",
  pages: 320,
  finished: false,
};

// Read a property with a dot: object.property
console.log(favoriteBook.title);
console.log(favoriteBook.pages + 1);
console.log(`《${favoriteBook.title}》共 ${favoriteBook.pages} 頁`);

// console.log can print a whole object at once.
console.log(favoriteBook);

// A property can be given a new value, as long as the type still matches.
favoriteBook.finished = true;
console.log(favoriteBook.finished);

// `interface` can describe the same kind of shape.
// This course uses `type` for data. `interface` comes back on Day 09.
interface Author {
  name: string;
  country: string;
}

const author: Author = { name: "James Clear", country: "美國" };
console.log(`${author.name}（${author.country}）`);

// Try it: remove the `//` in front of ONE of the lines below, then run
//   bun check day-02-type-system/examples/01-object-types.ts
// Read the error, then put the `//` back before trying the next line.

// const missingProperty: Book = { title: "小王子", pages: 96 };
// const wrongType: Book = { title: "小王子", pages: "96", finished: true };
// console.log(favoriteBook.titel);
