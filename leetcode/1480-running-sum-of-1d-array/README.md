# Running Sum of 1d Array（一維陣列的累加和）

> LeetCode 1480｜Easy｜建議在 Day 03 之後｜技巧：迴圈累加

## 題目

給一個數字陣列 `nums`，回傳一個一樣長的新陣列：新陣列的第 `i` 個位置，是 `nums` 從第 0 個一路加到第 `i` 個的總和。這種「一路加過去」的結果叫做累加和（running sum）。

`nums` 至少有 1 個數字，數字可以是負數或 0。

```text
輸入：nums = [2, 5, -1, 4]
輸出：[2, 7, 6, 10]
說明：2、2 + 5、2 + 5 + (-1)、2 + 5 + (-1) + 4

輸入：nums = [10]
輸出：[10]

輸入：nums = [4, 0, 6, 3, 0]
輸出：[4, 4, 10, 13, 13]
```

## 先想一想

1. 用紙筆算 `[2, 5, -1, 4]` 的第 4 個答案時，你會從頭加起，還是拿第 3 個答案來用？
2. 第 `i` 個答案和第 `i - 1` 個答案只差了什麼？
3. 要記住「到目前為止的總和」，需要幾個變數？

## 解法一：每個位置都從頭加

最直接的想法：輪到第 `i` 個位置時，用內層迴圈把第 0 個到第 `i` 個重新加一遍。

```ts
function runningSumSlow(nums: number[]): number[] {
  const sums: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    // Add nums[0] to nums[i] again, from scratch
    let total = 0;
    for (let j = 0; j <= i; j++) {
      const value = nums[j];
      if (value !== undefined) {
        total += value;
      }
    }
    sums.push(total);
  }
  return sums;
}
```

用索引取值的型別是 `number | undefined`，所以先用 `if` 縮小再相加（Day 02、Day 03）。

答案是對的，但做了很多重複的加法：

```text
nums    = [2, 5, -1, 4]

sums[0] = 2                  = 2
sums[1] = 2 + 5              = 7
sums[2] = 2 + 5 + (-1)       = 6
sums[3] = 2 + 5 + (-1) + 4   = 10
          └──────────┘
          這一段就是 sums[2]，又重算了一次
```

第 0 個位置加 1 個數字，第 1 個位置加 2 個，……，最後一個位置加 `n` 個（`n` 是陣列長度）。總共大約 `n × n ÷ 2` 次加法，陣列長度變成兩倍，加法次數就變成大約四倍。

## 解法二：沿用上一個總和

從上面那張圖可以看出：**第 `i` 個答案 = 第 `i - 1` 個答案 + `nums[i]`**。所以不必每次從頭加，只要用一個變數 `total` 記住「到目前為止的總和」，每看到一個新的數字就加上去：

```text
total： 0 ─(+2)→ 2 ─(+5)→ 7 ─(+(-1))→ 6 ─(+4)→ 10
push：           2        7           6        10
```

```ts
export function runningSum(nums: number[]): number[] {
  const sums: number[] = [];
  let total = 0;
  for (const value of nums) {
    total += value;
    sums.push(total);
  }
  return sums;
}
```

1. `sums` 先是空陣列，用來收集答案。
2. `total` 從 0 開始，代表「還沒加任何數字」。它會一直改變，所以用 `let`。
3. `for...of` 依序拿出每一個值。這裡不需要索引，所以不用 `for`（Day 03 的規範：走過陣列優先用 `for...of`）。
4. `total += value` 是 Day 03 的累加寫法，等同 `total = total + value`。加完之後，`total` 正好是「從第 0 個加到現在這一個」的總和。
5. `sums.push(total)` 把這個總和放到 `sums` 的尾端，它就是這個位置的答案。
6. 迴圈結束時，`sums` 和 `nums` 一樣長。`nums` 從頭到尾沒有被改動。

每個數字只加一次，就能得到全部的答案。

> ▶ 動畫演示：[total 怎麼一路累加，每加一次就把結果放進 sums](https://vincentlin0619.github.io/ts-engineer-bootcamp/leetcode/1480-running-sum-of-1d-array/#anim-leetcode-1480-running-sum-of-1d-array)

## 複雜度

Big-O 描述「資料量變成兩倍時，執行時間大約變成幾倍」。`n` 是陣列長度。

| 解法   | 時間                                           | 額外空間                               |
| ------ | ---------------------------------------------- | -------------------------------------- |
| 解法一 | O(n²)：長度變兩倍，時間變成大約四倍            | O(n)：回傳的陣列                       |
| 解法二 | O(n)：每個數字只加一次，長度變兩倍時間也變兩倍 | O(n)：回傳的陣列，另外只多一個 `total` |

`n` 是 1000 的時候，解法一大約要做 50 萬次加法，解法二只要 1000 次。

## 用到的新工具

沒有新工具，只用到 Day 03 以前的內容：`for...of`、`+=`、`push`。

## 練習

完成 [`exercises/running-sum-of-1d-array.ts`](exercises/running-sum-of-1d-array.ts) 裡的 `runningSum`：把 `throw new Error(...)` 換成你的程式，然後在專案根目錄執行：

```bash
# 檢查你的答案：全部顯示 pass 就完成了
bun test leetcode/1480
```

卡住超過 15 分鐘再看 [`solutions/running-sum-of-1d-array.ts`](solutions/running-sum-of-1d-array.ts) 裡的參考解答。看完後把解答關掉，自己重寫一次。

## 自我檢查清單

- [ ] 我能說出解法一重複做了哪些加法。
- [ ] 我能用一句話說明「第 `i` 個答案」和「第 `i - 1` 個答案」的關係。
- [ ] 我能說出 `total` 為什麼要宣告在迴圈外面。
- [ ] `bun test leetcode/1480` 全部通過。
