# Valid Parentheses（有效的括號）

> LeetCode 20｜Easy｜建議在 Day 10 之後｜技巧：堆疊（stack）

## 題目

給你一個只包含 `(`、`)`、`[`、`]`、`{`、`}` 的字串 `s`，判斷裡面的括號是不是都正確配對：

- 每個左括號都要被**同一種**右括號關上。
- 後打開的要先關上：括號可以一層包一層，但不能交叉。
- 每個右括號前面，都要有一個還沒關上的同種左括號在等它。

字串至少有 1 個字元。

| `s`        | 回傳    | 說明                                |
| ---------- | ------- | ----------------------------------- |
| `"{[]()}"` | `true`  | 外層的 `{}` 裡面並排著 `[]` 和 `()` |
| `"[(])"`   | `false` | `(` 還沒關上就遇到 `]`，交叉了      |
| `"(("`     | `false` | 兩個 `(` 都沒有被關上               |
| `"}{"`     | `false` | 第一個 `}` 前面沒有任何左括號       |

## 先想一想

1. 讀到一個右括號時，它應該和前面哪一個左括號配對？最早出現的那個，還是最近、還沒關上的那個？
2. 你需要一個地方暫存「還沒關上的左括號」。新的要放在哪裡？配對時要從哪裡拿？
3. 整個字串讀完之後，怎樣才算全部配對成功？

## 解法一：直覺做法

正確的字串裡，一定有某一對括號是緊緊相鄰的，例如 `()`、`[]`、`{}`。把它們刪掉，剩下的字串如果是正確的，又會出現新的相鄰的一對。一直刪到刪不動為止，剩下空字串就是正確的：

```ts
function isValidByRemoving(s: string): boolean {
  let text = s;
  let previous = "";
  while (text !== previous) {
    previous = text;
    text = text.replaceAll("()", "").replaceAll("[]", "").replaceAll("{}", "");
  }
  return text === "";
}
```

以 `"{[]()}"` 為例：第一輪刪掉 `[]` 和 `()`，剩下 `"{}"`；第二輪刪掉 `{}`，剩下 `""`；第三輪沒有東西可刪，迴圈結束，回傳 `true`。

慢在哪裡：每一輪都要把整個字串掃過一遍，還要做出新的字串。像 `"(((((())))))"` 這種一層包一層的字串，一輪只能刪掉最裡面的一對，n 個字元要掃大約 n / 2 輪，總共大約 n × n 次。

## 解法二：用堆疊記住還沒關上的左括號

讀到右括號時，要配對的是「**最近**打開、還沒關上的那個左括號」。這正是堆疊（stack）擅長的事。

堆疊就像一疊盤子：新的盤子放在最上面，拿的時候也從最上面拿。最後放進去的最先拿出來，叫做「後進先出」（LIFO，last in, first out）。Day 03 的 call stack 就是一個堆疊：最後呼叫的函式最先回傳。

在 TypeScript 裡，用陣列就能當堆疊：陣列的最後面當作最上面，`push` 放上去，`pop` 拿下來。

規則：

1. 讀到左括號：`push` 進堆疊，等它的另一半。
2. 讀到右括號：`pop` 出最上面的左括號。拿不到（堆疊是空的），或拿到的種類不對，就回傳 `false`。
3. 字串讀完：堆疊必須是空的。還剩下左括號，代表有括號沒被關上。

```ts
// closing bracket -> its opening bracket
const OPENING_OF = new Map<string, string>([
  [")", "("],
  ["]", "["],
  ["}", "{"],
]);

export function isValid(s: string): boolean {
  const stack: string[] = [];
  for (const ch of s) {
    const opening = OPENING_OF.get(ch);
    if (opening === undefined) {
      stack.push(ch); // an opening bracket: wait for its partner
    } else {
      const top = stack.pop();
      if (top !== opening) {
        return false; // wrong partner, or nothing left to close
      }
    }
  }
  return stack.length === 0; // every opening bracket was closed
}
```

以 `"{[]()}"` 為例（堆疊的最右邊是最上面）：

| 讀到 | 做的事                 | 之後的 `stack` |
| ---- | ---------------------- | -------------- |
| `{`  | 左括號，`push`         | `{`            |
| `[`  | 左括號，`push`         | `{ [`          |
| `]`  | `pop` 出 `[`，配對成功 | `{`            |
| `(`  | 左括號，`push`         | `{ (`          |
| `)`  | `pop` 出 `(`，配對成功 | `{`            |
| `}`  | `pop` 出 `{`，配對成功 | （空的）       |

讀完時堆疊是空的，回傳 `true`。換成 `"[(])"`：讀到 `]` 時 `pop` 出來的是 `(`，種類不對，馬上回傳 `false`。

幾個重點：

- `OPENING_OF` 的 key 是右括號，value 是對應的左括號。`get` 得到 `undefined`，就表示 `ch` 不是右括號；題目只有六種字元，所以它一定是左括號。
- 堆疊是空的時候，`pop()` 回傳 `undefined`。`undefined !== opening` 成立，正好回傳 `false`，不需要另外檢查堆疊是不是空的。
- 最後一行不能省略。`"(("` 從頭到尾沒有配錯，但留下兩個沒關上的左括號，也是錯的。
- `OPENING_OF` 放在函式外面、用 CONSTANT_CASE 命名（Day 07 的命名規範），因為它是固定的對照表，不需要每次呼叫都重新建立。

> ▶ 動畫演示：[左括號 push 進堆疊，右括號 pop 出最上面的那個來配對](https://vincentlin0619.github.io/ts-engineer-bootcamp/leetcode/0020-valid-parentheses/#anim-leetcode-0020-valid-parentheses)

## 複雜度

Big-O 用來描述「資料量變大時，花費怎麼跟著變大」。O(n) 的意思是：字串長度變成兩倍，執行時間大約也變成兩倍；O(n²) 則是變成四倍。

| 解法             | 時間  | 額外的記憶體 |
| ---------------- | ----- | ------------ |
| 解法一：反覆刪除 | O(n²) | O(n)         |
| 解法二：堆疊     | O(n)  | O(n)         |

- 解法一：最多要掃大約 n / 2 輪，每輪掃過整個字串，還會做出新的字串。
- 解法二：每個字元只看一次，`push`、`pop`、`get` 都是固定的時間。堆疊最多放 n 個左括號（例如整個字串都是左括號），所以額外的記憶體是 O(n)。

## 用到的新工具

### 陣列的 `pop()`

`pop()` 把陣列的最後一個元素拿掉，並回傳它。陣列是空的時候回傳 `undefined`，所以回傳型別是 `string | undefined`。它會直接修改原本的陣列（原地修改，見 [0283 Move Zeroes](../0283-move-zeroes/README.md)）。

```ts
const stack = ["{", "["];
console.log(stack.pop()); // "["
console.log(stack); // [ "{" ]
console.log([].pop()); // undefined
```

`push` 加在最後面、`pop` 從最後面拿，兩個一起用，陣列就是一個堆疊。

### 用初始資料建立 `Map`

[0001 Two Sum](../0001-two-sum/README.md) 介紹過 `Map`。建立時可以直接放入初始資料：傳入一個陣列，裡面每一項是 `[key, value]`。

```ts
const prices = new Map<string, number>([
  ["紅茶", 30],
  ["奶茶", 45],
]);
console.log(prices.get("奶茶")); // 45
```

### 用 `for...of` 走過字串

`for...of` 不只能走過陣列，也能走過字串，每一圈拿到一個字元。

```ts
for (const ch of "{}") {
  console.log(ch); // "{", then "}"
}
```

### `replaceAll`（解法一）

`text.replaceAll("()", "")` 回傳一個新字串，把 `text` 裡所有的 `()` 換成空字串，也就是刪掉。原本的字串不會變。

## 練習

完成 [`exercises/valid-parentheses.ts`](exercises/valid-parentheses.ts) 裡的 `isValid`，然後在專案根目錄執行：

```bash
bun test leetcode/0020
```

全部顯示 pass 就完成了。請用解法二的堆疊寫。

卡住超過 15 分鐘再看 [`solutions/valid-parentheses.ts`](solutions/valid-parentheses.ts)。看完後關掉解答，自己重寫一次。

## 自我檢查清單

- [ ] 我能用自己的話說明「後進先出」，以及為什麼這題需要它。
- [ ] 我能說出讀到左括號、讀到右括號、讀完字串時，各要做什麼。
- [ ] 我知道堆疊是空的時候 `pop()` 回傳什麼，以及程式怎麼處理這個情況。
- [ ] 我知道最後為什麼要檢查 `stack.length === 0`。
- [ ] 我能說出兩種解法的時間與額外記憶體的複雜度。
- [ ] `bun test leetcode/0020` 全部通過。
