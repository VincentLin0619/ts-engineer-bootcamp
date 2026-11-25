# 圖解動畫改版：線條圖示卡片＋資料標籤流動

日期：2026-11-25

## 1. 目的

課程網站上的每張 Mermaid 圖目前用 canvas 疊一條 2px 線從起點畫到終點（`site/src/client/diagram/animator.ts`）。學員覺得這種畫法單調，比較喜歡一支 OAuth 2.0 解說短片的風格：每個角色有線條圖示，傳遞的資料是一個小標籤，沿著連線移動。

這次改版只改**外觀與動畫**，不改敘事方式：步驟順序、說明文字、控制列的行為都沿用現有的 `steps.ts`。整體方向是「簡約、現代」。

## 2. 目標、非目標、反目標

目標：

- 網站上全部 54 張 Mermaid 圖（flowchart 40，含 `ROADMAP.md` 的一張；sequence 6、class 5、state 2、ER 1）自動套用新樣式，不需要逐張標註。
- 節點改成卡片：左側是依類別上色的線條圖示方塊，右側是標題與說明。
- 播放時，輪到的連線變成流動的圓點，資料標籤沿線移動，抵達後目標節點亮起。
- 淺色、深色主題都正確；手機寬度（375px）可用：維持現有行為，圖會整張縮放，外層 `.diagram-scroll` 可以水平捲動。驗收標準是沒有文字重疊或溢出（我的判斷）。

非目標：

- 不改課文 README 的 Mermaid 原始碼，只允許加 `%% icon:` 註解行。
- 不改程式碼動畫播放器（`site/src/client/player/`）與場景檔。
- 不手動排版，節點位置一律由 Mermaid 計算。
- 不改步驟的產生邏輯與說明文字的格式。

反目標（就算功能正常也算失敗）：

- 實線與虛線的差異消失。課程用虛線表達意思：flowchart 的 `-.->`（多半是 implements，22 條）、sequence 的回傳 `-->>`（23 條）、class 的 `..|>`（4 條）。
- 動畫花俏、搶走課文的焦點，或違反網站現有的 motion 語言（160／280／480ms 三種時長，兩種曲線）。
- 卡片裡的文字被圖示擠壓、溢出或互相重疊。
- GitHub 上的 README 圖表顯示和現在不同。

## 3. 限制

- 只能用 Bun。網站唯一允許的 runtime 套件是 `animejs`（v4.5.0，已經安裝，見 `CLAUDE.md`）。圖示要自己畫，不可以安裝圖示套件。
- Mermaid 12.3.0 由 CDN 載入（`site/src/client/main.ts`），設定 `securityLevel: "strict"`、`theme: "base"`。主題切換時會重新渲染所有圖，`attachDiagramAnimators()` 會先 destroy 舊的再重新掛上。
- 程式要通過 `bun run verify`、`bun run site:check`、`bun run site:build`，並維持 `bunx biome check .` 零警告。
- 系統開啟 `prefers-reduced-motion` 時不播移動動畫，直接切換到該步的亮起狀態（沿用 `reducedMotion()`）。
- 顏色一律用 `site/src/styles.css` 的 Rosé Pine token，不寫死色碼。

## 4. 做法比較

| 做法                                                         | 內容                                                                                                                | 取捨                                                                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **1. 沿用 Mermaid 排版，渲染前預留寬度、渲染後加工（採用）** | 渲染前讓需要圖示的節點多留出左側空間；渲染後插入圖示方塊，用 CSS 改成卡片；動畫用 animejs 疊在 Mermaid 自己的連線上 | 改動最小，所有圖表類型都能套用，`steps.ts` 幾乎不用改。依賴 Mermaid 12 的 SVG 結構（現在的 `steps.ts` 本來就依賴），「預留寬度」要先實測 |
| 2. 自己重畫節點，Mermaid 只算位置                            | 把 Mermaid 的節點藏起來，在相同位置畫自己的卡片                                                                     | 外觀完全可控，但五種圖表各要寫一套，程式量約兩到三倍，Mermaid 改版時容易壞                                                               |
| 3. Mermaid 內建 icon 節點 `@{ icon: … }`                     | 用 `registerIconPacks` 註冊自己的圖示                                                                               | 只支援 flowchart，圖示固定在文字上方，做不出選定的卡片樣式，所以放棄                                                                     |

使用者選了做法 1。

## 5. 使用者已決定的設計

透過瀏覽器 mockup 比較後選定。

### 5.1 節點：A 卡片，依類別上色

- 卡片：圓角 12px、1px `--line` 外框、`--surface` 底色。
- 左側圖示方塊：34×34、圓角 9px，底色是類別色的 14%（`color-mix(in srgb, <類別色> 14%, transparent)`）。方塊內放 20px 的線條圖示，筆畫用類別色。
- 右側：第一行是標題（13px、600），第二行起是說明（11.5px、`--muted`）。沿用 Mermaid 既有的 `<br/>` 換行。
- 沒配到圖示的矩形節點也用卡片的外框、圓角和字級，但文字維持置中（我的判斷）。
- 非矩形節點保留 Mermaid 原本的形狀，因為形狀本身就有意思：菱形是判斷、圓柱是儲存、膠囊是值。這些節點不放圖示方塊，也不預留寬度，文字維持置中。外框改用類別色：菱形 `--pine`、圓柱 `--gold`，膠囊和 state 圖的 `[*]` 維持中性的 `--line`（使用者決定）。
- 不新增虛線框規則。目前 54 張圖裡沒有虛線框的節點，`contract` 圖示本身已經是虛線（我的判斷）。
- 類別色：

| 類別       | 圖示                             | 顏色 token |
| ---------- | -------------------------------- | ---------- |
| 角色 actor | 人、地球                         | `--foam`   |
| 流程 flow  | 終端機、入口、判斷、非同步、測試 | `--pine`   |
| 程式 code  | 齒輪、合約、物件、函式           | `--iris`   |
| 儲存 store | 資料庫、檔案                     | `--gold`   |
| 錯誤 error | 錯誤                             | `--love`   |

### 5.2 圖示：自動判斷，可用註解覆寫

共 14 個 24×24 線條圖示，`fill: none`，筆畫 1.6、圓角端點與轉角。判斷順序如下，第一條符合的規則勝出；都不符合就不放圖示，也不預留空間。

1. 形狀：菱形 `{ }`、圓柱 `[( )]`、膠囊 `([ ])` 這些非矩形節點一律不配圖示，見 5.1；`%% icon:` 也不能替它們加。state 圖的狀態一律不配圖示：狀態不是角色，而且只有個別狀態會被關鍵字配到，看起來會不一致（spike 後的判斷）。
2. 原始碼裡的 `%% icon: <節點 id> <圖示名稱>` 覆寫。圖示名稱寫 `none` 代表不放。
3. sequence 的 `actor` 配 `user`。
4. 名稱關鍵字（不分大小寫），先只比對第一行。
5. 連線語意：`implements`（flowchart 的 `-.->|"implements"|`、class 的 `..|>`）的起點配 `cube`、終點配 `contract`。這條排在比對其餘各行之前，`InMemoryTodoRepository<br/>合約的實作` 才不會因為第二行有「合約」被配成 `contract`（我的判斷）。
6. 第一行沒有符合時，再比對其餘各行，例如 `TodoRepository<br/>介面：儲存的合約` 會配到 `contract`（我的判斷）。
7. class 圖裡沒有被上面規則配到的類別，一律配 `cube`；`<<abstract>>` 也配 `cube`。所以 class 圖的 `TodoService` 仍然是 `gear`（我的判斷）。

關鍵字表：

| 圖示       | 名稱   | 類別  | 關鍵字（示意，實作時以測試表為準）                        |
| ---------- | ------ | ----- | --------------------------------------------------------- |
| `alert`    | 錯誤   | error | `Error`、`throw`、`4xx`／`5xx` 狀態碼、錯誤               |
| `user`     | 人     | actor | 使用者、`user`                                            |
| `globe`    | 地球   | actor | `client`、瀏覽器、`browser`、`fetch`、`curl`              |
| `terminal` | 終端機 | flow  | `CLI`、終端機、`bun run`                                  |
| `entry`    | 入口   | flow  | `http`、`handler`、路由、`route`、`Bun.serve`             |
| `clock`    | 非同步 | flow  | `async`、`await`、`Promise`、非同步                       |
| `check`    | 測試   | flow  | `test`、`expect`、測試                                    |
| `gear`     | 齒輪   | code  | 名稱含 `Service`                                          |
| `contract` | 合約   | code  | `interface`、介面、合約、class 圖的 `<<interface>>`       |
| `cube`     | 物件   | code  | class 圖的類別、實作類別（例如 `InMemoryTodoRepository`） |
| `fn`       | 函式   | code  | 名稱以 `()` 結尾、`function`、函式                        |
| `db`       | 資料庫 | store | `SQLite`、資料庫、`database`                              |
| `file`     | 檔案   | store | 帶副檔名的檔名（`.json`、`.ts`、`.md`…）                  |
| `branch`   | 判斷   | flow  | 不會自動配到（菱形保留形狀），只用於 `%% icon:` 手動指定  |

順序很重要：`cli.ts` 要配終端機、`http-api.ts` 配入口、`todo-service.ts` 配齒輪，而不是一律被副檔名規則抓成「檔案」。

圖示的 path 資料（mockup 定稿版，viewBox `0 0 24 24`）：

```text
user      <circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/>
globe     <circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.5 3.6 5.3 3.6 8.5s-1.2 6-3.6 8.5c-2.4-2.5-3.6-5.3-3.6-8.5s1.2-6 3.6-8.5z"/>
terminal  <rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7 10l3 2.5L7 15M12.5 15H17"/>
entry     <path d="M3.5 12h10M10 8l4 4-4 4"/><path d="M14 4.5h3.5A2.5 2.5 0 0 1 20 7v10a2.5 2.5 0 0 1-2.5 2.5H14"/>
gear      <circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="12" r="6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
contract  <rect x="4" y="4" width="16" height="16" rx="3" stroke-dasharray="3.2 2.6"/><path d="M8.5 10h7M8.5 14h4.5"/>
cube      <path d="M12 3.2l7.8 4.4v8.8L12 20.8l-7.8-4.4V7.6z"/><path d="M4.4 7.7L12 12l7.6-4.3M12 12v8.6"/>
db        <ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>
file      <path d="M14 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V8.5z"/><path d="M14 3.5v5h5M9 13h6M9 16.5h4"/>
branch    <path d="M12 3.5l8.5 8.5-8.5 8.5L3.5 12z"/><path d="M10.2 10.2a1.9 1.9 0 1 1 2.5 1.8c-.4.2-.7.5-.7 1M12 15.4v.1"/>
alert     <path d="M10.3 4.6L3.2 17.2A2 2 0 0 0 5 20.2h14a2 2 0 0 0 1.8-3L13.7 4.6a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 16.8v.1"/>
fn        <path d="M15.5 4.5H14a2.5 2.5 0 0 0-2.5 2.5v10a2.5 2.5 0 0 1-2.5 2.5H7.5M8.5 10.5h6"/>
clock     <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>
check     <circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.3 4.6-4.8"/>
```

### 5.3 動畫：虛線流動＋資料標籤（靜止時保留原線型）

- 靜止與已走過的連線保持 Mermaid 原本的實線或虛線，用來保留「呼叫」對「implements」、「呼叫」對「回傳」的區別。
- 輪到的那條：在原連線上疊一條 `--accent` 色的圓點線（`stroke-dasharray: 0.1 6`、圓角端點、約 2.8px），用 `stroke-dashoffset` 往終點方向流動。
- 資料標籤同時沿線移動（`svg.createMotionPath`）。標籤是膠囊形：`--surface` 底、1px `--accent` 外框、11px 等寬字。開始時淡入、抵達前淡出。
- 標籤文字取自連線文字（flowchart、state、class 的關係文字）或 sequence 的訊息文字，取第一行，過長時截斷加「…」。沒有文字的連線不顯示標籤，只有圓點流動。
- 抵達後：目標節點從 30% 亮到 100%，並加上很輕微的放大（0.96 → 1）；連線、連線文字、目標節點依現有規則亮起。疊上去的圓點線淡出，連線回到原本的線型並保持亮起。
- 還沒走到的部分維持 30% 透明度（沿用 `anim-lit` 的機制）。
- sequence 圖例外：參與者照現狀一直全亮，不加入變暗的範圍，所以不需要改 `steps.ts` 的 `dimmable`。訊息抵達時，只讓目標參與者的上方方框做同樣輕微的放大。自己呼叫自己的訊息不做放大（我的判斷）。
- 移動時長沿用 `#travelTime()`（`MOTION.slow + 160`，再除以播放速度），節點亮起用 `MOTION.base` 搭配 `--ease-enter` 曲線。

### 5.4 說明列

- 說明文字前面加上金色圓形步驟編號（`--gold` 底），後面加上進度點（已走過的用 `--accent`）。
- 保留現有的控制鈕：回到開頭、上一步、播放／暫停、下一步、速度。

## 6. 各圖表類型的套用方式

| 類型      | 圖示放哪裡                                                                                                           | 動畫                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| flowchart | 矩形節點卡片左側的圖示方塊；非矩形節點只改外框顏色                                                                   | 每條連線一步，有流動與標籤                             |
| sequence  | 參與者方框內、文字上方（spike 發現長名稱的方框左右沒有空間）；方框高度不夠時就不放；`actor` 的火柴人換成 `user` 圖示 | 每則訊息一步，標籤是訊息文字；回傳訊息靜止時保持虛線   |
| class     | 類別名稱那一列的左側（`cube`；`<<interface>>` 用 `contract`；名稱以 `Error` 結尾用 `alert`）                         | 沿用現有規則：先亮類別，再畫關係線，關係線有流動與標籤 |
| state     | 不放圖示，只套卡片外框與字級                                                                                         | 每條轉換一步                                           |
| ER        | 資料表標題左側放 `db`                                                                                                | 沿用現有規則：先亮資料表，再逐欄亮起，沒有連線移動     |

## 7. 技術做法（做法 1）

處理流程：`renderDiagrams()` → 預留寬度 → `mermaid.run` → 加工節點 → `attachDiagramAnimators()`。

1. **預留寬度（2026-11-25 已在瀏覽器 spike 驗證）**：
   - `mermaid.mermaidAPI.getDiagramFromText(source)` 不用渲染就能拿到 parser 的 db。flowchart 用 `db.getVertices()` 取得 `{ id, text, type }`，`type` 是 `square`、`round`、`diamond`、`cylinder`、`stadium` 等；用 `db.getEdges()` 取得 `{ start, end, text, stroke }`。class 圖用 `db.getClasses()` 取得 `{ id, annotations }`（例如 `["interface"]`），用 `db.getRelations()` 取得 `{ id1, id2, title, relation: { type1, type2, lineType } }`。sequence 用 `db.getActors()` 取得 `{ name, description, type }`（`type` 是 `actor` 或 `participant`）。
   - flowchart：在送進 Mermaid 的字串後面附加 `class a,b icoSlot`。class 圖：附加 `cssClass "A,B" icoSlot`（class 名稱不能有 `-`）。再用 CSS `.icoSlot foreignObject > div { padding-left: …; box-sizing: content-box }`，Mermaid 就會把節點加寬，連線端點也跟著對齊。實測結果：flowchart 節點 152 → 196、class 節點 200 → 230。把 padding 放在 `.nodeLabel` 上沒有用，因為會被 `max-width` 吃掉。
   - sequence、ER 不預留寬度：sequence 的圖示放在文字上方，ER 的資料表名稱旁本來就有空間。空間不夠時就不放圖示。
   - 附加的敘述只存在於送進 Mermaid 的字串，不會寫回 README。
2. **加工節點**（新模組，例如 `site/src/client/diagram/decorate.ts`）：在每個需要圖示的節點插入圖示方塊和 `<use>`，掛上類別 class（例如 `cat-code`），由 CSS 決定顏色；左對齊文字。圖示的 `<symbol>` 只注入一次。
3. **圖示判斷**（新模組，例如 `site/src/client/diagram/icons.ts`）：寫成純函式（輸入是圖表類型、形狀、節點的全部文字行、class 的 stereotype、是否為 `implements` 的起點或終點、覆寫表，輸出是圖示名稱或 `undefined`），不碰 DOM，用 `bun:test` 測試。`%% icon:` 的解析方式比照 `captionOverrides()`。
4. **動畫**（改寫 `animator.ts`）：移除 canvas，改在 SVG 裡疊一層動畫圖層，用 animejs 的 `createTimeline`、`svg.createMotionPath` 與 `strokeDashoffset`。圖層要插在連線所在的同一個 `<g>` 裡，或用 `getCTM()` 換算座標，子圖框有 transform 時位置才會正確。`DiagramStep` 增加一個欄位放標籤文字，由 `steps.ts` 從既有的 `edgeLabel()` 或訊息文字取得。`destroy()` 要停止並清掉所有 animejs 實例與疊加的元素。
5. **樣式**：`site/src/styles.css` 的 `.diagram` 區段新增卡片、圖示方塊、類別色、膠囊標籤、圓點流動與說明列的樣式；移除 `.diagram-canvas`。

## 8. 驗證

- `bun run verify`、`bun run site:check`、`bun run site:build` 全部通過，`bunx biome check .` 零警告。
- `icons.ts` 的單元測試涵蓋 5.2 節的判斷順序案例（`cli.ts`、`http-api.ts`、`todo-service.ts`、矩形的 `todos.json` 配 `file`、圓柱形的 `todos.json` 不配圖示、`InMemoryTodoRepository`、`TodoRepository<br/>介面（合約）`、`ValidationError`）。
- 產出一份「全部 54 張圖的每個節點配了什麼圖示」清單給使用者檢查。配錯的地方優先調整規則，規則調不動才在 README 加 `%% icon:`。
- 用瀏覽器逐課檢查：淺色與深色主題、375px 手機寬度、從頭播到尾、上一步與下一步、切換主題後重新掛上、`prefers-reduced-motion`。
- 加了 `%% icon:` 的 README，確認在 GitHub 上的圖表顯示不變。

## 9. 需要同步更新的文件

- `docs/animation-authoring-guide.md` 第 8 節：運作方式改為「animejs 在 SVG 上播放」，新增 `%% icon:` 語法、圖示清單與判斷規則。
- `CLAUDE.md`：目前已寫明 `animejs` 是網站唯一的例外，不需要再改。

## 10. 留給實作者決定

- 關鍵字表的細節，以第 8 節的測試和圖示清單審查結果為準。
- 標籤截斷長度、圓點線的確切粗細，在 mockup 數值附近微調。
- 步驟很多的圖（例如 17 則訊息的 sequence）進度點太密時，改用細進度條。這點是我的判斷，可以再調整。
