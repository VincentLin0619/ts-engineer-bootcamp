// Run from the project root:
//   bun run day-07-ts-conventions-1/examples/05-print-report.ts

import type { Todo } from "./04-todo-report.ts";
import {
  buildReport,
  findOpenTodos,
  firstTitle,
  priorityLabel,
} from "./04-todo-report.ts";

const todos: Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: true, priority: "high" },
  { id: 3, title: "倒垃圾", done: false, priority: "low" },
  { id: 4, title: "繳電費", done: false, priority: "high" },
];

console.log(priorityLabel("medium")); // 中

// Open todos with high priority: #1 and #4.
console.log(findOpenTodos(todos, "high").map((todo) => todo.title));

console.log(firstTitle(todos)); // 買牛奶
console.log(firstTitle([])); // undefined, and no crash

// Only the first three lines are reported...
console.log(buildReport(todos));
// ...and the caller's array still has all four todos.
console.log(todos.length); // 4
