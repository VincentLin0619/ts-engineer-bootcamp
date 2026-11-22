import type { Mark, Scene, Slot, TablePanel, TableRow } from "../types.ts";

const COLUMNS = ["id", "title", "done", "priority"];

const row = (cells: string[], mark?: Mark): TableRow => ({
  key: cells[0] ?? "",
  cells,
  ...(mark ? { mark } : {}),
});

const todos = (rows: TableRow[]): TablePanel => ({
  name: "todos",
  columns: COLUMNS,
  rows,
});

// Values handed to the `?` placeholders, in order.
const bound = (...values: Array<[value: string, type: string]>): Slot[] =>
  values.map(([value, type], index) => ({
    name: `第 ${index + 1} 個 ?`,
    value,
    type,
  }));

const changes = (count: string): Slot => ({
  name: "changes",
  value: count,
  type: "number",
  mark: "new",
});

const milk = ["1", "買牛奶", "0", "high"];
const homework = ["2", "寫作業", "0", "medium"];
const homeworkDone = ["2", "寫作業", "1", "medium"];
const trash = ["3", "倒垃圾", "0", "high"];

const scene: Scene = {
  id: "day12-sql-crud",
  title: "四個 SQL 動詞與參數綁定",
  summary:
    "INSERT、SELECT、UPDATE、DELETE 依序作用在 todos 資料表上。看每個 ? 綁定了什麼值，資料表的哪幾列跟著改變。",
  language: "sql",
  code: `CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL
);

-- C = INSERT: add rows.
INSERT INTO todos (title, priority) VALUES (?, ?);

-- R = SELECT: read rows. WHERE keeps only the rows that match.
SELECT id, title, done, priority FROM todos
WHERE priority = ? ORDER BY id;

-- U = UPDATE: change columns of the rows that match WHERE.
UPDATE todos SET done = ? WHERE id = ?;

-- D = DELETE: remove the rows that match WHERE.
DELETE FROM todos WHERE id = ?;`,
  steps: [
    {
      line: [1, 2, 3, 4, 5, 6],
      note: "`CREATE TABLE` 建立 `todos` 資料表：有四個欄，還沒有任何列。",
      table: todos([]),
      vars: [],
    },
    {
      line: 9,
      note: '`insert.run("買牛奶", "high")`：兩個值依序交給兩個 `?`。SQL 文字本身沒有任何值。',
      vars: bound(['"買牛奶"', "string"], ['"high"', "string"]),
    },
    {
      line: 9,
      note: "執行 `INSERT`。SQL 沒有給 `id` 與 `done`：`id` 由 `AUTOINCREMENT` 給 1，`done` 用預設值 0。",
      table: todos([row(milk, "new")]),
    },
    {
      line: 9,
      note: '同一句 SQL 換一組值再執行：`("寫作業", "medium")`，新的一列拿到 id 2。',
      vars: bound(['"寫作業"', "string"], ['"medium"', "string"]),
      table: todos([row(milk), row(homework, "new")]),
    },
    {
      line: 9,
      note: '再執行一次：`("倒垃圾", "high")`，新的一列拿到 id 3。',
      vars: bound(['"倒垃圾"', "string"], ['"high"', "string"]),
      table: todos([row(milk), row(homework), row(trash, "new")]),
    },
    {
      line: [12, 13],
      note: '`SELECT ... WHERE priority = ?` 綁定 `"high"`：只有符合條件的 id 1 與 id 3 被讀出來。',
      vars: bound(['"high"', "string"]),
      table: todos([
        row(milk, "active"),
        row(homework, "dim"),
        row(trash, "active"),
      ]),
    },
    {
      line: 16,
      note: "`update.run(1, 2)`：把 1 和 2 交給這句 `UPDATE` 的兩個 `?`。",
      vars: bound(["1", "number"], ["2", "number"]),
      table: todos([row(milk), row(homework), row(trash)]),
      question: {
        prompt:
          "`UPDATE todos SET done = ? WHERE id = ?` 綁定 `(1, 2)`，會改到什麼？",
        choices: [
          "id 2 那一列的 `done` 改成 1",
          "id 1 那一列的 `done` 改成 2",
          "每一列的 `done` 都改成 1",
        ],
        answer: 0,
        explain:
          "值依照順序對應：第一個值 1 給 `done = ?`，第二個值 2 給 `id = ?`。有 `WHERE` 就只改符合條件的列。",
      },
    },
    {
      line: 16,
      note: "id 2 那一列的 `done` 從 0 變成 1。`changes` 是 1，表示這句 SQL 改到 1 列。",
      vars: [...bound(["1", "number"], ["2", "number"]), changes("1")],
      table: todos([row(milk), row(homeworkDone, "active"), row(trash)]),
    },
    {
      line: 16,
      note: "同一句換成 `update.run(1, 99)`：沒有 id 99 的列。這不算錯誤，只是改到 0 列。",
      vars: [...bound(["1", "number"], ["99", "number"]), changes("0")],
      table: todos([row(milk), row(homeworkDone), row(trash)]),
    },
    {
      line: 19,
      note: "`DELETE FROM todos WHERE id = ?` 綁定 3：`WHERE` 選中 id 3 那一列。",
      vars: bound(["3", "number"]),
      table: todos([row(milk), row(homeworkDone), row(trash, "active")]),
    },
    {
      line: 19,
      note: "id 3 那一列被刪掉，`changes` 是 1。",
      vars: [...bound(["3", "number"]), changes("1")],
      table: todos([row(milk), row(homeworkDone)]),
    },
    {
      line: 9,
      note: '再新增一列：`insert.run("洗碗", "low")`。',
      vars: bound(['"洗碗"', "string"], ['"low"', "string"]),
      question: {
        prompt: "id 3 剛被刪掉。新的這一列 `id` 會是多少？",
        choices: ["`4`", "`3`"],
        answer: 0,
        explain:
          "`AUTOINCREMENT` 給的號碼只會往上加，用過的號碼（包括被刪掉的 3）不會再用。",
      },
    },
    {
      line: 9,
      note: "新的一列拿到 id 4，不是 3。",
      table: todos([
        row(milk),
        row(homeworkDone),
        row(["4", "洗碗", "0", "low"], "new"),
      ]),
    },
  ],
};

export default scene;
