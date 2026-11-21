// Exercise 03 (optional): build the data of the Todo main line yourself.
//
// Close examples/05-todo.ts first and try to write the types from memory.
// Change the lines marked TODO, then run: bun test day-02

// TODO 1: a priority must allow exactly three values:
// "low", "medium" and "high". Add the two that are missing.
export type Priority = "low";

// TODO 2: add the two missing properties:
// `done` (a boolean) and `priority` (a Priority).
export type Todo = {
  id: number;
  title: string;
};

// TODO 3: describe this todo item: id 1, title "買牛奶", not done,
// priority "high".
export const firstTodo: Todo = {
  id: 0,
  title: "",
};

// TODO 4: build a list of three todo items, in this order:
//   - firstTodo (use the const above)
//   - id 2, title "寫作業", done, priority "medium"
//   - id 3, title "運動", not done, priority "low"
export const todos: Todo[] = [];

// TODO 5: finish the two functions below. As in exercise 02, check with
// `if` first when a value might be undefined.

// Return the title of the todo at the given index. When that position is
// empty, return "（沒有這一筆）".
// titleAt(todos, 0) -> "買牛奶"
// titleAt(todos, 9) -> "（沒有這一筆）"
export function titleAt(list: Todo[], index: number): string {
  // TODO: read `list[index]` into a const, check it with `if`, then return
  throw new Error("TODO：尚未完成 titleAt");
}

// Build one line of text from a todo:
// "#<id> <title>（優先度：<priority>，完成：<done>）"
// describeTodo(firstTodo) -> "#1 買牛奶（優先度：high，完成：false）"
export function describeTodo(todo: Todo): string {
  // TODO: return the line with a template literal
  throw new Error("TODO：尚未完成 describeTodo");
}
