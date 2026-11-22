// Run from the project root:
//   bun run day-09-oop-interfaces/examples/01-interface-implements.ts
//
// An interface is a contract: it lists WHAT a class must offer and says
// nothing about HOW the class does it.

// The contract: anything that calls itself a payment method must have these.
interface PaymentMethod {
  readonly name: string;
  pay(amount: number): string;
}

// `implements` asks TypeScript to check the class against the contract.
class CashPayment implements PaymentMethod {
  readonly name = "現金";

  pay(amount: number): string {
    return `收現金 ${amount} 元`;
  }
}

// A second class that fulfils the same contract in its own way.
// A class may have more than the contract asks for: #balance and topUp().
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

  topUp(amount: number): void {
    this.#balance = this.#balance + amount;
  }
}

const cash = new CashPayment();
const card = new EasyCardPayment(150);

console.log(cash.name, "->", cash.pay(100));
console.log(card.name, "->", card.pay(100));
console.log(card.name, "->", card.pay(100)); // not enough left

// Typed as the class: everything the class has is available.
card.topUp(500);
console.log(card.name, "->", card.pay(100));

// Typed as the interface: only what the contract lists is available.
const method: PaymentMethod = card;
console.log(method.name, "->", method.pay(100));

// Try it: remove the `//` on the next line, then run
//   bun check day-09-oop-interfaces/examples/01-interface-implements.ts
// TS2339: 'topUp' does not exist on type 'PaymentMethod'.
// method.topUp(100);

// A class that breaks the contract is rejected by `bun check`.
// Try it: delete the `@ts-expect-error` line below and run `bun check` to
// read the real message. Put the line back when you are done.

// @ts-expect-error -- TS2420: Class 'BrokenPayment' incorrectly implements interface 'PaymentMethod'.
class BrokenPayment implements PaymentMethod {
  readonly name = "壞掉的付款方式";
  // pay() is missing
}

console.log(new BrokenPayment().name, "-> 沒有 pay() 可以呼叫");
