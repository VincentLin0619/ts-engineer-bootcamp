// Run from the project root:
//   bun run day-04-arrays-immutability/examples/03-spread-destructuring.ts

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// Spread an array: `...` copies every item into a new array.
const titles: string[] = ["買牛奶", "寫作業"];
const copiedTitles = [...titles];

copiedTitles.push("運動");
console.log(titles);
console.log(copiedTitles);

// Spread can be mixed with other items, or with another array.
const withExtra = [...titles, "倒垃圾"];
const weekend: string[] = ["爬山", "看電影"];
const everything = [...titles, ...weekend];
console.log(withExtra);
console.log(everything);

// Spread an object: `...` copies every property into a new object.
const original: Todo = {
  id: 1,
  title: "買牛奶",
  done: false,
  priority: "high",
};
const copiedTodo: Todo = { ...original };
console.log(copiedTodo);
console.log(copiedTodo === original);

// A property written after the spread replaces the copied one.
const finished: Todo = { ...original, done: true };
console.log(original.done, finished.done);

// Destructuring an object: pull properties out into variables by name.
const { title, priority } = original;
console.log(title, priority);

// Destructuring an array: pull items out by position.
// `...rest` collects everything that is left into a new array.
const [first, ...rest] = everything;
console.log(first);
console.log(rest);
