// Run from the project root:
//   bun run day-02-type-system/examples/04-arrays.ts

// Array type: `string[]` means "a list where every item is a string".
const titles: string[] = ["買牛奶", "寫作業", "運動"];
console.log(titles);

// `.length` is the number of items.
console.log(titles.length);

// Index: the position of an item. The first position is 0, not 1.
const first = titles[0];
console.log(first);

// Position 3 is empty, because the last index is 2.
const outOfRange = titles[3];
console.log(outOfRange);

// The type of `first` is `string | undefined`: TypeScript reminds you that
// the position might be empty. Narrow with `if` before using it as a string.
if (first !== undefined) {
  console.log(`第一件事有 ${first.length} 個字`);
}

// The last item sits at index `length - 1`.
const last = titles[titles.length - 1];
if (last !== undefined) {
  console.log(`最後一件事：${last}`);
}

// Arrays of other types work the same way.
const minutes: number[] = [15, 60, 30];
const firstMinutes = minutes[0];
if (firstMinutes !== undefined) {
  console.log(firstMinutes * 2);
}

// An array of objects: `Book[]`.
type Book = {
  title: string;
  pages: number;
};

const books: Book[] = [
  { title: "原子習慣", pages: 320 },
  { title: "小王子", pages: 96 },
];

const secondBook = books[1];
if (secondBook !== undefined) {
  console.log(`《${secondBook.title}》共 ${secondBook.pages} 頁`);
}

// Try it: remove the `//` on the next line, then run
//   bun check day-02-type-system/examples/04-arrays.ts
// console.log(first.length);
