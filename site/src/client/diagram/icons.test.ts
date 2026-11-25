import { describe, expect, test } from "bun:test";
import {
  type IconName,
  iconOverrides,
  type NodeFacts,
  pickIcon,
} from "./icons.ts";

const none = new Map<string, never>();
const node = (lines: string[], extra: Partial<NodeFacts> = {}): NodeFacts => ({
  id: "n",
  kind: "flowchart",
  shape: "rect",
  lines,
  ...extra,
});

describe("pickIcon", () => {
  const flowchart: [string[], IconName | undefined][] = [
    [["cli.ts", "終端機入口"], "terminal"],
    [["http-api.ts", "HTTP 入口（今天新增）"], "entry"],
    [["todo-service.ts"], "gear"],
    [["todos.json"], "file"],
    [["TodoRepository", "介面：儲存的合約"], "contract"],
    [["InMemoryTodoRepository", "合約的實作"], undefined],
    [["C：Create", "service.add"], undefined],
    [["response 的 body", '{ "error": 訊息 }'], undefined],
    [["Arrange 準備", "建立這個測試要用的資料"], undefined],
    [["ValidationError"], "alert"],
    [["400 Bad Request", "訊息：錯誤的 message"], "alert"],
    [["client", "curl、fetch、瀏覽器"], "globe"],
    [["todo.complete()"], "fn"],
    [["SqliteTodoRepository"], "db"],
    [["parseNewTodoBody 檢查 body"], undefined],
  ];
  for (const [lines, icon] of flowchart) {
    test(`flowchart ${lines[0]} -> ${icon}`, () => {
      expect(pickIcon(node(lines), none)).toBe(icon);
    });
  }

  test("non-rect shapes never get an icon, even with an override", () => {
    expect(
      pickIcon(node(["todos.json"], { shape: "cylinder" }), none),
    ).toBeUndefined();
    expect(
      pickIcon(
        node(["有找到？"], { shape: "diamond" }),
        new Map([["n", "branch"]]),
      ),
    ).toBeUndefined();
  });

  test("overrides win on rect nodes", () => {
    expect(pickIcon(node(["anything"]), new Map([["n", "branch"]]))).toBe(
      "branch",
    );
    expect(
      pickIcon(node(["cli.ts"]), new Map([["n", "none"]])),
    ).toBeUndefined();
  });

  test("implements role beats every keyword", () => {
    expect(
      pickIcon(
        node(["SqliteTodoRepository"], { implementsRole: "source" }),
        none,
      ),
    ).toBe("cube");
    expect(
      pickIcon(
        node(["TodoRepository（todo-repository.ts）"], {
          implementsRole: "target",
        }),
        none,
      ),
    ).toBe("contract");
    expect(
      pickIcon(
        node(["JsonFileTodoRepository"], { implementsRole: "source" }),
        none,
      ),
    ).toBe("cube");
    expect(
      pickIcon(node(["TodoRepository"], { implementsRole: "target" }), none),
    ).toBe("contract");
    expect(
      pickIcon(node(["X", "合約"], { implementsRole: "source" }), none),
    ).toBe("cube");
  });

  test("state diagrams get no icons", () => {
    expect(
      pickIcon(node(["rejected", "已失敗：帶著錯誤"], { kind: "state" }), none),
    ).toBeUndefined();
  });

  test("sequence actors and participants", () => {
    expect(
      pickIcon(node(["使用者"], { kind: "sequence", isActor: true }), none),
    ).toBe("user");
    expect(pickIcon(node(["CLI"], { kind: "sequence" }), none)).toBe(
      "terminal",
    );
  });

  test("class diagrams fall back to cube", () => {
    const cls = (lines: string[], stereotype?: string): NodeFacts =>
      node(lines, { kind: "class", ...(stereotype ? { stereotype } : {}) });
    expect(pickIcon(cls(["TodoService"]), none)).toBe("gear");
    expect(pickIcon(cls(["TodoRepository"], "interface"), none)).toBe(
      "contract",
    );
    expect(pickIcon(cls(["TodoFormatter"], "abstract"), none)).toBe("cube");
    expect(pickIcon(cls(["Todo"]), none)).toBe("cube");
    expect(pickIcon(cls(["TodoNotFoundError"]), none)).toBe("alert");
  });
});

describe("iconOverrides", () => {
  test("reads %% icon: lines and skips unknown names", () => {
    const source =
      "flowchart LR\n  %%  icon:  cli   terminal\n  %% icon: q none\n  %% icon: a rocket\n  cli --> q";
    expect([...iconOverrides(source)]).toEqual([
      ["cli", "terminal"],
      ["q", "none"],
    ]);
  });
});
