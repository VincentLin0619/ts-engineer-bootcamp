// Todo mainline: the Todo class. Unchanged since Day 08.
//
// This file only defines things, so running it prints nothing.
// Run the demo that uses it instead:
//   bun run day-09-oop-interfaces/examples/04-todo-repository.ts

export type Priority = "low" | "medium" | "high";

// Plain data without any behaviour. In week 1 this shape was called `Todo`.
export type TodoData = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

const MAX_TITLE_LENGTH = 100;

// The title rule from Day 06: trim it, then require 1 to 100 characters.
// It is not exported: only the Todo class below is allowed to use it.
function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error("標題不可以是空的");
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new Error(`標題不可以超過 ${MAX_TITLE_LENGTH} 個字`);
  }
  return trimmed;
}

export class Todo {
  // Public and readonly: everyone can read the id, nobody can change it.
  readonly id: number;
  // Private: only the code inside this class can touch these three.
  #title: string;
  #done: boolean;
  #priority: Priority;

  constructor(
    id: number,
    title: string,
    priority: Priority = "medium",
    done: boolean = false,
  ) {
    this.id = id;
    // The rule is checked here, so an invalid Todo can never be created.
    this.#title = validateTitle(title);
    this.#priority = priority;
    this.#done = done;
  }

  // Getters: read-only windows onto the private fields.
  get title(): string {
    return this.#title;
  }

  get done(): boolean {
    return this.#done;
  }

  get priority(): Priority {
    return this.#priority;
  }

  // The only way to change the title, and it checks the rule again.
  rename(title: string): void {
    this.#title = validateTitle(title);
  }

  complete(): void {
    this.#done = true;
  }

  reopen(): void {
    this.#done = false;
  }

  changePriority(priority: Priority): void {
    this.#priority = priority;
  }

  // Class instance -> plain data (for printing, saving, sending).
  toData(): TodoData {
    return {
      id: this.id,
      title: this.#title,
      done: this.#done,
      priority: this.#priority,
    };
  }

  // Plain data -> class instance. `static`: called as Todo.fromData(...).
  static fromData(data: TodoData): Todo {
    return new Todo(data.id, data.title, data.priority, data.done);
  }
}
