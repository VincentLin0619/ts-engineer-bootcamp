// Exercise 02: an abstract class with a template method.
//
// Replace every `throw new Error(...)` line, then run: bun test day-09
//
// Every drink is made with the same four steps in the same order. Two of
// the steps are identical for every drink, two differ per drink:
//
//   const tea = new BlackTea();
//   tea.steps()
//     -> ["把水煮開", "放入茶包泡 3 分鐘", "倒進杯子", "加一片檸檬"]
//   tea.instructions()
//     -> ["紅茶的做法", "1. 把水煮開", "2. 放入茶包泡 3 分鐘",
//         "3. 倒進杯子", "4. 加一片檸檬"]

export abstract class DrinkRecipe {
  // The parts that differ per drink. Each subclass fills them in.
  abstract name(): string;
  abstract brew(): string;
  abstract addExtras(): string;

  // The template method. Return the four steps, always in this order:
  //   1. "把水煮開"
  //   2. whatever this.brew() returns
  //   3. "倒進杯子"
  //   4. whatever this.addExtras() returns
  steps(): string[] {
    // TODO: return an array with the four steps
    throw new Error("TODO：尚未完成 steps");
  }

  // A title line, "<name>的做法", followed by the numbered steps
  // "<number>. <step>". The numbers start at 1.
  instructions(): string[] {
    // TODO: reuse this.name() and this.steps()
    throw new Error("TODO：尚未完成 instructions");
  }
}

// name: "紅茶"   brew: "放入茶包泡 3 分鐘"   addExtras: "加一片檸檬"
export class BlackTea extends DrinkRecipe {
  name(): string {
    // TODO
    throw new Error("TODO：尚未完成 BlackTea 的 name");
  }

  brew(): string {
    // TODO
    throw new Error("TODO：尚未完成 BlackTea 的 brew");
  }

  addExtras(): string {
    // TODO
    throw new Error("TODO：尚未完成 BlackTea 的 addExtras");
  }
}

// name: "拿鐵"   brew: "沖一份濃縮咖啡"   addExtras: "倒入熱牛奶"
export class Latte extends DrinkRecipe {
  name(): string {
    // TODO
    throw new Error("TODO：尚未完成 Latte 的 name");
  }

  brew(): string {
    // TODO
    throw new Error("TODO：尚未完成 Latte 的 brew");
  }

  addExtras(): string {
    // TODO
    throw new Error("TODO：尚未完成 Latte 的 addExtras");
  }
}

// One line per recipe: "<name>：<number of steps> 個步驟".
// It is written against DrinkRecipe, so it works for every drink.
//
//   menu([new BlackTea(), new Latte()])
//     -> ["紅茶：4 個步驟", "拿鐵：4 個步驟"]
export function menu(recipes: readonly DrinkRecipe[]): string[] {
  // TODO: use only name() and steps()
  throw new Error("TODO：尚未完成 menu");
}
