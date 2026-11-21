// Reference solution for exercise 03.

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

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

export function toggleDone(todo: Todo): Todo {
  return { ...todo, done: !todo.done };
}

export function getOpenTitles(todos: readonly Todo[]): string[] {
  return todos.filter((todo) => !todo.done).map((todo) => todo.title);
}

export function countByPriority(
  todos: readonly Todo[],
  priority: Priority,
): number {
  return todos.filter((todo) => todo.priority === priority).length;
}

export function toggleDoneById(todos: readonly Todo[], id: number): Todo[] {
  // A new object for the match, the very same object for everything else.
  return todos.map((todo) => (todo.id === id ? toggleDone(todo) : todo));
}

export function sortByPriority(todos: readonly Todo[]): Todo[] {
  // `b - a` sorts from high to low, so rank 3 ("high") comes first.
  return todos.toSorted(
    (a, b) => priorityRank(b.priority) - priorityRank(a.priority),
  );
}
