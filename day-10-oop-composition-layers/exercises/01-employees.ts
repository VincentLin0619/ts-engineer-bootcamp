// Exercise 01: inheritance with `extends`, `super` and `override`.
//
// Replace every `throw new Error(...)` line, then run: bun test day-10
//
//   const staff = new Employee("小明", 40000);
//   staff.monthlyPay()   -> 40000
//   staff.describe()     -> "小明：月薪 40000 元"
//
//   const intern = new Intern("小華", 30000);
//   intern.monthlyPay()  -> 15000   (half of the base salary)
//   intern.describe()    -> "小華：月薪 15000 元"
//
//   const manager = makeManager("小美", 60000, 10000);
//   manager.monthlyPay() -> 70000   (base salary plus bonus)
//   manager.describe()   -> "小美：月薪 70000 元（主管）"

// Part 1: the parent class.
export class Employee {
  readonly name: string;
  // TODO: declare a private field for the base salary

  constructor(name: string, baseSalary: number) {
    // TODO: store both values
    throw new Error("TODO：尚未完成 Employee 的建構子");
  }

  // What this employee is paid each month: the base salary.
  monthlyPay(): number {
    // TODO
    throw new Error("TODO：尚未完成 Employee 的 monthlyPay");
  }

  // "<name>：月薪 <monthly pay> 元"
  // Call this.monthlyPay() here instead of reading the base salary, so
  // that child classes which override monthlyPay() get the right line.
  describe(): string {
    // TODO
    throw new Error("TODO：尚未完成 Employee 的 describe");
  }
}

// Part 2: a child class without its own constructor. `new Intern(...)`
// uses the constructor it inherits from Employee.
export class Intern extends Employee {
  // An intern is paid half of the base salary.
  // The base salary is private to Employee, so ask the parent for it:
  // super.monthlyPay().
  override monthlyPay(): number {
    // TODO
    throw new Error("TODO：尚未完成 Intern 的 monthlyPay");
  }
}

// Part 3: write a class named Manager yourself, starting from an empty
// line.
// - It extends Employee.
// - Its constructor takes (name: string, baseSalary: number, bonus: number).
//   Call super(...) first, then store the bonus in a private field.
// - It overrides monthlyPay(): the parent's monthly pay plus the bonus.
// - It overrides describe(): the parent's line followed by "（主管）".
// Then make makeManager return a new Manager.

// TODO: write `class Manager extends Employee { ... }` here

export function makeManager(
  name: string,
  baseSalary: number,
  bonus: number,
): Employee {
  // TODO: return a new Manager
  throw new Error("TODO：尚未完成 makeManager");
}

// Part 4: the monthly pay of everyone added together.
// It must work for Employee and for every child class of it.
// totalPayroll([staff, intern, manager]) -> 125000
export function totalPayroll(employees: readonly Employee[]): number {
  // TODO
  throw new Error("TODO：尚未完成 totalPayroll");
}
