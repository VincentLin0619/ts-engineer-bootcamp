// Reference solution for exercise 03.

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

export function priorityLabel(priority: Priority): string {
  switch (priority) {
    case "low":
      return "低";
    case "medium":
      return "中";
    case "high":
      return "高";
  }
}

export function formatTodo(todo: Todo): string {
  const mark = todo.done ? "x" : " ";
  const label = priorityLabel(todo.priority);
  return `[${mark}] #${todo.id} ${todo.title}（優先度：${label}）`;
}

export function countDone(todos: Todo[]): number {
  let count = 0;

  for (const todo of todos) {
    if (todo.done) {
      count++;
    }
  }

  return count;
}

export function countByPriority(todos: Todo[], priority: Priority): number {
  let count = 0;

  for (const todo of todos) {
    if (todo.priority === priority) {
      count++;
    }
  }

  return count;
}

export function formatSummary(todos: Todo[]): string {
  const total = todos.length;
  const done = countDone(todos);
  const open = total - done;
  return `共 ${total} 筆，已完成 ${done} 筆，未完成 ${open} 筆`;
}
