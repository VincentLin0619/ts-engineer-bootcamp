// Exercise 02: encapsulation with a `#` private field, a getter, `readonly`,
// `static`, and a constructor that protects a rule.
//
// Replace every `throw new Error(...)` line, then run: bun test day-08
//
// The rule this class must always keep: the balance is never negative.
//
//   const account = new BankAccount("  小明  ", 1000);
//   account.owner          -> "小明"   (trimmed, and it can never change)
//   account.balance        -> 1000
//   account.deposit(500);
//   account.withdraw(200);
//   account.balance        -> 1300
//   account.withdraw(5000); // throws Error("餘額不足")
//
//   const other = new BankAccount("小華"); // opening balance defaults to 0
//   BankAccount.transfer(account, other, 300);
//   account.balance        -> 1000
//   other.balance          -> 300

export class BankAccount {
  readonly owner: string;
  // TODO: declare a private field named `#balance` with the type number

  constructor(owner: string, openingBalance: number = 0) {
    // TODO:
    // 1. Trim owner. If the result is empty: throw new Error("戶名不可以是空的")
    // 2. If openingBalance is negative: throw new Error("開戶金額不可以是負數")
    // 3. Store the trimmed owner and the opening balance.
    throw new Error("TODO：尚未完成 BankAccount 的建構子");
  }

  // Read-only window onto the private balance.
  get balance(): number {
    // TODO: return the private balance
    throw new Error("TODO：尚未完成 balance");
  }

  // Add money. If amount is 0 or negative: throw new Error("金額必須大於 0")
  deposit(amount: number): void {
    // TODO: check the amount, then update the private balance
    throw new Error("TODO：尚未完成 deposit");
  }

  // Take money out.
  // If amount is 0 or negative: throw new Error("金額必須大於 0")
  // If amount is more than the balance: throw new Error("餘額不足")
  withdraw(amount: number): void {
    // TODO: check both rules, then update the private balance
    throw new Error("TODO：尚未完成 withdraw");
  }

  // Move money between two accounts. It belongs to no single account, so it
  // is static: BankAccount.transfer(from, to, 300).
  // Withdraw first: when that throws, `to` must stay untouched.
  static transfer(from: BankAccount, to: BankAccount, amount: number): void {
    // TODO: reuse withdraw() and deposit()
    throw new Error("TODO：尚未完成 transfer");
  }
}
