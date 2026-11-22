import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { BankAccount } = await loadExercise<
  typeof import("./02-bank-account.ts")
>(import.meta.dir, "02-bank-account");

describe("練習 02：封裝 BankAccount", () => {
  test("建構子存下去掉空白的戶名與開戶金額", () => {
    const account = new BankAccount("  小明  ", 1000);
    expect(account.owner).toBe("小明");
    expect(account.balance).toBe(1000);
  });

  test("開戶金額預設是 0", () => {
    const account = new BankAccount("小華");
    expect(account.balance).toBe(0);
  });

  test("建構子擋下不合法的資料", () => {
    expect(() => new BankAccount("   ", 100)).toThrow("戶名不可以是空的");
    expect(() => new BankAccount("小明", -1)).toThrow("開戶金額不可以是負數");
  });

  test("deposit 與 withdraw 會改變餘額", () => {
    const account = new BankAccount("小明", 1000);
    account.deposit(500);
    expect(account.balance).toBe(1500);
    account.withdraw(200);
    expect(account.balance).toBe(1300);
    account.withdraw(1300);
    expect(account.balance).toBe(0);
  });

  test("deposit 擋下 0 與負數，餘額不變", () => {
    const account = new BankAccount("小明", 1000);
    expect(() => account.deposit(0)).toThrow("金額必須大於 0");
    expect(() => account.deposit(-50)).toThrow("金額必須大於 0");
    expect(account.balance).toBe(1000);
  });

  test("withdraw 擋下不合法的金額與超額提款，餘額不變", () => {
    const account = new BankAccount("小明", 1000);
    expect(() => account.withdraw(0)).toThrow("金額必須大於 0");
    expect(() => account.withdraw(1001)).toThrow("餘額不足");
    expect(account.balance).toBe(1000);
  });

  test("餘額存在 # 私有欄位裡，從外面看不到", () => {
    const account = new BankAccount("小明", 1000);
    // A `#` field is invisible from outside, so only `owner` is listed.
    expect(Object.keys(account)).toEqual(["owner"]);
    expect(account.balance).toBe(1000);
  });

  test("BankAccount.transfer 在兩個帳戶之間轉帳", () => {
    const from = new BankAccount("小明", 1000);
    const to = new BankAccount("小華");
    BankAccount.transfer(from, to, 300);
    expect(from.balance).toBe(700);
    expect(to.balance).toBe(300);
  });

  test("BankAccount.transfer 餘額不足時兩邊都不變", () => {
    const from = new BankAccount("小明", 100);
    const to = new BankAccount("小華", 50);
    expect(() => BankAccount.transfer(from, to, 500)).toThrow("餘額不足");
    expect(from.balance).toBe(100);
    expect(to.balance).toBe(50);
  });
});
