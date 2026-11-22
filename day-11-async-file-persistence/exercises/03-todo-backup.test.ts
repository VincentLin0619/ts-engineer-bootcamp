import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { loadExercise } from "../../support/load-exercise.ts";
import { InMemoryTodoRepository } from "../examples/todo/in-memory-todo-repository.ts";
import { JsonFileTodoRepository } from "../examples/todo/json-file-todo-repository.ts";

const { exportTodos, importTodos } = await loadExercise<
  typeof import("./03-todo-backup.ts")
>(import.meta.dir, "03-todo-backup");

const dataFolder = join(import.meta.dir, "..", ".data");
const backupFile = join(dataFolder, "exercise-03-backup.json");
const storeFile = join(dataFolder, "exercise-03-store.json");

async function removeTestFiles(): Promise<void> {
  for (const path of [backupFile, storeFile]) {
    const file = Bun.file(path);
    if (await file.exists()) {
      await file.delete();
    }
  }
}

beforeEach(removeTestFiles);
afterEach(removeTestFiles);

// A repository with one finished todo and one open todo.
async function createSampleRepository(): Promise<InMemoryTodoRepository> {
  const repository = new InMemoryTodoRepository();
  const milk = await repository.create({ title: "買牛奶", priority: "high" });
  milk.complete();
  await repository.save(milk);
  await repository.create({ title: "寫作業", priority: "low" });
  return repository;
}

describe("練習 03（加練）：備份與還原待辦事項", () => {
  test("exportTodos 把所有待辦事項寫成 TodoData[] 的 JSON", async () => {
    const repository = await createSampleRepository();

    expect(await exportTodos(repository, backupFile)).toBe(2);

    const content: unknown = await Bun.file(backupFile).json();
    expect(content).toEqual([
      { id: 1, title: "買牛奶", done: true, priority: "high" },
      { id: 2, title: "寫作業", done: false, priority: "low" },
    ]);
  });

  test("exportTodos 遇到空的 repository 時寫出空陣列", async () => {
    expect(await exportTodos(new InMemoryTodoRepository(), backupFile)).toBe(0);

    const content: unknown = await Bun.file(backupFile).json();
    expect(content).toEqual([]);
  });

  test("importTodos 把備份還原到另一個記憶體 repository", async () => {
    await exportTodos(await createSampleRepository(), backupFile);
    const target = new InMemoryTodoRepository();

    expect(await importTodos(backupFile, target)).toBe(2);

    const todos = await target.findAll();
    expect(todos.map((todo) => todo.toData())).toEqual([
      { id: 1, title: "買牛奶", done: true, priority: "high" },
      { id: 2, title: "寫作業", done: false, priority: "low" },
    ]);
  });

  test("importTodos 也能還原到 JSON 檔案 repository", async () => {
    await exportTodos(await createSampleRepository(), backupFile);
    const target = new JsonFileTodoRepository(storeFile);

    expect(await importTodos(backupFile, target)).toBe(2);

    const todos = await target.findAll();
    expect(todos.map((todo) => todo.title)).toEqual(["買牛奶", "寫作業"]);
    expect(todos.map((todo) => todo.done)).toEqual([true, false]);
  });

  test("importTodos 由 repository 重新編 id，不沿用檔案裡的 id", async () => {
    await Bun.write(
      backupFile,
      JSON.stringify([
        { id: 40, title: "倒垃圾", done: false, priority: "medium" },
        { id: 70, title: "洗碗", done: true, priority: "low" },
      ]),
    );
    const target = new InMemoryTodoRepository();
    await target.create({ title: "原本就有的", priority: "medium" });

    expect(await importTodos(backupFile, target)).toBe(2);

    const todos = await target.findAll();
    expect(todos.map((todo) => todo.id)).toEqual([1, 2, 3]);
    expect(todos.map((todo) => todo.title)).toEqual([
      "原本就有的",
      "倒垃圾",
      "洗碗",
    ]);
  });

  test("importTodos 找不到備份檔時失敗", async () => {
    await expect(
      importTodos(backupFile, new InMemoryTodoRepository()),
    ).rejects.toThrow("找不到備份檔");
  });

  test("importTodos 遇到格式錯誤的備份檔時失敗，而且什麼都不建立", async () => {
    await Bun.write(
      backupFile,
      JSON.stringify([
        { id: 1, title: "買牛奶", done: false, priority: "high" },
        { id: 2, title: "寫作業", done: false, priority: "urgent" },
      ]),
    );
    const target = new InMemoryTodoRepository();

    await expect(importTodos(backupFile, target)).rejects.toThrow(
      "備份檔格式錯誤",
    );
    expect(await target.findAll()).toEqual([]);

    await Bun.write(backupFile, JSON.stringify({ title: "買牛奶" }));
    await expect(importTodos(backupFile, target)).rejects.toThrow(
      "備份檔格式錯誤",
    );
  });
});
