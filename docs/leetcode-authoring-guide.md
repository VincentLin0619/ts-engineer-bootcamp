# LeetCode 副線撰寫規範

LeetCode 副線是主線課程的加練：十題經典的 Easy 題，每題都對應到主線的某一天，並附上可以自己改輸入的動畫。這份文件說明每一題的檔案結構與寫法。

寫之前也要讀：

- `docs/lesson-authoring-guide.md`：文字、程式、練習機制的規範同樣適用。
- `docs/animation-authoring-guide.md`：動畫的寫法。

## 1. 題目清單

清單與順序固定，資料夾名稱 = 四位數題號 + LeetCode 網址上的代稱。

| 資料夾                                 | 題目                                                  | 用到的技巧               | 建議時機    |
| -------------------------------------- | ----------------------------------------------------- | ------------------------ | ----------- |
| `0412-fizz-buzz`                       | Fizz Buzz                                             | `if`／`else`、取餘數 `%` | Day 03 之後 |
| `1480-running-sum-of-1d-array`         | Running Sum of 1d Array（一維陣列的累加和）           | 迴圈累加                 | Day 03 之後 |
| `1672-richest-customer-wealth`         | Richest Customer Wealth（最富有客戶的資產總量）       | 巢狀陣列、`reduce`       | Day 04 之後 |
| `0121-best-time-to-buy-and-sell-stock` | Best Time to Buy and Sell Stock（買賣股票的最佳時機） | 走一次、記住目前最小值   | Day 04 之後 |
| `0217-contains-duplicate`              | Contains Duplicate（存在重複元素）                    | `Set`                    | Day 05 之後 |
| `0001-two-sum`                         | Two Sum（兩數之和）                                   | `Map`（雜湊表）          | Day 06 之後 |
| `0283-move-zeroes`                     | Move Zeroes（移動零）                                 | 雙指標、原地修改陣列     | Day 07 之後 |
| `0125-valid-palindrome`                | Valid Palindrome（驗證回文）                          | 雙指標、字串處理         | Day 08 之後 |
| `0704-binary-search`                   | Binary Search（二分搜尋）                             | 每次排除一半             | Day 09 之後 |
| `0020-valid-parentheses`               | Valid Parentheses（有效的括號）                       | 堆疊（stack）            | Day 10 之後 |

「建議時機」是「學完那一天之後就有足夠的基礎」，不是那一天的主題。

## 2. 版權

LeetCode 的題目敘述、範例與限制條件受著作權保護。

- **用自己的話描述題目**，不可以照抄或逐句翻譯原文。
- **範例自己設計**，不要用原題的範例數字。
- 限制條件用自己的話概述重點即可，例如「陣列長度至少 2」。
- 每題附上原題連結（網站會自動從資料夾名稱產生「在 LeetCode 看原題」）。
- 題目名稱與題號可以照用。

## 3. 資料夾結構

```text
leetcode/0001-two-sum/
  README.md                 題目、思路、兩種解法、複雜度、練習
  exercises/two-sum.ts      題目檔，函式本體先 throw
  exercises/two-sum.test.ts 測試，用 loadExercise 載入
  solutions/two-sum.ts      參考解答
```

檔名用題目代稱（資料夾名稱去掉題號）。練習機制和主線完全相同：`bun test leetcode/0001` 未作答時失敗，`SOLUTIONS=1 bun test leetcode/0001` 必須全部通過。

## 4. README 格式

```markdown
# Two Sum（兩數之和）

> LeetCode 1｜Easy｜建議在 Day 06 之後｜技巧：Map（雜湊表）

## 題目

## 先想一想

## 解法一：直覺做法

## 解法二：……

## 複雜度

## 用到的新工具

## 練習

## 自我檢查清單
```

- 第一行標題：英文原題名稱，後面括號放中文名稱。
- 標題下第一個引言**格式固定**，網站會從這一行讀出題號、建議時機與技巧，欄位用全形直線「｜」分開。
- **題目**：用自己的話描述，加上兩三個自己設計的輸入與輸出範例。
- **先想一想**：兩三個引導問題，讓學員先自己想，不直接給答案。
- **解法一**：最直覺的做法（通常是兩層迴圈或暴力法），附程式碼與它慢在哪裡。
- **解法二**：較好的做法，附程式碼、逐步說明，以及動畫標記。只有一種合理做法的題目（例如 Fizz Buzz），可以改成「解法」一節，搭配一個常見的錯誤寫法。
- **複雜度**：用白話說明時間與空間複雜度。第一次出現 Big-O 時解釋它的意思：「資料量變成兩倍時，執行時間大約變成幾倍」。
- **用到的新工具**：主線沒教過、這題用到的東西（例如 `Map`、`Set`、`entries()`、`charCodeAt`），各用兩三句話與一小段程式說明。沒有就寫「沒有新工具，只用到 Day NN 以前的內容」。
- **練習**：說明要完成哪個檔案、怎麼執行測試，附「卡住超過 15 分鐘再看解答」。
- **自我檢查清單**：最後一項固定是測試全部通過。

## 5. 程式

- 解答必須通過 strict 型別檢查（包含 `noUncheckedIndexedAccess`）。用 `for...of`、`entries()`、`??` 這類寫法處理索引可能是 `undefined` 的情況，不要用 `!` 或 `as`。
- 函式名稱用 camelCase 的英文，對應原題的函式名稱，例如 `twoSum`、`isValid`。
- 測試涵蓋：題目裡的範例、邊界情況（最短的輸入、找不到答案、重複值）、一個稍大的輸入。
- README 裡的程式碼必須和 `solutions/` 的程式一致；動畫的程式碼也一樣。

## 6. 動畫

- 每題一個動畫，id 為 `leetcode-` 加資料夾名稱，例如 `leetcode-0001-two-sum`。
- 必須有可修改的輸入，並匯出 `testInputs`。
- 動畫演示的是 README 裡較好的那個解法。

## 7. 驗證

```bash
bun check                                    # 型別
bunx biome check leetcode site               # lint
bun fmt leetcode                             # 排版
SOLUTIONS=1 bun test leetcode/0001           # 解答全過
bun test leetcode/0001                       # 未作答必須失敗
bun site/check-scenes.ts leetcode-0001-two-sum
bun run site:build                           # 確認網頁與動畫標記對得上
```
