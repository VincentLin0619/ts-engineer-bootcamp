import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { BlackTea, DrinkRecipe, Latte, menu } = await loadExercise<
  typeof import("./02-drink-recipe.ts")
>(import.meta.dir, "02-drink-recipe");

// A drink the exercise file has never heard of. The template method in
// DrinkRecipe must work for it without any change.
class HotCocoa extends DrinkRecipe {
  name(): string {
    return "熱可可";
  }

  brew(): string {
    return "拌入可可粉";
  }

  addExtras(): string {
    return "放上棉花糖";
  }
}

describe("練習 02：抽象類別 DrinkRecipe", () => {
  test("BlackTea 填入自己的步驟", () => {
    const tea = new BlackTea();
    expect(tea.name()).toBe("紅茶");
    expect(tea.brew()).toBe("放入茶包泡 3 分鐘");
    expect(tea.addExtras()).toBe("加一片檸檬");
  });

  test("Latte 填入自己的步驟", () => {
    const latte = new Latte();
    expect(latte.name()).toBe("拿鐵");
    expect(latte.brew()).toBe("沖一份濃縮咖啡");
    expect(latte.addExtras()).toBe("倒入熱牛奶");
  });

  test("steps 固定四個步驟的順序", () => {
    expect(new BlackTea().steps()).toEqual([
      "把水煮開",
      "放入茶包泡 3 分鐘",
      "倒進杯子",
      "加一片檸檬",
    ]);
    expect(new Latte().steps()).toEqual([
      "把水煮開",
      "沖一份濃縮咖啡",
      "倒進杯子",
      "倒入熱牛奶",
    ]);
  });

  test("instructions 是標題加上編號的步驟", () => {
    expect(new BlackTea().instructions()).toEqual([
      "紅茶的做法",
      "1. 把水煮開",
      "2. 放入茶包泡 3 分鐘",
      "3. 倒進杯子",
      "4. 加一片檸檬",
    ]);
  });

  test("樣板方法對新的子類別一樣有效", () => {
    expect(new HotCocoa().instructions()).toEqual([
      "熱可可的做法",
      "1. 把水煮開",
      "2. 拌入可可粉",
      "3. 倒進杯子",
      "4. 放上棉花糖",
    ]);
  });

  test("menu 對每一種飲料呼叫同樣的方法", () => {
    expect(menu([])).toEqual([]);
    expect(menu([new BlackTea(), new Latte(), new HotCocoa()])).toEqual([
      "紅茶：4 個步驟",
      "拿鐵：4 個步驟",
      "熱可可：4 個步驟",
    ]);
  });
});
