// Custom error classes for the Todo app (introduced on Day 10).

// Thrown when input breaks a rule, for example an empty title.
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Thrown when no todo has the requested id.
export class TodoNotFoundError extends Error {
  readonly id: number;

  constructor(id: number) {
    super(`找不到 id 為 ${id} 的待辦事項`);
    this.name = "TodoNotFoundError";
    this.id = id;
  }
}
