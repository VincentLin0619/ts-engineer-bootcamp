import type { Frame, Scene } from "../types.ts";

const main = (status?: string): Frame => ({
  id: "main",
  name: "主程式",
  slots: [{ name: "taxRate", value: "0.05", type: "number" }],
  ...(status ? { status } : {}),
});

const scene: Scene = {
  id: "day03-call-stack",
  title: "Call stack：函式呼叫函式",
  summary:
    "formatPrice 呼叫 addTax 時，call stack 怎麼長高，又怎麼一層一層縮回來。",
  code: `const taxRate = 0.05;

function addTax(price: number): number {
  const tax = price * taxRate;
  return price + tax;
}

function formatPrice(price: number): string {
  const total = addTax(price);
  return \`含稅 \${total} 元\`;
}

console.log("主程式開始");
console.log(formatPrice(100));
console.log("主程式結束");`,
  steps: [
    {
      line: 1,
      note: "程式從主程式開始。最外層宣告的 `taxRate`，整個檔案都看得到。",
      stack: [main()],
    },
    {
      line: [3, 8],
      note: "第 3 行與第 8 行只是**定義**函式，裡面的程式還不會執行。",
    },
    {
      line: 13,
      note: "印出「主程式開始」。",
      print: "主程式開始",
    },
    {
      line: 14,
      note: "呼叫 `formatPrice(100)`：把 formatPrice 疊到 call stack 最上面，參數 `price` 是 100。",
      stack: [
        main("等待 formatPrice 回傳"),
        {
          id: "formatPrice",
          name: "formatPrice",
          slots: [{ name: "price", value: "100" }],
        },
      ],
    },
    {
      line: 9,
      note: "formatPrice 需要 `addTax(price)` 的結果，所以先呼叫 addTax，自己停在這一行等待。",
      stack: [
        main("等待 formatPrice 回傳"),
        {
          id: "formatPrice",
          name: "formatPrice",
          slots: [{ name: "price", value: "100" }],
          status: "等待 addTax 回傳",
        },
        {
          id: "addTax",
          name: "addTax",
          slots: [{ name: "price", value: "100" }],
        },
      ],
    },
    {
      line: 4,
      note: "在 addTax 裡算出 `tax = 100 * 0.05 = 5`。`tax` 只存在 addTax 這一層。",
      stack: [
        main("等待 formatPrice 回傳"),
        {
          id: "formatPrice",
          name: "formatPrice",
          slots: [{ name: "price", value: "100" }],
          status: "等待 addTax 回傳",
        },
        {
          id: "addTax",
          name: "addTax",
          slots: [
            { name: "price", value: "100" },
            { name: "tax", value: "5" },
          ],
        },
      ],
    },
    {
      line: 5,
      note: "`return price + tax` 交出 105，addTax 結束。",
      question: {
        prompt: "addTax 回傳之後，程式接著執行哪裡？",
        choices: [
          "回到 formatPrice 的第 9 行，把 105 存進 `total`",
          "跳到主程式的第 15 行",
          "從 addTax 的第 4 行再執行一次",
        ],
        answer: 0,
        explain:
          "addTax 從 call stack 拿掉之後，最上面的是剛才在等待的 formatPrice，它從停下來的地方繼續。",
      },
    },
    {
      line: 9,
      note: "addTax 從 call stack 拿掉。formatPrice 繼續執行，把回傳值 105 存進 `total`。",
      stack: [
        main("等待 formatPrice 回傳"),
        {
          id: "formatPrice",
          name: "formatPrice",
          slots: [
            { name: "price", value: "100" },
            { name: "total", value: "105" },
          ],
        },
      ],
    },
    {
      line: 10,
      note: "formatPrice 回傳字串「含稅 105 元」，自己也結束。",
    },
    {
      line: 14,
      note: "formatPrice 從 call stack 拿掉，回到主程式。`console.log` 印出回傳的字串。",
      stack: [main()],
      print: "含稅 105 元",
    },
    {
      line: 15,
      note: "印出「主程式結束」。最後被呼叫的 addTax 最先結束，這就是 call stack 的規則。",
      print: "主程式結束",
    },
  ],
};

export default scene;
