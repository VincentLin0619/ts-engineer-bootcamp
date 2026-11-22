// Run from the project root (type commands yourself, `quit` to stop):
//   bun run day-05-crud-in-memory/examples/05-todo-cli.ts
//
// Or feed it commands through a pipe, one command per line:
//   printf 'add 買牛奶\nlist\nquit\n' | bun run day-05-crud-in-memory/examples/05-todo-cli.ts
//
// Commands: add <title>, list, done <id>, rm <id>, quit

// ---------------------------------------------------------------------------
// Part 1: types and CRUD functions.
// These are copied from 03-todo-store.ts. Copying is the only way to reuse
// code before modules are covered. Day 06 removes this duplication.
// ---------------------------------------------------------------------------

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

type NewTodo = { title: string; priority: Priority };
type TodoChanges = { title?: string; done?: boolean; priority?: Priority };

function nextId(todos: readonly Todo[]): number {
  let maxId = 0;
  for (const todo of todos) {
    if (todo.id > maxId) {
      maxId = todo.id;
    }
  }
  return maxId + 1;
}

function createTodo(todos: readonly Todo[], input: NewTodo): Todo[] {
  const todo: Todo = {
    id: nextId(todos),
    title: input.title,
    done: false,
    priority: input.priority,
  };
  return [...todos, todo];
}

function findTodoById(todos: readonly Todo[], id: number): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

function updateTodo(
  todos: readonly Todo[],
  id: number,
  changes: TodoChanges,
): Todo[] {
  return todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo));
}

function deleteTodo(todos: readonly Todo[], id: number): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}

function priorityLabel(priority: Priority): string {
  switch (priority) {
    case "low":
      return "低";
    case "medium":
      return "中";
    case "high":
      return "高";
  }
}

function formatTodo(todo: Todo): string {
  const mark = todo.done ? "x" : " ";
  return `[${mark}] #${todo.id} ${todo.title}（優先度：${priorityLabel(todo.priority)}）`;
}

// ---------------------------------------------------------------------------
// Part 2: turning one line of input into a command.
// ---------------------------------------------------------------------------

type Command = { name: string; argument: string };

function parseCommand(line: string): Command {
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

// ---------------------------------------------------------------------------
// Part 3: the command loop.
// ---------------------------------------------------------------------------

// The whole "database" is this one variable. It is gone when the program ends.
let todos: Todo[] = [];
let running = true;

console.log("Todo CLI：add <標題>、list、done <id>、rm <id>、quit");

while (running) {
  const line = prompt("todo>");

  if (line === null) {
    // Nothing to read: Enter on an empty line, or the piped input has ended.
    running = false;
  } else {
    const command = parseCommand(line);

    switch (command.name) {
      case "add": {
        if (command.argument === "") {
          console.log("用法：add <標題>");
        } else {
          todos = createTodo(todos, {
            title: command.argument,
            priority: "medium",
          });
          console.log(`已新增：${command.argument}`);
        }
        break;
      }
      case "list": {
        if (todos.length === 0) {
          console.log("目前沒有待辦事項");
        }
        for (const todo of todos) {
          console.log(formatTodo(todo));
        }
        break;
      }
      case "done": {
        // Number("abc") is NaN, and NaN never equals an id, so a wrong
        // argument simply ends up in the "not found" branch.
        const id = Number(command.argument);
        const found = findTodoById(todos, id);
        if (found === undefined) {
          console.log(`找不到 id 為 ${command.argument} 的待辦事項`);
        } else {
          todos = updateTodo(todos, id, { done: true });
          console.log(`已完成：${found.title}`);
        }
        break;
      }
      case "rm": {
        const id = Number(command.argument);
        const found = findTodoById(todos, id);
        if (found === undefined) {
          console.log(`找不到 id 為 ${command.argument} 的待辦事項`);
        } else {
          todos = deleteTodo(todos, id);
          console.log(`已刪除：${found.title}`);
        }
        break;
      }
      case "quit": {
        running = false;
        break;
      }
      default: {
        console.log(`不認識的指令：${command.name}`);
      }
    }
  }
}

console.log("再見！");
