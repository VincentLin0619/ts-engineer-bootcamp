import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import { TodoNotFoundError } from "../examples/todo/errors.ts";
import { InMemoryTodoRepository } from "../examples/todo/in-memory-todo-repository.ts";
import { TodoService } from "../examples/todo/todo-service.ts";

const { parseCommand, runCommand } = await loadExercise<
  typeof import("./03-todo-commands.ts")
>(import.meta.dir, "03-todo-commands");

function createService(): TodoService {
  return new TodoService(new InMemoryTodoRepository());
}

describe("練習 03（加練）：parseCommand", () => {
  test("add 帶著標題", () => {
    expect(parseCommand("add 買牛奶")).toEqual({
      ok: true,
      value: { kind: "add", title: "買牛奶" },
    });
    expect(parseCommand("  add   買 兩瓶 牛奶  ")).toEqual({
      ok: true,
      value: { kind: "add", title: "買 兩瓶 牛奶" },
    });
  });

  test("add 沒有標題是失敗", () => {
    expect(parseCommand("add")).toEqual({ ok: false, error: "add 需要標題" });
    expect(parseCommand("add   ")).toEqual({
      ok: false,
      error: "add 需要標題",
    });
  });

  test("list 預設是 all，也可以指定篩選條件", () => {
    expect(parseCommand("list")).toEqual({
      ok: true,
      value: { kind: "list", filter: "all" },
    });
    expect(parseCommand("  list  open ")).toEqual({
      ok: true,
      value: { kind: "list", filter: "open" },
    });
    expect(parseCommand("list done")).toEqual({
      ok: true,
      value: { kind: "list", filter: "done" },
    });
  });

  test("list 看不懂的篩選條件是失敗", () => {
    expect(parseCommand("list later")).toEqual({
      ok: false,
      error: "看不懂的篩選條件：later",
    });
  });

  test("done 與 rm 帶著 id", () => {
    expect(parseCommand("done 3")).toEqual({
      ok: true,
      value: { kind: "done", id: 3 },
    });
    expect(parseCommand("rm 12")).toEqual({
      ok: true,
      value: { kind: "remove", id: 12 },
    });
  });

  test("id 不是正整數是失敗", () => {
    // `as const` keeps `ok` as the literal type false instead of boolean.
    const failure = { ok: false, error: "id 必須是正整數" } as const;

    expect(parseCommand("done abc")).toEqual(failure);
    expect(parseCommand("done")).toEqual(failure);
    expect(parseCommand("rm 0")).toEqual(failure);
    expect(parseCommand("rm 1.5")).toEqual(failure);
    expect(parseCommand("rename x 買豆漿")).toEqual(failure);
  });

  test("rename 帶著 id 與新標題", () => {
    expect(parseCommand("rename 2 買豆漿")).toEqual({
      ok: true,
      value: { kind: "rename", id: 2, title: "買豆漿" },
    });
    expect(parseCommand("rename 2")).toEqual({
      ok: false,
      error: "rename 需要新的標題",
    });
  });

  test("其他的字是看不懂的指令", () => {
    expect(parseCommand("dance")).toEqual({
      ok: false,
      error: "看不懂的指令：dance",
    });
    expect(parseCommand("dance all night")).toEqual({
      ok: false,
      error: "看不懂的指令：dance",
    });
  });
});

describe("練習 03（加練）：runCommand", () => {
  test("add 新增一筆", async () => {
    const service = createService();

    const text = await runCommand(service, { kind: "add", title: "買牛奶" });

    expect(text).toBe("已新增 1 號：買牛奶");
    expect((await service.get(1)).title).toBe("買牛奶");
  });

  test("list 一行一筆，沒有資料時有固定的文字", async () => {
    const service = createService();
    expect(await runCommand(service, { kind: "list", filter: "all" })).toBe(
      "（沒有待辦事項）",
    );

    await service.add("買牛奶");
    await service.add("寫作業");
    await service.complete(2);

    expect(await runCommand(service, { kind: "list", filter: "all" })).toBe(
      "[ ] #1 買牛奶（優先度：中）\n[x] #2 寫作業（優先度：中）",
    );
    expect(await runCommand(service, { kind: "list", filter: "open" })).toBe(
      "[ ] #1 買牛奶（優先度：中）",
    );
    expect(await runCommand(service, { kind: "list", filter: "done" })).toBe(
      "[x] #2 寫作業（優先度：中）",
    );
  });

  test("done 標記完成", async () => {
    const service = createService();
    await service.add("買牛奶");

    const text = await runCommand(service, { kind: "done", id: 1 });

    expect(text).toBe("已完成 1 號");
    expect((await service.get(1)).done).toBe(true);
  });

  test("rename 改標題", async () => {
    const service = createService();
    await service.add("買牛奶");

    const text = await runCommand(service, {
      kind: "rename",
      id: 1,
      title: "買豆漿",
    });

    expect(text).toBe("1 號改名為：買豆漿");
    expect((await service.get(1)).title).toBe("買豆漿");
  });

  test("remove 刪除一筆", async () => {
    const service = createService();
    await service.add("買牛奶");

    const text = await runCommand(service, { kind: "remove", id: 1 });

    expect(text).toBe("已刪除 1 號");
    expect(await service.list()).toEqual([]);
  });

  test("Service 丟出的錯誤原樣往外丟", async () => {
    const service = createService();

    await expect(runCommand(service, { kind: "done", id: 99 })).rejects.toThrow(
      TodoNotFoundError,
    );
  });

  test("parseCommand 的結果可以直接交給 runCommand", async () => {
    const service = createService();
    const parsed = parseCommand("add 買牛奶");

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(await runCommand(service, parsed.value)).toBe(
        "已新增 1 號：買牛奶",
      );
    }
  });
});
