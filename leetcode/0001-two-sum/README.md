# Two Sum（兩數之和）

> LeetCode 1｜Easy｜建議在 Day 06 之後｜技巧：Map（雜湊表）

## 題目

給你一個整數陣列 `nums` 和一個整數 `target`。從陣列裡挑出兩個**不同位置**的數字，讓它們相加剛好等於 `target`，回傳這兩個位置，小的位置放前面。

- 同一個位置不能用兩次，但兩個位置上的數字可以一樣。
- 陣列至少有 2 個數字。
- 有答案時只會有一組。原題保證一定有答案；這裡多處理一種情況：找不到就回傳空陣列 `[]`。

| `nums`         | `target` | 回傳     | 說明                              |
| -------------- | -------- | -------- | --------------------------------- |
| `[3, 8, 5, 1]` | `13`     | `[1, 2]` | 位置 1 的 8 加上位置 2 的 5 是 13 |
| `[6, 6]`       | `12`     | `[0, 1]` | 數字一樣沒關係，位置不同就好      |
| `[2, 4, 7]`    | `20`     | `[]`     | 任兩個數字加起來都不是 20         |

## 先想一想

1. 用手算的話，你會怎麼找？最多要試幾組？
2. 走到某個數字 `value` 時，你其實已經知道「另一半」應該是多少。是多少？
3. 如果有一本筆記，記下「看過的數字在哪個位置」，第 2 題的「另一半」要怎麼查？

## 解法一：直覺做法

把每一組「兩個位置」都試一次：外層迴圈選第一個數字，內層迴圈選第二個數字。

```ts
function twoSumSlow(nums: readonly number[], target: number): number[] {
  for (const [i, a] of nums.entries()) {
    for (const [j, b] of nums.entries()) {
      if (j > i && a + b === target) {
        return [i, j];
      }
    }
  }
  return [];
}
```

- `entries()` 同時給出位置和數字，說明在「用到的新工具」。
- `j > i` 讓第二個位置一定在第一個位置的右邊：同一個位置不會用兩次，同一組也不會試兩遍。

慢在哪裡：每選一個 `a`，內層迴圈就要把整個陣列再走一遍。陣列有 n 個數字，就要檢查大約 n × n 次；一萬個數字就是一億次。

## 解法二：用 Map 記住看過的數字

換個問法：走到數字 `value` 時，需要的另一半是 `need = target - value`。只要能馬上回答「`need` 之前出現過嗎？在哪個位置？」，就不用回頭重找。

`Map` 就是這本筆記：key 放看過的數字，value 放它的位置。不管裡面記了多少筆，查一次都幾乎不花時間。

```ts
export function twoSum(nums: readonly number[], target: number): number[] {
  const seen = new Map<number, number>(); // value -> index
  for (const [i, value] of nums.entries()) {
    const need = target - value;
    const j = seen.get(need);
    if (j !== undefined) {
      return [j, i];
    }
    seen.set(value, i);
  }
  return [];
}
```

以 `nums = [3, 8, 5, 1]`、`target = 13` 為例：

1. 建立空的 `seen`。
2. 位置 0 的 3：需要 10，`seen` 裡沒有。記下 `3 → 0`。
3. 位置 1 的 8：需要 5，`seen` 裡沒有。記下 `8 → 1`。
4. 位置 2 的 5：需要 8，`seen.get(8)` 得到 1。回傳 `[1, 2]`，位置 3 的 1 根本不用看。

```text
看到的數字   需要的另一半   seen 裡有嗎？   之後的 seen
3            10             沒有            { 3 → 0 }
8            5              沒有            { 3 → 0, 8 → 1 }
5            8              有，在位置 1    回傳 [1, 2]
```

三個容易寫錯的細節：

- **先查再記**。如果先 `set` 再 `get`，遇到 `nums = [6, 1]`、`target = 12`，6 會在 Map 裡找到自己，回傳錯誤的 `[0, 0]`。
- 找到時回傳 `[j, i]`：`j` 是之前記下的位置，一定比現在的 `i` 小，所以小的位置自然在前面。
- 判斷要寫 `j !== undefined`，不能寫 `if (j)`。位置 0 也是合法的答案，但 `0` 放在 `if` 裡會被當成「不成立」。

> ▶ 動畫演示：[一邊往右走，一邊問 Map「需要的另一半出現過嗎？」](https://vincentlin0619.github.io/ts-engineer-bootcamp/leetcode/0001-two-sum/#anim-leetcode-0001-two-sum)

## 複雜度

Big-O 用來描述「資料量變大時，花費怎麼跟著變大」。O(n) 的意思是：資料量變成兩倍，執行時間大約也變成兩倍；O(n²) 則是變成四倍；O(1) 是不管資料多大，花費都差不多。

| 解法             | 時間  | 額外的記憶體 |
| ---------------- | ----- | ------------ |
| 解法一：兩層迴圈 | O(n²) | O(1)         |
| 解法二：Map      | O(n)  | O(n)         |

- 解法一：n 個數字要檢查大約 n × n 組，但除了幾個變數之外不需要額外的記憶體。
- 解法二：每個數字只看一次，每次查 Map、寫 Map 都是固定的時間。代價是 Map 最多要記下 n 筆。
- 這是很常見的取捨：多用一點記憶體，換來快很多的速度。

## 用到的新工具

### `Map`

`Map` 是「key → value」的對照表。它和物件很像，但 key 可以是任何型別（這題用 `number`），而且有專門的方法：

```ts
const ages = new Map<string, number>(); // key: string, value: number
ages.set("小明", 18);
console.log(ages.get("小明")); // 18
console.log(ages.get("小華")); // undefined, no such key
console.log(ages.has("小明")); // true
console.log(ages.size); // 1
```

- `<string, number>` 寫出 key 與 value 的型別。尖括號是泛型（generic）的寫法，先照抄，Day 14 會解釋。
- `get` 找不到時回傳 `undefined`，所以它的回傳型別是 `number | undefined`。和 Day 07 的 `noUncheckedIndexedAccess` 一樣，要先用 `if` 檢查才能當成數字用。
- 同一個 key 再 `set` 一次，會蓋掉舊的 value。
- 查詢、新增都不需要從頭找起，資料再多也幾乎一樣快。這種結構叫雜湊表（hash table）。

### 陣列的 `entries()`

`for...of` 只給你元素。陣列的 `entries()` 同時給出「位置和元素」，搭配 Day 04 的解構，一次拿到兩個：

```ts
const fruits = ["蘋果", "香蕉"];
for (const [i, fruit] of fruits.entries()) {
  console.log(i, fruit); // 0 蘋果, then 1 香蕉
}
```

用這個寫法拿到的 `fruit` 型別是 `string`；用 `fruits[i]` 拿到的則是 `string | undefined`，還要另外檢查。

## 練習

完成 [`exercises/two-sum.ts`](exercises/two-sum.ts) 裡的 `twoSum`，然後在專案根目錄執行：

```bash
bun test leetcode/0001
```

全部顯示 pass 就完成了。先試著憑記憶寫出解法二，不要邊看邊抄。

卡住超過 15 分鐘再看 [`solutions/two-sum.ts`](solutions/two-sum.ts)。看完後關掉解答，自己重寫一次。

## 自我檢查清單

- [ ] 我能說出解法一為什麼要檢查大約 n × n 次。
- [ ] 我能說出 `seen` 的 key 與 value 各存什麼。
- [ ] 我知道為什麼要「先查再記」，順序反過來會出什麼錯。
- [ ] 我會用 `new Map`、`get`、`set`，並處理 `get` 回傳的 `undefined`。
- [ ] 我能說出兩種解法的時間與額外記憶體的複雜度。
- [ ] `bun test leetcode/0001` 全部通過。
