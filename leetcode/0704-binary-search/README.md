# Binary Search（二分搜尋）

> LeetCode 704｜Easy｜建議在 Day 09 之後｜技巧：每次排除一半

## 題目

給你一個**由小到大排好、沒有重複數字**的整數陣列 `nums`，和一個整數 `target`。回傳 `target` 在陣列裡的位置；不在陣列裡就回傳 `-1`。

- 陣列至少有 1 個數字。
- 原題要求的速度是 O(log n)（說明見「複雜度」），也就是不能一個一個找。

| `nums`                                   | `target` | 回傳 |
| ---------------------------------------- | -------- | ---- |
| `[3, 9, 14, 20, 27, 31, 38, 45, 52, 60]` | `38`     | `6`  |
| `[3, 9, 14, 20, 27, 31, 38, 45, 52, 60]` | `10`     | `-1` |
| `[7]`                                    | `7`      | `0`  |

用 `-1` 代表「找不到」，和 Day 05 學過的字串 `indexOf` 是同一個習慣。

## 先想一想

1. 在一本按照注音排好的字典裡查一個字，你會從第一頁開始一頁一頁翻嗎？
2. 看了正中間的數字，發現它比 `target` 小。左半邊還有可能找到 `target` 嗎？
3. 每看一個數字就能丟掉一半，1000 個數字最多要看幾次？

## 解法一：直覺做法

從頭開始一個一個比：

```ts
function searchOneByOne(nums: readonly number[], target: number): number {
  for (const [i, value] of nums.entries()) {
    if (value === target) {
      return i;
    }
  }
  return -1;
}
```

`entries()` 同時給出位置和元素，在 [0001 Two Sum](../0001-two-sum/README.md) 介紹過。

慢在哪裡：它完全沒有用到「陣列已經排好」這件事。`target` 在最後面或根本不在陣列裡時，每個數字都要看一次；一百萬個數字就要比一百萬次。

## 解法二：每次看中間，丟掉一半

用 `left`、`right` 圍出「答案可能在的範圍」，一開始是整個陣列。每一圈：

1. 看範圍正中間的位置 `mid`。
2. `nums[mid]` 等於 `target`：找到了，回傳 `mid`。
3. `nums[mid]` 比 `target` 小：因為陣列由小到大排好，`mid` 和它左邊的數字都更小，全部丟掉，`left = mid + 1`。
4. `nums[mid]` 比 `target` 大：`mid` 和它右邊的數字都更大，全部丟掉，`right = mid - 1`。

範圍縮到沒有任何數字（`left > right`）還沒找到，就回傳 `-1`。

```ts
export function search(nums: readonly number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = nums[mid];
    if (value === undefined) {
      return -1; // never happens: mid is always between left and right
    }
    if (value === target) {
      return mid;
    }
    if (value < target) {
      left = mid + 1; // target can only be on the right
    } else {
      right = mid - 1; // target can only be on the left
    }
  }
  return -1;
}
```

在 `[3, 9, 14, 20, 27, 31, 38, 45, 52, 60]` 裡找 `38`：

| 第幾圈 | `left` | `right` | `mid` | `nums[mid]` | 結果    | 下一步                    |
| ------ | ------ | ------- | ----- | ----------- | ------- | ------------------------- |
| 1      | 0      | 9       | 4     | 27          | 27 < 38 | 丟掉位置 0–4，`left = 5`  |
| 2      | 5      | 9       | 7     | 45          | 45 > 38 | 丟掉位置 7–9，`right = 6` |
| 3      | 5      | 6       | 5     | 31          | 31 < 38 | 丟掉位置 5，`left = 6`    |
| 4      | 6      | 6       | 6     | 38          | 相等    | 回傳 6                    |

找 `10` 的話：27 太大（`right = 3`）、9 太小（`left = 2`）、14 太大（`right = 1`），這時 `left` 是 2、`right` 是 1，範圍裡沒有數字了，回傳 `-1`。

幾個容易寫錯的細節：

- 迴圈條件是 `left <= right`，**等號不能少**。`left` 等於 `right` 時，範圍裡還剩一個數字沒檢查，上面那張表的第 4 圈就是這種情況。
- 移動時要寫 `mid + 1`、`mid - 1`，不能寫成 `left = mid`。`mid` 已經檢查過了，如果不跳過它，範圍可能永遠縮不下去，迴圈停不下來。
- `if (value === undefined)` 這三行永遠不會執行，因為 `mid` 一定在 `left` 和 `right` 之間。但 TypeScript 看不出這一點：在本專案的 strict 設定下，`nums[mid]` 的型別是 `number | undefined`。照 Day 07 學的，用一個 `if` 把 `undefined` 排除，後面的 `value` 就是 `number`。

> ▶ 動畫演示：[每看一次中間，就丟掉不可能有答案的那一半](https://vincentlin0619.github.io/ts-engineer-bootcamp/leetcode/0704-binary-search/#anim-leetcode-0704-binary-search)

## 複雜度

Big-O 用來描述「資料量變大時，花費怎麼跟著變大」。O(n) 的意思是：資料量變成兩倍，執行時間大約也變成兩倍。

| 解法               | 時間     | 額外的記憶體 |
| ------------------ | -------- | ------------ |
| 解法一：一個一個比 | O(n)     | O(1)         |
| 解法二：二分搜尋   | O(log n) | O(1)         |

O(log n) 的意思是：資料量變成兩倍，只要**多看一次**。因為每看一次範圍就砍半，n 個數字最多砍幾次就剩一個：

| 數字個數  | 解法一最多比幾次 | 解法二最多看幾次 |
| --------- | ---------------- | ---------------- |
| 10        | 10               | 4                |
| 1000      | 1000             | 10               |
| 1,000,000 | 1,000,000        | 20               |

代價是：陣列一定要先排好。沒排好的陣列，丟掉一半的推理就不成立了。

## 用到的新工具

### `Math.floor`：無條件捨去

`Math.floor(x)` 回傳小於或等於 `x` 的最大整數，也就是把小數部分捨去。`(left + right) / 2` 可能是 4.5 這種小數，不能拿來當位置，所以要先捨去。

```ts
console.log(Math.floor(4.5)); // 4
console.log(Math.floor(9 / 2)); // 4
console.log(Math.floor(6)); // 6
```

## 練習

完成 [`exercises/binary-search.ts`](exercises/binary-search.ts) 裡的 `search`，然後在專案根目錄執行：

```bash
bun test leetcode/0704
```

全部顯示 pass 就完成了。請用解法二寫：測試只檢查答案對不對，不會檢查你有沒有一個一個找，這要靠你自己守住。

卡住超過 15 分鐘再看 [`solutions/binary-search.ts`](solutions/binary-search.ts)。看完後關掉解答，自己重寫一次。

## 自我檢查清單

- [ ] 我能說出 `left` 和 `right` 圍出的範圍代表什麼。
- [ ] 我能解釋為什麼 `nums[mid]` 比 `target` 小時，可以丟掉 `mid` 和它左邊的全部。
- [ ] 我知道迴圈條件為什麼是 `left <= right`，以及為什麼要寫 `mid + 1`、`mid - 1`。
- [ ] 我能用「資料量變成兩倍時多看一次」解釋 O(log n)。
- [ ] 我知道二分搜尋為什麼只能用在排好的陣列上。
- [ ] `bun test leetcode/0704` 全部通過。
