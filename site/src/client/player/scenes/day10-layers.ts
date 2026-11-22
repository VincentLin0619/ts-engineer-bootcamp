import type { LanesPanel, Scene, Token } from "../types.ts";

const LANES = ["CLI", "TodoService", "TodoRepository"];

// The message is in lane `token.at`, and that lane is highlighted.
const at = (token: Token): LanesPanel => ({
  lanes: LANES,
  active: token.at,
  token,
});

const scene: Scene = {
  id: "day10-layers",
  title: "一個指令怎麼穿過各層",
  summary:
    "done 1 從 CLI 一路往下到 Repository 再回來；done 99 找不到資料，TodoNotFoundError 從 Service 往上傳回 CLI。",
  code: `// cli.ts: runCommand(), the "done" command
const todo = service.complete(parseId(rest));
console.log(\`已完成 \${formatTodo(todo)}\`);

// todo-service.ts
complete(id: number): Todo {
  const todo = this.#findOrThrow(id);
  todo.complete();
  this.#repository.save(todo);
  return todo;
}
#findOrThrow(id: number): Todo {
  const todo = this.#repository.findById(id);
  if (todo === undefined) {
    throw new TodoNotFoundError(id);
  }
  return todo;
}

// cli.ts: main() catches the error and calls reportError(error)
if (error instanceof ValidationError) {
  console.log(\`輸入有誤：\${error.message}\`);
} else if (error instanceof TodoNotFoundError) {
  console.log(\`找不到 #\${error.id}，輸入 list 看有哪些待辦事項\`);
}`,
  steps: [
    {
      line: 2,
      note: '已經用 `add 買牛奶` 新增了 #1，現在輸入 `done 1`。CLI 用 `parseId` 把文字 `"1"` 轉成數字 1，準備呼叫 `service.complete(1)`。',
      lanes: at({ at: 0, label: "complete(1)", kind: "request" }),
    },
    {
      line: 6,
      note: "呼叫往下一層：TodoService 的 `complete(1)` 開始執行。",
      lanes: at({ at: 1, label: "complete(1)", kind: "request" }),
    },
    {
      line: 7,
      note: "第一步「找出來」：交給私有方法 `#findOrThrow(1)`，還在 TodoService 這一層。",
      lanes: at({ at: 1, label: "#findOrThrow(1)", kind: "request" }),
    },
    {
      line: 13,
      note: "`#findOrThrow` 再往下一層，請 Repository `findById(1)`。",
      lanes: at({ at: 2, label: "findById(1)", kind: "request" }),
    },
    {
      line: [13, 17],
      note: "Repository 找到 id 1，交回一個 `Todo` 複本。它不是 `undefined`，`#findOrThrow` 把它交回 `complete`。",
      lanes: at({ at: 1, label: "Todo #1（複本）", kind: "response" }),
    },
    {
      line: 8,
      note: "第二步「請 Todo 自己改」：`todo.complete()` 把手上這個 Todo 的 `#done` 改成 `true`。",
      question: {
        prompt:
          "`todo.complete()` 執行完，Repository 存的那一筆也變成已完成了嗎？",
        choices: [
          "還沒有，要等第 9 行 `save(todo)` 存回去",
          "已經變了，因為 `todo` 就是 Repository 裡的那一筆",
        ],
        answer: 0,
        explain:
          "Repository 交出來的是新建立的複本（Day 09）。改了複本之後，要 `save()` 才會存回去。",
      },
    },
    {
      line: 9,
      note: "第三步「存回去」：`save(todo)` 往下交給 Repository，Repository 存的那一筆現在才變成已完成。",
      lanes: at({ at: 2, label: "save(todo)", kind: "request" }),
    },
    {
      line: 9,
      note: "Repository 存好了，回到 TodoService。",
      lanes: at({ at: 1, label: "存好了", kind: "response" }),
    },
    {
      line: 10,
      note: "`return todo`：結果往上一層，交回 CLI。",
      lanes: at({ at: 0, label: "Todo #1（已完成）", kind: "response" }),
    },
    {
      line: 3,
      note: "CLI 負責把結果變成文字，印出「已完成」那一行。",
      print: "已完成 [x] #1 買牛奶（優先度：中）",
    },
    {
      line: 2,
      note: "再輸入 `done 99`。同一條路：CLI 呼叫 `service.complete(99)`。",
      lanes: at({ at: 0, label: "complete(99)", kind: "request" }),
    },
    {
      line: 13,
      note: "經過 `complete` 與 `#findOrThrow`，往下請 Repository `findById(99)`。",
      lanes: at({ at: 2, label: "findById(99)", kind: "request" }),
    },
    {
      line: 13,
      note: "Repository 找不到 id 99。它不判斷這算不算錯，只回報 `undefined`。",
      lanes: at({ at: 1, label: "undefined", kind: "response" }),
      question: {
        prompt: "`todo` 是 `undefined`。接下來會發生什麼？",
        choices: [
          "第 15 行丟出 `TodoNotFoundError`，錯誤往上傳回 CLI",
          "`#findOrThrow` 回傳 `undefined`，`complete` 繼續執行第 8 行",
          "CLI 收到 `undefined`，印出「已完成 undefined」",
        ],
        answer: 0,
        explain:
          "「`id` 必須存在」是 TodoService 的規則：`#findOrThrow` 看到 `undefined` 就丟出錯誤，後面的程式都不會執行。",
      },
    },
    {
      line: 15,
      note: "`throw new TodoNotFoundError(99)`：錯誤在發現問題的這一層丟出。",
      lanes: at({ at: 1, label: "TodoNotFoundError", kind: "error" }),
    },
    {
      line: 20,
      note: "`complete` 裡沒有 `try`／`catch`，錯誤直接穿過它往上，第 8–10 行都不會執行。CLI 的 `main()` 用 `catch` 接住，交給 `reportError`。",
      lanes: at({ at: 0, label: "TodoNotFoundError", kind: "error" }),
    },
    {
      line: [23, 24],
      note: "`reportError` 用 `instanceof` 認出這是 `TodoNotFoundError`，讀 `error.id` 印出提示。",
      print: "找不到 #99，輸入 list 看有哪些待辦事項",
    },
  ],
};

export default scene;
