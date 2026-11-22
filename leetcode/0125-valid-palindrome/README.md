# Valid Palindrome（驗證回文）

> LeetCode 125｜Easy｜建議在 Day 08 之後｜技巧：雙指標、字串處理

## 題目

給你一個字串 `s`，判斷它是不是回文（palindrome）：從左讀到右，和從右讀到左，內容完全一樣。

判斷之前先套用兩條規則：

- 只看英文字母和數字，空白與標點符號都略過。
- 大小寫視為同一個字母，`T` 和 `t` 算一樣。

略過之後什麼都不剩（例如空字串，或只有標點），也算回文。字串裡只會出現一般英文鍵盤打得出來的字元。

| `s`               | 實際拿來比較的內容 | 回傳    |
| ----------------- | ------------------ | ------- |
| `"Top spot!"`     | `topspot`          | `true`  |
| `"Step on a pet"` | `steponapet`       | `false` |
| `"12:21"`         | `1221`             | `true`  |
| `"?!"`            | （什麼都不剩）     | `true`  |

## 先想一想

1. 最簡單的方法是先把字串整理乾淨，再和倒過來的字串比較。這樣要多做出幾個新字串？
2. 回文的第一個字和最後一個字一定一樣，第二個字和倒數第二個字也一樣。可以只從兩端往中間比嗎？
3. 從兩端比的時候，如果有一端是空白或標點，該怎麼辦？

## 解法一：直覺做法

先做出只有小寫字母與數字的 `cleaned`，再做出倒過來的 `reversed`，最後比較兩者：

```ts
function isPalindromeByReversing(s: string): boolean {
  let cleaned = "";
  for (const ch of s.toLowerCase()) {
    if (isLowercaseOrDigit(ch)) {
      cleaned += ch;
    }
  }
  let reversed = "";
  for (const ch of cleaned) {
    reversed = ch + reversed;
  }
  return cleaned === reversed;
}
```

- `isLowercaseOrDigit` 的寫法在解法二。
- `reversed = ch + reversed` 每次把新的字放在最前面，走完一遍就倒過來了。

慢在哪裡：不管字串長什麼樣子，它都要把整個字串走兩遍，還多做了 `cleaned`、`reversed` 兩個和原字串差不多長的新字串。就算第一個字和最後一個字就不一樣、一眼就知道答案，它也要全部做完才回答。

## 解法二：雙指標，從兩端往中間走

用兩個位置：`left` 從最左邊開始，`right` 從最右邊開始。每一圈只做下面其中一件事：

1. `left` 指到的不是字母或數字：`left` 往右一格。
2. `right` 指到的不是字母或數字：`right` 往左一格。
3. 兩邊都是字母或數字，但不一樣：不是回文，馬上回傳 `false`。
4. 兩邊一樣：這一對沒問題，`left` 往右、`right` 往左，各走一格。

兩個位置相遇或交錯時，都還沒回傳 `false`，就是回文。

```ts
// True for "a" to "z" and "0" to "9". Lowercase a character before
// passing it in.
function isLowercaseOrDigit(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
}

export function isPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    const a = s.charAt(left).toLowerCase();
    const b = s.charAt(right).toLowerCase();
    if (!isLowercaseOrDigit(a)) {
      left++;
    } else if (!isLowercaseOrDigit(b)) {
      right--;
    } else if (a !== b) {
      return false;
    } else {
      left++;
      right--;
    }
  }
  return true;
}
```

以 `"Top spot!"` 為例（`␣` 代表空白）：

```text
位置   0  1  2  3  4  5  6  7  8
字元   T  o  p  ␣  s  p  o  t  !

第 1 圈  left=0 "t"   right=8 "!"   "!" 不算數，right 往左
第 2 圈  left=0 "t"   right=7 "t"   一樣，兩邊各走一格
第 3 圈  left=1 "o"   right=6 "o"   一樣，兩邊各走一格
第 4 圈  left=2 "p"   right=5 "p"   一樣，兩邊各走一格
第 5 圈  left=3 "␣"   right=4 "s"   空白不算數，left 往右
left=4、right=4，不再 left < right，迴圈結束，回傳 true
```

幾個重點：

- 每一圈只移動一步，就回到 `while` 重新讀 `a` 和 `b`。所以跳過一個標點之後，下一圈會自動再檢查新位置是不是也要跳過，連續好幾個標點也不怕。
- 迴圈條件是 `left < right`，不是 `left <= right`。兩個位置指到同一個字時，那個字只會和自己比，一定一樣，不用比。
- 只在讀出來的那一刻把單一個字轉成小寫，不需要先做一份整個字串的小寫版本。

> ▶ 動畫演示：[left 和 right 從兩端往中間走，遇到空白與標點就跳過](https://vincentlin0619.github.io/ts-engineer-bootcamp/leetcode/0125-valid-palindrome/#anim-leetcode-0125-valid-palindrome)

## 複雜度

Big-O 用來描述「資料量變大時，花費怎麼跟著變大」。O(n) 的意思是：字串長度變成兩倍，執行時間大約也變成兩倍；O(1) 是不管資料多大，花費都差不多。

| 解法               | 時間 | 額外的記憶體 |
| ------------------ | ---- | ------------ |
| 解法一：整理後反轉 | O(n) | O(n)         |
| 解法二：雙指標     | O(n) | O(1)         |

- 兩種解法最多都把字串走固定幾遍，時間都是 O(n)。
- 解法一要存 `cleaned` 和 `reversed`，字串越長，用掉的記憶體越多。
- 解法二只用了 `left`、`right`、`a`、`b` 幾個變數；而且一發現不一樣就停下來，常常不用走完整個字串。

## 用到的新工具

### `charAt(i)`：取出某個位置的字

字串也可以用 `s[i]` 取出一個字，但在本專案的 strict 設定下，`s[i]` 的型別是 `string | undefined`，還要另外檢查。`charAt(i)` 的回傳型別一定是 `string`，位置超出範圍時回傳空字串 `""`。

```ts
const word = "Top";
console.log(word.charAt(0)); // "T"
console.log(word.charAt(9)); // "" (out of range)
console.log(word.length); // 3
```

### `toLowerCase()`：轉成小寫

回傳一個全部轉成小寫的新字串，原本的字串不會變。不是英文字母的字元（數字、空白、標點）維持原樣。

```ts
console.log("Top spot!".toLowerCase()); // "top spot!"
```

### 用 `>=`、`<=` 比較字元

兩個字串可以用 `<`、`>`、`<=`、`>=` 比較，規則是照字元的編號（Unicode 編號）一個字一個字比。`"a"` 到 `"z"` 的編號是連續的，`"0"` 到 `"9"` 也是，所以下面這行就能判斷「是不是小寫字母」：

```ts
const ch = "q";
console.log(ch >= "a" && ch <= "z"); // true
console.log("A" >= "a"); // false: upper case letters come before "a"
```

大寫字母的編號在小寫字母前面，所以 `isLowercaseOrDigit` 只能用在已經轉成小寫的字元上。

### 用 `for...of` 走過字串

解法一用到：`for...of` 不只能走過陣列，也能走過字串，每一圈拿到一個字。

```ts
for (const ch of "ab") {
  console.log(ch); // "a", then "b"
}
```

## 練習

完成 [`exercises/valid-palindrome.ts`](exercises/valid-palindrome.ts) 裡的 `isPalindrome`。檔案裡已經寫好 `isLowercaseOrDigit`，可以直接使用。完成後在專案根目錄執行：

```bash
bun test leetcode/0125
```

全部顯示 pass 就完成了。請用解法二的雙指標寫，不要另外做出整理過的新字串。

卡住超過 15 分鐘再看 [`solutions/valid-palindrome.ts`](solutions/valid-palindrome.ts)。看完後關掉解答，自己重寫一次。

## 自我檢查清單

- [ ] 我能說出每一圈的四種情況，以及各自怎麼移動 `left`、`right`。
- [ ] 我知道迴圈條件為什麼是 `left < right`。
- [ ] 我知道為什麼用 `charAt(i)` 而不是 `s[i]`。
- [ ] 我能解釋 `ch >= "a" && ch <= "z"` 為什麼能判斷小寫字母。
- [ ] 我能說出兩種解法的時間與額外記憶體的複雜度。
- [ ] `bun test leetcode/0125` 全部通過。
