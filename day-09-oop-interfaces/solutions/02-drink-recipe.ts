// Reference solution for exercise 02.

export abstract class DrinkRecipe {
  abstract name(): string;
  abstract brew(): string;
  abstract addExtras(): string;

  // The order of the steps is decided here, once. A subclass can change
  // what step 2 and step 4 say, but not where they happen.
  steps(): string[] {
    return ["把水煮開", this.brew(), "倒進杯子", this.addExtras()];
  }

  instructions(): string[] {
    const lines = [`${this.name()}的做法`];
    let stepNumber = 1;
    for (const step of this.steps()) {
      lines.push(`${stepNumber}. ${step}`);
      stepNumber = stepNumber + 1;
    }
    return lines;
  }
}

export class BlackTea extends DrinkRecipe {
  name(): string {
    return "紅茶";
  }

  brew(): string {
    return "放入茶包泡 3 分鐘";
  }

  addExtras(): string {
    return "加一片檸檬";
  }
}

export class Latte extends DrinkRecipe {
  name(): string {
    return "拿鐵";
  }

  brew(): string {
    return "沖一份濃縮咖啡";
  }

  addExtras(): string {
    return "倒入熱牛奶";
  }
}

export function menu(recipes: readonly DrinkRecipe[]): string[] {
  return recipes.map(
    (recipe) => `${recipe.name()}：${recipe.steps().length} 個步驟`,
  );
}
