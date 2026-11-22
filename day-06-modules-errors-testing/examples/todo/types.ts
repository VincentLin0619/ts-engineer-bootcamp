// This module only defines things, so it is not run directly. It is used by
// cli.ts and store.test.ts. From the project root:
//   bun run day-06-modules-errors-testing/examples/todo/cli.ts
//   bun test day-06-modules-errors-testing/examples/todo
//
// The data types of the Todo app. This module has no imports: every other
// module may depend on it, and it depends on nothing.

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// What the caller provides when creating a todo.
export type NewTodo = { title: string; priority: Priority };

// What the caller provides when updating a todo: only what should change.
export type TodoChanges = {
  title?: string;
  done?: boolean;
  priority?: Priority;
};
