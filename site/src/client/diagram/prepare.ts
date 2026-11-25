// Runs before Mermaid draws a diagram: reads the parsed diagram, picks an
// icon for each node, and appends `class`/`cssClass` statements so CSS can
// widen the nodes that carry an icon. The README source is never changed;
// only the text handed to Mermaid is.

import {
  type DiagramKind,
  type IconName,
  iconOverrides,
  type NodeFacts,
  type NodeShape,
  pickIcon,
} from "./icons.ts";

/** The part of the Mermaid module this file needs. */
export type MermaidParser = {
  mermaidAPI: {
    getDiagramFromText(text: string): Promise<{ type: string; db: unknown }>;
  };
};

export type Prepared = {
  /** Text to hand to Mermaid: the source plus appended class statements. */
  source: string;
  kind: DiagramKind | undefined;
  /** Node id → icon, for nodes that get one. */
  icons: Map<string, IconName>;
};

type ShapeClass = "shapeBranch" | "shapeStore";

export function diagramKind(type: string): DiagramKind | undefined {
  if (/^flowchart|^graph/.test(type)) return "flowchart";
  if (/^sequence/.test(type)) return "sequence";
  if (/^class/.test(type)) return "class";
  if (/^state/.test(type)) return "state";
  if (/^er$/.test(type)) return "er";
  return undefined;
}

// --- reading the parser's db (shapes differ per diagram type) ---------------

type Fields = Record<string, unknown>;

function isRecord(value: unknown): value is Fields {
  return typeof value === "object" && value !== null;
}

/** Calls `db[name]()` if it exists and returns its items as an array. */
function callList(db: unknown, name: string): Fields[] {
  if (!isRecord(db)) return [];
  const method = db[name];
  if (typeof method !== "function") return [];
  const result: unknown = method.call(db);
  const items =
    result instanceof Map
      ? [...result.values()]
      : Array.isArray(result)
        ? result
        : isRecord(result)
          ? Object.values(result)
          : [];
  return items.filter(isRecord);
}

const text = (value: unknown): string =>
  typeof value === "string" ? value : "";

const ENTITIES: Record<string, string> = {
  "&quot;": '"',
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&#39;": "'",
};

/** Label text as lines: `<br>` splits, other tags go, entities decode. */
function labelLines(label: string): string[] {
  return label
    .split(/<br\s*\/?>/i)
    .map((line) =>
      line
        .replace(/<[^>]+>/g, "")
        .replace(/&(quot|amp|lt|gt|#39);/g, (entity) => ENTITIES[entity] ?? "")
        .trim(),
    )
    .filter((line) => line !== "");
}

function flowShape(type: unknown): NodeShape {
  if (type === "diamond" || type === "cylinder" || type === "stadium") {
    return type;
  }
  if (
    type === undefined ||
    type === "square" ||
    type === "round" ||
    type === "rect"
  ) {
    return "rect";
  }
  return "other";
}

function flowchartNodes(db: unknown): NodeFacts[] {
  const roles = new Map<string, "source" | "target">();
  for (const edge of callList(db, "getEdges")) {
    if (!/implements/i.test(text(edge.text))) continue;
    roles.set(text(edge.start), "source");
    roles.set(text(edge.end), "target");
  }
  return callList(db, "getVertices").map((vertex) => {
    const id = text(vertex.id);
    const role = roles.get(id);
    return {
      id,
      kind: "flowchart",
      shape: flowShape(vertex.type),
      lines: labelLines(text(vertex.text)),
      ...(role ? { implementsRole: role } : {}),
    };
  });
}

function classNodes(db: unknown): NodeFacts[] {
  const roles = new Map<string, "source" | "target">();
  for (const relation of callList(db, "getRelations")) {
    const kind = isRecord(relation.relation) ? relation.relation : {};
    const id1 = text(relation.id1);
    const id2 = text(relation.id2);
    const dotted = kind.lineType === 1;
    if (dotted && kind.type2 === 1) {
      roles.set(id1, "source");
      roles.set(id2, "target");
    } else if (dotted && kind.type1 === 1) {
      roles.set(id2, "source");
      roles.set(id1, "target");
    } else if (/implements/i.test(text(relation.title))) {
      roles.set(id1, "source");
      roles.set(id2, "target");
    }
  }
  return callList(db, "getClasses").map((entry) => {
    const id = text(entry.id);
    const annotations = Array.isArray(entry.annotations)
      ? entry.annotations
      : [];
    const stereotype = text(annotations[0]);
    const role = roles.get(id);
    return {
      id,
      kind: "class",
      shape: "rect",
      lines: [id],
      ...(stereotype ? { stereotype } : {}),
      ...(role ? { implementsRole: role } : {}),
    };
  });
}

function sequenceNodes(db: unknown): NodeFacts[] {
  return callList(db, "getActors").map((actor) => {
    const id = text(actor.name);
    const lines = labelLines(text(actor.description) || id);
    return {
      id,
      kind: "sequence",
      shape: "rect",
      lines,
      ...(actor.type === "actor" ? { isActor: true } : {}),
    };
  });
}

/** Facts about every node the icon rules may decorate. */
export function collectNodes(kind: DiagramKind, db: unknown): NodeFacts[] {
  if (kind === "flowchart") return flowchartNodes(db);
  if (kind === "class") return classNodes(db);
  if (kind === "sequence") return sequenceNodes(db);
  // State diagrams get no icons; ER tables always get `db` after rendering.
  return [];
}

// --- the text handed to Mermaid ---------------------------------------------

export function augmentSource(
  source: string,
  kind: DiagramKind,
  slotted: readonly string[],
  shapes: ReadonlyMap<string, ShapeClass>,
): string {
  const extra: string[] = [];
  if (kind === "flowchart") {
    if (slotted.length > 0) extra.push(`class ${slotted.join(",")} icoSlot`);
    for (const name of ["shapeBranch", "shapeStore"] as const) {
      const ids = [...shapes].filter(([, shape]) => shape === name);
      if (ids.length > 0) {
        extra.push(`class ${ids.map(([id]) => id).join(",")} ${name}`);
      }
    }
  } else if (kind === "class" && slotted.length > 0) {
    // Class diagrams reject `-` in class names, hence camelCase.
    extra.push(`cssClass "${slotted.join(",")}" icoSlot`);
  }
  if (extra.length === 0) return source;
  return `${source}\n${extra.map((line) => `  ${line}`).join("\n")}`;
}

export async function prepareDiagram(
  mermaid: MermaidParser,
  source: string,
): Promise<Prepared> {
  try {
    const diagram = await mermaid.mermaidAPI.getDiagramFromText(source);
    const kind = diagramKind(diagram.type);
    if (!kind) return { source, kind, icons: new Map() };
    const overrides = iconOverrides(source);
    const icons = new Map<string, IconName>();
    const shapes = new Map<string, ShapeClass>();
    for (const node of collectNodes(kind, diagram.db)) {
      const icon = pickIcon(node, overrides);
      if (icon) icons.set(node.id, icon);
      if (node.shape === "diamond") shapes.set(node.id, "shapeBranch");
      if (node.shape === "cylinder") shapes.set(node.id, "shapeStore");
    }
    // Sequence participants keep their size; their icon sits above the text.
    const slotted = kind === "sequence" ? [] : [...icons.keys()];
    return {
      source: augmentSource(source, kind, slotted, shapes),
      kind,
      icons,
    };
  } catch {
    // An unknown syntax or a Mermaid change must not break the diagram.
    return { source, kind: undefined, icons: new Map() };
  }
}
