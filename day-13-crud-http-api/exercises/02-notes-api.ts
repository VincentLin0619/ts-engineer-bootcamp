// Exercise 02: build a small HTTP API with Bun.serve and its `routes`.
//
// The API manages notes that are kept in an array in memory.
//
// | Method and path     | Success | What it does                              |
// | ------------------- | ------- | ----------------------------------------- |
// | POST /notes         | 201     | body { "text": string }, replies the note |
// | GET /notes          | 200     | replies every note as an array            |
// | GET /notes/:id      | 200     | replies one note                          |
// | DELETE /notes/:id   | 204     | removes one note, replies no body         |
//
// Errors always reply { "error": string }:
//   400  the body is not valid JSON, is not an object, or `text` is not a
//        string with at least one character
//   404  no note has that id (GET /notes/:id and DELETE /notes/:id)
//   404  no route matches the path
//
// The first note gets id 1, the next one id 2, and so on.
//
// Example:
//   POST /notes  { "text": "記得帶傘" }  -> 201 { "id": 1, "text": "記得帶傘" }
//   GET /notes/1                         -> 200 { "id": 1, "text": "記得帶傘" }
//   GET /notes/9                         -> 404 { "error": "..." }
//
// Biome wants camelCase property names, but HTTP methods are upper case.
// Wrap your `routes` in these two comments to allow them:
//
//   // biome-ignore-start lint/style/useNamingConvention: HTTP methods are upper case
//   routes: { ... },
//   // biome-ignore-end lint/style/useNamingConvention: HTTP methods are upper case

export type Note = { id: number; text: string };

// Starts the server on the given port and returns it.
// The tests pass port 0 and stop the server when they are done.
export function startNotesApi(port: number): Bun.Server<undefined> {
  // The data lives here, so every call to startNotesApi starts empty.
  let notes: Note[] = [];
  let nextId = 1;

  // TODO: return Bun.serve({ port, routes: { ... }, fetch() { ... } })
  throw new Error("TODO：尚未完成 startNotesApi");
}
