// Run from the project root:
//   bun run day-03-control-flow-functions/examples/05-todo.ts
//
// Todo main line: the first helper functions for the types from Day 02.

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// Turn a priority into the text shown to the user.
// Every case returns, so no `break` is needed.
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

// Format one todo as a single line, for example "[x] #2 寫作業（優先度：中）".
function formatTodo(todo: Todo): string {
  const mark = todo.done ? "x" : " ";
  const label = priorityLabel(todo.priority);
  return `[${mark}] #${todo.id} ${todo.title}（優先度：${label}）`;
}

// Count how many todos are done.
function countDone(todos: Todo[]): number {
  let count = 0;

  for (const todo of todos) {
    if (todo.done) {
      count++;
    }
  }

  return count;
}

const todos: Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: true, priority: "medium" },
  { id: 3, title: "運動", done: false, priority: "low" },
];

for (const todo of todos) {
  console.log(formatTodo(todo));
}

console.log(`已完成 ${countDone(todos)} / ${todos.length} 筆`);
