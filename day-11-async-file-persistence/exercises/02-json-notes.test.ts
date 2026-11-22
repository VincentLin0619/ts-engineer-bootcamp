import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { loadExercise } from "../../support/load-exercise.ts";

const { addNote, isNote, loadNotes, saveNotes } = await loadExercise<
  typeof import("./02-json-notes.ts")
>(import.meta.dir, "02-json-notes");

const notesFile = join(
  import.meta.dir,
  "..",
  ".data",
  "exercise-02-notes.json",
);

async function removeNotesFile(): Promise<void> {
  const file = Bun.file(notesFile);
  if (await file.exists()) {
    await file.delete();
  }
}

// Every test starts without the file and leaves nothing behind.
beforeEach(removeNotesFile);
afterEach(removeNotesFile);

describe("練習 02：JSON 檔案與型別守衛", () => {
  test("isNote 接受形狀正確的資料", () => {
    expect(isNote({ id: 1, text: "買牛奶" })).toBe(true);
  });

  test("isNote 拒絕形狀不對的資料", () => {
    expect(isNote({ id: "1", text: "買牛奶" })).toBe(false);
    expect(isNote({ id: 1, text: 42 })).toBe(false);
    expect(isNote({ id: 1 })).toBe(false);
    expect(isNote({ text: "買牛奶" })).toBe(false);
    expect(isNote(null)).toBe(false);
    expect(isNote("買牛奶")).toBe(false);
    expect(isNote(undefined)).toBe(false);
  });

  test("saveNotes 把筆記寫成 JSON 陣列", async () => {
    await saveNotes(notesFile, [
      { id: 1, text: "買牛奶" },
      { id: 2, text: "寫作業" },
    ]);

    const content: unknown = JSON.parse(await Bun.file(notesFile).text());
    expect(content).toEqual([
      { id: 1, text: "買牛奶" },
      { id: 2, text: "寫作業" },
    ]);
  });

  test("loadNotes 在檔案不存在時回傳空陣列", async () => {
    expect(await loadNotes(notesFile)).toEqual([]);
  });

  test("loadNotes 讀回 saveNotes 寫入的內容", async () => {
    await saveNotes(notesFile, [{ id: 7, text: "倒垃圾" }]);
    expect(await loadNotes(notesFile)).toEqual([{ id: 7, text: "倒垃圾" }]);
  });

  test("loadNotes 在內容不是陣列時失敗", async () => {
    await Bun.write(notesFile, JSON.stringify({ id: 1, text: "買牛奶" }));
    await expect(loadNotes(notesFile)).rejects.toThrow("筆記檔案格式錯誤");
  });

  test("loadNotes 在陣列裡有不是筆記的資料時失敗", async () => {
    await Bun.write(
      notesFile,
      JSON.stringify([{ id: 1, text: "買牛奶" }, { id: "2" }]),
    );
    await expect(loadNotes(notesFile)).rejects.toThrow("筆記檔案格式錯誤");
  });

  test("addNote 從 id 1 開始，之後是最大的 id 加 1", async () => {
    expect(await addNote(notesFile, "買牛奶")).toEqual({
      id: 1,
      text: "買牛奶",
    });
    expect(await addNote(notesFile, "寫作業")).toEqual({
      id: 2,
      text: "寫作業",
    });

    await saveNotes(notesFile, [
      { id: 9, text: "倒垃圾" },
      { id: 4, text: "洗碗" },
    ]);
    expect(await addNote(notesFile, "澆花")).toEqual({ id: 10, text: "澆花" });
    expect(await loadNotes(notesFile)).toEqual([
      { id: 9, text: "倒垃圾" },
      { id: 4, text: "洗碗" },
      { id: 10, text: "澆花" },
    ]);
  });
});
