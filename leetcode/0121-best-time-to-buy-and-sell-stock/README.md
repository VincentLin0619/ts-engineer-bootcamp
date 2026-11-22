# Best Time to Buy and Sell Stock（買賣股票的最佳時機）

> LeetCode 121｜Easy｜建議在 Day 04 之後｜技巧：走一次、記住目前最小值

## 題目

`prices[i]` 是某一支股票在第 `i` 天的價格。你可以挑一天買進，再挑之後的某一天賣出，而且只能買賣一次。回傳最多能賺多少錢；不管怎麼買賣都賺不到錢時，回傳 0。

至少有 1 天，價格都是 0 以上的整數。

```text
輸入：prices = [8, 3, 6, 2, 7]
輸出：5
說明：在價格 2 那天買進、價格 7 那天賣出，賺 7 - 2 = 5。
      8 雖然是最高價，但它在第一天，前面沒有日子可以買進。

輸入：prices = [9, 7, 5, 2]
輸出：0
說明：價格一路下跌，怎麼買賣都會賠錢，所以不交易。

輸入：prices = [5]
輸出：0
```

## 先想一想

1. 如果已經決定「今天賣出」，應該挑哪一天買進？
2. 從左往右走到某一天時，要記住前面的哪一個數字，才能馬上算出「今天賣出最多賺多少」？
3. 找到一個更低的價格之後，之前算出的最好獲利還算數嗎？

## 解法一：試遍每一組買賣日

最直覺的做法：每一天都試著當買進日，再和它之後的每一天配對，算出所有組合的獲利，留下最大的。

```ts
function maxProfitSlow(prices: number[]): number {
  let best = 0;
  for (let buy = 0; buy < prices.length; buy++) {
    for (let sell = buy + 1; sell < prices.length; sell++) {
      const buyPrice = prices[buy];
      const sellPrice = prices[sell];
      if (buyPrice !== undefined && sellPrice !== undefined) {
        const profit = sellPrice - buyPrice;
        if (profit > best) {
          best = profit;
        }
      }
    }
  }
  return best;
}
```

用索引取值的型別是 `number | undefined`，所以先用 `if` 縮小再相減（Day 02、Day 03）。

答案是對的，但組合太多。`n` 天就有大約 `n × n ÷ 2` 組買賣日要試：10 天是 45 組，1 萬天就要試大約 5000 萬組。天數變成兩倍，要試的組合就變成大約四倍。

## 解法二：走一次，記住目前最低價

換個角度想：如果決定「今天賣出」，最好的買進日一定是**今天以前價格最低的那一天**。所以只要從左往右走一次，一路記住兩件事：

- `minPrice`：到今天為止看過的最低價。
- `best`：到今天為止最好的獲利。

每走到一天，就用 `price - minPrice` 算出「今天賣出能賺多少」，比 `best` 多就換掉。

```ts
export function maxProfit(prices: number[]): number {
  let minPrice = Infinity; // lowest price seen so far
  let best = 0; // best profit seen so far
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    }
    const profit = price - minPrice;
    if (profit > best) {
      best = profit;
    }
  }
  return best;
}
```

1. `minPrice` 從 `Infinity` 開始（見「用到的新工具」），代表「還沒看過任何價格」。第一天的價格一定比它低，所以第一圈就會換成第一天的價格。
2. `best` 從 0 開始：完全不交易就是賺 0，答案不會比 0 小。
3. 每一天先檢查今天是不是新的最低價。是的話就記下來，之後的日子都可以考慮在今天買進。
4. `profit` 是「在最低價那天買進、今天賣出」的獲利。今天剛好就是最低價時，`profit` 是 0，等於不交易。
5. `profit` 比 `best` 多，就把 `best` 換掉。

以第一個範例為例，每一圈結束時：

| 位置 | `price` | `minPrice` | `profit` | `best` |
| ---- | ------- | ---------- | -------- | ------ |
| 0    | 8       | 8          | 0        | 0      |
| 1    | 3       | 3          | 0        | 0      |
| 2    | 6       | 3          | 3        | 3      |
| 3    | 2       | 2          | 0        | 3      |
| 4    | 7       | 2          | 5        | 5      |

注意位置 3：價格 2 成為新的最低價，但 `best` 仍然是 3。`best` 記住的是「到目前為止」最好的結果，換了更低的買進價，只會讓之後有機會賺更多，不會讓已經算過的獲利消失。

> ▶ 動畫演示：[從左往右走一次，看 minPrice 和 best 怎麼變化](https://vincentlin0619.github.io/ts-engineer-bootcamp/leetcode/0121-best-time-to-buy-and-sell-stock/#anim-leetcode-0121-best-time-to-buy-and-sell-stock)

## 複雜度

Big-O 描述「資料量變成兩倍時，執行時間大約變成幾倍」。`n` 是天數。

| 解法   | 時間                                       | 額外空間                                  |
| ------ | ------------------------------------------ | ----------------------------------------- |
| 解法一 | O(n²)：天數變兩倍，時間變成大約四倍        | O(1)：只多用幾個變數                      |
| 解法二 | O(n)：每天只看一次，天數變兩倍時間也變兩倍 | O(1)：只多用 `minPrice`、`best`、`profit` |

O(1) 的意思是「用量固定，不會隨資料變多而增加」。

## 用到的新工具

### `Infinity`

`Infinity` 是 `number` 型別裡的一個特殊值，比任何數字都大。要找最小值時，常拿它當起點：第一個拿來比較的數字一定比它小，馬上就會取代它。

```ts
console.log(5 < Infinity); // true
console.log(999999 < Infinity); // true

let minPrice = Infinity;
if (8 < minPrice) {
  minPrice = 8; // the first price always replaces Infinity
}
console.log(minPrice); // 8
```

如果起點寫成 0，所有價格都不會比 0 低，`minPrice` 就永遠停在 0，答案會錯。

## 練習

完成 [`exercises/best-time-to-buy-and-sell-stock.ts`](exercises/best-time-to-buy-and-sell-stock.ts) 裡的 `maxProfit`：把 `throw new Error(...)` 換成你的程式，然後在專案根目錄執行：

```bash
# 檢查你的答案：全部顯示 pass 就完成了
bun test leetcode/0121
```

卡住超過 15 分鐘再看 [`solutions/best-time-to-buy-and-sell-stock.ts`](solutions/best-time-to-buy-and-sell-stock.ts) 裡的參考解答。看完後把解答關掉，自己重寫一次。

## 自我檢查清單

- [ ] 我能說出「今天賣出」時，最好的買進日是哪一天。
- [ ] 我能說出 `minPrice` 為什麼從 `Infinity` 開始，而不是 0。
- [ ] 我能解釋最低價換掉之後，`best` 為什麼不用歸零。
- [ ] `bun test leetcode/0121` 全部通過。
