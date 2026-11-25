import { describe, expect, test } from "bun:test";
import {
  augmentSource,
  collectNodes,
  diagramKind,
  type MermaidParser,
  prepareDiagram,
} from "./prepare.ts";

const flowDb = {
  getVertices: () =>
    new Map([
      [
        "cli",
        {
          id: "cli",
          text: "CLI（cli.ts）<br>把文字指令變成方法呼叫",
          type: "square",
        },
      ],
      ["d", { id: "d", text: "todos.json", type: "cylinder" }],
      ["m", { id: "m", text: "InMemoryTodoRepository", type: undefined }],
    ]),
  getEdges: () => [{ start: "m", end: "r", text: "implements" }],
};

const parserFor = (type: string, db: unknown): MermaidParser => ({
  mermaidAPI: { getDiagramFromText: async () => ({ type, db }) },
});

describe("diagramKind", () => {
  test("maps Mermaid diagram types", () => {
    expect(diagramKind("flowchart-v2")).toBe("flowchart");
    expect(diagramKind("sequence")).toBe("sequence");
    expect(diagramKind("classDiagram")).toBe("class");
    expect(diagramKind("stateDiagram")).toBe("state");
    expect(diagramKind("er")).toBe("er");
    expect(diagramKind("pie")).toBeUndefined();
  });
});

describe("collectNodes", () => {
  test("flowchart vertices, shapes and implements edges", () => {
    const nodes = collectNodes("flowchart", flowDb);
    const byId = new Map(nodes.map((node) => [node.id, node]));
    expect(byId.get("cli")?.lines).toEqual([
      "CLI（cli.ts）",
      "把文字指令變成方法呼叫",
    ]);
    expect(byId.get("cli")?.shape).toBe("rect");
    expect(byId.get("d")?.shape).toBe("cylinder");
    expect(byId.get("m")?.implementsRole).toBe("source");
  });

  test("class stereotypes and realization", () => {
    const db = {
      getClasses: () =>
        new Map([
          [
            "TodoRepository",
            { id: "TodoRepository", annotations: ["interface"] },
          ],
          [
            "InMemoryTodoRepository",
            { id: "InMemoryTodoRepository", annotations: [] },
          ],
        ]),
      getRelations: () => [
        {
          id1: "InMemoryTodoRepository",
          id2: "TodoRepository",
          title: "implements",
          relation: { type1: "none", type2: 1, lineType: 1 },
        },
      ],
    };
    const byId = new Map(
      collectNodes("class", db).map((node) => [node.id, node]),
    );
    expect(byId.get("TodoRepository")?.stereotype).toBe("interface");
    expect(byId.get("TodoRepository")?.implementsRole).toBe("target");
    expect(byId.get("InMemoryTodoRepository")?.implementsRole).toBe("source");
  });

  test("sequence actors", () => {
    const db = {
      getActors: () =>
        new Map([["U", { name: "U", description: "使用者", type: "actor" }]]),
    };
    expect(collectNodes("sequence", db)).toEqual([
      {
        id: "U",
        kind: "sequence",
        shape: "rect",
        lines: ["使用者"],
        isActor: true,
      },
    ]);
  });

  test("state, er and unknown dbs give nothing", () => {
    expect(collectNodes("state", flowDb)).toEqual([]);
    expect(collectNodes("er", flowDb)).toEqual([]);
    expect(collectNodes("flowchart", {})).toEqual([]);
    expect(collectNodes("class", null)).toEqual([]);
  });
});

describe("augmentSource", () => {
  const src = "flowchart LR\n  a --> b";
  test("flowchart slots and shape classes", () => {
    expect(
      augmentSource(
        src,
        "flowchart",
        ["a", "b"],
        new Map([["q", "shapeBranch"]]),
      ),
    ).toBe(`${src}\n  class a,b icoSlot\n  class q shapeBranch`);
  });
  test("class diagram slots", () => {
    expect(augmentSource(src, "class", ["A", "B"], new Map())).toBe(
      `${src}\n  cssClass "A,B" icoSlot`,
    );
  });
  test("nothing to add keeps the source", () => {
    expect(augmentSource(src, "flowchart", [], new Map())).toBe(src);
  });
});

describe("prepareDiagram", () => {
  test("picks icons and reserves room for them", async () => {
    const source = "flowchart LR\n  cli --> d";
    const prepared = await prepareDiagram(
      parserFor("flowchart-v2", flowDb),
      source,
    );
    expect(prepared.kind).toBe("flowchart");
    expect(prepared.icons.get("cli")).toBe("terminal");
    expect(prepared.icons.has("d")).toBe(false);
    expect(prepared.source).toContain("class cli,m icoSlot");
    expect(prepared.source).toContain("class d shapeStore");
  });

  test("falls back when the parser throws", async () => {
    const parser: MermaidParser = {
      mermaidAPI: {
        getDiagramFromText: async () => {
          throw new Error("Parse error on line 1");
        },
      },
    };
    const prepared = await prepareDiagram(parser, "graph ???");
    expect(prepared).toEqual({
      source: "graph ???",
      kind: undefined,
      icons: new Map(),
    });
  });
});
