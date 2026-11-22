// Todo mainline, Day 10: custom error classes.
//
// This file only defines things, so running it prints nothing.
// Run the demo that uses it instead:
//   bun run day-10-oop-composition-layers/examples/03-custom-errors.ts

// Thrown when input breaks a rule: an empty title, a duplicate title, ...
export class ValidationError extends Error {
  constructor(message: string) {
    // Error's own constructor stores the message.
    super(message);
    // `name` is a property every Error has. By default it is "Error".
    this.name = "ValidationError";
  }
}

// Thrown when no todo has the requested id.
export class TodoNotFoundError extends Error {
  // Extra data for whoever catches the error: which id was missing.
  readonly id: number;

  constructor(id: number) {
    // This class builds its own message, so every caller words it the same.
    super(`找不到 id 為 ${id} 的待辦事項`);
    this.name = "TodoNotFoundError";
    this.id = id;
  }
}
