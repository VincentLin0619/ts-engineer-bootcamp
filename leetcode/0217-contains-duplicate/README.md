# Contains Duplicate（存在重複元素）

> LeetCode 217｜Easy｜建議在 Day 05 之後｜技巧：Set

## 題目

給一個整數陣列 `nums`。只要有任何一個數字出現兩次以上，就回傳 `true`；每個數字都只出現一次，就回傳 `false`。

`nums` 至少有 1 個數字。

```text
輸入：nums = [6, 2, 8, 2, 5]
輸出：true
說明：2 出現了兩次

輸入：nums = [7, 3, 10, 1]
輸出：false

輸入：nums = [4]
輸出：false
```

## 先想一想

1. 用紙筆檢查時，你怎麼確認一個數字「前面出現過」？
2. 從左往右走到某個數字時，需要記住什麼，才能馬上回答「它出現過嗎」？
3. 一找到重複就能停下來嗎，還是一定要看完整個陣列？

## 解法一：每兩個數字都比一次

最直覺的做法：拿每一個數字，和它後面的每一個數字比，只要有一組相等就是重複。

```ts
function containsDuplicateSlow(nums: number[]): boolean {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) {
        return true;
      }
    }
  }
  return false;
}
```

`j` 從 `i + 1` 開始，因為自己和自己比沒有意義，前面的組合也已經比過了。

答案是對的，但比較的次數太多。`n` 個數字有大約 `n × n ÷ 2` 組要比：1 萬個數字就要比大約 5000 萬次。數字的個數變成兩倍，比較次數就變成大約四倍。

## 解法二：用 Set 記住看過的數字

換個做法：從左往右走，把看過的數字放進一個 `Set`（見「用到的新工具」）。每看到一個數字，先問 `Set`「這個數字出現過嗎？」：

- 出現過：找到重複，馬上回傳 `true`。
- 沒出現過：把它放進 `Set`，繼續往下走。

`Set` 回答「在不在裡面」不需要一個一個比，不管裡面放了多少東西都幾乎一樣快。

```ts
export function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const value of nums) {
    if (seen.has(value)) {
      return true;
    }
    seen.add(value);
  }
  return false;
}
```

1. `seen` 是一個空的 `Set`，用來記住看過的數字。
2. `for...of` 依序拿出每一個值。
3. `seen.has(value)` 是 `true`，代表這個值前面出現過，直接 `return true`。函式在這裡結束，後面的數字都不用再看。
4. 沒出現過，就用 `seen.add(value)` 記下來，給後面的數字查。
5. 迴圈走完都沒有提早回傳，代表沒有任何重複，回傳 `false`。

以第一個範例為例：

| `value` | `seen.has(value)` | 做了什麼      | 之後的 `seen` |
| ------- | ----------------- | ------------- | ------------- |
| 6       | `false`           | `add(6)`      | 6             |
| 2       | `false`           | `add(2)`      | 6、2          |
| 8       | `false`           | `add(8)`      | 6、2、8       |
| 2       | `true`            | `return true` | （函式結束）  |

最後的 5 根本不用看。

> ▶ 動畫演示：[一邊往右走，一邊問 Set「這個數字看過嗎？」](https://vincentlin0619.github.io/ts-engineer-bootcamp/leetcode/0217-contains-duplicate/#anim-leetcode-0217-contains-duplicate)

## 複雜度

Big-O 描述「資料量變成兩倍時，執行時間大約變成幾倍」。`n` 是陣列長度。

| 解法   | 時間                                           | 額外空間                       |
| ------ | ---------------------------------------------- | ------------------------------ |
| 解法一 | O(n²)：數字變兩倍，時間變成大約四倍            | O(1)：只多用 `i`、`j` 兩個變數 |
| 解法二 | O(n)：每個數字只看一次，數字變兩倍時間也變兩倍 | O(n)：`Set` 最多放 `n` 個數字  |

解法二多用了一個 `Set` 的空間，換來快很多的速度。這種「用空間換時間」的取捨在演算法裡很常見。

## 用到的新工具

### `Set`

`Set`（集合）是一種「只記得有沒有」的容器：同一個值放進去兩次，裡面還是只有一個。它的用處是很快地回答「這個值在不在裡面」。

```ts
const seen = new Set<number>(); // an empty Set of numbers
seen.add(4);
seen.add(9);
seen.add(4); // 4 is already there, nothing changes

console.log(seen.has(4)); // true
console.log(seen.has(7)); // false
console.log(seen.size); // 2
```

| 寫法                | 意思                                              |
| ------------------- | ------------------------------------------------- |
| `new Set<number>()` | 建立一個空的 `Set`，`<number>` 說明裡面放的是數字 |
| `seen.add(value)`   | 放進一個值；已經有了就什麼都不做                  |
| `seen.has(value)`   | 回傳 `boolean`：這個值在不在裡面                  |
| `seen.size`         | 裡面有幾個不同的值                                |

`<number>` 是泛型（generic）的寫法，先照抄，Day 14 會解釋。

`new Set(nums)` 也可以直接把一個陣列變成 `Set`，重複的值只會留下一個。所以 `new Set(nums).size !== nums.length` 也能判斷有沒有重複，只是它一定會把整個陣列看完，不能一找到重複就停。

## 練習

完成 [`exercises/contains-duplicate.ts`](exercises/contains-duplicate.ts) 裡的 `containsDuplicate`：把 `throw new Error(...)` 換成你的程式，然後在專案根目錄執行：

```bash
# 檢查你的答案：全部顯示 pass 就完成了
bun test leetcode/0217
```

卡住超過 15 分鐘再看 [`solutions/contains-duplicate.ts`](solutions/contains-duplicate.ts) 裡的參考解答。看完後把解答關掉，自己重寫一次。

## 自我檢查清單

- [ ] 我能用 `new Set`、`add`、`has` 記住並查詢看過的值。
- [ ] 我能說出解法二為什麼可以在找到重複時馬上回傳。
- [ ] 我能說出解法二比解法一快在哪裡，又多付出了什麼。
- [ ] `bun test leetcode/0217` 全部通過。
