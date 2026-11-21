// Exercise 03 (optional): write the Todo helper functions yourself.
//
// Close examples/05-todo.ts first and write the first three functions
// from memory. The last two are new.
// Replace the `throw new Error(...)` lines, then run: bun test day-03

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// Use switch. "low" -> "低", "medium" -> "中", "high" -> "高"
// priorityLabel("high") -> "高"
export function priorityLabel(priority: Priority): string {
  // TODO: return the text for this priority
  throw new Error("TODO：尚未完成 priorityLabel");
}

// Format one todo as "[<mark>] #<id> <title>（優先度：<label>）".
// <mark> is "x" when the todo is done, and one space when it is not.
// <label> comes from calling priorityLabel.
// formatTodo({ id: 2, title: "寫作業", done: true, priority: "medium" })
//   -> "[x] #2 寫作業（優先度：中）"
// formatTodo({ id: 1, title: "買牛奶", done: false, priority: "high" })
//   -> "[ ] #1 買牛奶（優先度：高）"
export function formatTodo(todo: Todo): string {
  // TODO: return the line
  throw new Error("TODO：尚未完成 formatTodo");
}

// Use a loop. Count how many todos are done.
// countDone([]) -> 0
export function countDone(todos: Todo[]): number {
  // TODO: return the number of todos whose `done` is true
  throw new Error("TODO：尚未完成 countDone");
}

// Use a loop. Count how many todos have the given priority.
// With one "high" todo and two "low" todos in the list:
// countByPriority(todos, "low") -> 2
export function countByPriority(todos: Todo[], priority: Priority): number {
  // TODO: return the number of todos with this priority
  throw new Error("TODO：尚未完成 countByPriority");
}

// Build the summary line "共 <total> 筆，已完成 <done> 筆，未完成 <open> 筆".
// Call countDone to get the number of done todos.
// With 3 todos, 1 of them done:
// formatSummary(todos) -> "共 3 筆，已完成 1 筆，未完成 2 筆"
export function formatSummary(todos: Todo[]): string {
  // TODO: return the summary line
  throw new Error("TODO：尚未完成 formatSummary");
}
