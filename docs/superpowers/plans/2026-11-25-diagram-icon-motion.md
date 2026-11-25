# 圖解動畫改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 網站上 54 張 Mermaid 圖改成「依類別上色的線條圖示卡片」，播放時輪到的連線變成流動圓點、資料標籤沿線移動。

**Architecture:** 渲染前用 Mermaid 自己的 parser 判斷每個節點的圖示，在送進 Mermaid 的字串後面附加 `class`／`cssClass` 敘述，讓 CSS padding 撐出圖示的位置。渲染後由 `decorate.ts` 插入圖示方塊。`animator.ts` 改用 animejs，在 SVG 裡疊上流動線與標籤，取代 canvas。步驟邏輯沿用 `steps.ts`。

**Tech Stack:** TypeScript 7、Bun（`bun:test`、`Bun.build`）、Mermaid 12.3.0（CDN）、animejs 4.5.0。

**Spec:** `docs/superpowers/specs/2026-11-25-diagram-icon-motion-design.md`（以下簡稱 spec，第 N 節寫作 §N）

## Global Constraints

- 只用 Bun。網站唯一允許的 runtime 套件是 `animejs`，不可以安裝圖示套件或其他套件。
- 課文 README 的 Mermaid 原始碼不改，只允許加 `%% icon:` 註解行。附加的 `class`／`cssClass` 敘述只存在於送進 Mermaid 的字串。
- 顏色一律用 `site/src/styles.css` 的 token：`--foam`、`--pine`、`--iris`、`--gold`、`--love`、`--accent`、`--surface`、`--line`、`--text`、`--muted`。
- 動畫時長只用 `MOTION.fast`／`base`／`slow`（160／280／480ms）和 `#travelTime()`；`prefers-reduced-motion` 時不播移動動畫。
- 每個任務結束前，`bun test site`、`bun run site:check`、`bunx biome check .` 都要零錯誤、零警告；最後一個任務再加跑 `bun run verify` 和 `bun run site:build`。
- 程式碼註解用英文，畫面上的文字用繁體中文。
- 在分支 `feat/diagram-icons` 上工作，絕不推送 `main`（推送會觸發部署）。commit 步驟需要使用者同意才執行。
- 瀏覽器驗證：`bun run site:dev` 啟動 `http://localhost:4321/`，用 chrome-devtools MCP 開頁面，跑步驟裡給的 `evaluate_script`。

## Review Focus

1. **播放到一半切換主題**：會重新渲染並重新掛上動畫，舊的 timeline 不能繼續寫入已經移除的節點，console 不能有錯誤。由 Task 4 Step 7 驗證。
2. **子圖框裡的連線**（day-10 第一張圖有 `subgraph`）：標籤抵達時，要停在連線終點附近（2px 以內），不能因為 transform 偏掉。由 Task 4 Step 7 驗證。
3. **連線文字有 HTML entity**（day-13 的 `{ &quot;error&quot;: 訊息 }`）：標籤要顯示成解碼後的 `{ "error": 訊息 }`。由 Task 4 Step 7 驗證。
4. **parser 失敗**（未知語法或 Mermaid 改版）：要回退成原始碼照常渲染、沒有圖示，不能讓整張圖失敗。由 Task 2 的單元測試 `falls back when the parser throws` 驗證。
5. **連按「下一步」**：上一個流動動畫要先取消，畫面上同時最多只有一個 `.anim-chip`。由 Task 4 Step 7 驗證。

---

### Task 1: 圖示判斷規則

**Files:**

- Create: `site/src/client/diagram/icons.ts`
- Test: `site/src/client/diagram/icons.test.ts`

**Interfaces:**

- Produces:
  - `type IconName = "user" | "globe" | "terminal" | "entry" | "gear" | "contract" | "cube" | "fn" | "db" | "file" | "branch" | "alert" | "clock" | "check"`
  - `type IconCategory = "actor" | "flow" | "code" | "store" | "error"`
  - `const ICON_CATEGORY: Record<IconName, IconCategory>`（依 spec §5.1 的類別表）
  - `const ICON_MARKUP: Record<IconName, string>`（每個圖示的內層 SVG，逐字照抄 spec §5.2 的 path 資料）
  - `type DiagramKind = "flowchart" | "sequence" | "class" | "state" | "er"`
  - `type NodeShape = "rect" | "diamond" | "cylinder" | "stadium" | "other"`
  - `type NodeFacts = { id: string; kind: DiagramKind; shape: NodeShape; lines: string[]; stereotype?: string; implementsRole?: "source" | "target"; isActor?: boolean }`
  - `function pickIcon(node: NodeFacts, overrides: ReadonlyMap<string, IconName | "none">): IconName | undefined`
  - `function iconOverrides(source: string): Map<string, IconName | "none">`
  - `function isIconName(value: string): value is IconName`

- [ ] **Step 0: 開分支並收進目前尚未 commit 的變更**

```bash
git switch -c feat/diagram-icons
git add package.json bun.lock CLAUDE.md docs/superpowers
git commit -m "Add animejs and the diagram restyle design"
```

- [ ] **Step 1: 寫失敗的測試**

```ts
import { describe, expect, test } from "bun:test";
import {
  type IconName,
  iconOverrides,
  type NodeFacts,
  pickIcon,
} from "./icons.ts";

const none = new Map<string, never>();
const node = (lines: string[], extra: Partial<NodeFacts> = {}): NodeFacts => ({
  id: "n",
  kind: "flowchart",
  shape: "rect",
  lines,
  ...extra,
});

describe("pickIcon", () => {
  const flowchart: [string[], IconName | undefined][] = [
    [["cli.ts", "終端機入口"], "terminal"],
    [["http-api.ts", "HTTP 入口（今天新增）"], "entry"],
    [["todo-service.ts"], "gear"],
    [["todos.json"], "file"],
    [["TodoRepository", "介面：儲存的合約"], "contract"],
    [["InMemoryTodoRepository", "合約的實作"], "cube"],
    [["ValidationError"], "alert"],
    [["400 Bad Request", "訊息：錯誤的 message"], "alert"],
    [["client", "curl、fetch、瀏覽器"], "globe"],
    [["todo.complete()"], "fn"],
    [["SqliteTodoRepository"], "db"],
    [["parseNewTodoBody 檢查 body"], undefined],
  ];
  for (const [lines, icon] of flowchart) {
    test(`flowchart ${lines[0]} -> ${icon}`, () => {
      expect(pickIcon(node(lines), none)).toBe(icon);
    });
  }
  test("non-rect shapes never get an icon, even with an override", () => {
    expect(
      pickIcon(node(["todos.json"], { shape: "cylinder" }), none),
    ).toBeUndefined();
    expect(
      pickIcon(
        node(["有找到？"], { shape: "diamond" }),
        new Map([["n", "branch"]]),
      ),
    ).toBeUndefined();
  });
  test("overrides win on rect nodes", () => {
    expect(pickIcon(node(["anything"]), new Map([["n", "branch"]]))).toBe(
      "branch",
    );
    expect(
      pickIcon(node(["cli.ts"]), new Map([["n", "none"]])),
    ).toBeUndefined();
  });
  test("implements role beats later lines but not the first line", () => {
    expect(
      pickIcon(
        node(["JsonFileTodoRepository"], { implementsRole: "source" }),
        none,
      ),
    ).toBe("cube");
    expect(
      pickIcon(node(["TodoRepository"], { implementsRole: "target" }), none),
    ).toBe("contract");
    expect(
      pickIcon(node(["X", "合約"], { implementsRole: "source" }), none),
    ).toBe("cube");
  });
  test("state diagrams get no icons", () => {
    expect(
      pickIcon(node(["rejected", "已失敗：帶著錯誤"], { kind: "state" }), none),
    ).toBeUndefined();
  });
  test("sequence actors and participants", () => {
    expect(
      pickIcon(node(["使用者"], { kind: "sequence", isActor: true }), none),
    ).toBe("user");
    expect(pickIcon(node(["CLI"], { kind: "sequence" }), none)).toBe(
      "terminal",
    );
  });
  test("class diagrams fall back to cube", () => {
    const cls = (lines: string[], stereotype?: string) =>
      node(lines, { kind: "class", ...(stereotype ? { stereotype } : {}) });
    expect(pickIcon(cls(["TodoService"]), none)).toBe("gear");
    expect(pickIcon(cls(["TodoRepository"], "interface"), none)).toBe(
      "contract",
    );
    expect(pickIcon(cls(["TodoFormatter"], "abstract"), none)).toBe("cube");
    expect(pickIcon(cls(["Todo"]), none)).toBe("cube");
    expect(pickIcon(cls(["TodoNotFoundError"]), none)).toBe("alert");
  });
});

describe("iconOverrides", () => {
  test("reads %% icon: lines and skips unknown names", () => {
    const source =
      "flowchart LR\n  %%  icon:  cli   terminal\n  %% icon: q none\n  %% icon: a rocket\n  cli --> q";
    expect([...iconOverrides(source)]).toEqual([
      ["cli", "terminal"],
      ["q", "none"],
    ]);
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `bun test site/src/client/diagram/icons.test.ts`
Expected: FAIL，訊息是找不到 `./icons.ts`。

- [ ] **Step 3: 在 `icons.ts` 實作**

`pickIcon` 依序判斷，第一條成立的就回傳：

1. `shape !== "rect"` 或 `kind === "state"` → `undefined`
2. 覆寫表有這個 `id` → 覆寫值（`"none"` 回傳 `undefined`）
3. `isActor` → `"user"`
4. 用關鍵字表比對 `lines[0]`
5. 有 `implementsRole` → source 回傳 `"cube"`，target 回傳 `"contract"`
6. `kind === "class"` 且 `stereotype === "interface"` → `"contract"`
7. 用關鍵字表依序比對 `lines.slice(1)`
8. `kind === "class"` → `"cube"`
9. 都不成立 → `undefined`

關鍵字表依下面的順序比對，第一個符合的勝出：

```ts
const KEYWORDS: [IconName, RegExp][] = [
  ["alert", /error|throw|\b[45]\d\d\b|錯誤|例外/i],
  ["user", /使用者|\buser\b/i],
  ["globe", /client|瀏覽器|browser|fetch|curl/i],
  ["terminal", /\bcli\b|終端機|terminal|bun run/i],
  ["entry", /http|handler|路由|route|bun\.serve/i],
  ["clock", /async|await|promise|非同步/i],
  ["check", /\btest\b|expect|測試/i],
  ["gear", /service/i],
  ["cube", /實作|implementation|物件/i],
  ["contract", /interface|介面|合約|契約/i],
  ["fn", /\(\)\s*$|function|函式/i],
  ["db", /sqlite|資料庫|database|\bdb\b/i],
  ["file", /[\w-]+\.(json|ts|js|md|txt|csv|html)\b/i],
];
```

`iconOverrides` 比照 `captionOverrides()`（`steps.ts:125`）逐行比對 `/^\s*%%\s*icon:\s*(\S+)\s+(\S+)\s*$/`，名稱不在 `IconName` 也不是 `none` 的就略過。

- [ ] **Step 4: 確認測試通過**

Run: `bun test site/src/client/diagram/icons.test.ts && bun run site:check && bunx biome check .`
Expected: 全部 PASS、零診斷。

- [ ] **Step 5: Commit**

```bash
git add site/src/client/diagram/icons.ts site/src/client/diagram/icons.test.ts
git commit -m "Add icon rules for diagram nodes"
```

---

### Task 2: 渲染前的準備（parser → 圖示 → 附加敘述）

**Files:**

- Create: `site/src/client/diagram/prepare.ts`
- Test: `site/src/client/diagram/prepare.test.ts`

**Interfaces:**

- Consumes: Task 1 的 `NodeFacts`、`DiagramKind`、`IconName`、`pickIcon`、`iconOverrides`
- Produces:
  - `type MermaidParser = { mermaidAPI: { getDiagramFromText(text: string): Promise<{ type: string; db: unknown }> } }`
  - `type Prepared = { source: string; kind: DiagramKind | undefined; icons: Map<string, IconName> }`
  - `function diagramKind(type: string): DiagramKind | undefined`
  - `function collectNodes(kind: DiagramKind, db: unknown): NodeFacts[]`
  - `function augmentSource(source: string, kind: DiagramKind, slotted: readonly string[], shapes: ReadonlyMap<string, "shapeBranch" | "shapeStore">): string`
  - `function prepareDiagram(mermaid: MermaidParser, source: string): Promise<Prepared>`

- [ ] **Step 1: 寫失敗的測試**

測試裡用假的 db，不載入 Mermaid。斷言如下：

- `diagramKind`：`"flowchart-v2"` → `"flowchart"`；`"sequence"` → `"sequence"`；`"classDiagram"` → `"class"`；`"stateDiagram"` → `"state"`；`"er"` → `"er"`；`"pie"` → `undefined`。
- `collectNodes("flowchart", db)`：假 db 的 `getVertices()` 回傳 `Map`，內容是 `cli`（`text: "CLI（cli.ts）<br>把文字指令變成方法呼叫"`, `type: "square"`）、`d`（`text: "todos.json"`, `type: "cylinder"`）、`m`（`text: "InMemoryTodoRepository"`, `type: undefined`）。`getEdges()` 回傳 `[{ start: "m", end: "r", text: "implements" }]`。預期：`cli` 的 `lines` 是 `["CLI（cli.ts）", "把文字指令變成方法呼叫"]`、`shape` 是 `"rect"`；`d` 的 `shape` 是 `"cylinder"`；`m` 的 `implementsRole` 是 `"source"`。
- `collectNodes("class", db)`：`getClasses()` 回傳 `TodoRepository`（`annotations: ["interface"]`）和 `InMemoryTodoRepository`。`getRelations()` 回傳 `[{ id1: "InMemoryTodoRepository", id2: "TodoRepository", title: "implements", relation: { type1: "none", type2: 1, lineType: 1 } }]`。預期：stereotype 是 `"interface"`，`implementsRole` 一個是 source、一個是 target。
- `collectNodes("sequence", db)`：`getActors()` 回傳 `U`（`description: "使用者"`, `type: "actor"`）。預期：`{ id: "U", lines: ["使用者"], isActor: true, shape: "rect" }`。
- `collectNodes` 遇到 `"state"`、`"er"`、缺少方法的 db，一律回傳 `[]`。
- `augmentSource("flowchart LR\n  a --> b", "flowchart", ["a", "b"], new Map([["q", "shapeBranch"]]))` 回傳 `"flowchart LR\n  a --> b\n  class a,b icoSlot\n  class q shapeBranch"`。
- `augmentSource(src, "class", ["A", "B"], new Map())` 回傳 `src + '\n  cssClass "A,B" icoSlot'`。
- 沒有要附加的內容時，回傳原字串。
- `prepareDiagram`：假 parser 回傳 flowchart db 時，`icons.get("cli")` 是 `"terminal"`，`source` 的結尾含有 `class cli icoSlot`。
- `falls back when the parser throws`：假 parser 丟出錯誤時，回傳 `{ source: 原字串, kind: undefined, icons: 空 Map }`。

- [ ] **Step 2: 確認測試失敗**

Run: `bun test site/src/client/diagram/prepare.test.ts`
Expected: FAIL，訊息是找不到 `./prepare.ts`。

- [ ] **Step 3: 在 `prepare.ts` 實作**

- `diagramKind` 用這幾個 regex：`/^flowchart|^graph/`、`/^sequence/`、`/^class/`、`/^state/`、`/^er$/`。
- `collectNodes` 收到的 `db` 型別是 `unknown`，先用型別守衛確認方法存在再呼叫（Biome 禁止 `any`）。
  - 文字處理：用 `/<br\s*\/?>/i` 切行，去掉其餘標籤，解碼 `&quot; &amp; &lt; &gt; &#39;`，trim 後丟掉空行。
  - flowchart 形狀對應：`diamond`、`cylinder`、`stadium` 照原名；`square`、`round`、`rect`、`undefined` 對應 `rect`；其他對應 `other`。連線文字符合 `/implements/i` 時，`start` 是 source、`end` 是 target。
  - class 的 implements 判斷：`lineType === 1` 且 `type2 === 1` 時，`id1` 是 source、`id2` 是 target；`type1 === 1` 時方向相反；只有 `title` 符合 `/implements/i` 時，`id1` 是 source。`stereotype` 取 `annotations[0]`。
- `prepareDiagram` 的流程：
  1. 呼叫 `getDiagramFromText`。
  2. 由 `diagramKind` 決定類型。
  3. `collectNodes` 收集節點，再用 `pickIcon` 和 `iconOverrides(source)` 判斷每個節點的圖示。
  4. flowchart、class 有圖示的節點放進 `slotted`；sequence 不預留寬度，`slotted` 給空陣列。
  5. flowchart 的菱形對應 `shapeBranch`、圓柱對應 `shapeStore`。
  6. 用 `augmentSource` 組出最後的字串。
  7. 任何例外都回傳原字串、`kind: undefined`、空的 icons。

- [ ] **Step 4: 確認測試通過**

Run: `bun test site/src/client/diagram && bun run site:check && bunx biome check .`
Expected: 全部 PASS、零診斷。

- [ ] **Step 5: Commit**

```bash
git add site/src/client/diagram/prepare.ts site/src/client/diagram/prepare.test.ts
git commit -m "Pick diagram icons from the Mermaid parser before rendering"
```

---

### Task 3: 卡片與圖示（渲染後加工、樣式、接上 main.ts）

**Files:**

- Create: `site/src/client/diagram/decorate.ts`
- Modify: `site/src/client/main.ts:71-74`（`MermaidApi` 型別）、`:86-118`（`mermaidTheme`）、`:120-137`（`renderDiagrams`）
- Modify: `site/src/styles.css`（`.diagram` 區段，約 `:837-935`）

**Interfaces:**

- Consumes: Task 1 的 `ICON_MARKUP`、`ICON_CATEGORY`、`IconName`、`DiagramKind`；Task 2 的 `prepareDiagram`、`Prepared`、`MermaidParser`
- Produces:
  - `function ensureIconSprite(doc: Document): void`：只注入一次隱藏的 `<svg id="diagram-icon-sprite">`，每個圖示是 `<symbol id="dicon-<name>" viewBox="0 0 24 24">`
  - `function decorateDiagram(svg: SVGSVGElement, kind: DiagramKind, icons: ReadonlyMap<string, IconName>): void`
  - 加工過的節點掛上 `data-icon="<name>"` 和 class `cat-<category>`。圖示方塊結構是 `<g class="dicon"><rect class="dicon-tile"/><use class="dicon-glyph" href="#dicon-<name>"/></g>`

- [ ] **Step 1: 接上 `main.ts`**

- `MermaidApi` 改成 `MermaidParser & { initialize…; run… }`。
- 在 `renderDiagrams()` 裡，先 `mermaid.initialize(mermaidTheme())`，再對每個 `pre` 用 `prepareDiagram(mermaid, node.dataset.src ?? "")` 的結果覆蓋 `node.textContent`（`data-src` 保持原文）。`mermaid.run` 之後依序呼叫 `ensureIconSprite(document)`、對每個 `kind` 不是 `undefined` 的圖呼叫 `decorateDiagram`，最後 `attachDiagramAnimators()`。
- `mermaidTheme` 的 `primaryBorderColor` 和 `actorBorder` 改讀 `--line`。

- [ ] **Step 2: 在 `decorate.ts` 實作**

找節點的方式：

| 類型      | 選取                                                     | 對應 id 的方式            |
| --------- | -------------------------------------------------------- | ------------------------- |
| flowchart | `g.node`                                                 | `/-flowchart-(.+)-\d+$/`  |
| class     | `g.node`                                                 | `/-classId-(.+)-\d+$/`    |
| sequence  | `[data-et="participant"][data-id]`（上下兩個方框都處理） | `data-id`                 |
| er        | `g.node`                                                 | 一律放 `db`，不看 `icons` |

圖示的尺寸與位置：

| 類型             | 方塊        | 圖示 | 位置                                                                                                   |
| ---------------- | ----------- | ---- | ------------------------------------------------------------------------------------------------------ |
| flowchart        | 34×34、rx 9 | 20   | 插進節點的 `g.label`，`x = fo.x + 6`，垂直置中於 `foreignObject`                                       |
| class            | 24×24、rx 7 | 16   | 插進 `g.label-group`，`x = fo.x + 4`，垂直置中於名稱列                                                 |
| sequence         | 不畫方塊    | 18   | 方框置中，`y = rect.y + 8`，文字加 `transform="translate(0 10)"`；`rect.height − 文字高度 < 44` 時不放 |
| sequence `actor` | 不畫方塊    | 26   | 火柴人的線條加 class `dicon-hidden`，圖示放在火柴人原本的中心                                          |
| er               | 24×24、rx 7 | 16   | 資料表名稱左側 `fo.x − 28`；超出卡片左緣（`rect.x + 6`）時不放                                         |

- [ ] **Step 3: 在 `styles.css` 加樣式**

```css
pre.mermaid g.node.icoSlot > g.label foreignObject > div {
  padding-left: 46px !important;
  box-sizing: content-box !important;
  text-align: left;
}
pre.mermaid g.node.icoSlot g.label-group foreignObject > div {
  padding-left: 32px !important;
  box-sizing: content-box !important;
}
```

其餘規則：

- flowchart、state 的 `g.node > rect.label-container` 改成 `rx: 12px; ry: 12px`。
- 類別色：`.cat-actor { --tint: var(--foam) }`，以及 `flow`／`pine`、`code`／`iris`、`store`／`gold`、`error`／`love` 四組。
- `.dicon-tile { fill: color-mix(in srgb, var(--tint) 14%, transparent) }`。
- `.dicon-glyph`：`fill: none`、`stroke: var(--tint)`、`stroke-width: 1.6`、圓角端點與轉角。
- `.dicon-hidden { display: none }`。
- 非矩形外框：`g.node.shapeBranch > polygon { stroke: var(--pine) !important }`、`g.node.shapeStore > path { stroke: var(--gold) !important }`。

- [ ] **Step 4: 在瀏覽器驗證 day-13**

用 `bun run site:dev` 啟動，開 day-13 頁面。對第三張圖（架構圖）執行：

```js
() =>
  [
    ...document.querySelectorAll("pre.mermaid")[2].querySelectorAll("g.node"),
  ].map((g) => [
    g.id.match(/-flowchart-(.+)-\d+$/)?.[1],
    g.dataset.icon ?? "-",
  ]);
```

Expected：`U` → `globe`、`H` → `entry`、`CLI` → `terminal`、`S` → `gear`、`R` → `contract`，`M`、`J`、`Q` → `cube`，`T`、`F`、`DB` → `-`。

- [ ] **Step 5: 驗證沒有文字溢出**

在 day-10、day-13、day-12（ER）三頁，對每個 `g.node.icoSlot` 檢查：`foreignObject` 的右緣不超過 `rect` 的右緣，而且方塊和文字的外框不重疊（用 `getBoundingClientRect` 比較）。Expected：沒有任何違規。另外截圖確認淺色、深色、375px 寬度，以及 class 圖（day-10）、sequence（day-10）、ER（day-12）的圖示位置。

- [ ] **Step 6: 跑檢查並 commit**

Run: `bun test site && bun run site:check && bunx biome check .`
Expected: 全部 PASS、零診斷。

```bash
git add site/src/client/diagram/decorate.ts site/src/client/main.ts site/src/styles.css
git commit -m "Draw diagram nodes as icon cards"
```

---

### Task 4: animejs 流動動畫與說明列

**Files:**

- Modify: `site/src/client/diagram/steps.ts`（`DiagramStep`、`edgeSteps`、`sequenceSteps`）
- Modify: `site/src/client/diagram/animator.ts`（移除 canvas，改寫 `#drawLine`，調整說明列）
- Modify: `site/src/styles.css`（流動線、標籤、說明列；刪除 `.diagram-canvas`；`anim-focus` 的三條規則改用 `--accent`）
- Test: `site/src/client/diagram/steps.test.ts`

**Interfaces:**

- Consumes: Task 3 已經加工好的 SVG
- Produces:
  - `DiagramStep` 新增 `chip?: string`
  - `export function chipText(text: string): string`：取第一行、合併空白，超過 24 字截斷成 23 字加「…」，空字串回傳 `""`
  - sequence 的步驟加上 `pulse`：目標參與者第一個 `[data-et="participant"][data-id="<to>"]`；`from === to` 時不加
  - `attachDiagramAnimators(root?: ParentNode): void` 簽名不變

- [ ] **Step 1: 寫 `chipText` 的失敗測試**

```ts
import { expect, test } from "bun:test";
import { chipText } from "./steps.ts";

test("chipText keeps the first line and trims to 24 characters", () => {
  expect(chipText("呼叫")).toBe("呼叫");
  expect(chipText("POST /todos\nbody 是 JSON")).toBe("POST /todos");
  expect(chipText("  a   b  ")).toBe("a b");
  expect(chipText("x".repeat(30))).toBe(`${"x".repeat(23)}…`);
  expect(chipText("")).toBe("");
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `bun test site/src/client/diagram/steps.test.ts`
Expected: FAIL，`chipText` 不存在。

- [ ] **Step 3: 修改 `steps.ts`**

- 實作 `chipText`。
- `edgeSteps` 用 `chipText(labelOf(label))` 設定 `chip`，空字串時不設。標籤文字來自渲染後的 DOM，HTML entity 已經解碼。
- `sequenceSteps` 用訊息文字設定 `chip`，並依上面的規則設定 `pulse`。

Run: `bun test site/src/client/diagram/steps.test.ts`
Expected: PASS。

- [ ] **Step 4: 改寫 `animator.ts` 的動畫部分**

- 刪除 canvas、`ResizeObserver`、`#fitCanvas`、`#clearCanvas`、`route()`、`ease`。
- 新增 `#flow: Timeline | undefined` 和 `#flowNodes: Element[]`，用 `#cancelFlow()` 暫停 timeline 並移除疊加的元素。`#show`、`#goIdle`、`destroy` 一開始都要先呼叫 `#cancelFlow()`。
- `#drawFlow(step, done)` 取代 `#drawLine`：
  1. 建立一條 `<path class="anim-flow">`，插在 `step.motion.element` 的下一個兄弟位置（和連線同一個座標系）。`d` 來源：`kind === "path"` 時複製原本的 `d`；`kind === "line"` 時組成 `M x1 y1 L x2 y2`。
  2. 有 `step.chip` 時，再插入 `<g class="anim-chip"><rect/><text/></g>`。寬度是 `getComputedTextLength() + 16`，高 20、`rx` 10，以原點為中心。
  3. 用 `createTimeline` 播放（時長 `t = #travelTime()`）：
     - 流動線：`opacity [0, 1]` 用 `MOTION.fast`；`strokeDashoffset [0, -42]` 用 `t`，`ease: "linear"`。
     - 標籤：用 `svg.createMotionPath(流動線)` 取得 `translateX`／`translateY`，時長 `t`，`ease: "inOut(3)"`。
     - 標籤：0ms 起 `opacity [0, 1]` 140ms；`t − 100` 起 `opacity [1, 0]` 180ms。
  4. 完成後依序：呼叫 `done()`、用 `MOTION.fast` 淡出流動線並移除所有疊加的元素、`#pop(step.pulse)`。
- `#pop(el)`：
  - `el` 有 `transform="translate(…)"` 屬性時，用 `animate` 把一個 `{ s: 0.96 }` 物件補間到 1（`MOTION.base`、`ease: "out(3)"`），在 `onUpdate` 寫回 `translate(…) scale(s)`，結束時還原原本的屬性。不可以設 CSS `transform`，它會蓋掉 Mermaid 的定位。
  - 沒有 `transform` 屬性時，加上 `transform-box: fill-box; transform-origin: center`，再補間 CSS `scale`。
- `reducedMotion()` 時不呼叫 `#drawFlow`，直接亮起。

- [ ] **Step 5: 改寫說明列**

- 移除 `#counter`。
- `#caption` 前面加 `span.diagram-step`（金色編號）。閒置時加 `hidden` 屬性。
- 後面加 `span.diagram-dots`，`role="img"`，`aria-label` 是「第 n / m 步」或「完成」。其中 `m = steps.length − 1`。`m <= 12` 時放 m 個 `<i>`（走過的加 `.on`）；`m > 12` 時改放 `span.diagram-progress > i`，用寬度百分比表示進度。

- [ ] **Step 6: 加樣式**

```css
pre.mermaid svg .anim-flow {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.8px;
  stroke-linecap: round;
  stroke-dasharray: 0.1 6;
  pointer-events: none;
}
pre.mermaid svg .anim-chip rect {
  fill: var(--surface);
  stroke: var(--accent);
  stroke-width: 1px;
}
pre.mermaid svg .anim-chip text {
  fill: var(--text);
  font: 500 11px var(--font-code);
  text-anchor: middle;
  dominant-baseline: central;
}
```

其餘：

- `.diagram-step`：22px 圓、`--gold` 底、`--surface` 字、12px 粗體。
- `.diagram-dots i`：6px 圓、`--line` 底，`.on` 時用 `--accent`。
- `.diagram-progress`：高 3px、圓角、`--line` 底，內層 `i` 用 `--accent`、`transition: width var(--dur) var(--ease-move)`。
- 手機版沿用 `@media (max-width: 40rem)` 原本給 `.diagram-counter` 的規則，改套到 `.diagram-dots`。

- [ ] **Step 7: 在瀏覽器驗證（含 Review Focus）**

在 day-13 頁面播放架構圖：

1. 流動途中檢查 `document.querySelectorAll(".anim-chip").length === 1`，抵達後是 `0`，`.anim-flow` 也是 `0`。
2. 錯誤處理那張圖（第二張）播到 `{ "error": 訊息 }` 那一步，確認標籤文字是解碼後的。
3. 連按 5 次「下一步」，每次之後都確認 `.anim-chip` 最多 1 個。
4. 播放中按主題切換，`list_console_messages` 沒有 error，圖重新渲染成閒置狀態。
5. 用 `emulate` 開啟 `prefers-reduced-motion: reduce` 再播放，全程沒有 `.anim-chip`。
6. sequence 圖（17 則訊息）出現 `.diagram-progress`，沒有 `.diagram-dots i`。

在 day-10 第一張圖（有 subgraph）播放，在 `onComplete` 前一刻取標籤的 `getBoundingClientRect()` 中心，和連線終點的 `getScreenCTM()` 換算位置比較。Expected：距離小於 2px。

- [ ] **Step 8: 跑檢查並 commit**

Run: `bun test site && bun run site:check && bunx biome check .`
Expected: 全部 PASS、零診斷。

```bash
git add site/src/client/diagram/steps.ts site/src/client/diagram/steps.test.ts site/src/client/diagram/animator.ts site/src/styles.css
git commit -m "Animate diagram steps with flowing dots and data chips"
```

---

### Task 5: 圖示清單審查、文件與總驗證

**Files:**

- Modify: `docs/animation-authoring-guide.md`（第 8 節）
- Modify: 依審查結果可能修改 `site/src/client/diagram/icons.ts`、`icons.test.ts`，或在課文 README 加 `%% icon:` 行

- [ ] **Step 1: 產出圖示清單**

逐頁開啟 14 課與 `ROADMAP.md` 的頁面，對每張圖收集「頁面、第幾張圖、節點 id、第一行文字、`data-icon`」，寫成 `$SCRATCHPAD/icon-report.md`（每張圖一個表格）。

- [ ] **Step 2: 交給使用者審查（暫停點）**

把清單路徑給使用者，等待回覆。配錯的地方優先調整 `KEYWORDS`，同時補一個對應的測試案例；規則調不動的，才在 README 加 `%% icon: <id> <name>`。

- [ ] **Step 3: 更新 `docs/animation-authoring-guide.md` 第 8 節**

- 「運作方式」第一點改成：節點加上依類別上色的線條圖示，播放時由 animejs 在 SVG 上畫出流動的圓點，資料標籤沿線移動。
- 新增「### 自訂圖示」小節：`%% icon: <節點 id> <圖示名稱>` 語法、`none` 的用法，以及 14 個圖示名稱。說明非矩形節點與 state 圖不放圖示，sequence 圖的 id 是 `participant` 的別名。
- 寫清楚判斷順序：第一行的關鍵字 → `implements` → 其餘各行 → class 圖預設物件。

- [ ] **Step 4: 總驗證**

Run: `bun run verify && bun run site:check && bun run site:build`
Expected: 全部通過，site:build 輸出「網站建置完成」。若 README 有改，確認 GitHub 上的 Mermaid 顯示不受 `%% icon:` 影響（Mermaid 會把 `%%` 開頭的行當註解略過）。

- [ ] **Step 5: Commit**

```bash
git add docs/animation-authoring-guide.md site/src/client/diagram day-*/README.md ROADMAP.md
git commit -m "Document diagram icons and tune icon rules"
```
