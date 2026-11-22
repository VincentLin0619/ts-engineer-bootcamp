# TypeScript 工程師基礎課程

兩週、每天 1–3 小時的軟體工程入門課程。從「只會寫簡單的 todolist」出發，學會三件事：

1. **CRUD**：資料的新增、讀取、更新、刪除，從記憶體、檔案、資料庫一路做到 HTTP API。
2. **物件導向**：類別、封裝、介面、多型、繼承與組合、分層架構。
3. **TypeScript 設計規範**：型別系統怎麼用、程式怎麼命名與排版、工具怎麼把關。

每一天都包含範例程式、運作圖解、逐步解說，以及附自動檢查的練習題。

**課程網站：<https://vincentlin0619.github.io/ts-engineer-bootcamp/>**

網站和這個 repo 是同一份課文。差別在於網站上的每一課都有程式執行動畫：程式一步一步跑，畫面上同時顯示變數、call stack、記憶體怎麼變化。播放到一半還會停下來，讓你先猜下一步的結果。課文裡以「▶ 動畫演示」開頭的連結，就是連到網站上對應的動畫。

這兩週是第一階段。學完之後的方向見 [`ROADMAP.md`](ROADMAP.md)。

## 開始之前

需要安裝 [Bun](https://bun.com)（本課程以 1.4 版撰寫）。在專案根目錄執行一次：

```bash
bun install
```

## 課綱

整個課程圍繞同一個 Todo App。它從 Day 05 的幾個函式開始，每天多學一個觀念就演進一步，最後成為有資料庫、有 HTTP API 的分層架構程式。

### 第 1 週：TypeScript 基礎與第一版 CRUD

| 完成 | Day                                           | 主題                                             | Todo 進度               |
| ---- | --------------------------------------------- | ------------------------------------------------ | ----------------------- |
| ☐    | [01](day-01-setup-variables-types/README.md)  | 環境、變數與基本型別                             | —                       |
| ☐    | [02](day-02-type-system/README.md)            | 型別系統：物件、陣列、union、`type`／`interface` | 定義 `Todo` 型別        |
| ☐    | [03](day-03-control-flow-functions/README.md) | 流程控制與函式                                   | 第一批 Todo 輔助函式    |
| ☐    | [04](day-04-arrays-immutability/README.md)    | 陣列操作與不可變性                               | 篩選、統計 Todo         |
| ☐    | [05](day-05-crud-in-memory/README.md)         | CRUD（一）：記憶體版                             | 函式版 CRUD＋互動式 CLI |
| ☐    | [06](day-06-modules-errors-testing/README.md) | 模組、錯誤處理與測試                             | 拆成模組、加上測試      |
| ☐    | [07](day-07-ts-conventions-1/README.md)       | TypeScript 設計規範（一）＋第 1 週複習           | 依規範重構              |

### 第 2 週：物件導向、資料持久化與 API

| 完成 | Day                                              | 主題                                 | Todo 進度             |
| ---- | ------------------------------------------------ | ------------------------------------ | --------------------- |
| ☐    | [08](day-08-oop-classes/README.md)               | 物件導向（一）：類別與封裝           | `Todo` 類別           |
| ☐    | [09](day-09-oop-interfaces/README.md)            | 物件導向（二）：介面、抽象、多型     | `TodoRepository` 介面 |
| ☐    | [10](day-10-oop-composition-layers/README.md)    | 物件導向（三）：繼承與組合、分層架構 | `TodoService`         |
| ☐    | [11](day-11-async-file-persistence/README.md)    | 非同步與檔案持久化                   | 資料存進 JSON 檔      |
| ☐    | [12](day-12-crud-sql/README.md)                  | CRUD（二）：SQL 與資料庫             | 資料存進 SQLite       |
| ☐    | [13](day-13-crud-http-api/README.md)             | CRUD（三）：HTTP API                 | REST API              |
| ☐    | [14](day-14-ts-conventions-2-capstone/README.md) | TypeScript 設計規範（二）＋總複習    | 成果驗收              |

完成一天就把該列的 ☐ 改成 ☑。網站首頁的課綱也可以勾選，進度只存在你的瀏覽器裡。

### LeetCode 副線

十題經典的 Easy 題，當作每天的加練。每一題都標著「建議在 Day NN 之後」，主線學到哪裡就做到哪裡。題目、思路、兩種解法、可以自己改輸入的動畫，以及附測試的練習，都在 [`leetcode/`](leetcode/README.md)。

```bash
bun test leetcode/0001   # 檢查某一題的練習
```

## 每天怎麼上課

每一天的資料夾結構都相同：

```text
day-05-crud-in-memory/
  README.md     當天的課文：觀念、圖解、逐步解說
  examples/     可以直接執行的範例程式
  exercises/    練習題與自動測試
  solutions/    參考解答
```

建議的流程：

1. 讀 `README.md` 的「觀念說明」，看懂每一張圖，並在網站上播放對應的動畫。
2. 照著「逐步解說」一個一個執行 `examples/` 裡的範例，對照課文理解每一行。
3. 動手改範例：改一個值、故意寫錯，觀察結果有什麼不同。
4. 做 `exercises/` 裡的練習，用測試檢查答案。
5. 勾完「自我檢查清單」，再進入下一天。

每天的內容分成兩層：

- **必修**：約 60 分鐘，一定要完成。
- **加練**：把時間補到 3 小時，有空再做。

## 常用指令

所有指令都在專案根目錄執行。

| 目的                 | 指令                                                        |
| -------------------- | ----------------------------------------------------------- |
| 執行一個範例         | `bun run day-01-setup-variables-types/examples/01-hello.ts` |
| 檢查某一天的練習     | `bun test day-01`                                           |
| 檢查型別             | `bun check`                                                 |
| 檢查程式是否符合規範 | `bun run lint`                                              |
| 自動排版             | `bun run format`                                            |
| 在本機預覽課程網站   | `bun run site:dev`，然後打開 `http://localhost:4321/`       |

## 練習題怎麼運作

- 練習檔裡標著 `TODO` 的地方就是要你完成的地方。
- 還沒作答時，`bun test day-NN` 會顯示 fail，這是正常的。把題目完成後，測試會變成 pass。
- 卡住超過 15 分鐘再看 `solutions/`。看完把解答關掉，自己重寫一次。
- 想確認參考解答本身是正確的，可以執行 `SOLUTIONS=1 bun test day-NN`。

## 專案裡的其他檔案

| 檔案                                                                     | 用途                                         |
| ------------------------------------------------------------------------ | -------------------------------------------- |
| [`ROADMAP.md`](ROADMAP.md)                                               | 兩週之後的學習路線                           |
| [`leetcode/`](leetcode/README.md)                                        | LeetCode 副線的十道題目                      |
| [`docs/lesson-authoring-guide.md`](docs/lesson-authoring-guide.md)       | 課程撰寫規範，新增課程時使用                 |
| [`docs/animation-authoring-guide.md`](docs/animation-authoring-guide.md) | 網站動畫的撰寫規範                           |
| [`docs/leetcode-authoring-guide.md`](docs/leetcode-authoring-guide.md)   | LeetCode 副線的撰寫規範                      |
| `site/`                                                                  | 課程網站的產生程式與動畫播放器               |
| `tsconfig.json`                                                          | TypeScript 的嚴格度設定，Day 07 會逐項說明   |
| `biome.json`                                                             | 程式規範檢查工具 Biome 的設定，Day 07 會說明 |
| `support/`                                                               | 練習題測試共用的輔助程式                     |
