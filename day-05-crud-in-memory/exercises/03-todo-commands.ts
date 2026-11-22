// Exercise 03 (optional): turn command lines into changes on the Todo list.
//
// In examples/05-todo-cli.ts the commands are handled inside the `while`
// loop, mixed with prompt() and console.log(). Here you move that logic into
// two functions that only take values and return values. Functions like
// these are easy to check automatically, which is what Day 06 builds on.
//
// Replace each `throw new Error(...)` line, then run: bun test day-05

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

export type Command = { name: string; argument: string };

// ---------------------------------------------------------------------------
// Already written for you: the same functions as examples/03-todo-store.ts.
// Use them below. Do not change them.
// ---------------------------------------------------------------------------

export function nextId(todos: readonly Todo[]): number {
  let maxId = 0;
  for (const todo of todos) {
    if (todo.id > maxId) {
      maxId = todo.id;
    }
  }
  return maxId + 1;
}

export function createTodo(todos: readonly Todo[], input: NewTodo): Todo[] {
  const todo: Todo = {
    id: nextId(todos),
    title: input.title,
    done: false,
    priority: input.priority,
  };
  return [...todos, todo];
}

export function updateTodo(
  todos: readonly Todo[],
  id: number,
  changes: TodoChanges,
): Todo[] {
  return todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo));
}

export function deleteTodo(todos: readonly Todo[], id: number): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}

// ---------------------------------------------------------------------------
// Your part starts here.
// ---------------------------------------------------------------------------

// Split one line into a command name and an argument.
// - Spaces at both ends of the line are ignored.
// - The name is everything before the first space.
// - The argument is everything after it, with the spaces at both ends removed.
// - When there is no space, the argument is the empty string "".
//
// parseCommand("add 買牛奶")        -> { name: "add", argument: "買牛奶" }
// parseCommand("add 買牛奶 和雞蛋") -> { name: "add", argument: "買牛奶 和雞蛋" }
// parseCommand("  list  ")          -> { name: "list", argument: "" }
export function parseCommand(line: string): Command {
  // TODO: use trim(), indexOf(" ") and slice()
  throw new Error("TODO：尚未完成 parseCommand");
}

// Apply one command line to the list and return the resulting list.
// Never change `todos`. Always return a new array.
//
// - "add <title>": add a todo with priority "medium".
//                  When the title is empty, the contents stay the same.
// - "done <id>":   set `done` to true on that todo.
// - "rm <id>":     delete that todo.
// - anything else (for example "list" or "hello"): the contents stay the same.
//
// An id that does not exist, or is not a number, changes nothing. You do not
// need a special check for that: look at what updateTodo and deleteTodo
// already return in that case.
//
// applyCommand([], "add 買牛奶")
//   -> [{ id: 1, title: "買牛奶", done: false, priority: "medium" }]
export function applyCommand(todos: readonly Todo[], line: string): Todo[] {
  // TODO: call parseCommand, then pick the right CRUD function with `switch`
  throw new Error("TODO：尚未完成 applyCommand");
}
