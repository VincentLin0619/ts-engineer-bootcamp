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

export type Command = { name: string; argument: string };

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

export function parseCommand(line: string): Command {
  const trimmed = line.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { name: trimmed, argument: "" };
  }
  return {
    name: trimmed.slice(0, spaceIndex),
    argument: trimmed.slice(spaceIndex + 1).trim(),
  };
}

export function applyCommand(todos: readonly Todo[], line: string): Todo[] {
  const command = parseCommand(line);

  switch (command.name) {
    case "add": {
      if (command.argument === "") {
        return [...todos];
      }
      return createTodo(todos, { title: command.argument, priority: "medium" });
    }
    case "done": {
      // Number("abc") is NaN, which matches no id, so nothing changes.
      return updateTodo(todos, Number(command.argument), { done: true });
    }
    case "rm": {
      return deleteTodo(todos, Number(command.argument));
    }
    default: {
      // `todos` is readonly, so return a copy with the same contents.
      return [...todos];
    }
  }
}
