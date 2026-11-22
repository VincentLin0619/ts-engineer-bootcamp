// Exercise 01: HTTP vocabulary, checking an unknown body, and turning
// errors into status codes. No server is needed yet.
//
// Replace each `throw new Error("TODO...")` line, then run: bun test day-13

export type CrudLetter = "C" | "R" | "U" | "D";

// Map an HTTP method to the CRUD letter it stands for in a REST API.
// Any other text has no letter.
// crudLetterOf("POST")   -> "C"
// crudLetterOf("GET")    -> "R"
// crudLetterOf("PATCH")  -> "U"
// crudLetterOf("DELETE") -> "D"
// crudLetterOf("HELLO")  -> undefined
export function crudLetterOf(method: string): CrudLetter | undefined {
  // TODO: return the letter for the method
  throw new Error("TODO：尚未完成 crudLetterOf");
}

export type StatusGroup = "success" | "client-error" | "server-error";

// Tell which group a status code belongs to.
// 200-299 -> "success", 400-499 -> "client-error", 500-599 -> "server-error".
// Any other number has no group.
// statusGroupOf(201) -> "success"
// statusGroupOf(404) -> "client-error"
// statusGroupOf(500) -> "server-error"
// statusGroupOf(302) -> undefined
export function statusGroupOf(status: number): StatusGroup | undefined {
  // TODO: return the group for the status code
  throw new Error("TODO：尚未完成 statusGroupOf");
}

// The two error classes below are finished. Do not change them.

// The request body breaks a rule.
export class InvalidBodyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBodyError";
  }
}

// The requested note does not exist.
export class NoteNotFoundError extends Error {
  constructor(id: number) {
    super(`找不到 id 為 ${id} 的筆記`);
    this.name = "NoteNotFoundError";
  }
}

export type NewNote = { text: string; pinned: boolean };

// Check a request body whose type is `unknown` and return a NewNote.
// Rules, checked in this order:
//   1. body must be an object and not null
//        otherwise throw new InvalidBodyError("body 必須是 JSON 物件")
//   2. body.text must be a string
//        otherwise throw new InvalidBodyError("text 必須是文字")
//   3. body.pinned is optional. When it is missing, use false.
//      When it is present it must be a boolean
//        otherwise throw new InvalidBodyError("pinned 必須是 true 或 false")
//
// parseNewNote({ text: "記得帶傘" })               -> { text: "記得帶傘", pinned: false }
// parseNewNote({ text: "記得帶傘", pinned: true }) -> { text: "記得帶傘", pinned: true }
// parseNewNote({ text: 42 })                      -> throws InvalidBodyError
export function parseNewNote(body: unknown): NewNote {
  // TODO: check the body step by step, then return the NewNote
  throw new Error("TODO：尚未完成 parseNewNote");
}

// Decide which status code an error becomes.
// InvalidBodyError  -> 400
// NoteNotFoundError -> 404
// anything else     -> 500
// statusCodeOf(new NoteNotFoundError(7)) -> 404
export function statusCodeOf(error: unknown): number {
  // TODO: use instanceof to tell the errors apart
  throw new Error("TODO：尚未完成 statusCodeOf");
}
