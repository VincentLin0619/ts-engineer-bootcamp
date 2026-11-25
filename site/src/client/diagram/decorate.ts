// Runs after Mermaid has drawn a diagram: adds the line icons chosen in
// prepare.ts. Flowchart and class nodes already have room for the icon
// (CSS padding on `.icoSlot`); sequence and ER icons go where there is space.

import {
  type DiagramKind,
  ICON_CATEGORY,
  ICON_MARKUP,
  type IconName,
} from "./icons.ts";

const SVG_NS = "http://www.w3.org/2000/svg";
const SPRITE_ID = "diagram-icon-sprite";

type Attrs = Record<string, string | number>;

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Attrs,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) {
    element.setAttribute(name, String(value));
  }
  return element;
}

/** Adds one hidden sprite with every icon as a `<symbol>`, once per page. */
export function ensureIconSprite(doc: Document): void {
  if (doc.getElementById(SPRITE_ID)) return;
  const sprite = doc.createElementNS(SVG_NS, "svg");
  sprite.id = SPRITE_ID;
  sprite.setAttribute("aria-hidden", "true");
  sprite.setAttribute(
    "style",
    "position:absolute;width:0;height:0;overflow:hidden",
  );
  sprite.innerHTML = Object.entries(ICON_MARKUP)
    .map(
      ([name, markup]) =>
        `<symbol id="dicon-${name}" viewBox="0 0 24 24">${markup}</symbol>`,
    )
    .join("");
  doc.body.append(sprite);
}

type Box = { x: number; y: number; size: number };

/** A rounded tile (when `radius` is given) with the icon centred in it. */
function iconGroup(
  name: IconName,
  box: Box,
  glyph: number,
  radius?: number,
): SVGGElement {
  const group = svgEl("g", { class: "dicon", "aria-hidden": "true" });
  if (radius !== undefined) {
    group.append(
      svgEl("rect", {
        class: "dicon-tile",
        x: box.x,
        y: box.y,
        width: box.size,
        height: box.size,
        rx: radius,
      }),
    );
  }
  const inset = (box.size - glyph) / 2;
  group.append(
    svgEl("use", {
      class: "dicon-glyph",
      href: `#dicon-${name}`,
      x: box.x + inset,
      y: box.y + inset,
      width: glyph,
      height: glyph,
    }),
  );
  return group;
}

function mark(element: Element, name: IconName): void {
  element.setAttribute("data-icon", name);
  element.classList.add(`cat-${ICON_CATEGORY[name]}`);
}

/** Puts a tile at the left of a node's label, inside the label's group. */
function tileBesideLabel(
  label: SVGForeignObjectElement,
  name: IconName,
  tile: number,
  glyph: number,
  radius: number,
  left: number,
): SVGGElement | undefined {
  const parent = label.parentElement;
  if (!parent) return undefined;
  const x = label.x.baseVal.value + left;
  const y = label.y.baseVal.value + (label.height.baseVal.value - tile) / 2;
  const group = iconGroup(name, { x, y, size: tile }, glyph, radius);
  parent.append(group);
  return group;
}

function nodeId(node: Element, pattern: RegExp): string | undefined {
  return pattern.exec(node.id)?.[1];
}

function decorateBoxes(
  svg: SVGSVGElement,
  pattern: RegExp,
  labelSelector: string,
  icons: ReadonlyMap<string, IconName>,
  size: { tile: number; glyph: number; radius: number; left: number },
): void {
  for (const node of svg.querySelectorAll("g.node")) {
    const id = nodeId(node, pattern);
    const name = id === undefined ? undefined : icons.get(id);
    const label = node.querySelector<SVGForeignObjectElement>(labelSelector);
    if (!name || !label) continue;
    tileBesideLabel(label, name, size.tile, size.glyph, size.radius, size.left);
    mark(node, name);
  }
}

/** Icon above the participant's name; skipped when the box is too low. */
function decorateParticipantBox(group: Element, name: IconName): void {
  const rect = group.querySelector<SVGRectElement>("rect.actor");
  const text = group.querySelector<SVGTextElement>("text");
  if (!rect || !text) return;
  const height = rect.height.baseVal.value;
  if (height - text.getBBox().height < 44) return;
  const glyph = 18;
  const x = rect.x.baseVal.value + (rect.width.baseVal.value - glyph) / 2;
  group.append(
    iconGroup(name, { x, y: rect.y.baseVal.value + 8, size: glyph }, glyph),
  );
  text.setAttribute("transform", "translate(0 10)");
  mark(group, name);
}

/** Replaces Mermaid's stick figure with the icon, keeping the name below. */
function decorateStickFigure(figure: Element, name: IconName): void {
  const parts = Array.from(
    figure.querySelectorAll(":scope > line, :scope > circle"),
  );
  if (parts.length === 0) return;
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const part of parts) {
    if (!(part instanceof SVGGraphicsElement)) continue;
    const box = part.getBBox();
    left = Math.min(left, box.x);
    top = Math.min(top, box.y);
    right = Math.max(right, box.x + box.width);
    bottom = Math.max(bottom, box.y + box.height);
    part.classList.add("dicon-hidden");
  }
  const glyph = 26;
  const x = (left + right) / 2 - glyph / 2;
  const y = (top + bottom) / 2 - glyph / 2;
  figure.append(iconGroup(name, { x, y, size: glyph }, glyph));
  mark(figure, name);
}

function decorateSequence(
  svg: SVGSVGElement,
  icons: ReadonlyMap<string, IconName>,
): void {
  for (const [id, name] of icons) {
    const escaped = CSS.escape(id);
    const top = svg.querySelector(
      `[data-et="participant"][data-id="${escaped}"]`,
    );
    const bottom = svg.querySelector(`.actor-bottom[name="${escaped}"]`);
    for (const element of [top, bottom]) {
      if (!element) continue;
      if (element.classList.contains("actor-man")) {
        decorateStickFigure(element, name);
      } else {
        // The bottom box is a bare <rect>; its group holds the name too.
        const group =
          element instanceof SVGRectElement ? element.parentElement : element;
        if (group) decorateParticipantBox(group, name);
      }
    }
  }
}

/** Every ER table gets the database icon left of its name, if it fits. */
function decorateEntities(svg: SVGSVGElement): void {
  for (const node of svg.querySelectorAll("g.node")) {
    const label = node.querySelector<SVGForeignObjectElement>(
      "g.label.name foreignObject",
    );
    if (!label) continue;
    const group = tileBesideLabel(label, "db", 24, 16, 7, -28);
    if (!group) continue;
    const tile = group.getBoundingClientRect();
    const card = node.getBoundingClientRect();
    if (tile.left < card.left + 6) {
      group.remove();
      continue;
    }
    mark(node, "db");
  }
}

export function decorateDiagram(
  svg: SVGSVGElement,
  kind: DiagramKind,
  icons: ReadonlyMap<string, IconName>,
): void {
  if (kind === "flowchart") {
    decorateBoxes(
      svg,
      /-flowchart-(.+)-\d+$/,
      ":scope > g.label foreignObject",
      icons,
      { tile: 34, glyph: 20, radius: 9, left: 6 },
    );
  } else if (kind === "class") {
    decorateBoxes(
      svg,
      /-classId-(.+)-\d+$/,
      "g.label-group foreignObject",
      icons,
      { tile: 24, glyph: 16, radius: 7, left: 4 },
    );
  } else if (kind === "sequence") {
    decorateSequence(svg, icons);
  } else if (kind === "er") {
    decorateEntities(svg);
  }
}
