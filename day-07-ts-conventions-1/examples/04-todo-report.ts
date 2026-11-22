// The "after" version of the refactoring walkthrough in the README.
// The "before" version is shown there, in the section "步驟 5".
//
// This module only defines things, so it is not run directly. To see it
// work, run the file that imports it. From the project root:
//   bun run day-07-ts-conventions-1/examples/05-print-report.ts

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

const PRIORITY_LABELS = { low: "低", medium: "中", high: "高" } as const;
const MAX_REPORT_LINES = 3;

export function priorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority];
}

export function findOpenTodos(
  todos: readonly Todo[],
  priority: Priority,
): Todo[] {
  return todos.filter((todo) => !todo.done && todo.priority === priority);
}

export function firstTitle(todos: readonly Todo[]): string | undefined {
  const first = todos[0];
  if (first === undefined) {
    return undefined;
  }
  return first.title;
}

// At most MAX_REPORT_LINES lines, one per todo. The array it receives is
// left untouched.
export function buildReport(todos: readonly Todo[]): string[] {
  const lines: string[] = [];
  for (const todo of todos) {
    if (lines.length < MAX_REPORT_LINES) {
      lines.push(`${todo.title}（${priorityLabel(todo.priority)}）`);
    }
  }
  return lines;
}
