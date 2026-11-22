import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { Employee, Intern, makeManager, totalPayroll } = await loadExercise<
  typeof import("./01-employees.ts")
>(import.meta.dir, "01-employees");

describe("練習 01：繼承 Employee", () => {
  test("Employee 的月薪是底薪", () => {
    const staff = new Employee("小明", 40000);
    expect(staff.name).toBe("小明");
    expect(staff.monthlyPay()).toBe(40000);
    expect(staff.describe()).toBe("小明：月薪 40000 元");
  });

  test("Employee 的底薪是 # 私有欄位", () => {
    expect(Object.keys(new Employee("小明", 40000))).toEqual(["name"]);
  });

  test("Intern 沿用父類別的建構子，月薪是底薪的一半", () => {
    const intern = new Intern("小華", 30000);
    expect(intern.name).toBe("小華");
    expect(intern.monthlyPay()).toBe(15000);
  });

  test("Intern 沒有覆寫 describe，卻印出自己的月薪", () => {
    expect(new Intern("小華", 30000).describe()).toBe("小華：月薪 15000 元");
  });

  test("Intern 也是 Employee", () => {
    const intern = new Intern("小華", 30000);
    expect(intern).toBeInstanceOf(Intern);
    expect(intern).toBeInstanceOf(Employee);
    expect(new Employee("小明", 40000)).not.toBeInstanceOf(Intern);
  });

  test("makeManager 回傳的主管月薪是底薪加獎金", () => {
    const manager = makeManager("小美", 60000, 10000);
    expect(manager.name).toBe("小美");
    expect(manager.monthlyPay()).toBe(70000);
  });

  test("主管的 describe 是父類別的結果加上（主管）", () => {
    expect(makeManager("小美", 60000, 10000).describe()).toBe(
      "小美：月薪 70000 元（主管）",
    );
  });

  test("主管是 Employee 的子類別，不是 Employee 本身", () => {
    const manager = makeManager("小美", 60000, 10000);
    expect(manager).toBeInstanceOf(Employee);
    expect(manager.constructor).not.toBe(Employee);
    expect(manager.constructor.name).toBe("Manager");
  });

  test("totalPayroll 把每個人的月薪加起來", () => {
    expect(totalPayroll([])).toBe(0);
    expect(
      totalPayroll([
        new Employee("小明", 40000),
        new Intern("小華", 30000),
        makeManager("小美", 60000, 10000),
      ]),
    ).toBe(125000);
  });
});
