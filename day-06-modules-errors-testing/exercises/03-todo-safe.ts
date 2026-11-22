// Exercise 03 (optional): build on the Todo modules in examples/todo/.
//
// Yesterday every file needed its own copy of the CRUD functions. Today this
// file imports them from another folder and adds three functions on top.
//
// Replace each `throw new Error("TODO...")` line, then run: bun test day-06

// The type import is already written.
import type { Todo } from "../examples/todo/types.ts";

// TODO: import the functions you need from
//       "../examples/todo/store.ts" and "../examples/todo/validation.ts"

// The result of a command that cannot fail: the list afterwards, and a
// message to show to the user.
export type CommandResult = { todos: Todo[]; message: string };

// Mark a todo as done. Returns a new array.
// - The id does not exist    -> throw new Error("找不到 id 為 <id> 的待辦事項")
// - The todo is already done -> throw new Error("id 為 <id> 的待辦事項已經完成")
//
// completeTodo(todos, 1) -> the same list with todo 1 marked as done
export function completeTodo(todos: readonly Todo[], id: number): Todo[] {
  // TODO: find the todo first, handle the two failures, then call updateTodo
  throw new Error("TODO：尚未完成 completeTodo");
}

// Add a todo with priority "medium". This function must never throw.
// - Success -> { todos: <the new list>, message: "已新增：<title>" }
//              where <title> is the title after validateTitle cleaned it
// - Failure -> { todos: <a list with the same contents>,
//                message: "錯誤：<the error message>" }
//
// addTodoSafely([], " 買牛奶 ")
//   -> { todos: [{ id: 1, title: "買牛奶", done: false, priority: "medium" }],
//        message: "已新增：買牛奶" }
// addTodoSafely([], "  ")
//   -> { todos: [], message: "錯誤：標題不可以是空白" }
export function addTodoSafely(
  todos: readonly Todo[],
  title: string,
): CommandResult {
  // TODO: use try/catch, and `instanceof Error` to read the message
  throw new Error("TODO：尚未完成 addTodoSafely");
}

// Mark a todo as done with completeTodo. This function must never throw.
// - Success -> { todos: <the new list>,
//                message: "已完成 id 為 <id> 的待辦事項" }
// - Failure -> { todos: <a list with the same contents>,
//                message: "錯誤：<the error message>" }
export function completeTodoSafely(
  todos: readonly Todo[],
  id: number,
): CommandResult {
  // TODO: use try/catch around completeTodo
  throw new Error("TODO：尚未完成 completeTodoSafely");
}
