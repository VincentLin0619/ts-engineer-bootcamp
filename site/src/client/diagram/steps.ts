// Turns a diagram that Mermaid has already rendered into an ordered list of
// animation steps. Works from the SVG structure Mermaid 12 emits:
//   - edges are `path[data-edge]`, edge labels share the edge's `data-id`
//   - sequence messages carry `data-et="message"`, `data-from`, `data-to`
// Which nodes an edge connects is found geometrically from the edge's end
// points, so no Mermaid source parsing is needed.

export type Motion =
  | { kind: "path"; element: SVGPathElement }
  | { kind: "line"; element: SVGLineElement };

export type DiagramStep = {
  caption: string;
  /** Elements that become (and stay) lit from this step on. */
  reveal: Element[];
  /**
   * The part of `reveal` lit as soon as the step starts (where a moving line
   * sets off). The rest lights up when the line arrives.
   */
  revealFirst?: Element[];
  /** Elements emphasised only during this step. */
  focus: Element[];
  /** Route of the travelling dot, if any. */
  motion?: Motion;
  /** Text of the data chip that travels along the route, if any. */
  chip?: string;
  /** Element that pulses when the dot arrives (or when the step starts). */
  pulse?: Element;
};

export type DiagramPlan = {
  kind: "flow" | "sequence" | "structure";
  steps: DiagramStep[];
  /** Everything the animator dims while playing. */
  dimmable: Element[];
};

type Box = { left: number; top: number; right: number; bottom: number };

const MAX_LABEL = 40;
const MAX_CHIP = 24;

function shorten(text: string): string {
  const flat = text
    .replace(/\s*\n\s*/g, "，")
    .replace(/\s+/g, " ")
    .trim();
  return flat.length > MAX_LABEL ? `${flat.slice(0, MAX_LABEL - 1)}…` : flat;
}

/** Chip text: the first non-empty line, spaces collapsed, kept short. */
export function chipText(text: string): string {
  const line =
    text
      .split("\n")
      .map((part) => part.replace(/\s+/g, " ").trim())
      .find((part) => part !== "") ?? "";
  return line.length > MAX_CHIP ? `${line.slice(0, MAX_CHIP - 1)}…` : line;
}

/** Visible text of a node, keeping the line breaks Mermaid draws. */
function labelOf(element: Element | null | undefined): string {
  if (!element) return "";
  // Class boxes keep the class name in its own group, apart from «stereotype».
  const host = element.querySelector(":scope > g.label-group") ?? element;
  const html = host.querySelector("foreignObject div, foreignObject span");
  const text =
    // biome-ignore lint/performance/useDomNodeTextContent: innerText keeps the <br> line breaks that textContent drops
    html instanceof HTMLElement ? html.innerText : host.textContent;
  return (text ?? "").trim();
}

function firstLine(text: string): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !/^«.*»$/.test(line));
  return lines[0] ?? "";
}

function boxOf(element: Element): Box {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
  };
}

function distanceToBox(x: number, y: number, box: Box): number {
  const dx = Math.max(box.left - x, 0, x - box.right);
  const dy = Math.max(box.top - y, 0, y - box.bottom);
  return Math.hypot(dx, dy);
}

/** Distance to a box's outline: 0 on the border, positive inside or outside. */
function distanceToOutline(x: number, y: number, box: Box): number {
  const outside = distanceToBox(x, y, box);
  if (outside > 0) return outside;
  return Math.min(x - box.left, box.right - x, y - box.top, box.bottom - y);
}

function screenPoint(
  path: SVGPathElement,
  at: number,
): { x: number; y: number } | undefined {
  const matrix = path.getScreenCTM();
  if (!matrix) return undefined;
  const point = path.getPointAtLength(at);
  return {
    x: point.x * matrix.a + point.y * matrix.c + matrix.e,
    y: point.x * matrix.b + point.y * matrix.d + matrix.f,
  };
}

function isVisibleEdge(path: SVGPathElement): boolean {
  if (path.getAttribute("class")?.includes("invisible")) return false;
  const style = getComputedStyle(path);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (
    Number.parseFloat(style.strokeWidth) === 0 ||
    Number.parseFloat(style.opacity) === 0
  ) {
    return false;
  }
  return path.getTotalLength() > 1;
}

function edgeLabel(svg: SVGSVGElement, edge: Element): Element | undefined {
  const id = edge.getAttribute("data-id");
  if (!id) return undefined;
  const label = svg.querySelector(`.edgeLabels [data-id="${CSS.escape(id)}"]`);
  return label?.closest("g.edgeLabel") ?? label ?? undefined;
}

/** Custom captions written as `%% step: text` lines in the Mermaid source. */
export function captionOverrides(source: string): string[] {
  return source
    .split("\n")
    .map((line) => /^\s*%%\s*step:\s*(.*)$/.exec(line)?.[1]?.trim())
    .filter((caption): caption is string => caption !== undefined);
}

// ---------------------------------------------------------------------------
// Flowcharts, state diagrams, class diagrams, ER diagrams

type Shape = { element: Element; box: Box; isCluster: boolean };

function shapesOf(svg: SVGSVGElement): Shape[] {
  const nodes = Array.from(svg.querySelectorAll("g.node")).map((element) => ({
    element,
    box: boxOf(element),
    isCluster: false,
  }));
  const clusters = Array.from(svg.querySelectorAll("g.cluster")).map(
    (element) => ({
      element,
      box: boxOf(element),
      isCluster: true,
    }),
  );
  return [...nodes, ...clusters];
}

function nearestShape(
  shapes: Shape[],
  point: { x: number; y: number },
): Shape | undefined {
  let best: Shape | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const shape of shapes) {
    // Edges end on a node's border; for clusters only the outline counts.
    const distance = shape.isCluster
      ? distanceToOutline(point.x, point.y, shape.box) + 2
      : distanceToBox(point.x, point.y, shape.box);
    if (distance < bestDistance) {
      best = shape;
      bestDistance = distance;
    }
  }
  return best;
}

/** Clusters that contain a node, so they light up together with it. */
/** Everything drawn inside a cluster, so a lit box never has dark contents. */
function contentsOf(shapes: Shape[], cluster: Shape): Element[] {
  if (!cluster.isCluster) return [];
  return shapes
    .filter((shape) => {
      if (shape === cluster) return false;
      const x = (shape.box.left + shape.box.right) / 2;
      const y = (shape.box.top + shape.box.bottom) / 2;
      return distanceToBox(x, y, cluster.box) === 0;
    })
    .map((shape) => shape.element);
}

function clustersAround(shapes: Shape[], target: Shape): Element[] {
  if (target.isCluster) return [target.element];
  const center = {
    x: (target.box.left + target.box.right) / 2,
    y: (target.box.top + target.box.bottom) / 2,
  };
  return shapes
    .filter(
      (shape) =>
        shape.isCluster && distanceToBox(center.x, center.y, shape.box) === 0,
    )
    .map((shape) => shape.element);
}

function shapeName(
  shape: Shape | undefined,
  kind: "flow" | "structure",
  fallback = "",
): string {
  if (!shape) return fallback;
  const text = shape.isCluster
    ? labelOf(shape.element.querySelector(".cluster-label") ?? shape.element)
    : labelOf(shape.element);
  // The first line of a box is its name; later lines are details.
  const name = shorten(firstLine(text));
  return name || (kind === "flow" ? fallback : "");
}

/** Label of the smallest cluster around a shape, used to tell twins apart. */
function innermostCluster(shapes: Shape[], target: Shape | undefined): string {
  if (!target || target.isCluster) return "";
  const x = (target.box.left + target.box.right) / 2;
  const y = (target.box.top + target.box.bottom) / 2;
  const around = shapes
    .filter((shape) => shape.isCluster && distanceToBox(x, y, shape.box) === 0)
    .sort(
      (a, b) =>
        (a.box.right - a.box.left) * (a.box.bottom - a.box.top) -
        (b.box.right - b.box.left) * (b.box.bottom - b.box.top),
    );
  const cluster = around[0];
  if (!cluster) return "";
  return shorten(
    firstLine(
      labelOf(
        cluster.element.querySelector(".cluster-label") ?? cluster.element,
      ),
    ),
  );
}

function edgeSteps(
  svg: SVGSVGElement,
  shapes: Shape[],
  kind: "flow" | "structure",
): DiagramStep[] {
  const steps: DiagramStep[] = [];
  const edges = Array.from(
    svg.querySelectorAll<SVGPathElement>("path[data-edge]"),
  ).filter(isVisibleEdge);
  for (const edge of edges) {
    const length = edge.getTotalLength();
    const start = screenPoint(edge, 0);
    const end = screenPoint(edge, length);
    if (!start || !end) continue;
    const from = nearestShape(shapes, start);
    const to = nearestShape(shapes, end);
    const label = edgeLabel(svg, edge);
    const labelText = shorten(labelOf(label));
    let fromName = shapeName(from, kind, "開始");
    let toName = shapeName(to, kind, "結束");
    if (fromName === toName) {
      const fromGroup = innermostCluster(shapes, from);
      const toGroup = innermostCluster(shapes, to);
      if (fromGroup) fromName = `${fromGroup}：${fromName}`;
      if (toGroup) toName = `${toGroup}：${toName}`;
    }
    const caption =
      kind === "structure"
        ? `「${fromName}」和「${toName}」${labelText ? `：${labelText}` : ""}`
        : `「${fromName}」→「${toName}」${labelText ? `：${labelText}` : ""}`;
    const around = (shape: Shape | undefined): Element[] =>
      shape
        ? [
            shape.element,
            ...clustersAround(shapes, shape),
            ...contentsOf(shapes, shape),
          ]
        : [];
    const first = around(from);
    const reveal: Element[] = [edge, ...first, ...around(to)];
    if (label) reveal.push(label);
    const chip = chipText(labelOf(label));
    steps.push({
      caption,
      reveal,
      revealFirst: first,
      focus: label ? [edge, label] : [edge],
      motion: { kind: "path", element: edge },
      ...(chip ? { chip } : {}),
      ...(to ? { pulse: to.element } : {}),
    });
  }
  return steps;
}

/** ER entities light up row by row: the table name, then each column. */
function entitySteps(node: Element): DiagramStep[] {
  const name = firstLine(labelOf(node.querySelector("g.label.name") ?? node));
  const steps: DiagramStep[] = [
    {
      caption: `資料表「${name}」`,
      reveal: [node],
      focus: [node],
      pulse: node,
    },
  ];
  const labels = Array.from(node.querySelectorAll("g.label")).filter(
    (label) => !label.classList.contains("name"),
  );
  for (const row of node.querySelectorAll("g[class^='row-rect']")) {
    const box = boxOf(row);
    const middle = (box.top + box.bottom) / 2;
    const cells = labels
      .filter((label) => {
        const cell = boxOf(label);
        return cell.top <= middle && cell.bottom >= middle;
      })
      .map((label) => labelOf(label))
      .filter((text) => text !== "");
    if (cells.length === 0) continue;
    const [type, column, ...rest] = cells;
    steps.push({
      caption: `欄位「${column ?? type}」：${[type, ...rest].filter(Boolean).join("、")}`,
      reveal: [node],
      focus: [row],
    });
  }
  return steps;
}

function structureSteps(svg: SVGSVGElement, role: string): DiagramStep[] {
  const shapes = shapesOf(svg);
  const steps: DiagramStep[] = [];
  for (const node of svg.querySelectorAll("g.node")) {
    if (role === "er") {
      steps.push(...entitySteps(node));
      continue;
    }
    const name = firstLine(labelOf(node));
    steps.push({
      caption: `類別「${name}」`,
      reveal: [node],
      focus: [node],
      pulse: node,
    });
  }
  return [...steps, ...edgeSteps(svg, shapes, "structure")];
}

// ---------------------------------------------------------------------------
// Sequence diagrams

function sequenceSteps(svg: SVGSVGElement): {
  steps: DiagramStep[];
  dimmable: Element[];
} {
  const names = new Map<string, string>();
  for (const participant of svg.querySelectorAll(
    '[data-et="participant"][data-id]',
  )) {
    const id = participant.getAttribute("data-id") ?? "";
    const text = participant.querySelector("text")?.textContent?.trim();
    if (id && text && !names.has(id)) names.set(id, text);
  }
  for (const actor of svg.querySelectorAll("rect.actor-top[name]")) {
    const id = actor.getAttribute("name") ?? "";
    const text = actor.parentElement
      ?.querySelector("text")
      ?.textContent?.trim();
    if (id && text && !names.has(id)) names.set(id, text);
  }
  const messages = Array.from(svg.querySelectorAll('[data-et="message"]'));
  const texts = Array.from(svg.querySelectorAll("text.messageText"));
  const steps: DiagramStep[] = [];
  const dimmable: Element[] = [];
  messages.forEach((message, index) => {
    const text = texts[index];
    const fromId = message.getAttribute("data-from") ?? "";
    const toId = message.getAttribute("data-to") ?? "";
    const from = names.get(fromId) ?? "";
    const to = names.get(toId) ?? "";
    const words = shorten(text?.textContent ?? "");
    const chip = chipText(text?.textContent ?? "");
    // The receiver's top box pops on arrival; a self-call has no receiver.
    const target =
      toId && toId !== fromId
        ? svg.querySelector(
            `[data-et="participant"][data-id="${CSS.escape(toId)}"]`,
          )
        : null;
    const reveal = text ? [message, text] : [message];
    dimmable.push(...reveal);
    let motion: Motion | undefined;
    if (message instanceof SVGLineElement)
      motion = { kind: "line", element: message };
    else if (message instanceof SVGPathElement)
      motion = { kind: "path", element: message };
    steps.push({
      caption: `${from} → ${to}${words ? `：${words}` : ""}`,
      reveal,
      focus: reveal,
      ...(motion ? { motion } : {}),
      ...(chip ? { chip } : {}),
      ...(target ? { pulse: target } : {}),
    });
  });
  return { steps, dimmable };
}

// ---------------------------------------------------------------------------

export function planDiagram(
  svg: SVGSVGElement,
  source: string,
): DiagramPlan | undefined {
  const role = svg.getAttribute("aria-roledescription") ?? "";
  let plan: DiagramPlan;
  if (role === "sequence") {
    const { steps, dimmable } = sequenceSteps(svg);
    plan = { kind: "sequence", steps, dimmable };
  } else if (role === "classDiagram" || role === "er") {
    const steps = structureSteps(svg, role);
    plan = { kind: "structure", steps, dimmable: dimmableOf(svg) };
  } else if (role.startsWith("flowchart") || role === "stateDiagram") {
    const shapes = shapesOf(svg);
    const steps = edgeSteps(svg, shapes, "flow");
    // Diagrams without visible edges step through their boxes instead.
    if (steps.length === 0) {
      for (const shape of shapes.filter((item) => !item.isCluster)) {
        steps.push({
          caption: `「${shapeName(shape, "flow")}」`,
          reveal: [shape.element, ...clustersAround(shapes, shape)],
          focus: [shape.element],
          pulse: shape.element,
        });
      }
    }
    plan = { kind: "flow", steps, dimmable: dimmableOf(svg) };
  } else {
    return undefined;
  }
  if (plan.steps.length === 0) return undefined;

  const overrides = captionOverrides(source);
  plan.steps.forEach((step, index) => {
    const custom = overrides[index];
    if (custom) step.caption = custom;
  });
  plan.steps.push({
    caption: "這就是完整的圖。按 ⏮ 回到開頭，或按 ▶ 再播一次。",
    reveal: plan.dimmable,
    focus: [],
  });
  return plan;
}

function dimmableOf(svg: SVGSVGElement): Element[] {
  return Array.from(
    svg.querySelectorAll("g.node, g.cluster, path[data-edge], g.edgeLabel"),
  );
}
