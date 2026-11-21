// Reference solution for exercise 03.

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

export const firstTodo: Todo = {
  id: 1,
  title: "買牛奶",
  done: false,
  priority: "high",
};

export const todos: Todo[] = [
  firstTodo,
  { id: 2, title: "寫作業", done: true, priority: "medium" },
  { id: 3, title: "運動", done: false, priority: "low" },
];

export function titleAt(list: Todo[], index: number): string {
  // The type of `todo` is `Todo | undefined`: the position may be empty.
  const todo = list[index];
  if (todo !== undefined) {
    return todo.title;
  }
  return "（沒有這一筆）";
}

export function describeTodo(todo: Todo): string {
  return `#${todo.id} ${todo.title}（優先度：${todo.priority}，完成：${todo.done}）`;
}
