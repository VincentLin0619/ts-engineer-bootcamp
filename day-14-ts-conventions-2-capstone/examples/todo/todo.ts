import { ValidationError } from "./errors.ts";

export type Priority = "low" | "medium" | "high";

// The plain-data shape of a todo. This is what goes into a file or a database.
export type TodoData = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

const MAX_TITLE_LENGTH = 100;

// Trims the title and enforces the 1-100 character rule.
export function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new ValidationError("標題不可以是空白");
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new ValidationError(`標題不可以超過 ${MAX_TITLE_LENGTH} 個字`);
  }
  return trimmed;
}

// Type guard: when this returns true, TypeScript treats `value` as a Priority.
export function isPriority(value: unknown): value is Priority {
  return value === "low" || value === "medium" || value === "high";
}

// Type guard for data that comes from outside the program (a file, a database).
export function isTodoData(value: unknown): value is TodoData {
  // Step 1: it must be an object at all.
  if (typeof value !== "object" || value === null) {
    return false;
  }
  // Step 2: it must have every property we are about to read.
  if (
    !("id" in value) ||
    !("title" in value) ||
    !("done" in value) ||
    !("priority" in value)
  ) {
    return false;
  }
  // Step 3: every property must have the right type.
  return (
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.done === "boolean" &&
    isPriority(value.priority)
  );
}

export class Todo {
  readonly id: number;
  #title: string;
  #done: boolean;
  #priority: Priority;

  constructor(
    id: number,
    title: string,
    priority: Priority = "medium",
    done = false,
  ) {
    this.id = id;
    this.#title = validateTitle(title);
    this.#priority = priority;
    this.#done = done;
  }

  get title(): string {
    return this.#title;
  }

  get done(): boolean {
    return this.#done;
  }

  get priority(): Priority {
    return this.#priority;
  }

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

  // Class instance -> plain data, ready to be stored.
  toData(): TodoData {
    return {
      id: this.id,
      title: this.#title,
      done: this.#done,
      priority: this.#priority,
    };
  }

  // Plain data -> class instance, used when reading from storage.
  static fromData(data: TodoData): Todo {
    return new Todo(data.id, data.title, data.priority, data.done);
  }
}
