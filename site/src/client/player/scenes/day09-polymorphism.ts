import type { Frame, Scene } from "../types.ts";

const main = (
  options: { instances?: boolean; status?: string } = {},
): Frame => ({
  id: "main",
  name: "主程式",
  slots: options.instances
    ? [
        { name: "cash", value: "CashPayment 的實例" },
        { name: "creditCard", value: "CreditCardPayment 的實例" },
      ]
    : [],
  ...(options.status ? { status: options.status } : {}),
});

const checkout = (id: string, instance: string, status?: string): Frame => ({
  id,
  name: "checkout",
  slots: [
    { name: "method", value: instance, type: "PaymentMethod" },
    { name: "amount", value: "100" },
  ],
  ...(status ? { status } : {}),
});

const creditPay = (total: string, changed = false): Frame => ({
  id: "credit-pay",
  name: "CreditCardPayment.pay",
  slots: [
    { name: "amount", value: "100" },
    {
      name: "this.#totalCharged",
      value: total,
      ...(changed ? { mark: "active" as const } : {}),
    },
  ],
});

const waiting = "等待 checkout 回傳";
const waitingPay = "等待 method.pay 回傳";

const scene: Scene = {
  id: "day09-polymorphism",
  title: "多型：同一行 method.pay()，執行不同的程式",
  summary:
    "checkout 只認得介面 PaymentMethod。看同一行 method.pay(amount) 怎麼依實例的類別，疊上不同的 pay()。",
  code: `class CashPayment implements PaymentMethod {
  readonly name = "現金";
  pay(amount: number): string {
    return \`收現金 \${amount} 元\`;
  }
}

class CreditCardPayment implements PaymentMethod {
  readonly name = "信用卡";
  #totalCharged = 0;
  pay(amount: number): string {
    this.#totalCharged = this.#totalCharged + amount;
    return \`刷卡 \${amount} 元，本期累計 \${this.#totalCharged} 元\`;
  }
}

function checkout(method: PaymentMethod, amount: number): void {
  console.log(\`[\${method.name}] \${method.pay(amount)}\`);
}

const cash = new CashPayment();
const creditCard = new CreditCardPayment();
checkout(cash, 100);
checkout(creditCard, 100);`,
  steps: [
    {
      line: [1, 8],
      note: "兩個類別都 `implements PaymentMethod`，所以都有 `name` 與 `pay(amount)`。但兩個 `pay()` 的內容不一樣。",
      stack: [main()],
    },
    {
      line: [21, 22],
      note: "建立兩個實例：`cash` 來自 CashPayment，`creditCard` 來自 CreditCardPayment。",
      stack: [main({ instances: true })],
    },
    {
      line: 23,
      note: "呼叫 `checkout(cash, 100)`。參數 `method` 的型別是介面 `PaymentMethod`，這次裝進來的是 CashPayment 的實例。",
      stack: [
        main({ instances: true, status: waiting }),
        checkout("checkout-1", "CashPayment 的實例"),
      ],
    },
    {
      line: 18,
      note: '`method.name` 是 `"現金"`。接著要呼叫 `method.pay(amount)`。',
      question: {
        prompt:
          "`method` 的型別寫的是 `PaymentMethod`。`method.pay(amount)` 會執行哪一段程式？",
        choices: [
          "CashPayment 的 `pay()`（第 3–5 行）",
          "介面 `PaymentMethod` 裡的 `pay()`",
          "CreditCardPayment 的 `pay()`（第 11–14 行）",
        ],
        answer: 0,
        explain:
          "介面只有簽名，沒有程式可以執行。真正執行的是 `method` 裝的那個實例所屬類別的 `pay()`。",
      },
    },
    {
      line: 4,
      note: "`method` 裝的是 CashPayment 的實例，所以疊上 `CashPayment.pay`。它回傳「收現金 100 元」。",
      stack: [
        main({ instances: true, status: waiting }),
        checkout("checkout-1", "CashPayment 的實例", waitingPay),
        {
          id: "cash-pay",
          name: "CashPayment.pay",
          slots: [{ name: "amount", value: "100" }],
        },
      ],
    },
    {
      line: 18,
      note: "`CashPayment.pay` 從 call stack 拿掉。`console.log` 把結果接在 `[現金]` 後面印出來。",
      stack: [
        main({ instances: true, status: waiting }),
        checkout("checkout-1", "CashPayment 的實例"),
      ],
      print: "[現金] 收現金 100 元",
    },
    {
      line: 23,
      note: "`checkout` 結束，從 call stack 拿掉，回到主程式。",
      stack: [main({ instances: true })],
    },
    {
      line: 24,
      note: "第二次呼叫同一個 `checkout()`，這次 `method` 裝的是 CreditCardPayment 的實例。",
      stack: [
        main({ instances: true, status: waiting }),
        checkout("checkout-2", "CreditCardPayment 的實例"),
      ],
    },
    {
      line: 18,
      note: '又回到第 18 行，`method.name` 是 `"信用卡"`。這一行的程式碼一個字都沒變。',
      question: {
        prompt: "同樣是第 18 行的 `method.pay(amount)`，這次會執行哪一段程式？",
        choices: [
          "CreditCardPayment 的 `pay()`",
          "CashPayment 的 `pay()`，因為剛才第 18 行執行的就是它",
        ],
        answer: 0,
        explain:
          "執行哪一個 `pay()` 不是由程式寫在哪一行決定，而是由 `method` 當下裝的實例決定。這就是多型。",
      },
    },
    {
      line: 11,
      note: "疊上 `CreditCardPayment.pay`。這次的 `this` 是 `creditCard`，它的 `#totalCharged` 目前是 0。",
      stack: [
        main({ instances: true, status: waiting }),
        checkout("checkout-2", "CreditCardPayment 的實例", waitingPay),
        creditPay("0"),
      ],
    },
    {
      line: 12,
      note: "`this.#totalCharged` 加上 100，變成 100。這是 CreditCardPayment 的實例自己記住的狀態，CashPayment 沒有這個欄位。",
      stack: [
        main({ instances: true, status: waiting }),
        checkout("checkout-2", "CreditCardPayment 的實例", waitingPay),
        creditPay("100", true),
      ],
    },
    {
      line: 13,
      note: "回傳「刷卡 100 元，本期累計 100 元」。",
    },
    {
      line: 18,
      note: "`CreditCardPayment.pay` 從 call stack 拿掉。`console.log` 把結果接在 `[信用卡]` 後面印出來。",
      stack: [
        main({ instances: true, status: waiting }),
        checkout("checkout-2", "CreditCardPayment 的實例"),
      ],
      print: "[信用卡] 刷卡 100 元，本期累計 100 元",
    },
    {
      line: 24,
      note: "`checkout` 結束。同一個函式、同一行 `method.pay(amount)`，依實例的類別執行了兩段不同的程式。",
      stack: [main({ instances: true })],
    },
  ],
};

export default scene;
