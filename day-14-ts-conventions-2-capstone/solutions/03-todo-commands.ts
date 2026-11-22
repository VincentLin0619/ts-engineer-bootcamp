// Reference solution for exercise 03.
import type { Priority } from "../examples/todo/todo.ts";
import type { TodoFilter, TodoService } from "../examples/todo/todo-service.ts";

// Labels for the one-line format used since Day 03.
const PRIORITY_LABELS: Readonly<Record<Priority, string>> = {
  low: "低",
  medium: "中",
  high: "高",
};

export type Result<TValue, TError> =
  { ok: true; value: TValue } | { ok: false; error: TError };

export type Command =
  | { kind: "add"; title: string }
  | { kind: "list"; filter: TodoFilter }
  | { kind: "done"; id: number }
  | { kind: "rename"; id: number; title: string }
  | { kind: "remove"; id: number };

export function assertNever(value: never): never {
  throw new Error(`沒有處理到的情況：${JSON.stringify(value)}`);
}

// Splits "rename 2 買豆漿" into the first word "rename" and the rest
// "2 買豆漿". Both parts come back trimmed.
function splitFirstWord(text: string): { first: string; rest: string } {
  const trimmed = text.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { first: trimmed, rest: "" };
  }
  return {
    first: trimmed.slice(0, spaceIndex),
    rest: trimmed.slice(spaceIndex + 1).trim(),
  };
}

// A small Result of its own: the id, or the reason it is not one.
function parseId(text: string): Result<number, string> {
  const id = Number(text);
  if (!Number.isInteger(id) || id < 1) {
    return { ok: false, error: "id 必須是正整數" };
  }
  return { ok: true, value: id };
}

export function parseCommand(line: string): Result<Command, string> {
  const { first: word, rest } = splitFirstWord(line);

  if (word === "add") {
    if (rest === "") {
      return { ok: false, error: "add 需要標題" };
    }
    return { ok: true, value: { kind: "add", title: rest } };
  }

  if (word === "list") {
    if (rest === "") {
      return { ok: true, value: { kind: "list", filter: "all" } };
    }
    if (rest === "all" || rest === "open" || rest === "done") {
      return { ok: true, value: { kind: "list", filter: rest } };
    }
    return { ok: false, error: `看不懂的篩選條件：${rest}` };
  }

  if (word === "done" || word === "rm") {
    const id = parseId(rest);
    if (!id.ok) {
      // A failure carries no value, so it fits Result<Command, string> too.
      return id;
    }
    return word === "done"
      ? { ok: true, value: { kind: "done", id: id.value } }
      : { ok: true, value: { kind: "remove", id: id.value } };
  }

  if (word === "rename") {
    const { first: idText, rest: title } = splitFirstWord(rest);
    const id = parseId(idText);
    if (!id.ok) {
      return id;
    }
    if (title === "") {
      return { ok: false, error: "rename 需要新的標題" };
    }
    return { ok: true, value: { kind: "rename", id: id.value, title } };
  }

  return { ok: false, error: `看不懂的指令：${word}` };
}

export async function runCommand(
  service: TodoService,
  command: Command,
): Promise<string> {
  switch (command.kind) {
    case "add": {
      const todo = await service.add(command.title);
      return `已新增 ${todo.id} 號：${todo.title}`;
    }
    case "list": {
      const todos = await service.list(command.filter);
      if (todos.length === 0) {
        return "（沒有待辦事項）";
      }
      return todos
        .map(
          (todo) =>
            `[${todo.done ? "x" : " "}] #${todo.id} ${todo.title}（優先度：${PRIORITY_LABELS[todo.priority]}）`,
        )
        .join("\n");
    }
    case "done": {
      const todo = await service.complete(command.id);
      return `已完成 ${todo.id} 號`;
    }
    case "rename": {
      const todo = await service.rename(command.id, command.title);
      return `${todo.id} 號改名為：${todo.title}`;
    }
    case "remove": {
      await service.remove(command.id);
      return `已刪除 ${command.id} 號`;
    }
    default:
      // Add a sixth kind to Command and this line stops compiling.
      return assertNever(command);
  }
}
