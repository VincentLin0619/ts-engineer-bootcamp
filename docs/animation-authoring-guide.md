# 動畫場景撰寫規範

課程網站的每一課都可以嵌入「程式執行動畫」：左邊是程式碼，目前執行的那一行會亮起來；右邊是變數、call stack、記憶體等面板；下面是一句說明。學員可以播放、暫停、單步前進或後退，遇到「先猜猜看」的題目時先作答。

這份文件說明怎麼新增一個動畫。寫之前先讀完，並對照這四個範例：

| 範例                                                     | 示範的面板                        |
| -------------------------------------------------------- | --------------------------------- |
| `site/src/client/player/scenes/day03-count-done.ts`      | 變數、陣列與指標、輸出、題目      |
| `site/src/client/player/scenes/day03-call-stack.ts`      | call stack                        |
| `site/src/client/player/scenes/day04-reference.ts`       | 記憶體與參考箭頭                  |
| `site/src/client/player/scenes/leetcode-0001-two-sum.ts` | 可修改的輸入、Map、由程式產生步驟 |

資料型別的完整定義在 `site/src/client/player/types.ts`，以那個檔案為準。

## 1. 檔案與命名

- 每個動畫是一個檔案，放在 `site/src/client/player/scenes/`，用 `export default` 匯出一個 `Scene`。
- **檔名必須等於場景 id**：`day05-crud-update.ts` 的 id 是 `"day05-crud-update"`。
- id 只用小寫英文、數字、連字號。課程用 `dayNN-主題`，LeetCode 用 `leetcode-NNNN-題目代稱`（與 `leetcode/` 下的資料夾名稱對應）。
- 不需要登記到任何索引：`bun run site:build` 會自動掃描這個資料夾。
- 不要修改 `engine.ts`、`render.ts`、`types.ts`、`snapshots.ts`。缺少需要的面板或功能時，先回報。

## 2. 嵌入到課文

在課文裡要放動畫的位置，加一行引言：

```markdown
> ▶ 動畫演示：[一句話說明這段動畫在看什麼](https://vincentlin0619.github.io/ts-engineer-bootcamp/day-05/#anim-day05-crud-update)
```

- 網址的頁面路徑：課程是 `day-NN/`，LeetCode 是 `leetcode/<資料夾名稱>/`。
- `#anim-` 後面接場景 id。
- 在 GitHub 上看 README 時，這一行是一個連到網站的連結；在網站上，這一行會被換成播放器。
- 放在對應觀念的說明與圖解之後，讓學員先讀懂觀念，再看它實際執行。

## 3. 場景的組成

```ts
const scene: Scene = {
  id: "day05-crud-update",
  title: "updateTodo：不改舊陣列，回傳新陣列", // 播放器標題
  summary: "一句話說明這段動畫讓你看到什麼。", // 標題下的說明
  code: `...`, // 要顯示的程式碼
  language: "ts", // 預設 ts；SQL 用 "sql"
  steps: [/* 每一步 */],
};
```

### 程式碼

- 從當天的範例檔節錄，語意必須和課文一致。可以刪減與這段動畫無關的行，但不可以改寫成課文沒教過的寫法。
- 節錄的程式碼要能通過本課程的 strict 型別檢查。不確定時，把它貼進一個暫時的 `.ts` 檔用 `bun check` 確認。
- 長度以 8–25 行為宜。超過就拆成兩個動畫。
- 程式碼註解用英文，字串用繁體中文，和課程規範相同。

### 步驟

每一步描述「這個時刻學員應該看到什麼」。

- `line`：這一步亮起的行號（從 1 開始），可以是陣列。`null` 表示沒有任何一行亮起。
- `note`：必填。一到兩句繁體中文，說明這一步發生了什麼、為什麼。程式碼用反引號包起來，重點可用 `**粗體**`。
- 面板欄位（`vars`、`stack`、`heap`、`arrays`、`map`、`table`、`lanes`、`queues`）：**沒寫的面板沿用上一步**；寫了就整個取代，不會與上一步合併。所以改變一個面板時，要寫出它完整的新狀態。
- `print`：在輸出面板加一行（或多行）。`output` 則是整個取代輸出面板。
- `question`：在這一步暫停並出題，見第 5 節。

一步只做一件事。學員按「下一步」時，畫面上應該只有一個地方改變，而且說明文字正好在講那個改變。

建議 8–20 步。

## 4. 面板怎麼選

| 面板       | 欄位                       | 適合的觀念                                         |
| ---------- | -------------------------- | -------------------------------------------------- |
| 變數       | `vars: Slot[]`             | 變數的值怎麼變、型別縮小（用 `type` 顯示型別）     |
| Call stack | `stack: Frame[]`           | 函式呼叫、回傳、錯誤往上傳遞。陣列最後一個是最上層 |
| 記憶體     | `heap: { roots, objects }` | 參考、物件、類別的實例、`this`                     |
| 陣列       | `arrays: ArrayPanel[]`     | 迴圈、陣列方法、雙指標、LeetCode                   |
| Map        | `map: MapPanel`            | `Map`、`Set`、用 key 查詢                          |
| 資料表     | `table: TablePanel`        | SQL 的 `INSERT`／`SELECT`／`UPDATE`／`DELETE`      |
| 流程       | `lanes: LanesPanel`        | 分層架構、HTTP 請求在各層之間移動                  |
| 佇列       | `queues: QueuesPanel`      | event loop 的各個佇列                              |
| 輸出       | `print` / `output`         | `console.log` 的結果                               |

使用規則：

- 一個場景用 2–3 個面板就好，太多會讓學員不知道該看哪裡。
- `Slot` 的 `value` 是要顯示的文字，字串值要自己加上雙引號，例如 `'"買牛奶"'`，這樣學員看得出它是字串。
- 記憶體面板：`roots` 是左邊的變數，`objects` 是右邊的物件卡片。在 `Slot` 寫 `ref: "物件 id"` 就會畫出箭頭；物件的欄位也可以 `ref` 到另一個物件。
- Call stack 的每一層要有固定的 `id`，同一層在不同步驟用同一個 `id`，動畫才會是「同一張卡片在變」而不是「換了一張」。
- 陣列的 `pointers` 是 `{ 名稱: 位置 }`，用來表示 `i`、`left`、`right` 這類索引。位置可以是 `-1` 或等於長度，代表剛好走出陣列。
- 流程面板的 `token.kind`：往下呼叫用 `"request"`，回傳用 `"response"`，錯誤用 `"error"`。

### 標記（`mark`）

| 值        | 意思                       |
| --------- | -------------------------- |
| `active`  | 現在正在處理的東西         |
| `compare` | 正在拿來比較的東西         |
| `done`    | 處理完、結果成立           |
| `found`   | 找到答案                   |
| `new`     | 這一步剛新增的             |
| `error`   | 出錯的地方                 |
| `dim`     | 已經不重要、可以忽略的東西 |

同一個場景裡，同一種意思一律用同一種標記。

## 5. 先猜猜看（題目）

在「學員有機會自己推理出下一步」的時刻出題，例如函式回傳後回到哪一行、改了物件之後另一個變數看到什麼、迴圈下一圈 `i` 是多少。

- 每個場景 1–2 題。
- 題目放在**答案揭曉之前**的那一步：畫面停在那一步時，答案還沒有出現在面板上。
- `choices` 2–4 個，錯誤選項要是初學者真的會犯的錯，不要湊數。
- `explain` 用一句話說明為什麼，答對答錯都會顯示。

## 6. 可修改的輸入

LeetCode 動畫要讓學員自己改輸入、重新執行。做法：

- `inputs` 列出文字欄位與預設值，`hint` 寫清楚格式。
- `code` 與 `steps` 改寫成函式，從輸入產生內容。
- 用 `site/src/client/player/inputs.ts` 的 `parseInteger`、`parseIntegerList`、`parseText` 解析輸入。它們會在格式錯誤時丟出 `SceneInputError`，播放器會把訊息顯示在表單下方。
- 限制輸入大小（例如陣列最多 10 個數字），避免步驟多到播不完。
- 產生步驟的邏輯必須真的執行演算法，不可以寫死結果。
- 另外 `export const testInputs: InputValues[] = [...]`，列出 2–4 組要檢查的輸入，涵蓋找得到、找不到、邊界情況。`bun site/check-scenes.ts` 會用它們驗證。

## 7. 驗證

寫完一個場景，在專案根目錄依序執行：

```bash
bun site/check-scenes.ts <場景 id>   # 只驗證你的場景：行號、箭頭、題目、輸入
bun run site:check                   # 網站程式的型別檢查
bunx biome check site                # lint
bun run site:build                   # 建置整個網站，並確認課文裡的標記都對得上
```

`check-scenes.ts` 會抓出：行號超出程式碼範圍、箭頭指向不存在的物件、題目答案的索引錯誤、檔名與 id 不同、`testInputs` 執行失敗等問題。

想在瀏覽器裡看實際效果：

```bash
bun run site:dev   # 建置後開啟 http://localhost:4321/
```

最後逐步播放一次，確認每一步的說明文字都和畫面上的變化一致。

## 8. 圖解動畫（Mermaid）

課文裡的每一張 Mermaid 圖，在網站上都會自動加上一條控制列，可以一步一步播放。這不需要寫任何場景檔。

運作方式：

- 圖照樣由 Mermaid 畫出來，網站在圖的上方疊一層 canvas，畫出沿著箭頭移動的光點。
- 步驟依照原始碼裡箭頭（或訊息）出現的順序：
  - 流程圖、狀態圖：一條箭頭一步。
  - 時序圖：一則訊息一步。
  - 類別圖：先逐一亮出類別，再逐條畫出關係線。
  - 資料表關聯圖：先亮出資料表，再逐欄亮起。
- 每一步的說明文字自動產生，格式是「起點」→「終點」：箭頭上的文字。節點的第一行會被當作名稱。

所以畫圖時：

- **箭頭的書寫順序就是播放順序**。依照「事情發生的先後」寫箭頭。
- **節點的第一行寫名稱，第二行之後寫說明**，例如 `A["TodoService<br/>商業規則"]`。
- 起點與終點同名時（例如修改前後的同一筆資料），說明會自動加上它所屬子圖框的名稱，所以請替子圖框取有意義的標題。

### 自訂說明文字

自動產生的說明不夠清楚時，可以在 Mermaid 原始碼裡逐步改寫：

```text
flowchart LR
  %% step: 使用者輸入指令，CLI 把它轉成方法呼叫
  %% step: Service 檢查規則之後，交給 Repository 存起來
  CLI -->|"呼叫"| SVC
  SVC -->|"呼叫"| REPO
```

- 第 N 行 `%% step:` 取代第 N 步的說明；寫成空的 `%% step:` 代表那一步沿用自動說明。
- `%%` 開頭是 Mermaid 的註解，GitHub 顯示 README 時會忽略它。

改完後執行 `bun run site:dev`，在瀏覽器裡把那張圖從頭播到尾，確認每一步的說明都對得上畫面。
