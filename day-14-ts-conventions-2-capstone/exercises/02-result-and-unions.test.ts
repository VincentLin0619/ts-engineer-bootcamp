import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { describeEvent, describeResult, parsePercent, valueOr } =
  await loadExercise<typeof import("./02-result-and-unions.ts")>(
    import.meta.dir,
    "02-result-and-unions",
  );

describe("練習 02：Result 與 discriminated union", () => {
  test("parsePercent 接受 0 到 100 的整數", () => {
    expect(parsePercent("42")).toEqual({ ok: true, value: 42 });
    expect(parsePercent("0")).toEqual({ ok: true, value: 0 });
    expect(parsePercent("100")).toEqual({ ok: true, value: 100 });
  });

  test("parsePercent 拒絕範圍外、小數與不是數字的文字", () => {
    expect(parsePercent("101")).toEqual({
      ok: false,
      error: "「101」不是 0 到 100 的整數",
    });
    expect(parsePercent("-1")).toEqual({
      ok: false,
      error: "「-1」不是 0 到 100 的整數",
    });
    expect(parsePercent("4.5")).toEqual({
      ok: false,
      error: "「4.5」不是 0 到 100 的整數",
    });
    expect(parsePercent("abc")).toEqual({
      ok: false,
      error: "「abc」不是 0 到 100 的整數",
    });
  });

  test("describeResult 分別描述成功與失敗", () => {
    expect(describeResult({ ok: true, value: 42 })).toBe("成功：42");
    expect(describeResult({ ok: false, error: "沒有資料" })).toBe(
      "失敗：沒有資料",
    );
  });

  test("describeResult 可以接上 parsePercent", () => {
    expect(describeResult(parsePercent("7"))).toBe("成功：7");
    expect(describeResult(parsePercent("七"))).toBe(
      "失敗：「七」不是 0 到 100 的整數",
    );
  });

  test("valueOr 成功時回傳 value，失敗時回傳 fallback", () => {
    expect(valueOr({ ok: true, value: 42 }, 0)).toBe(42);
    expect(valueOr({ ok: false, error: "沒有資料" }, 0)).toBe(0);
    expect(valueOr({ ok: false, error: 404 }, "（無）")).toBe("（無）");
    expect(valueOr(parsePercent("abc"), 50)).toBe(50);
  });

  test("describeEvent 描述每一種事件", () => {
    expect(describeEvent({ kind: "added", title: "買牛奶" })).toBe(
      "新增了「買牛奶」",
    );
    expect(describeEvent({ kind: "completed", id: 3 })).toBe("完成了 3 號");
    expect(describeEvent({ kind: "renamed", id: 3, title: "買豆漿" })).toBe(
      "3 號改名為「買豆漿」",
    );
    expect(describeEvent({ kind: "removed", id: 3 })).toBe("刪除了 3 號");
  });
});
