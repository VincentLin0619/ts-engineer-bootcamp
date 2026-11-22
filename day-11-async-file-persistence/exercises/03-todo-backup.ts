// Exercise 03 (optional): back up and restore the Todo app.
//
// Both functions receive a TodoRepository. They must work with every
// implementation (in memory, JSON file, and tomorrow's SQLite version),
// so use only the methods of the interface.
//
// The backup file contains a TodoData[] array as JSON, for example:
//   [{ "id": 1, "title": "買牛奶", "done": true, "priority": "high" }]

import type { TodoData } from "../examples/todo/todo.ts";
import { isTodoData } from "../examples/todo/todo.ts";
import type { TodoRepository } from "../examples/todo/todo-repository.ts";

// Write every todo of the repository to the backup file.
// Resolves to the number of todos written.
// A repository with 2 todos -> the file holds 2 items, resolves to 2
// An empty repository       -> the file holds [], resolves to 0
export async function exportTodos(
  repository: TodoRepository,
  filePath: string,
): Promise<number> {
  // TODO: findAll, turn each Todo into TodoData with toData(), write JSON
  throw new Error("TODO：尚未完成 exportTodos");
}

// Read the backup file and create every todo in the repository.
// Resolves to the number of todos created.
//
// - Create the todos one by one, in the order of the file. Do not use
//   Promise.all here: two writes to the same file at the same time can
//   overwrite each other.
// - The repository hands out new ids. The ids in the file are ignored.
// - A todo that is `done` in the file must be done in the repository too:
//   create it, call complete(), then save it.
// - The file does not exist  -> rejects with Error("找不到備份檔")
// - The content is not an array of TodoData
//                            -> rejects with Error("備份檔格式錯誤")
//   In that case nothing may be created: check everything first.
export async function importTodos(
  filePath: string,
  repository: TodoRepository,
): Promise<number> {
  // TODO: read, check with isTodoData, then create / complete / save
  throw new Error("TODO：尚未完成 importTodos");
}
