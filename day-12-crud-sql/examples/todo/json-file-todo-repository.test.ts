// Tests for what only the JSON file version can do: keep data on disk.

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { JsonFileTodoRepository } from "./json-file-todo-repository.ts";

const testFile = join(
  import.meta.dir,
  "..",
  "..",
  ".data",
  "json-file-todo-repository-test.json",
);

async function removeTestFile(): Promise<void> {
  const file = Bun.file(testFile);
  if (await file.exists()) {
    await file.delete();
  }
}

beforeEach(removeTestFile);
afterEach(removeTestFile);

describe("JsonFileTodoRepository 的檔案行為", () => {
  test("檔案還不存在時當作沒有資料", async () => {
    const repository = new JsonFileTodoRepository(testFile);
    expect(await repository.findAll()).toEqual([]);
  });

  test("檔案內容是 TodoData[] 的 JSON", async () => {
    const repository = new JsonFileTodoRepository(testFile);
    await repository.create({ title: "買牛奶", priority: "high" });

    const content: unknown = await Bun.file(testFile).json();
    expect(content).toEqual([
      { id: 1, title: "買牛奶", done: false, priority: "high" },
    ]);
  });

  test("換一個新的 repository 物件，資料還在", async () => {
    const first = new JsonFileTodoRepository(testFile);
    await first.create({ title: "買牛奶", priority: "high" });

    // A new object pointing at the same file: like restarting the program.
    const second = new JsonFileTodoRepository(testFile);
    const todos = await second.findAll();
    expect(todos.map((todo) => todo.title)).toEqual(["買牛奶"]);

    const next = await second.create({ title: "寫作業", priority: "low" });
    expect(next.id).toBe(2);
  });

  test("檔案內容不是陣列時丟出錯誤", async () => {
    await Bun.write(testFile, JSON.stringify({ title: "買牛奶" }));
    const repository = new JsonFileTodoRepository(testFile);

    await expect(repository.findAll()).rejects.toThrow(
      "JSON 檔案的內容必須是陣列",
    );
  });

  test("檔案裡有形狀不對的資料時丟出錯誤", async () => {
    const badItems = [{ id: 1, title: "買牛奶", done: "no", priority: "high" }];
    await Bun.write(testFile, JSON.stringify(badItems));
    const repository = new JsonFileTodoRepository(testFile);

    await expect(repository.findAll()).rejects.toThrow(
      "JSON 檔案裡有一筆資料不是待辦事項",
    );
  });
});
