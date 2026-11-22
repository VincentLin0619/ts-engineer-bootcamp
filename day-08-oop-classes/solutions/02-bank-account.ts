// Reference solution for exercise 02.

export class BankAccount {
  readonly owner: string;
  #balance: number;

  constructor(owner: string, openingBalance: number = 0) {
    const trimmedOwner = owner.trim();
    if (trimmedOwner.length === 0) {
      throw new Error("戶名不可以是空的");
    }
    if (openingBalance < 0) {
      throw new Error("開戶金額不可以是負數");
    }
    this.owner = trimmedOwner;
    this.#balance = openingBalance;
  }

  get balance(): number {
    return this.#balance;
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error("金額必須大於 0");
    }
    this.#balance = this.#balance + amount;
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error("金額必須大於 0");
    }
    if (amount > this.#balance) {
      throw new Error("餘額不足");
    }
    this.#balance = this.#balance - amount;
  }

  static transfer(from: BankAccount, to: BankAccount, amount: number): void {
    // withdraw() throws before anything changes, so `to` stays untouched
    // when `from` does not have enough money.
    from.withdraw(amount);
    to.deposit(amount);
  }
}
