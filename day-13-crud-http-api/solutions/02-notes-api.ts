// Reference solution for exercise 02.

export type Note = { id: number; text: string };

// The request is wrong: answered with 400.
class BadRequestError extends Error {}

// The note does not exist: answered with 404.
class NotFoundError extends Error {}

function errorResponse(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

// Reads the body and returns the text of the new note, or throws.
async function readNoteText(request: Request): Promise<string> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BadRequestError("body 必須是合法的 JSON");
  }
  if (typeof body !== "object" || body === null) {
    throw new BadRequestError("body 必須是 JSON 物件");
  }
  if (!("text" in body) || typeof body.text !== "string") {
    throw new BadRequestError("text 必須是文字");
  }
  if (body.text.length === 0) {
    throw new BadRequestError("text 不可以是空的");
  }
  return body.text;
}

export function startNotesApi(port: number): Bun.Server<undefined> {
  // `let`, because deleting a note replaces the array with a new one.
  let notes: Note[] = [];
  let nextId = 1;

  // Shared by GET /notes/:id and DELETE /notes/:id.
  function findNote(idText: string): Note {
    const id = Number(idText);
    const note = notes.find((item) => item.id === id);
    if (note === undefined) {
      throw new NotFoundError(`找不到 id 為 ${idText} 的筆記`);
    }
    return note;
  }

  return Bun.serve({
    port,
    // biome-ignore-start lint/style/useNamingConvention: HTTP methods are upper case
    routes: {
      "/notes": {
        POST: async (request) => {
          const note: Note = { id: nextId, text: await readNoteText(request) };
          nextId += 1;
          notes.push(note);
          return Response.json(note, { status: 201 });
        },
        GET: () => Response.json(notes),
      },
      "/notes/:id": {
        GET: (request) => Response.json(findNote(request.params.id)),
        DELETE: (request) => {
          const note = findNote(request.params.id);
          notes = notes.filter((item) => item.id !== note.id);
          return new Response(null, { status: 204 });
        },
      },
    },
    // biome-ignore-end lint/style/useNamingConvention: HTTP methods are upper case
    // No route matched.
    fetch() {
      return errorResponse(404, "找不到這個路徑");
    },
    // A route handler threw: decide the status code in one place.
    error(error) {
      if (error instanceof BadRequestError) {
        return errorResponse(400, error.message);
      }
      if (error instanceof NotFoundError) {
        return errorResponse(404, error.message);
      }
      console.error(error);
      return errorResponse(500, "伺服器發生未預期的錯誤");
    },
  });
}
