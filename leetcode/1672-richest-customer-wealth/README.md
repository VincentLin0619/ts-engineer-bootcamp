# Richest Customer Wealth（最富有客戶的資產總量）

> LeetCode 1672｜Easy｜建議在 Day 04 之後｜技巧：巢狀陣列、reduce

## 題目

`accounts` 是一個陣列，裡面的每一個元素又是一個陣列（見「用到的新工具」）。`accounts[i]` 列出第 `i` 位客戶在各家銀行的存款，一位客戶的資產就是他所有存款的總和。回傳最富有的那位客戶的資產。

至少有 1 位客戶，每位客戶在同樣幾家銀行各有一筆存款（至少一家），金額都是正整數。

```text
輸入：accounts = [[3, 8, 1], [5, 5, 5], [2, 9, 1]]
輸出：15
說明：三位客戶的資產分別是 12、15、12，最多的是 15

輸入：accounts = [[4], [10], [7]]
輸出：10

輸入：accounts = [[6, 1, 2], [2, 4, 3]]
輸出：9
說明：兩位客戶一樣多，都是 9
```

## 先想一想

1. 這題可以拆成哪兩件小事？
2. 把一位客戶的存款加起來，Day 04 的哪一個陣列方法最適合？
3. 「目前最多的資產」一開始要設成多少？為什麼 0 可以？

## 解法一：兩層迴圈

外層迴圈一次拿出一位客戶，內層迴圈把這位客戶的存款一筆一筆加起來，再和目前最多的資產比較。

```ts
function maximumWealthLoops(accounts: number[][]): number {
  let richest = 0;
  for (const customer of accounts) {
    let wealth = 0;
    for (const money of customer) {
      wealth += money;
    }
    if (wealth > richest) {
      richest = wealth;
    }
  }
  return richest;
}
```

這個做法其實不慢：每一筆存款只加一次，已經是這題最快的速度，因為不看完每一筆存款就不可能知道總和。

可以改進的是讀起來的感覺。`let wealth = 0`、內層迴圈、`wealth += money` 這幾行合起來只做一件事：「把一位客戶的存款加起來」，但讀的人要看完整段才知道。

## 解法二：用 reduce 算出每位客戶的資產

Day 04 學過，`reduce` 帶著一個累計值走過整個陣列，最常用來加總。把內層迴圈換成一行 `reduce`，每一行程式就只做一件事：

```ts
export function maximumWealth(accounts: number[][]): number {
  let richest = 0;
  for (const customer of accounts) {
    const wealth = customer.reduce((total, money) => total + money, 0);
    if (wealth > richest) {
      richest = wealth;
    }
  }
  return richest;
}
```

1. `richest` 記住「到目前為止最多的資產」。存款都是正整數，任何客戶的資產都大於 0，所以從 0 開始，第一位客戶一定會取代它。
2. 外層 `for...of` 每一圈拿出一位客戶。`accounts` 的型別是 `number[][]`，所以 `customer` 的型別是 `number[]`。
3. `customer.reduce((total, money) => total + money, 0)` 就是 Day 04 的加總寫法：`total` 是累計值、`money` 是目前這一筆、最後的 `0` 是起點。結果存進 `wealth`，它不會再改變，所以用 `const`。
4. `wealth` 比 `richest` 多，就把 `richest` 換掉。一樣多的時候不用換，答案相同。
5. 所有客戶都看完之後，`richest` 就是答案。

以第一個範例為例：

| 這一圈的 `customer` | `wealth` | `wealth > richest` | 這一圈結束後的 `richest` |
| ------------------- | -------- | ------------------ | ------------------------ |
| （迴圈開始前）      |          |                    | 0                        |
| `[3, 8, 1]`         | 12       | 12 > 0，成立       | 12                       |
| `[5, 5, 5]`         | 15       | 15 > 12，成立      | 15                       |
| `[2, 9, 1]`         | 12       | 12 > 15，不成立    | 15                       |

> ▶ 動畫演示：[reduce 怎麼算出每位客戶的資產，richest 什麼時候被換掉](https://vincentlin0619.github.io/ts-engineer-bootcamp/leetcode/1672-richest-customer-wealth/#anim-leetcode-1672-richest-customer-wealth)

## 複雜度

Big-O 描述「資料量變成兩倍時，執行時間大約變成幾倍」。假設有 `m` 位客戶、每位有 `n` 筆存款。

- 時間複雜度 O(m × n)：每一筆存款都剛好加一次。客戶變成兩倍，時間大約也變成兩倍。兩種解法都一樣。
- 額外空間 O(1)：不管有多少客戶，都只多用 `richest` 和 `wealth` 兩個變數。O(1) 的意思是「用量固定，不會隨資料變多而增加」。

## 用到的新工具

### `number[][]`：陣列裡面放陣列

Day 02 學過 `number[]` 是「數字的陣列」。把 `number[]` 再當成元素，就是 `number[][]`：「數字陣列的陣列」，也叫二維陣列。可以把它想成一張表格，每一列是一個 `number[]`。

```ts
const accounts: number[][] = [
  [3, 8, 1], // customer 0
  [5, 5, 5], // customer 1
];

console.log(accounts.length); // 2: there are two rows

for (const customer of accounts) {
  // `customer` is one row, a number[]
  console.log(customer.length); // 3, then 3
}
```

用索引取出一列時，`accounts[0]` 的型別是 `number[] | undefined`，和 Day 02 用索引取值一樣要先縮小。用 `for...of` 一次拿出一整列，就不必處理 `undefined`。

## 練習

完成 [`exercises/richest-customer-wealth.ts`](exercises/richest-customer-wealth.ts) 裡的 `maximumWealth`：把 `throw new Error(...)` 換成你的程式，然後在專案根目錄執行：

```bash
# 檢查你的答案：全部顯示 pass 就完成了
bun test leetcode/1672
```

卡住超過 15 分鐘再看 [`solutions/richest-customer-wealth.ts`](solutions/richest-customer-wealth.ts) 裡的參考解答。看完後把解答關掉，自己重寫一次。

## 自我檢查清單

- [ ] 我能說出 `number[][]` 是什麼，以及 `for...of` 走過它時每一圈拿到什麼。
- [ ] 我能用 `reduce` 把一個數字陣列加總，並說出最後的 `0` 是做什麼的。
- [ ] 我能說出 `richest` 為什麼可以從 0 開始。
- [ ] `bun test leetcode/1672` 全部通過。
