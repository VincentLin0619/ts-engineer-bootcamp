// Run from the project root:
//   bun run day-08-oop-classes/examples/02-first-class.ts
//
// A first class: properties, a constructor, methods and `this`.
// Everything is still public here. Step 3 locks it down.

class Todo {
  // Properties: the data every instance carries.
  id: number;
  title: string;
  done: boolean;

  // The constructor runs once for every `new Todo(...)`.
  constructor(id: number, title: string) {
    // `this` is the instance being created right now.
    this.id = id;
    this.title = title;
    this.done = false;
  }

  // Methods: functions that belong to the class and work on `this`.
  complete(): void {
    this.done = true;
  }

  describe(): string {
    const mark = this.done ? "x" : " ";
    return `#${this.id} [${mark}] ${this.title}`;
  }
}

// `new` creates an instance and runs the constructor.
const milk = new Todo(1, "買牛奶");
const report = new Todo(2, "寫報告");

console.log(milk.describe());
console.log(report.describe());

// Inside complete(), `this` is whatever stands left of the dot: milk.
milk.complete();
console.log(milk.describe()); // changed
console.log(report.describe()); // untouched: it has its own data

// Each instance has its own data, but the methods exist only once.
console.log(milk.complete === report.complete); // true

// instanceof checks whether a value was created from a class.
console.log(milk instanceof Todo); // true

// Still not safe: properties are public, so the rule can be bypassed.
milk.title = "";
console.log(`「${milk.title}」`);
