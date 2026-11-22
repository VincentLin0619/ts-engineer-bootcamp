// Reference solution for exercise 03.

import type { TodoData } from "../examples/todo/todo.ts";
import { isTodoData } from "../examples/todo/todo.ts";
import type { TodoRepository } from "../examples/todo/todo-repository.ts";

export async function exportTodos(
  repository: TodoRepository,
  filePath: string,
): Promise<number> {
  const todos = await repository.findAll();
  const items: TodoData[] = todos.map((todo) => todo.toData());
  await Bun.write(filePath, JSON.stringify(items, null, 2));
  return items.length;
}

// unknown -> TodoData[]. Everything is checked before anything is created.
function parseBackup(value: unknown): TodoData[] {
  if (!Array.isArray(value)) {
    throw new Error("備份檔格式錯誤");
  }
  const candidates: unknown[] = value;
  const items: TodoData[] = [];
  for (const candidate of candidates) {
    if (!isTodoData(candidate)) {
      throw new Error("備份檔格式錯誤");
    }
    items.push(candidate);
  }
  return items;
}

export async function importTodos(
  filePath: string,
  repository: TodoRepository,
): Promise<number> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    throw new Error("找不到備份檔");
  }

  const parsed: unknown = await file.json();
  const items = parseBackup(parsed);

  // One at a time: each await finishes before the next write starts.
  for (const item of items) {
    const todo = await repository.create({
      title: item.title,
      priority: item.priority,
    });
    if (item.done) {
      todo.complete();
      await repository.save(todo);
    }
  }
  return items.length;
}
