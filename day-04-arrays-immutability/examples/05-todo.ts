// Run from the project root:
//   bun run day-04-arrays-immutability/examples/05-todo.ts
//
// Todo main line: the Day 03 helpers, rewritten and extended with
// array methods and immutable updates.

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

type TodoStats = {
  total: number;
  done: number;
  open: number;
};

// Unchanged from Day 03.
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

// Unchanged from Day 03.
function formatTodo(todo: Todo): string {
  const mark = todo.done ? "x" : " ";
  const label = priorityLabel(todo.priority);
  return `[${mark}] #${todo.id} ${todo.title}（優先度：${label}）`;
}

// Day 03 used a loop and a counter. filter + length does the same.
// `readonly Todo[]` promises the caller that the array is not changed.
function countDone(todos: readonly Todo[]): number {
  return todos.filter((todo) => todo.done).length;
}

function getOpenTodos(todos: readonly Todo[]): Todo[] {
  return todos.filter((todo) => !todo.done);
}

function getTitles(todos: readonly Todo[]): string[] {
  return todos.map((todo) => todo.title);
}

function getStats(todos: readonly Todo[]): TodoStats {
  const doneCount = countDone(todos);
  return {
    total: todos.length,
    done: doneCount,
    open: todos.length - doneCount,
  };
}

// Returns a new object. The todo passed in is not changed.
function toggleDone(todo: Todo): Todo {
  return { ...todo, done: !todo.done };
}

const todos: readonly Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: true, priority: "medium" },
  { id: 3, title: "運動", done: false, priority: "low" },
];

console.log(getTitles(getOpenTodos(todos)));
console.log(getStats(todos));

// Toggle one todo inside the list: map + toggleDone.
const updated = todos.map((todo) => (todo.id === 1 ? toggleDone(todo) : todo));

for (const todo of updated) {
  console.log(formatTodo(todo));
}

// The original list still has the old data.
console.log(`原本的陣列已完成 ${countDone(todos)} 筆`);
console.log(`新的陣列已完成 ${countDone(updated)} 筆`);
