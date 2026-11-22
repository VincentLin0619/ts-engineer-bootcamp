// Run from the project root:
//   bun run day-11-async-file-persistence/examples/05-file-json.ts

import { join } from "node:path";

type Note = { id: number; text: string };

// Type guard: when it returns true, TypeScript treats `value` as a Note.
function isNote(value: unknown): value is Note {
  // It must be an object (typeof null is also "object", so rule that out).
  if (typeof value !== "object" || value === null) {
    return false;
  }
  // `"id" in value` asks: does this object have a property named id?
  if (!("id" in value) || !("text" in value)) {
    return false;
  }
  return typeof value.id === "number" && typeof value.text === "string";
}

// import.meta.dir is the folder that contains this file.
// join() glues path pieces together: <lesson folder>/.data/...
const dataFolder = join(import.meta.dir, "..", ".data");
const textPath = join(dataFolder, "hello.txt");
const notesPath = join(dataFolder, "notes.json");

// 1. Write text to a file, then read it back. Both return a Promise.
await Bun.write(textPath, "第一行\n第二行\n");
const text = await Bun.file(textPath).text();
console.log(text);

// 2. Bun.file() does not read anything yet. exists() checks the disk.
console.log(await Bun.file(textPath).exists()); // true
console.log(await Bun.file(join(dataFolder, "nothing.txt")).exists()); // false

// 3. A file stores text, so objects are turned into JSON text first.
const notes: Note[] = [
  { id: 1, text: "買牛奶" },
  { id: 2, text: "寫作業" },
];
await Bun.write(notesPath, JSON.stringify(notes, null, 2));
console.log(await Bun.file(notesPath).text());

// 4. Reading JSON back: the program cannot know what is inside the file,
// so the result is `unknown` until it has been checked.
const parsed: unknown = await Bun.file(notesPath).json();
if (Array.isArray(parsed)) {
  const items: unknown[] = parsed;
  for (const item of items) {
    if (isNote(item)) {
      // Inside this block `item` is a Note, so .id and .text are allowed.
      console.log(`#${item.id} ${item.text}`);
    }
  }
}

// 5. The guard rejects data with the wrong shape.
const wrongTypes: unknown = JSON.parse('{ "id": "1", "text": 42 }');
const missingText: unknown = JSON.parse('{ "id": 3 }');
console.log(isNote(wrongTypes)); // false
console.log(isNote(missingText)); // false

// 6. Clean up, so the example leaves nothing behind.
await Bun.file(textPath).delete();
await Bun.file(notesPath).delete();
console.log("檔案已刪除");
