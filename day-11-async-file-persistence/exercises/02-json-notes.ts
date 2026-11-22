// Exercise 02: read and write a JSON file, and check `unknown` data.
//
// Notes are stored in one file as a JSON array, for example:
//   [{ "id": 1, "text": "買牛奶" }, { "id": 2, "text": "寫作業" }]
//
// Use Bun.file(...) and Bun.write(...). The tests pass in a path inside this
// lesson's .data/ folder.

export type Note = { id: number; text: string };

// Type guard: true only for an object whose `id` is a number and whose
// `text` is a string.
// isNote({ id: 1, text: "買牛奶" }) -> true
// isNote({ id: "1", text: "買牛奶" }) -> false
// isNote({ id: 1 })                 -> false
// isNote(null)                      -> false
export function isNote(value: unknown): value is Note {
  // TODO: check the value step by step, as in examples/05-file-json.ts
  throw new Error("TODO：尚未完成 isNote");
}

// Write the notes to the file as JSON text.
// After saveNotes(path, [{ id: 1, text: "買牛奶" }]) the file contains
// a JSON array with that one note.
export async function saveNotes(
  filePath: string,
  notes: Note[],
): Promise<void> {
  // TODO: turn `notes` into JSON text and write it with Bun.write
  throw new Error("TODO：尚未完成 saveNotes");
}

// Read the notes back from the file.
// - The file does not exist           -> resolves to []
// - The content is a Note array       -> resolves to that array
// - The content is anything else      -> rejects with Error("筆記檔案格式錯誤")
//   (not an array, or one of the items is not a Note)
export async function loadNotes(filePath: string): Promise<Note[]> {
  // TODO: treat the parsed JSON as `unknown` and check it with isNote
  throw new Error("TODO：尚未完成 loadNotes");
}

// Add one note to the file and resolve to the new note.
// The id is 1 for the first note, otherwise the biggest id in the file + 1.
// addNote(path, "買牛奶") on a missing file -> resolves to { id: 1, text: "買牛奶" }
// addNote(path, "寫作業") right after       -> resolves to { id: 2, text: "寫作業" }
export async function addNote(filePath: string, text: string): Promise<Note> {
  // TODO: load the notes, add the new one, save them all, return the new note
  throw new Error("TODO：尚未完成 addNote");
}
