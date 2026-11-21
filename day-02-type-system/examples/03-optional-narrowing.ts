// Run from the project root:
//   bun run day-02-type-system/examples/03-optional-narrowing.ts

// Optional property: the `?` means this property may be left out.
type Movie = {
  title: string;
  minutes: number;
  note?: string;
};

const withNote: Movie = { title: "神隱少女", minutes: 125, note: "想再看一次" };
const withoutNote: Movie = { title: "你的名字", minutes: 106 };

// Reading an optional property gives its value, or undefined when left out.
console.log(withNote.note);
console.log(withoutNote.note);

// The type of `note` is `string | undefined`.
// `.length` (the number of characters) only exists on a string, so
// TypeScript wants a check first.
// Try it: remove the `//` on the next line, then run `bun check` on this file.
// console.log(withNote.note.length);

// Narrowing: check with `if`, then use the value inside the braces.
if (withNote.note !== undefined) {
  // Here the type of `withNote.note` is string.
  console.log(`備註有 ${withNote.note.length} 個字`);
}

// `===` asks "are these two the same?".
if (withoutNote.note === undefined) {
  console.log(`《${withoutNote.title}》沒有備註`);
}

// typeof narrowing: find out which member of a union you are holding.
type Product = {
  name: string;
  code: string | number;
};

const pencil: Product = { name: "鉛筆", code: "AB-12" };
const eraser: Product = { name: "橡皮擦", code: 7 };

if (typeof pencil.code === "string") {
  // Here the type of `pencil.code` is string.
  console.log(`${pencil.name}的代碼有 ${pencil.code.length} 個字`);
}

if (typeof eraser.code === "number") {
  // Here the type of `eraser.code` is number.
  console.log(`${eraser.name}的下一個編號是 ${eraser.code + 1}`);
}

// null: an "empty" value that somebody put there on purpose.
type Member = {
  name: string;
  nickname: string | null;
};

const member: Member = { name: "小明", nickname: null };

if (member.nickname === null) {
  console.log(`${member.name}沒有暱稱`);
}
