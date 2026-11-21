// Run from the project root:
//   bun run day-04-arrays-immutability/examples/04-immutable-updates.ts

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// `readonly Todo[]`: an array that TypeScript does not let you change.
const todos: readonly Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: true, priority: "medium" },
];

// Add: a new array with every old item, plus one more.
const jogging: Todo = { id: 3, title: "運動", done: false, priority: "low" };
const added = [...todos, jogging];

// Remove: filter keeps every item except the one to remove.
const removed = todos.filter((todo) => todo.id !== 2);

// Update: map gives back a new object for the matching item,
// and the same object for every other item.
const updated = todos.map((todo) =>
  todo.id === 1 ? { ...todo, done: true } : todo,
);

console.log(added.length, removed.length, updated.length);
console.log(updated[0]);

// The original array and its objects are untouched.
console.log(todos.length);
console.log(todos[0]);

// The item that did not change is the very same object in both arrays.
console.log(updated[1] === todos[1]);

// toSorted: returns a sorted copy. `a - b` sorts numbers from low to high,
// `b - a` from high to low.
const scores: readonly number[] = [72, 95, 60];
const ascending = scores.toSorted((a, b) => a - b);
const descending = scores.toSorted((a, b) => b - a);
console.log(scores, ascending, descending);

// `readonly` in front of a property: it can be read, but not reassigned.
type Member = {
  readonly id: number;
  name: string;
};

const member: Member = { id: 1, name: "小明" };
member.name = "小華";
console.log(member);

// Try it: remove the `//` in front of ONE of the lines below, then run
//   bun check day-04-arrays-immutability/examples/04-immutable-updates.ts
// Read the error, then put the `//` back before trying the next line.

// todos.push(jogging);
// scores.sort();
// member.id = 2;
