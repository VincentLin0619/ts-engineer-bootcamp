// Reference solution for exercise 01.

export class Employee {
  readonly name: string;
  #baseSalary: number;

  constructor(name: string, baseSalary: number) {
    this.name = name;
    this.#baseSalary = baseSalary;
  }

  monthlyPay(): number {
    return this.#baseSalary;
  }

  describe(): string {
    // this.monthlyPay() runs the version of the instance's own class.
    return `${this.name}：月薪 ${this.monthlyPay()} 元`;
  }
}

export class Intern extends Employee {
  override monthlyPay(): number {
    return super.monthlyPay() / 2;
  }
}

// Not exported: the outside world only ever sees it as an Employee.
class Manager extends Employee {
  #bonus: number;

  constructor(name: string, baseSalary: number, bonus: number) {
    // The parent sets up its own part first.
    super(name, baseSalary);
    this.#bonus = bonus;
  }

  override monthlyPay(): number {
    return super.monthlyPay() + this.#bonus;
  }

  override describe(): string {
    return `${super.describe()}（主管）`;
  }
}

export function makeManager(
  name: string,
  baseSalary: number,
  bonus: number,
): Employee {
  return new Manager(name, baseSalary, bonus);
}

export function totalPayroll(employees: readonly Employee[]): number {
  return employees.reduce((sum, employee) => sum + employee.monthlyPay(), 0);
}
