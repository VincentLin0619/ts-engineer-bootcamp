// Exercise 03 (optional): array methods and immutable updates on the
// Todo main line.
//
// Replace the `throw new Error(...)` lines, then run: bun test day-04
// As in exercise 02, never change what is passed in.

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// Already written for you: a number to sort priorities by.
export function priorityRank(priority: Priority): number {
  switch (priority) {
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
  }
}

// Close examples/05-todo.ts and write this one from memory.
// Return a new todo whose `done` is the opposite of the one passed in.
// toggleDone({ id: 1, title: "買牛奶", done: false, priority: "high" })
//   -> { id: 1, title: "買牛奶", done: true, priority: "high" }
export function toggleDone(todo: Todo): Todo {
  // TODO: return a new object
  throw new Error("TODO：尚未完成 toggleDone");
}

// Use filter, then map. Return the titles of the todos that are not done.
// With 買牛奶 (open), 寫作業 (done) and 運動 (open):
// getOpenTitles(todos) -> ["買牛奶", "運動"]
export function getOpenTitles(todos: readonly Todo[]): string[] {
  // TODO: return the titles of the open todos
  throw new Error("TODO：尚未完成 getOpenTitles");
}

// On Day 03 you wrote this with a loop and a counter. Write it again
// with filter.
// countByPriority(todos, "low") -> the number of todos with priority "low"
export function countByPriority(
  todos: readonly Todo[],
  priority: Priority,
): number {
  // TODO: return the number of todos with this priority
  throw new Error("TODO：尚未完成 countByPriority");
}

// Use map and call toggleDone. Return a new array in which the todo with
// this id is toggled. Every other todo stays as it is. When no todo has
// this id, the new array has the same content as the old one.
export function toggleDoneById(todos: readonly Todo[], id: number): Todo[] {
  // TODO: return a new array with one todo replaced
  throw new Error("TODO：尚未完成 toggleDoneById");
}

// Use toSorted and priorityRank. Return a new array with the highest
// priority first: "high", then "medium", then "low".
export function sortByPriority(todos: readonly Todo[]): Todo[] {
  // TODO: return a sorted copy
  throw new Error("TODO：尚未完成 sortByPriority");
}
