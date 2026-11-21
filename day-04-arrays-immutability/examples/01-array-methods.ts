// Run from the project root:
//   bun run day-04-arrays-immutability/examples/01-array-methods.ts

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

const todos: Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: true, priority: "medium" },
  { id: 3, title: "運動", done: false, priority: "low" },
];

// The Day 03 way: a loop and push.
const titlesFromLoop: string[] = [];

for (const todo of todos) {
  titlesFromLoop.push(todo.title);
}

console.log(titlesFromLoop);

// map: turn every item into something else. The result is a new array
// of the same length. The arrow function is called once per item.
const titles = todos.map((todo) => todo.title);
console.log(titles);

// filter: keep only the items for which the function returns true.
const openTodos = todos.filter((todo) => !todo.done);
console.log(openTodos.length);

// Chain: filter returns an array, so map can be called on its result.
const openTitles = todos.filter((todo) => !todo.done).map((todo) => todo.title);
console.log(openTitles);

// find: the first item that matches, or undefined when nothing matches.
const second = todos.find((todo) => todo.id === 2);

if (second !== undefined) {
  console.log(second.title);
}

const missing = todos.find((todo) => todo.id === 99);
console.log(missing);

// some: does at least one item match?
console.log(todos.some((todo) => todo.priority === "high"));

// every: do all items match?
console.log(todos.every((todo) => todo.done));

// reduce: boil the whole array down to a single value.
// `total` is the result so far, `value` is the current item, 0 is the start.
const minutes: number[] = [15, 60, 30];
const totalMinutes = minutes.reduce((total, value) => total + value, 0);
console.log(totalMinutes);

// None of these methods changed the original array.
console.log(todos.length, minutes);
