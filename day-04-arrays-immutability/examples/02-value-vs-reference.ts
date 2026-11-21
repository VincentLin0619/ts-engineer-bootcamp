// Run from the project root:
//   bun run day-04-arrays-immutability/examples/02-value-vs-reference.ts

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// Numbers, strings and booleans are copied: each name has its own value.
const a = 1;
let b = a;
b = 2;
console.log(a, b);

// Objects are not copied. Both names point at the same object.
const original: Todo = {
  id: 1,
  title: "買牛奶",
  done: false,
  priority: "high",
};
const sameTodo = original;

sameTodo.done = true;
console.log(original.done);

// `===` on objects asks "is this the same object?", not "same content?".
console.log(original === sameTodo);

const lookalike: Todo = {
  id: 1,
  title: "買牛奶",
  done: true,
  priority: "high",
};
console.log(original === lookalike);

// Arrays are objects too, so they behave the same way.
const titles: string[] = ["買牛奶", "寫作業"];
const sameTitles = titles;

sameTitles.push("運動");
console.log(titles);

// A function receives the same object as well, not a copy of it.
function markDone(todo: Todo): void {
  todo.done = true;
}

const homework: Todo = {
  id: 2,
  title: "寫作業",
  done: false,
  priority: "medium",
};
markDone(homework);
console.log(homework.done);
