// Reference solution for exercise 01.

export type CrudLetter = "C" | "R" | "U" | "D";

export function crudLetterOf(method: string): CrudLetter | undefined {
  switch (method) {
    case "POST":
      return "C";
    case "GET":
      return "R";
    case "PATCH":
      return "U";
    case "DELETE":
      return "D";
    default:
      return undefined;
  }
}

export type StatusGroup = "success" | "client-error" | "server-error";

export function statusGroupOf(status: number): StatusGroup | undefined {
  // The first digit decides the group: 2xx, 4xx, 5xx.
  if (status >= 200 && status <= 299) {
    return "success";
  }
  if (status >= 400 && status <= 499) {
    return "client-error";
  }
  if (status >= 500 && status <= 599) {
    return "server-error";
  }
  return undefined;
}

export class InvalidBodyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBodyError";
  }
}

export class NoteNotFoundError extends Error {
  constructor(id: number) {
    super(`找不到 id 為 ${id} 的筆記`);
    this.name = "NoteNotFoundError";
  }
}

export type NewNote = { text: string; pinned: boolean };

export function parseNewNote(body: unknown): NewNote {
  // 1. typeof null is "object" too, so null needs its own check.
  if (typeof body !== "object" || body === null) {
    throw new InvalidBodyError("body 必須是 JSON 物件");
  }
  // 2. `in` proves the property exists, typeof proves it is text.
  if (!("text" in body) || typeof body.text !== "string") {
    throw new InvalidBodyError("text 必須是文字");
  }
  // 3. A missing pinned falls back to false.
  const pinned = "pinned" in body ? body.pinned : false;
  if (typeof pinned !== "boolean") {
    throw new InvalidBodyError("pinned 必須是 true 或 false");
  }
  return { text: body.text, pinned };
}

export function statusCodeOf(error: unknown): number {
  if (error instanceof InvalidBodyError) {
    return 400;
  }
  if (error instanceof NoteNotFoundError) {
    return 404;
  }
  // An error nobody planned for is the server's fault.
  return 500;
}
