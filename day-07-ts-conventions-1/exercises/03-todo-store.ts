// Exercise 03 (optional): bring a Todo store up to the course conventions.
//
// This is the Day 06 store, plus two extra functions, as a teammate in a
// hurry might have written it. The function names and what they should do
// are the same as on Day 06. Every problem is marked `PROBLEM n`.
//
// Work on one problem at a time, as in exercises 01 and 02:
// 1. When the problem has a suppression comment, delete that comment.
// 2. Run both checkers and read what they report:
//      bunx biome check day-07-ts-conventions-1/exercises
//      bun check day-07-ts-conventions-1/exercises
// 3. Fix the code properly. Do not put the comment back.
// When every problem is fixed, run: bun test day-07
//
// Fixing one problem can make the checkers report a line further down.
// That is the point: the mistake was already there, only hidden.

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

export type NewTodo = { title: string; priority: Priority };

export type TodoChanges = {
  title?: string;
  done?: boolean;
  priority?: Priority;
};

// PROBLEM 1: a fixed value at the top of a module is named in CONSTANT_CASE.
// biome-ignore lint/style/useNamingConvention: delete this comment, then rename the constant
const max_title_length = 100;

// PROBLEM 2: `any` hides a typo, so a title that is too long is accepted.
// validateTitle("  買牛奶 ") -> "買牛奶"
// validateTitle("   ")       -> throws Error("標題不可以是空白")
// A title of 101 characters  -> throws Error("標題不可以超過 100 個字")
// biome-ignore lint/suspicious/noExplicitAny: delete this comment, then replace `any`
export function validateTitle(title: any): string {
  const trimmed = title.trim();
  if (trimmed === "") {
    throw new Error("標題不可以是空白");
  }
  if (trimmed.lenght > max_title_length) {
    throw new Error(`標題不可以超過 ${max_title_length} 個字`);
  }
  return trimmed;
}

// PROBLEM 3: `!` crashes on an empty list. The idea is also wrong: the last
// todo does not always have the largest id.
// nextId([])                       -> 1
// nextId([{ id: 5 }, { id: 2 }])   -> 6
export function nextId(todos: readonly Todo[]): number {
  // biome-ignore lint/style/noNonNullAssertion: delete this comment, then find the largest id safely
  return todos[todos.length - 1]!.id + 1;
}

// PROBLEM 4: this function changes the array it receives. Promise not to do
// that in the parameter type, then return a new array.
export function createTodo(todos: Todo[], input: NewTodo): Todo[] {
  todos.push({
    id: nextId(todos),
    title: validateTitle(input.title),
    done: false,
    priority: input.priority,
  });
  return todos;
}

// PROBLEM 5: `as Todo` claims the todo always exists. Remove the `as` and
// write the honest return type. `bun check` then reports every caller that
// believed the claim.
export function findTodoById(todos: readonly Todo[], id: number): Todo {
  return todos.find((todo) => todo.id === id) as Todo;
}

// PROBLEM 6: a parameter without a type, and a forgotten case behind it.
// priorityLabel("high") -> "高", "medium" -> "中", "low" -> "低"
// @ts-expect-error -- TS7006: Parameter 'priority' implicitly has an 'any' type. Delete this comment, then add the parameter type and the return type.
export function priorityLabel(priority) {
  if (priority === "high") {
    return "高";
  }
  if (priority === "medium") {
    return "中";
  }
}

// One line that describes a todo.
// describeTodo(todos, 1)  -> "買牛奶（高）"
// describeTodo(todos, 99) -> "找不到 id 為 99 的待辦事項"
// (Nothing is marked here. PROBLEM 5 will lead you to it.)
export function describeTodo(todos: readonly Todo[], id: number): string {
  const todo = findTodoById(todos, id);
  return `${todo.title}（${priorityLabel(todo.priority)}）`;
}

// PROBLEM 7: `any` again. Use the type that describes the allowed changes.
// updateTodo throws Error("找不到 id 為 <id> 的待辦事項") when the id does not exist.
export function updateTodo(
  todos: readonly Todo[],
  id: number,
  // biome-ignore lint/suspicious/noExplicitAny: delete this comment, then replace `any`
  changes: any,
): Todo[] {
  if (findTodoById(todos, id) === undefined) {
    throw new Error(`找不到 id 為 ${id} 的待辦事項`);
  }
  return todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo));
}

// Marks a todo as done.
// (Nothing is marked here. PROBLEM 7 will lead you to it.)
export function completeTodo(todos: readonly Todo[], id: number): Todo[] {
  return updateTodo(todos, id, { don: true });
}
