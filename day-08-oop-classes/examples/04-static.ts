// Run from the project root:
//   bun run day-08-oop-classes/examples/04-static.ts
//
// `static` members belong to the class itself, not to any single instance.

type Priority = "low" | "medium" | "high";

type TodoData = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

class Todo {
  // A static property: one value for the whole class.
  static readonly MAX_TITLE_LENGTH = 100;
  // Static members can be private too.
  static #createdCount = 0;

  readonly id: number;
  #title: string;
  #done: boolean;
  #priority: Priority;

  constructor(id: number, title: string, priority: Priority, done: boolean) {
    this.id = id;
    this.#title = title;
    this.#priority = priority;
    this.#done = done;
    // Static members are reached through the class name, not through `this`.
    Todo.#createdCount = Todo.#createdCount + 1;
  }

  get title(): string {
    return this.#title;
  }

  // A static getter: read as Todo.createdCount.
  static get createdCount(): number {
    return Todo.#createdCount;
  }

  // An instance method needs an instance: milk.toData().
  toData(): TodoData {
    return {
      id: this.id,
      title: this.#title,
      done: this.#done,
      priority: this.#priority,
    };
  }

  // A static method needs no instance: Todo.fromData(...).
  // Its job here is to CREATE an instance, so it cannot start from one.
  static fromData(data: TodoData): Todo {
    return new Todo(data.id, data.title, data.priority, data.done);
  }
}

// Static members are used through the class name.
console.log(Todo.MAX_TITLE_LENGTH);
console.log(Todo.createdCount); // 0: no instance yet

const milk = new Todo(1, "買牛奶", "high", false);
console.log(Todo.createdCount); // 1

// Instance -> plain data.
const data = milk.toData();
console.log(data);

// Plain data -> a new instance with the same content.
const copy = Todo.fromData(data);
console.log(copy.title);
console.log(copy === milk); // false: two different instances
console.log(Todo.createdCount); // 2: one shared counter for the whole class

// Try it: remove the `//` on the next line, then run
//   bun check day-08-oop-classes/examples/04-static.ts
// You will see TS2576: static members do not exist on instances.
// console.log(milk.MAX_TITLE_LENGTH);
