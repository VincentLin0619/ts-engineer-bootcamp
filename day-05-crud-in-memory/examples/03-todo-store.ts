// Run from the project root:
//   bun run day-05-crud-in-memory/examples/03-todo-store.ts
//
// All five functions in one file, then one todo list taken through
// Create -> Read -> Update -> Delete.

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

// C = Create
function createTodo(todos: readonly Todo[], input: NewTodo): Todo[] {
  const todo: Todo = {
    id: nextId(todos),
    title: input.title,
    done: false,
    priority: input.priority,
  };
  return [...todos, todo];
}

// R = Read
function findTodoById(todos: readonly Todo[], id: number): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

// U = Update
function updateTodo(
  todos: readonly Todo[],
  id: number,
  changes: TodoChanges,
): Todo[] {
  return todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo));
}

// D = Delete
function deleteTodo(todos: readonly Todo[], id: number): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}

// Same helpers as Day 03.
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

// Turns one todo into one line of text, for example "[x] #2 寫作業（優先度：中）".
function formatTodo(todo: Todo): string {
  const mark = todo.done ? "x" : " ";
  return `[${mark}] #${todo.id} ${todo.title}（優先度：${priorityLabel(todo.priority)}）`;
}

function printTodos(label: string, todos: readonly Todo[]): void {
  console.log(`--- ${label}（共 ${todos.length} 筆）`);
  for (const todo of todos) {
    console.log(formatTodo(todo));
  }
}

// The "current" list lives in one `let` variable. The functions never change
// the array they receive, so the result must be stored back into `todos`.
let todos: Todo[] = [];

// Create
todos = createTodo(todos, { title: "買牛奶", priority: "high" });
todos = createTodo(todos, { title: "寫作業", priority: "medium" });
todos = createTodo(todos, { title: "倒垃圾", priority: "low" });
printTodos("新增三筆之後", todos);

// Read
const second = findTodoById(todos, 2);
if (second !== undefined) {
  console.log(`讀取 id 2：${second.title}`);
}

// Update
todos = updateTodo(todos, 2, { done: true });
printTodos("把 id 2 標成完成之後", todos);

// Delete
todos = deleteTodo(todos, 1);
printTodos("刪除 id 1 之後", todos);

// A new todo gets the largest id plus 1, not the number of todos plus 1.
todos = createTodo(todos, { title: "繳電費", priority: "medium" });
printTodos("再新增一筆之後", todos);

// Forgetting to store the result changes nothing.
deleteTodo(todos, 2);
printTodos("呼叫 deleteTodo 但沒有接住回傳值", todos);
