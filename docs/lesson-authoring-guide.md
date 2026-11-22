# 課程撰寫規範

這份文件給「寫課程的人」看，學員不需要讀。新增或修改任何一天的課程前，先讀完這份文件，並把 [`day-01-setup-variables-types/`](../day-01-setup-variables-types/) 當作範本對照。

## 1. 學員設定

- 起點：只寫得出很簡單的 todolist，沒有系統性學過程式。
- 兩週目標：懂 CRUD、物件導向、TypeScript 設計規範。
- 每天 1–3 小時：「必修」約 60 分鐘，「加練」補到 3 小時。
- 每課必備三件事：範例程式、運作圖解、逐步解說。

寫每一句話之前先問：一個只學過前幾天內容的人看得懂嗎？

## 2. 每課資料夾結構

```text
day-NN-topic-name/
  README.md       解說、圖解、逐步步驟
  examples/       可直接 bun run 的範例，檔名 NN-name.ts
  exercises/      練習題 NN-name.ts 與測試 NN-name.test.ts
  solutions/      參考解答，檔名與練習題相同
```

需要多個檔案的 Todo 主線程式放在 `examples/todo/`。

## 3. README 固定段落

依照下列順序，標題文字與 Day 01 一致：

1. `# Day NN — 主題`，下一行用引言標明週次與時間。
2. `## 學習目標`：3–5 點，每點以「能夠做到的事」描述。
3. `## 時間分配`：表格，區分必修與加練。
4. `## 觀念說明`：一個小節講一個觀念。每個觀念先用一兩句白話說明，再給圖解或程式片段。
5. `## 逐步解說`：每個步驟對應一個範例檔。寫出執行指令，再用編號清單逐行說明程式做了什麼。
6. `## 規範重點`：今天內容對應的 TypeScript 寫法規範，每點說明「怎麼寫」與「為什麼」。
7. `## 常見錯誤`：表格，欄位為錯誤訊息或現象、原因、修法。
8. `## 練習`：表格列出練習檔、內容、必修或加練，並附檢查指令。加上「延伸挑戰（加練）」小節。
9. `## 自我檢查清單`：用 `- [ ]` 勾選項目，最後一項固定是 `bun test day-NN` 全部通過。
10. `## 下一課`：連到下一天的 README，用一句話說明今天與明天的關聯。

Day 05 之後，在「觀念說明」之前加一個 `## 今天的 Todo 進度` 小節，用兩三句話說明主線專案今天從什麼狀態演進到什麼狀態。

## 4. 圖解規則

- 每課至少 2 張 Mermaid 圖。程式語法的拆解另外用 `text` 程式碼區塊畫 ASCII 標註圖。
- 可用的圖表類型：`flowchart`、`sequenceDiagram`、`classDiagram`、`stateDiagram-v2`、`erDiagram`。
- 節點文字一律用雙引號包起來，例如 `A["文字（含標點）"]`。換行用 `<br/>`。文字裡要出現雙引號時寫 `&quot;`。
- 不要自訂顏色或主題，GitHub 的深色與淺色模式都要能讀。
- 一張圖不超過 12 個節點。太複雜就拆成兩張。
- 每張圖前面有一句話說明「這張圖在講什麼」，圖後面列出要帶走的重點。
- 每張圖都必須通過 mermaid-cli 轉圖驗證。

## 5. 文字規範

- 繁體中文，台灣用語，語氣專業、精簡、直接。一次只講一個觀念。
- 術語對照：變數、型別、函式、參數、回傳值、陣列、物件、屬性、方法、類別、實例、建構子、介面、繼承、封裝、多型、泛型、模組、例外處理、資料庫、專案。
- 技術名詞保留英文：API、CRUD、JSON、SQL、HTTP、REST、Promise、`async`/`await`、Repository、Service，以及所有程式裡的關鍵字與識別字。
- 術語第一次出現時附上英文，例如「型別推論（type inference）」。
- 不使用還沒教過的觀念。非用不可時明講「先照抄，Day NN 會解釋」。各天已教內容見第 9 節。

## 6. 程式規範

- 程式碼註解一律用英文。
- 給學員看的字串用繁體中文：`console.log` 的輸出、測試名稱、錯誤訊息、待辦事項的內容。
- 識別字用英文：變數與函式 camelCase，型別、類別、介面 PascalCase，全域常數 CONSTANT_CASE。
- 檔名用 kebab-case，例如 `todo-service.ts`。
- 預設用 `const`。不用 `var`、不用 `any`、不用非空斷言 `!`、不用 `as` 強制轉型（`as const` 除外）。
- 匯出的函式一律寫出參數型別與回傳型別。
- `import` 路徑要寫 `.ts` 副檔名。只匯入型別時用 `import type`。
- 不安裝任何外部套件，只用 bun 內建功能與 `node:` 標準模組。bun 的 API 以 `node_modules/bun-types/docs/` 內的文件為準。
- 範例檔開頭用註解寫出從專案根目錄執行的完整指令。
- 範例必須能自己跑完並結束。需要輸入的範例要能用管線輸入驗證，例如 `printf 'list\nquit\n' | bun run ...`。
- 執行時產生的檔案（JSON、SQLite）一律寫到該課資料夾下的 `.data/`，這個資料夾已被 git 忽略。
- 故意示範型別錯誤時，用 `// @ts-expect-error -- 說明` 讓整個專案仍能通過檢查，並在 README 引導學員拿掉註解觀察錯誤。

## 7. 練習機制

- 每課 2 個必修練習＋1 個加練練習。
- `exercises/NN-name.ts`：題目。要學員完成的地方用 `// TODO:` 標示，函式本體先寫 `throw new Error("TODO：尚未完成 <名稱>");`。題目說明用英文註解，並附上輸入輸出範例。
- `exercises/NN-name.test.ts`：測試。用 `support/load-exercise.ts` 的 `loadExercise` 載入題目：

  ```ts
  import { describe, expect, test } from "bun:test";
  import { loadExercise } from "../../support/load-exercise.ts";

  const { describeCourse } = await loadExercise<
    typeof import("./02-sentences.ts")
  >(import.meta.dir, "02-sentences");
  ```

- `solutions/NN-name.ts`：參考解答，匯出的名稱與型別和題目完全相同。解答需要的輔助檔案也放在 `solutions/` 裡，不可以引用 `exercises/`。
- 未作答時 `bun test day-NN` 應該失敗；`SOLUTIONS=1 bun test day-NN` 必須全部通過。
- 練習要用到當天教的每一個重點，難度由淺入深。加練題把當天內容接到 Todo 主線上。

## 8. Todo 主線規格

主線專案是同一個 Todo App，每天演進一步。各天的型別與函式簽名以這一節為準，名稱不可自行更改，這樣前後幾天的程式才接得起來。

### Day 02–04：資料型別與輔助函式

```ts
type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};
```

- Day 02：定義上述型別，建立幾筆 `Todo` 資料與 `Todo[]`。
- Day 03：`formatTodo(todo: Todo): string`、`priorityLabel(priority: Priority): string`、`countDone(todos: Todo[]): number`（用迴圈）。Day 04 起 `countDone` 的參數改為 `readonly Todo[]`。
- `priorityLabel` 把 `"low"`／`"medium"`／`"high"` 對應到 `"低"`／`"中"`／`"高"`。
- 一筆待辦事項印成一行純文字時，全課程固定用 `formatTodo` 的格式：`[x] #2 寫作業（優先度：中）`、`[ ] #1 買牛奶（優先度：高）`。之後每一天的 CLI 與 `PlainTextFormatter` 都沿用這個格式。
- Day 04：用陣列方法改寫與擴充，例如篩選未完成、取出標題、統計；`toggleDone(todo: Todo): Todo` 回傳新物件，不修改原物件。

### Day 05：函式版 CRUD（單一檔案，資料放在記憶體）

```ts
type NewTodo = { title: string; priority: Priority };
type TodoChanges = { title?: string; done?: boolean; priority?: Priority };

function nextId(todos: readonly Todo[]): number;
function createTodo(todos: readonly Todo[], input: NewTodo): Todo[]; // C
function findTodoById(todos: readonly Todo[], id: number): Todo | undefined; // R
function updateTodo(
  todos: readonly Todo[],
  id: number,
  changes: TodoChanges,
): Todo[]; // U
function deleteTodo(todos: readonly Todo[], id: number): Todo[]; // D
```

- 所有函式都回傳新陣列，不修改傳入的陣列。找不到 `id` 時 `updateTodo` 與 `deleteTodo` 回傳內容相同的陣列。
- 另外做一個互動式 CLI：用 `prompt()` 讀取指令，支援 `add <標題>`、`list`、`done <id>`、`rm <id>`、`quit`。
- 這一天還沒教模組，CLI 檔案直接把 CRUD 函式複製一份。這個重複是刻意的，用來引出 Day 06。

### Day 06：拆成模組、加上錯誤處理與測試

```text
examples/todo/
  types.ts        Priority, Todo, NewTodo, TodoChanges
  validation.ts   validateTitle(title: string): string
  store.ts        Day 05 的 CRUD 函式
  store.test.ts   bun:test 測試
  cli.ts          互動式 CLI，import 上面的模組
```

- `validateTitle` 去掉前後空白；結果是空字串或超過 100 個字時 `throw new Error(...)`；否則回傳處理後的標題。
- `updateTodo` 與 `deleteTodo` 找不到 `id` 時改為 `throw new Error("找不到 id 為 N 的待辦事項")`。
- 這一天只用內建的 `Error`，自訂錯誤類別留到 Day 10。

### Day 07：依規範重構

- 沿用 Day 06 的結構與簽名。重點是 strict 設定、命名、`unknown` 與 `any`、`readonly`、`as const`、Biome 與 `bun fmt`。
- 提供一份「不合規範」的程式讓學員逐項修正。

### Day 08：類別與封裝

```ts
type TodoData = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

class Todo {
  readonly id: number;
  #title: string;
  #done: boolean;
  #priority: Priority;

  constructor(id: number, title: string, priority?: Priority, done?: boolean);

  get title(): string;
  get done(): boolean;
  get priority(): Priority;

  rename(title: string): void;
  complete(): void;
  reopen(): void;
  changePriority(priority: Priority): void;

  toData(): TodoData;
  static fromData(data: TodoData): Todo;
}
```

Day 08 起，主線程式放在 `examples/todo/`，檔名固定如下。每一天把前一天的檔案完整帶過來，再加上當天的新檔案：

```text
examples/todo/
  todo.ts                         Priority, TodoData, Todo            Day 08 起
  todo-repository.ts              NewTodo, TodoRepository             Day 09 起
  in-memory-todo-repository.ts    InMemoryTodoRepository              Day 09 起
  errors.ts                       ValidationError, TodoNotFoundError  Day 10 起
  todo-service.ts                 TodoFilter, TodoService             Day 10 起
  cli.ts                          互動式 CLI                          Day 10 起
  json-file-todo-repository.ts    JsonFileTodoRepository              Day 11 起
  sqlite-todo-repository.ts       SqliteTodoRepository                Day 12 起
  http-api.ts                     HTTP 路由                           Day 13 起
```

- 第 1 週的純資料型別 `Todo` 從這天起改名為 `TodoData`，`Todo` 這個名字留給類別。
- 私有成員一律用 `#`。課文要說明 `#` 與 `private` 關鍵字的差別，以及本課程為何選 `#`。
- `priority` 預設 `"medium"`，`done` 預設 `false`。
- 建構子與 `rename` 都要驗證標題：去掉前後空白，1–100 個字。Day 08 與 Day 09 驗證失敗時 `throw new Error(...)`，Day 10 起改丟 `ValidationError`。

### Day 09：介面、抽象類別、多型

```ts
type NewTodo = { title: string; priority: Priority };

interface TodoRepository {
  create(input: NewTodo): Todo; // C
  findAll(): Todo[]; // R
  findById(id: number): Todo | undefined; // R
  save(todo: Todo): void; // U
  delete(id: number): boolean; // D，回傳是否真的刪到東西
}

class InMemoryTodoRepository implements TodoRepository {}
```

- `id` 由 Repository 產生，從 1 開始遞增。
- 抽象類別用另一個例子示範：`abstract class TodoFormatter`，子類別 `PlainTextFormatter` 與 `MarkdownFormatter`。

### Day 10：繼承與組合、分層架構

```ts
class ValidationError extends Error {}
class TodoNotFoundError extends Error {
  readonly id: number;
}

type TodoFilter = "all" | "open" | "done";

class TodoService {
  constructor(repository: TodoRepository);

  add(title: string, priority?: Priority): Todo;
  list(filter?: TodoFilter): Todo[];
  complete(id: number): Todo;
  rename(id: number, title: string): Todo;
  remove(id: number): void;
}
```

- 分層：CLI → `TodoService` → `TodoRepository` → 儲存位置。相依方向只能由上往下。
- `Todo` 負責自己的資料正確（標題規則，丟 `ValidationError`）。
- `TodoService` 負責跨多筆資料的規則：不能有兩筆「未完成且標題相同」的待辦事項（丟 `ValidationError`）；找不到 `id` 丟 `TodoNotFoundError`。

### Day 11：非同步與 JSON 檔案

- `TodoRepository` 的每個方法改為回傳 `Promise`：`create(input): Promise<Todo>`、`findAll(): Promise<Todo[]>`、`findById(id): Promise<Todo | undefined>`、`save(todo): Promise<void>`、`delete(id): Promise<boolean>`。
- `TodoService` 的每個方法跟著改成 `async`，回傳型別包上 `Promise`。
- 新增 `JsonFileTodoRepository`，建構子接收檔案路徑，內容是 `TodoData[]` 的 JSON。`InMemoryTodoRepository` 保留並改成非同步版本。

### Day 12：SQL 與 SQLite

```sql
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL
);
```

- 新增 `SqliteTodoRepository`，建構子接收 `bun:sqlite` 的 `Database`。
- 四個 SQL 動詞對應 CRUD：`INSERT`、`SELECT`、`UPDATE`、`DELETE`。一律用參數綁定，不可把值拼進 SQL 字串。
- 資料表的 `done` 是 0 或 1，讀出來要轉成 `boolean`；`priority` 是文字，讀出來要用型別守衛確認是 `Priority`。
- `TodoService` 一行都不用改，這是這一天要讓學員看到的重點。

### Day 13：HTTP API

| 方法與路徑          | CRUD | 成功狀態碼 | 說明                                               |
| ------------------- | ---- | ---------- | -------------------------------------------------- |
| `POST /todos`       | C    | 201        | body：`{ "title": string, "priority"?: Priority }` |
| `GET /todos`        | R    | 200        | 可加 `?filter=all｜open｜done`                     |
| `GET /todos/:id`    | R    | 200        |                                                    |
| `PATCH /todos/:id`  | U    | 200        | body：`{ "title"?: string, "done"?: boolean }`     |
| `DELETE /todos/:id` | D    | 204        |                                                    |

- 用 `Bun.serve` 的 `routes`。回應一律是 JSON，內容是 `TodoData`。
- 錯誤回應格式 `{ "error": string }`：`ValidationError` 與格式錯誤的 body 回 400，`TodoNotFoundError` 回 404。
- request body 的型別是 `unknown`，要先檢查再使用。
- 測試用 `port: 0` 啟動伺服器，測完關閉。

### Day 14：泛型、discriminated union、總複習

```ts
interface Repository<TEntity, TNew> {
  create(input: TNew): Promise<TEntity>;
  findAll(): Promise<TEntity[]>;
  findById(id: number): Promise<TEntity | undefined>;
  save(entity: TEntity): Promise<void>;
  delete(id: number): Promise<boolean>;
}

type TodoRepository = Repository<Todo, NewTodo>;

type Result<TValue, TError> =
  { ok: true; value: TValue } | { ok: false; error: TError };
```

- 另外介紹工具型別 `Partial`、`Pick`、`Omit`、`Readonly`，以及用 `never` 做窮盡檢查。
- 最後放完整架構圖、兩週成果驗收清單，並連到根目錄的 `ROADMAP.md`。

## 9. 各天已教內容

寫第 N 天時，只能假設學員會第 1 到 N−1 天的內容。

| Day | 教完之後學員會的東西                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01  | `console.log`、`const`／`let`、`string`／`number`／`boolean`、樣板字串、`typeof`、`Number()`／`String()`、讀型別錯誤                                   |
| 02  | 物件型別、陣列型別與索引、`.length`、`type`、`interface`、選用屬性、union、literal type、`undefined`／`null`、最基本的 `if` 型別縮小                   |
| 03  | `if`／`else`、比較與邏輯運算、三元運算、`switch`、`for`／`for...of`／`while`、`push`、函式宣告與箭頭函式、參數與回傳型別、預設參數、作用域、call stack |
| 04  | `map`／`filter`／`find`／`some`／`every`／`reduce`、展開與解構、值與參考、不可變更新、`readonly`                                                       |
| 05  | CRUD 的定義、用函式操作記憶體中的陣列、產生 `id`、`prompt()` 互動                                                                                      |
| 06  | `export`／`import`／`import type`、檔案拆分、`throw`、`try`／`catch`、`unknown` 的錯誤物件、`bun:test`                                                 |
| 07  | strict 各選項、命名規範、`any` 與 `unknown`、`as const`、Biome、`bun fmt`                                                                              |
| 08  | `class`、建構子、屬性與方法、`this`、`#` 私有成員、getter、`static`                                                                                    |
| 09  | `interface` 作為合約、`implements`、`abstract`、多型                                                                                                   |
| 10  | `extends`、`super`、繼承與組合的取捨、分層架構、相依注入、自訂錯誤類別                                                                                 |
| 11  | 同步與非同步、Promise、`async`／`await`、event loop、`Promise.all`、檔案讀寫                                                                           |
| 12  | 資料表、`CREATE TABLE`、`INSERT`／`SELECT`／`UPDATE`／`DELETE`、參數綁定、`bun:sqlite`                                                                 |
| 13  | HTTP 方法與狀態碼、REST、`Bun.serve`、`fetch`、驗證 `unknown` 輸入                                                                                     |
| 14  | 泛型、discriminated union、工具型別、`never` 窮盡檢查                                                                                                  |

## 10. 驗證

每寫完一天，在專案根目錄執行，全部都要通過：

```bash
bun fmt day-NN-topic-name                     # 排版
bun check day-NN-topic-name                   # 型別檢查
bunx biome check day-NN-topic-name            # lint，不可以有 error、warning、info
SOLUTIONS=1 bun test day-NN                   # 參考解答必須全過
bun test day-NN                               # 未作答的題目必須失敗
```

另外逐一執行 `examples/` 裡的每個檔案，確認輸出與 README 的說明一致，並驗證每張 Mermaid 圖。

整個專案的總檢查：

```bash
bun run verify
```

## 11. 網站動畫

每一課在網站上都可以嵌入程式執行動畫。新增動畫的方法、課文裡的標記寫法與驗證方式，見 [`animation-authoring-guide.md`](animation-authoring-guide.md)。

- 動畫放在它所演示的觀念說明與圖解之後。
- 改了範例程式時，同步檢查有沒有動畫節錄了那段程式，一起更新。
