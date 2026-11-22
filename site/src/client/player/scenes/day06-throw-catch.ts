import type { Frame, Mark, Scene, Slot } from "../types.ts";

const main = (status?: string): Frame => ({
  id: "main",
  name: "主程式",
  ...(status ? { status } : {}),
});

const orderArgs: Slot[] = [
  { name: "productName", value: '"牛奶"' },
  { name: "quantityText", value: '"很多"' },
];

const printOrder = (status?: string, extra: Slot[] = []): Frame => ({
  id: "printOrder",
  name: "printOrder",
  slots: [...orderArgs, ...extra],
  ...(status ? { status } : {}),
});

const orderLine = (status?: string, mark?: Mark): Frame => ({
  id: "orderLine",
  name: "orderLine",
  slots: orderArgs,
  ...(status ? { status } : {}),
  ...(mark ? { mark } : {}),
});

const parseQuantity = (slots: Slot[], status?: string, mark?: Mark): Frame => ({
  id: "parseQuantity",
  name: "parseQuantity",
  slots,
  ...(status ? { status } : {}),
  ...(mark ? { mark } : {}),
});

const textSlot: Slot = { name: "text", value: '"很多"' };
const nanSlots: Slot[] = [textSlot, { name: "quantity", value: "NaN" }];

const WAITING_MAIN = "等待 printOrder 回傳";
const WAITING_TRY = "在 try 區塊裡等待 orderLine 回傳";
const WAITING_PARSE = "等待 parseQuantity 回傳";

const scene: Scene = {
  id: "day06-throw-catch",
  title: "throw 與 catch：錯誤沿著 call stack 往上找人處理",
  summary:
    "parseQuantity 丟出錯誤後，看它怎麼穿過沒有 try／catch 的 orderLine，一路回到 printOrder 的 catch。",
  code: `function parseQuantity(text: string): number {
  const quantity = Number(text);
  if (!Number.isInteger(quantity)) {
    throw new Error(\`數量必須是整數：\${text}\`);
  }
  return quantity;
}

function orderLine(productName: string, quantityText: string): string {
  const quantity = parseQuantity(quantityText);
  console.log("  （orderLine：數量沒問題，繼續往下）");
  return \`\${productName} x \${quantity}\`;
}

function printOrder(productName: string, quantityText: string): void {
  console.log(\`處理訂單：\${productName}、「\${quantityText}」\`);
  try {
    const line = orderLine(productName, quantityText);
    console.log(\`  成功：\${line}\`);
  } catch (error) {
    console.log(\`  失敗：\${errorMessage(error)}\`);
  }
}

printOrder("牛奶", "很多");`,
  steps: [
    {
      line: 25,
      note: "呼叫 `printOrder`：printOrder 疊到 call stack 最上面。這筆訂單的數量是文字「很多」。",
      stack: [main(WAITING_MAIN), printOrder()],
    },
    {
      line: 16,
      note: "印出正在處理哪一筆訂單。",
      print: "處理訂單：牛奶、「很多」",
    },
    {
      line: [17, 18],
      note: "進入 `try` 區塊，呼叫 `orderLine`。printOrder 停在第 18 行等待。",
      stack: [main(WAITING_MAIN), printOrder(WAITING_TRY), orderLine()],
    },
    {
      line: 10,
      note: "orderLine 呼叫 `parseQuantity`，自己停在第 10 行等待。注意 orderLine 裡沒有 `try`／`catch`。",
      stack: [
        main(WAITING_MAIN),
        printOrder(WAITING_TRY),
        orderLine(WAITING_PARSE),
        parseQuantity([textSlot]),
      ],
    },
    {
      line: 2,
      note: '`Number("很多")` 轉不出數字，結果是 `NaN`。',
      stack: [
        main(WAITING_MAIN),
        printOrder(WAITING_TRY),
        orderLine(WAITING_PARSE),
        parseQuantity(nanSlots),
      ],
    },
    {
      line: 3,
      note: "`NaN` 不是整數，`!Number.isInteger(quantity)` 成立，進入大括號。",
    },
    {
      line: 4,
      note: "`throw` 丟出一個 `Error`。parseQuantity 立刻結束，第 6 行的 `return` 不會執行。",
      stack: [
        main(WAITING_MAIN),
        printOrder(WAITING_TRY),
        orderLine(WAITING_PARSE),
        parseQuantity(nanSlots, "丟出 Error：數量必須是整數：很多", "error"),
      ],
      question: {
        prompt: "錯誤丟出之後，orderLine 第 11 行的 `console.log` 會印出來嗎？",
        choices: [
          "不會：orderLine 沒有 `catch`，錯誤直接穿過它",
          "會：parseQuantity 結束後，orderLine 照常往下執行",
          "會：錯誤要等 orderLine 執行完，才繼續往上傳",
        ],
        answer: 0,
        explain:
          "錯誤沿著 call stack 往上找 `try`／`catch`。沿途沒有 `catch` 的函式，剩下的程式全部跳過。",
      },
    },
    {
      line: 10,
      note: "parseQuantity 從 call stack 拿掉，錯誤回到 orderLine 的第 10 行。orderLine 沒有 `catch`，第 11、12 行全部跳過，錯誤繼續往上。",
      stack: [
        main(WAITING_MAIN),
        printOrder(WAITING_TRY),
        orderLine("沒有 try／catch：剩下的程式跳過", "error"),
      ],
    },
    {
      line: 20,
      note: "orderLine 也被跳出。錯誤回到 printOrder 的 `try` 區塊，第 19 行跳過；`catch (error)` 接住它，`error` 的型別是 `unknown`。",
      stack: [
        main(WAITING_MAIN),
        printOrder("catch 接住了錯誤", [
          {
            name: "error",
            value: "Error「數量必須是整數：很多」",
            type: "unknown",
            mark: "new",
          },
        ]),
      ],
    },
    {
      line: 21,
      note: "`errorMessage(error)` 先確認它是 `Error`，再取出訊息，印出「失敗：…」。",
      print: "  失敗：數量必須是整數：很多",
    },
    {
      line: 25,
      note: "錯誤已經被接住，printOrder 正常結束，回到主程式。程式沒有中斷，可以繼續處理下一筆訂單。",
      stack: [main()],
    },
  ],
};

export default scene;
