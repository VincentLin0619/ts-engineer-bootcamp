import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { loadExercise } from "../../support/load-exercise.ts";

const { countPaid, describeFailure, largestTotal, orderSummary, paymentLabel } =
  await loadExercise<typeof import("./02-any-unknown.ts")>(
    import.meta.dir,
    "02-any-unknown",
  );

// The text of the file being tested, to check what tests cannot observe by
// calling functions: leftover `any`, `as` and suppression comments.
const source = await Bun.file(
  join(
    import.meta.dir,
    process.env.SOLUTIONS ? "../solutions" : ".",
    "02-any-unknown.ts",
  ),
).text();
const lines = source.split("\n").map((line) => line.trim());
const codeLines = lines.filter((line) => !line.startsWith("//"));

const orders = [
  { id: 1, customer: "小明", total: 250, paid: false },
  { id: 2, customer: "小華", total: 480, paid: true },
  { id: 3, customer: "阿美", total: 120, paid: true },
];

describe("練習 02：any、unknown、! 與 as", () => {
  test("沒有留下 biome-ignore 或 @ts-expect-error 註解", () => {
    const suppressions = lines.filter(
      (line) =>
        line.startsWith("// biome-ignore") ||
        line.startsWith("// @ts-expect-error"),
    );
    expect(suppressions).toEqual([]);
  });

  test("程式裡沒有 any 型別，也沒有 as 轉型", () => {
    const looseLines = codeLines.filter(
      (line) => /:\s*any\b/.test(line) || line.includes(" as PaymentMethod"),
    );
    expect(looseLines).toEqual([]);
  });

  test("orderSummary 組出訂單摘要", () => {
    expect(
      orderSummary({ id: 1, customer: "小明", total: 250, paid: false }),
    ).toBe("#1 小明：NT$250");
  });

  test("countPaid 算出已付款的訂單數", () => {
    expect(countPaid(orders)).toBe(2);
    expect(countPaid([])).toBe(0);
  });

  test("largestTotal 找出最大的金額", () => {
    expect(largestTotal(orders)).toBe(480);
  });

  test("largestTotal 遇到空陣列時回傳 0，不會當掉", () => {
    expect(largestTotal([])).toBe(0);
  });

  test("paymentLabel 回傳付款方式的名稱", () => {
    expect(paymentLabel("cash")).toBe("現金");
    expect(paymentLabel("card")).toBe("刷卡");
  });

  test("paymentLabel 遇到不支援的付款方式時丟出錯誤", () => {
    expect(() => paymentLabel("bitcoin")).toThrow("不支援的付款方式：bitcoin");
  });

  test("describeFailure 讀出 Error 的訊息", () => {
    expect(describeFailure(new Error("餘額不足"))).toBe("失敗：餘額不足");
  });

  test("describeFailure 也能處理不是 Error 的值", () => {
    expect(describeFailure("網路斷線")).toBe("失敗：網路斷線");
    expect(describeFailure(404)).toBe("失敗：404");
  });
});
