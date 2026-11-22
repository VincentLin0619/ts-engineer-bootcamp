// Reference solution for exercise 02.

export type Note = { id: number; text: string };

export function isNote(value: unknown): value is Note {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("id" in value) || !("text" in value)) {
    return false;
  }
  return typeof value.id === "number" && typeof value.text === "string";
}

export async function saveNotes(
  filePath: string,
  notes: Note[],
): Promise<void> {
  await Bun.write(filePath, JSON.stringify(notes, null, 2));
}

export async function loadNotes(filePath: string): Promise<Note[]> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return [];
  }

  // Whatever is in the file, it is `unknown` until it has been checked.
  const parsed: unknown = await file.json();
  if (!Array.isArray(parsed)) {
    throw new Error("筆記檔案格式錯誤");
  }

  const items: unknown[] = parsed;
  const notes: Note[] = [];
  for (const item of items) {
    if (!isNote(item)) {
      throw new Error("筆記檔案格式錯誤");
    }
    notes.push(item);
  }
  return notes;
}

export async function addNote(filePath: string, text: string): Promise<Note> {
  const notes = await loadNotes(filePath);

  let maxId = 0;
  for (const note of notes) {
    if (note.id > maxId) {
      maxId = note.id;
    }
  }

  const newNote: Note = { id: maxId + 1, text };
  await saveNotes(filePath, [...notes, newNote]);
  return newNote;
}
