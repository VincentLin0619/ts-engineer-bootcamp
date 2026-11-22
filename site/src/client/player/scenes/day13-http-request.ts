import type { LanesPanel, Scene, Token } from "../types.ts";

const LANES = [
  "client",
  "Bun.serve 路由",
  "TodoService",
  "SqliteTodoRepository",
  "SQLite",
];

// The message is in lane `token.at`, and that lane is highlighted.
const at = (token: Token): LanesPanel => ({
  lanes: LANES,
  active: token.at,
  token,
});

const scene: Scene = {
  id: "day13-http-request",
  title: "一個 HTTP request 的來回",
  summary:
    "POST /todos 從 client 一路往下到 SQLite，帶著 201 回來；GET /todos/99 找不到資料，錯誤變成 404 回到 client。",
  code: `Bun.serve({
  routes: {
    "/todos": {
      POST: async (request) => {
        const input = parseNewTodoBody(await readJsonBody(request));
        const todo = await service.add(input.title, input.priority);
        return Response.json(todo.toData(), { status: 201 });
      },
    },
    "/todos/:id": {
      GET: async (request) => {
        const todo = await service.get(parseId(request.params.id));
        return Response.json(todo.toData());
      },
    },
  },
  error(error) {
    return toErrorResponse(error);
  },
});

// toErrorResponse(error): the branch for TodoNotFoundError
if (error instanceof TodoNotFoundError) {
  return errorResponse(404, error.message);
}`,
  steps: [
    {
      line: null,
      note: '資料表原本是空的。client 送出 `POST /todos`，body 是 JSON 文字 `{"title":"買牛奶"}`。',
      lanes: at({ at: 0, label: "POST /todos", kind: "request" }),
    },
    {
      line: [3, 4],
      note: "Bun.serve 比對路徑 `/todos` 與方法 `POST`，交給這個 handler。",
      lanes: at({ at: 1, label: "POST /todos", kind: "request" }),
    },
    {
      line: 5,
      note: 'body 先讀成 `unknown`，再交給 `parseNewTodoBody` 檢查。通過之後得到 `{ title: "買牛奶" }`。',
      lanes: at({ at: 1, label: '{ title: "買牛奶" }', kind: "request" }),
    },
    {
      line: 6,
      note: '呼叫 `service.add("買牛奶")`，往下交給 TodoService。HTTP 層到這裡就不管規則了。',
      lanes: at({ at: 2, label: 'add("買牛奶")', kind: "request" }),
    },
    {
      line: 6,
      note: "TodoService 確認沒有同名的未完成待辦事項（這一段來回先省略），請 Repository `create`。",
      lanes: at({ at: 3, label: "create(...)", kind: "request" }),
    },
    {
      line: 6,
      note: "Repository 把它變成一句 `INSERT`，值用參數綁定交給 SQLite。",
      lanes: at({ at: 4, label: "INSERT", kind: "request" }),
    },
    {
      line: 6,
      note: "SQLite 新增一列，回報新的 id 是 1。",
      lanes: at({ at: 3, label: "id: 1", kind: "response" }),
    },
    {
      line: 6,
      note: "Repository 用新的 id 建立 `Todo` 實例，TodoService 原封不動交回 handler，存進 `todo`。",
      lanes: at({ at: 1, label: "Todo #1", kind: "response" }),
    },
    {
      line: 7,
      note: "`todo.toData()` 轉成純資料，`Response.json` 轉成 JSON 文字，狀態碼 201。response 回到 client。",
      lanes: at({ at: 0, label: "201 Created", kind: "response" }),
      print: [
        "POST /todos",
        '  -> 201 {"id":1,"title":"買牛奶","done":false,"priority":"medium"}',
      ],
    },
    {
      line: null,
      note: "第二個 request：client 送出 `GET /todos/99`。",
      lanes: at({ at: 0, label: "GET /todos/99", kind: "request" }),
    },
    {
      line: [10, 11],
      note: "路徑 `/todos/:id` 符合，`:id` 這個位置的內容放在 `request.params.id`。",
      lanes: at({ at: 1, label: "GET /todos/99", kind: "request" }),
      question: {
        prompt: "`request.params.id` 拿到的是什麼？",
        choices: ['文字 `"99"`', "數字 `99`"],
        answer: 0,
        explain:
          "網址裡的每一部分都是文字，所以要交給 `parseId` 轉成數字並檢查。",
      },
    },
    {
      line: 12,
      note: '`parseId` 把文字 `"99"` 轉成數字 99，呼叫 `service.get(99)`。',
      lanes: at({ at: 2, label: "get(99)", kind: "request" }),
    },
    {
      line: 12,
      note: "TodoService 的 `#findOrThrow` 請 Repository `findById(99)`。",
      lanes: at({ at: 3, label: "findById(99)", kind: "request" }),
    },
    {
      line: 12,
      note: "Repository 執行 `SELECT ... WHERE id = ?`，綁定 99。",
      lanes: at({ at: 4, label: "SELECT", kind: "request" }),
    },
    {
      line: 12,
      note: "沒有符合的列，`get()` 得到 `null`。Repository 換成合約規定的 `undefined`，交回 TodoService。",
      lanes: at({ at: 2, label: "undefined", kind: "response" }),
      question: {
        prompt: "TodoService 拿到 `undefined`。client 最後會收到什麼？",
        choices: [
          '404，body 是 `{ "error": "找不到 id 為 99 的待辦事項" }`',
          "200，body 是 `null`",
          "500，因為程式丟出了錯誤",
        ],
        answer: 0,
        explain:
          "`#findOrThrow` 丟出 `TodoNotFoundError`，`toErrorResponse` 把這種錯誤對應到 404。只有沒預料到的錯誤才是 500。",
      },
    },
    {
      line: 12,
      note: "`#findOrThrow` 看到 `undefined`，丟出 `TodoNotFoundError`。",
      lanes: at({ at: 2, label: "TodoNotFoundError", kind: "error" }),
    },
    {
      line: [17, 18],
      note: "handler 裡沒有 `try`／`catch`，第 13 行不會執行。錯誤交給 Bun.serve 的 `error(error)`，再交給 `toErrorResponse`。",
      lanes: at({ at: 1, label: "TodoNotFoundError", kind: "error" }),
    },
    {
      line: [23, 24],
      note: '`TodoNotFoundError` 對應到 404，body 是 `{ "error": 訊息 }`。response 回到 client。',
      lanes: at({ at: 0, label: "404 Not Found", kind: "error" }),
      print: [
        "GET /todos/99",
        '  -> 404 {"error":"找不到 id 為 99 的待辦事項"}',
      ],
    },
  ],
};

export default scene;
