# 專案說明

這是一套兩週的 TypeScript 入門課程，學員是這個 repo 的擁有者。課文是繁體中文，程式碼註解是英文。

- 課綱與使用方式：`README.md`
- 課程撰寫規範與 Todo 主線規格：`docs/lesson-authoring-guide.md`
- 網站動畫撰寫規範：`docs/animation-authoring-guide.md`
- LeetCode 副線撰寫規範：`docs/leetcode-authoring-guide.md`
- 範本課程：`day-01-setup-variables-types/`

新增或修改任何一天的課程前，先讀 `docs/lesson-authoring-guide.md`。主線專案的型別與函式簽名以該文件第 8 節為準，不可自行更名。

## 工具

一律使用 Bun，不使用 Node.js、npm、ts-node、jest、vite、express。

- `bun run <file>` 執行程式
- `bun test day-NN`、`bun test leetcode/NNNN` 執行測試；未作答的練習會失敗，這是預期行為
- `SOLUTIONS=1 bun test` 用參考解答跑同一組測試，必須全部通過
- `bun check` 型別檢查
- `bunx biome check .` lint，不可以有 error、warning、info
- `bun fmt` 排版
- `bun run verify` 一次跑完上面所有檢查

課程本身不安裝外部套件。只用 Bun 內建功能（`bun:test`、`bun:sqlite`、`Bun.serve`、`Bun.file`、`Bun.markdown`、`Bun.build`）與 `node:` 標準模組。Bun 的 API 以 `node_modules/bun-types/docs/` 與 `node_modules/bun-types/bun.d.ts` 為準。

## 課程網站

網址：<https://vincentlin0619.github.io/ts-engineer-bootcamp/>。推送到 `main` 後，`.github/workflows/pages.yml` 會先跑 `bun run verify`，通過才建置並部署。

- `site/build.ts` 把每一課的 README、`leetcode/` 與 `ROADMAP.md` 轉成網頁，輸出到 `site/dist/`（不進 git）。
- 動畫場景在 `site/src/client/player/scenes/`，檔名等於場景 id。課文用一行 `> ▶ 動畫演示：[…](…#anim-<id>)` 嵌入。
- `bun site/check-scenes.ts [id…]` 驗證場景；`bun run site:check` 型別檢查；`bun run site:build` 建置；`bun run site:dev` 建置後在 `http://localhost:4321/` 預覽。

## 修改課程後

1. 對改過的資料夾執行 `docs/lesson-authoring-guide.md` 第 10 節的驗證指令。
2. 逐一執行改過的範例，確認輸出與課文一致。
3. 驗證改過的 Mermaid 圖能正常轉圖。
4. 改過課文或動畫時，執行 `bun run site:build`，確認動畫標記都對得上。
5. 課綱有變動時同步更新 `README.md` 的課綱表格。
