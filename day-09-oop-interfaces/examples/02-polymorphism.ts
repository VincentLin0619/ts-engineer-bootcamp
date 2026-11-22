// Run from the project root:
//   bun run day-09-oop-interfaces/examples/02-polymorphism.ts
//
// Polymorphism: the same call, `method.pay(amount)`, behaves differently
// depending on which class the instance was created from.

// The same contract as in step 1.
interface PaymentMethod {
  readonly name: string;
  pay(amount: number): string;
}

class CashPayment implements PaymentMethod {
  readonly name = "現金";

  pay(amount: number): string {
    return `收現金 ${amount} 元`;
  }
}

class EasyCardPayment implements PaymentMethod {
  readonly name = "悠遊卡";
  #balance: number;

  constructor(balance: number) {
    this.#balance = balance;
  }

  pay(amount: number): string {
    if (amount > this.#balance) {
      return `悠遊卡餘額不足（餘額 ${this.#balance} 元）`;
    }
    this.#balance = this.#balance - amount;
    return `悠遊卡扣款 ${amount} 元，餘額 ${this.#balance} 元`;
  }
}

class CreditCardPayment implements PaymentMethod {
  readonly name = "信用卡";
  #totalCharged = 0;

  pay(amount: number): string {
    this.#totalCharged = this.#totalCharged + amount;
    return `刷卡 ${amount} 元，本期累計 ${this.#totalCharged} 元`;
  }
}

// This function is written against the interface. It does not know, and
// does not need to know, which class `method` was created from.
function checkout(method: PaymentMethod, amount: number): void {
  console.log(`[${method.name}] ${method.pay(amount)}`);
}

// 1. One function, three behaviours.
const cash = new CashPayment();
const easyCard = new EasyCardPayment(150);
const creditCard = new CreditCardPayment();

checkout(cash, 100);
checkout(easyCard, 100);
checkout(creditCard, 100);

// 2. An array of the interface type can hold instances of different classes.
const methods: PaymentMethod[] = [cash, easyCard, creditCard];

console.log("--- 每一種付款方式再付 100 元 ---");
for (const method of methods) {
  // The same line of code runs three different pay() methods.
  checkout(method, 100);
}

// 3. Without polymorphism the caller needs one branch per class, and
//    every new payment method means editing this function again.
function checkoutWithoutPolymorphism(kind: string, amount: number): void {
  if (kind === "cash") {
    console.log(`[現金] 收現金 ${amount} 元`);
  } else if (kind === "credit-card") {
    console.log(`[信用卡] 刷卡 ${amount} 元`);
  } else {
    console.log(`不認得的付款方式：${kind}`);
  }
}

console.log("--- 沒有多型的寫法 ---");
checkoutWithoutPolymorphism("cash", 100);
checkoutWithoutPolymorphism("line-pay", 100);

// 4. With polymorphism a new payment method is a new class. checkout()
//    stays exactly as it is.
class LinePayPayment implements PaymentMethod {
  readonly name = "LINE Pay";

  pay(amount: number): string {
    return `LINE Pay 付款 ${amount} 元`;
  }
}

console.log("--- 新增一種付款方式 ---");
checkout(new LinePayPayment(), 100);
