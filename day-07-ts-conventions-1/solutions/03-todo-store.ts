// Reference solution for exercise 03.

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

// PROBLEM 1: CONSTANT_CASE for a fixed value at the top of a module.
const MAX_TITLE_LENGTH = 100;

// PROBLEM 2: with `title: string`, the typo `trimmed.lenght` is reported.
export function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed === "") {
    throw new Error("標題不可以是空白");
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new Error(`標題不可以超過 ${MAX_TITLE_LENGTH} 個字`);
  }
  return trimmed;
}

// PROBLEM 3: no index, so nothing can be undefined, and no `!` is needed.
export function nextId(todos: readonly Todo[]): number {
  let maxId = 0;
  for (const todo of todos) {
    if (todo.id > maxId) {
      maxId = todo.id;
    }
  }
  return maxId + 1;
}

// PROBLEM 4: `readonly` makes `todos.push(...)` a type error.
export function createTodo(todos: readonly Todo[], input: NewTodo): Todo[] {
  const todo: Todo = {
    id: nextId(todos),
    title: validateTitle(input.title),
    done: false,
    priority: input.priority,
  };
  return [...todos, todo];
}

// PROBLEM 5: the honest return type. No `as` is needed: this is exactly
// what `find` returns.
export function findTodoById(
  todos: readonly Todo[],
  id: number,
): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

// PROBLEM 6: with the parameter type and `: string` written out, the
// missing "low" case is reported.
export function priorityLabel(priority: Priority): string {
  if (priority === "high") {
    return "高";
  }
  if (priority === "medium") {
    return "中";
  }
  return "低";
}

// Found through PROBLEM 5: `todo` may be undefined, so check it first.
export function describeTodo(todos: readonly Todo[], id: number): string {
  const todo = findTodoById(todos, id);
  if (todo === undefined) {
    return `找不到 id 為 ${id} 的待辦事項`;
  }
  return `${todo.title}（${priorityLabel(todo.priority)}）`;
}

// PROBLEM 7: `TodoChanges` lists exactly what may be changed.
export function updateTodo(
  todos: readonly Todo[],
  id: number,
  changes: TodoChanges,
): Todo[] {
  if (findTodoById(todos, id) === undefined) {
    throw new Error(`找不到 id 為 ${id} 的待辦事項`);
  }
  return todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo));
}

// Found through PROBLEM 7: `{ don: true }` is not a valid TodoChanges.
export function completeTodo(todos: readonly Todo[], id: number): Todo[] {
  return updateTodo(todos, id, { done: true });
}
