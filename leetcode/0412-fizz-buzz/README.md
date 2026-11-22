# Fizz Buzz

> LeetCode 412｜Easy｜建議在 Day 03 之後｜技巧：if／else、取餘數 %

## 題目

從 1 數到 `n`，把每個數字換成一個字串，依序放進陣列後回傳。換的規則：

- 同時是 3 和 5 的倍數：換成 `"FizzBuzz"`
- 只是 3 的倍數：換成 `"Fizz"`
- 只是 5 的倍數：換成 `"Buzz"`
- 都不是：換成數字本身的文字，例如 `"7"`

`n` 至少是 1。

```text
輸入：n = 7
輸出：["1", "2", "Fizz", "4", "Buzz", "Fizz", "7"]

輸入：n = 1
輸出：["1"]

輸入：n = 16
輸出：["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8",
       "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz", "16"]
```

## 先想一想

1. 怎麼用程式判斷「`i` 是不是 3 的倍數」？（提示：看「用到的新工具」）
2. 15 同時是 3 和 5 的倍數。四種情況要用什麼順序檢查，15 才不會被換成 `"Fizz"`？
3. 回傳的是字串陣列。數字 `7` 要怎麼變成文字 `"7"`？

## 解法

這題只有一種合理的做法：用 `for` 從 1 數到 `n`，每個數字用 `if`／`else if`／`else` 決定要換成什麼，再 `push` 進陣列。真正要小心的是條件的順序。

### 常見的錯誤寫法

```ts
// Wrong: 15 matches `i % 3 === 0` first and becomes "Fizz"
if (i % 3 === 0) {
  answer.push("Fizz");
} else if (i % 5 === 0) {
  answer.push("Buzz");
} else if (i % 3 === 0 && i % 5 === 0) {
  answer.push("FizzBuzz"); // never reached
} else {
  answer.push(String(i));
}
```

Day 03 說過，整組 `if`／`else if`／`else` 只會執行其中一段，遇到第一個成立的條件就停。15 先符合 `i % 3 === 0`，放進 `"Fizz"` 之後，後面的條件都不會再檢查，所以 `"FizzBuzz"` 永遠不會出現。

### 正確寫法

把最嚴格的條件「同時是 3 和 5 的倍數」放在最前面：

```ts
export function fizzBuzz(n: number): string[] {
  const answer: string[] = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      answer.push("FizzBuzz");
    } else if (i % 3 === 0) {
      answer.push("Fizz");
    } else if (i % 5 === 0) {
      answer.push("Buzz");
    } else {
      answer.push(String(i));
    }
  }
  return answer;
}
```

1. `answer` 先是空陣列，用來收集結果。之後只會 `push`，不會重新指派，所以用 `const`。
2. `for (let i = 1; i <= n; i++)`：題目要從 1 數到 `n`，而且包含 `n`，所以起點是 1、條件是 `<=`。
3. 第一個條件用 `&&` 同時檢查兩件事：`i` 除以 3 和除以 5 都沒有餘數。15、30、45 會停在這裡。
4. 走到第二個條件時，已經確定 `i` 不是「3 和 5 的倍數」，所以 `i % 3 === 0` 代表「只是 3 的倍數」。第三個條件同理。
5. 前面都不成立，就走到 `else`，用 `String(i)` 把數字轉成文字（Day 01）。
6. 迴圈跑完，`answer` 正好有 `n` 個字串，把它回傳。

> ▶ 動畫演示：[從 1 數到 15，看每個數字走進哪一個分支](https://vincentlin0619.github.io/ts-engineer-bootcamp/leetcode/0412-fizz-buzz/#anim-leetcode-0412-fizz-buzz)

## 複雜度

Big-O 是描述「程式有多快」的寫法，意思是：資料量變成兩倍時，執行時間大約變成幾倍。

- 時間複雜度 O(n)：迴圈跑 `n` 圈，每圈只做固定幾次判斷。`n` 變成兩倍，執行時間大約也變成兩倍。
- 空間複雜度 O(n)：回傳的陣列有 `n` 個字串。題目要的答案本身就這麼大，沒辦法再省。

## 用到的新工具

### 取餘數 `%`

`a % b` 算出「`a` 除以 `b` 的餘數」。餘數是 0，代表 `a` 剛好是 `b` 的倍數。

```ts
console.log(7 % 3); // 1, because 7 = 3 * 2 + 1
console.log(9 % 3); // 0, so 9 is a multiple of 3
console.log(10 % 5); // 0, so 10 is a multiple of 5
```

所以「`i` 是 3 的倍數」寫成 `i % 3 === 0`。同樣的寫法也能判斷奇偶數：`n % 2 === 0` 是偶數。

## 練習

完成 [`exercises/fizz-buzz.ts`](exercises/fizz-buzz.ts) 裡的 `fizzBuzz`：把 `throw new Error(...)` 換成你的程式，然後在專案根目錄執行：

```bash
# 檢查你的答案：全部顯示 pass 就完成了
bun test leetcode/0412
```

卡住超過 15 分鐘再看 [`solutions/fizz-buzz.ts`](solutions/fizz-buzz.ts) 裡的參考解答。看完後把解答關掉，自己重寫一次。

## 自我檢查清單

- [ ] 我能用 `%` 判斷一個數字是不是另一個數字的倍數。
- [ ] 我能說出為什麼「同時是 3 和 5 的倍數」要放在第一個檢查。
- [ ] 我能說出 `for` 的條件為什麼寫 `i <= n`，而不是 `i < n`。
- [ ] `bun test leetcode/0412` 全部通過。
