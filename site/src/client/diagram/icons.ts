// Line icons for diagram nodes and the rules that pick one for each node.
// Pure data and functions: no DOM access, so the rules are unit-tested.

export type IconName =
  | "user"
  | "globe"
  | "terminal"
  | "entry"
  | "gear"
  | "contract"
  | "cube"
  | "fn"
  | "db"
  | "file"
  | "branch"
  | "alert"
  | "clock"
  | "check";

export type IconCategory = "actor" | "flow" | "code" | "store" | "error";

export const ICON_CATEGORY: Record<IconName, IconCategory> = {
  user: "actor",
  globe: "actor",
  terminal: "flow",
  entry: "flow",
  branch: "flow",
  clock: "flow",
  check: "flow",
  gear: "code",
  contract: "code",
  cube: "code",
  fn: "code",
  db: "store",
  file: "store",
  alert: "error",
};

/** Inner markup of each 24×24 icon, drawn with `fill: none` strokes. */
export const ICON_MARKUP: Record<IconName, string> = {
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/>',
  globe:
    '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.5 3.6 5.3 3.6 8.5s-1.2 6-3.6 8.5c-2.4-2.5-3.6-5.3-3.6-8.5s1.2-6 3.6-8.5z"/>',
  terminal:
    '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7 10l3 2.5L7 15M12.5 15H17"/>',
  entry:
    '<path d="M3.5 12h10M10 8l4 4-4 4"/><path d="M14 4.5h3.5A2.5 2.5 0 0 1 20 7v10a2.5 2.5 0 0 1-2.5 2.5H14"/>',
  gear: '<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="12" r="6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  contract:
    '<rect x="4" y="4" width="16" height="16" rx="3" stroke-dasharray="3.2 2.6"/><path d="M8.5 10h7M8.5 14h4.5"/>',
  cube: '<path d="M12 3.2l7.8 4.4v8.8L12 20.8l-7.8-4.4V7.6z"/><path d="M4.4 7.7L12 12l7.6-4.3M12 12v8.6"/>',
  db: '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
  file: '<path d="M14 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V8.5z"/><path d="M14 3.5v5h5M9 13h6M9 16.5h4"/>',
  branch:
    '<path d="M12 3.5l8.5 8.5-8.5 8.5L3.5 12z"/><path d="M10.2 10.2a1.9 1.9 0 1 1 2.5 1.8c-.4.2-.7.5-.7 1M12 15.4v.1"/>',
  alert:
    '<path d="M10.3 4.6L3.2 17.2A2 2 0 0 0 5 20.2h14a2 2 0 0 0 1.8-3L13.7 4.6a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 16.8v.1"/>',
  fn: '<path d="M15.5 4.5H14a2.5 2.5 0 0 0-2.5 2.5v10a2.5 2.5 0 0 1-2.5 2.5H7.5M8.5 10.5h6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  check:
    '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.3 4.6-4.8"/>',
};

export type DiagramKind = "flowchart" | "sequence" | "class" | "state" | "er";

export type NodeShape = "rect" | "diamond" | "cylinder" | "stadium" | "other";

/** What the icon rules know about one node, gathered before rendering. */
export type NodeFacts = {
  id: string;
  kind: DiagramKind;
  shape: NodeShape;
  /** Label lines, first line is the node's name. */
  lines: string[];
  /** Class stereotype without the angle brackets, e.g. "interface". */
  stereotype?: string;
  /** Which end of an `implements` relation this node is on. */
  implementsRole?: "source" | "target";
  /** Sequence `actor` (stick figure) rather than `participant`. */
  isActor?: boolean;
};

// Order matters: the first matching keyword wins, so `cli.ts` is a
// terminal and `todo-service.ts` a service rather than a plain file.
const KEYWORDS: [IconName, RegExp][] = [
  ["alert", /error|throw|\b[45]\d\d\b|錯誤|例外/i],
  ["user", /使用者|\buser\b/i],
  ["globe", /client|瀏覽器|browser|fetch|curl/i],
  ["terminal", /\bcli\b|終端機|terminal|bun run/i],
  ["entry", /http|handler|路由|route|bun\.serve/i],
  ["clock", /async|await|promise|非同步/i],
  ["check", /\btest\b|expect|測試/i],
  ["gear", /service/i],
  ["cube", /實作|implementation|物件/i],
  ["contract", /interface|介面|合約|契約/i],
  ["fn", /\(\)\s*$|function|函式/i],
  ["db", /sqlite|資料庫|database|\bdb\b/i],
  ["file", /[\w-]+\.(json|ts|js|md|txt|csv|html)\b/i],
];

function matchKeyword(line: string): IconName | undefined {
  return KEYWORDS.find(([, pattern]) => pattern.test(line))?.[0];
}

export function isIconName(value: string): value is IconName {
  return Object.hasOwn(ICON_CATEGORY, value);
}

/** Picks a node's icon; `undefined` means the node gets no icon at all. */
export function pickIcon(
  node: NodeFacts,
  overrides: ReadonlyMap<string, IconName | "none">,
): IconName | undefined {
  // Non-rect shapes already say what they are; states are not actors.
  if (node.shape !== "rect" || node.kind === "state") return undefined;
  const override = overrides.get(node.id);
  if (override !== undefined) return override === "none" ? undefined : override;
  if (node.isActor) return "user";
  const [first = "", ...rest] = node.lines;
  const byName = matchKeyword(first);
  if (byName) return byName;
  if (node.implementsRole === "source") return "cube";
  if (node.implementsRole === "target") return "contract";
  if (node.kind === "class" && node.stereotype === "interface") {
    return "contract";
  }
  for (const line of rest) {
    const byDetail = matchKeyword(line);
    if (byDetail) return byDetail;
  }
  return node.kind === "class" ? "cube" : undefined;
}

/** Icon choices written as `%% icon: <node id> <icon name>` lines. */
export function iconOverrides(source: string): Map<string, IconName | "none"> {
  const overrides = new Map<string, IconName | "none">();
  for (const line of source.split("\n")) {
    const match = /^\s*%%\s*icon:\s*(\S+)\s+(\S+)\s*$/.exec(line);
    const id = match?.[1];
    const name = match?.[2];
    if (!id || !name) continue;
    if (name === "none" || isIconName(name)) overrides.set(id, name);
  }
  return overrides;
}
