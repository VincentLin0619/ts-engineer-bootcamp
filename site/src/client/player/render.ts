// DOM rendering for the player's panels. Elements are kept and updated in
// place (keyed by name or id) so CSS transitions can show what changed.

import type {
  ArrayPanel,
  Frame,
  HeapObject,
  HeapPanel,
  LanesPanel,
  MapPanel,
  Mark,
  QueuesPanel,
  Slot,
  Snapshot,
  TablePanel,
} from "./types.ts";

export const reducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Turns `code` and **bold** in a note into HTML. Everything else is escaped. */
export function formatNote(text: string): string {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function flash(node: HTMLElement): void {
  if (reducedMotion()) return;
  node.animate(
    [{ backgroundColor: "var(--flash)" }, { backgroundColor: "transparent" }],
    { duration: 900, easing: "ease-out" },
  );
}

function setMark(node: HTMLElement, mark: Mark | undefined): void {
  if (mark) {
    node.dataset.mark = mark;
  } else {
    delete node.dataset.mark;
  }
}

/**
 * Makes `container`'s children match `items`, reusing elements with the same
 * key. New elements fade in; removed elements fade out.
 */
function sync<T>(
  container: HTMLElement,
  items: readonly T[],
  keyOf: (item: T, index: number) => string,
  create: (item: T) => HTMLElement,
  update: (node: HTMLElement, item: T, isNew: boolean) => void,
): void {
  const existing = new Map<string, HTMLElement>();
  for (const child of Array.from(container.children)) {
    if (
      child instanceof HTMLElement &&
      child.dataset.key !== undefined &&
      child.dataset.leaving === undefined
    ) {
      existing.set(child.dataset.key, child);
    }
  }

  const wanted: HTMLElement[] = [];
  items.forEach((item, index) => {
    const key = keyOf(item, index);
    const found = existing.get(key);
    if (found) {
      existing.delete(key);
      update(found, item, false);
      wanted.push(found);
      return;
    }
    const created = create(item);
    created.dataset.key = key;
    update(created, item, true);
    if (!reducedMotion()) {
      created.animate(
        [
          { opacity: 0, transform: "translateY(-6px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 320, easing: "ease-out" },
      );
    }
    wanted.push(created);
  });

  for (const leaving of existing.values()) {
    if (reducedMotion()) {
      leaving.remove();
      continue;
    }
    leaving.dataset.leaving = "";
    leaving
      .animate([{ opacity: 1 }, { opacity: 0, transform: "scale(0.96)" }], {
        duration: 240,
        easing: "ease-in",
      })
      .finished.then(() => leaving.remove())
      .catch(() => leaving.remove());
  }

  const current = Array.from(container.children).filter(
    (child) =>
      child instanceof HTMLElement && child.dataset.leaving === undefined,
  );
  const inOrder =
    current.length === wanted.length &&
    current.every((child, index) => child === wanted[index]);
  if (!inOrder) {
    for (const node of wanted) container.append(node);
  }
}

// ---------------------------------------------------------------------------
// Slots: name = value rows used by variables, frames and heap objects.

function createSlot(): HTMLElement {
  const row = el("div", "slot");
  row.append(
    el("span", "slot-name"),
    el("span", "slot-type"),
    el("span", "slot-value"),
  );
  return row;
}

function updateSlot(row: HTMLElement, slot: Slot, isNew: boolean): void {
  const [name, type, value] = Array.from(row.children) as HTMLElement[];
  if (!name || !type || !value) return;
  name.textContent = slot.name;
  type.textContent = slot.type ? `: ${slot.type}` : "";
  type.hidden = !slot.type;
  const display = slot.ref ? "●" : (slot.value ?? "");
  if (slot.ref) {
    row.dataset.ref = slot.ref;
    value.classList.add("slot-ref");
    value.title = "指向右邊的物件";
  } else {
    delete row.dataset.ref;
    value.classList.remove("slot-ref");
    value.removeAttribute("title");
  }
  const signature = `${slot.ref ?? ""}|${display}|${slot.type ?? ""}`;
  if (!isNew && row.dataset.signature !== signature) flash(value);
  row.dataset.signature = signature;
  value.textContent = display;
  setMark(row, slot.mark);
}

function syncSlots(container: HTMLElement, slots: readonly Slot[]): void {
  sync(container, slots, (slot) => slot.name, createSlot, updateSlot);
}

// ---------------------------------------------------------------------------
// Panels

export type PanelKind =
  | "vars"
  | "stack"
  | "heap"
  | "arrays"
  | "map"
  | "table"
  | "lanes"
  | "queues"
  | "output";

const PANEL_ORDER: PanelKind[] = [
  "lanes",
  "stack",
  "vars",
  "heap",
  "arrays",
  "map",
  "table",
  "queues",
  "output",
];

const PANEL_TITLES: Record<PanelKind, string> = {
  vars: "變數",
  stack: "Call stack（最上面的正在執行）",
  heap: "記憶體",
  arrays: "陣列",
  map: "Map",
  table: "資料表",
  lanes: "流程",
  queues: "佇列",
  output: "輸出",
};

/** Which panels a list of snapshots uses, in display order. */
export function panelsUsed(snapshots: readonly Snapshot[]): PanelKind[] {
  return PANEL_ORDER.filter((kind) =>
    snapshots.some((snapshot) => {
      if (kind === "output") return snapshot.output.length > 0;
      return snapshot[kind] !== undefined;
    }),
  );
}

export type PanelElements = Map<PanelKind, HTMLElement>;

export function createPanels(
  container: HTMLElement,
  kinds: PanelKind[],
): PanelElements {
  container.replaceChildren();
  const panels: PanelElements = new Map();
  for (const kind of kinds) {
    const section = el("section", `panel panel-${kind}`);
    const title = el("p", "panel-title", PANEL_TITLES[kind]);
    const content = el("div", "panel-content");
    section.append(title, content);
    container.append(section);
    panels.set(kind, content);
  }
  return panels;
}

function renderVars(
  content: HTMLElement,
  vars: readonly Slot[] | undefined,
): void {
  if (!vars || vars.length === 0) {
    content.replaceChildren(el("p", "panel-empty", "（還沒有變數）"));
    return;
  }
  content.querySelector(".panel-empty")?.remove();
  syncSlots(content, vars);
}

function renderStack(
  content: HTMLElement,
  frames: readonly Frame[] | undefined,
): void {
  const list =
    content.querySelector<HTMLElement>(".stack") ??
    content.appendChild(el("div", "stack"));
  sync(
    list,
    frames ?? [],
    (frame) => frame.id,
    () => {
      const card = el("div", "frame");
      card.append(
        el("p", "frame-name"),
        el("div", "frame-slots"),
        el("p", "frame-status"),
      );
      return card;
    },
    (card, frame) => {
      const [name, slots, status] = Array.from(card.children) as HTMLElement[];
      if (!name || !slots || !status) return;
      name.textContent = frame.name;
      syncSlots(slots, frame.slots ?? []);
      status.textContent = frame.status ?? "";
      status.hidden = !frame.status;
      setMark(card, frame.mark);
    },
  );
  list.querySelectorAll<HTMLElement>(".frame").forEach((card, index, all) => {
    card.classList.toggle("frame-top", index === all.length - 1);
  });
}

/** Groups heap objects by their shortest reference distance from a root. */
function heapColumns(heap: HeapPanel | undefined): HeapObject[][] {
  if (!heap) return [];
  const byId = new Map(heap.objects.map((object) => [object.id, object]));
  const depth = new Map<string, number>();
  const queue: Array<[string, number]> = heap.roots.flatMap((slot) =>
    slot.ref ? [[slot.ref, 0] as [string, number]] : [],
  );
  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;
    const [id, level] = next;
    if (depth.has(id)) continue;
    depth.set(id, level);
    for (const slot of byId.get(id)?.slots ?? []) {
      if (slot.ref && !depth.has(slot.ref)) queue.push([slot.ref, level + 1]);
    }
  }
  const columns: HeapObject[][] = [];
  for (const object of heap.objects) {
    const level = depth.get(object.id) ?? 0;
    while (columns.length <= level) columns.push([]);
    columns[level]?.push(object);
  }
  return columns.filter((column) => column.length > 0);
}

function renderHeap(content: HTMLElement, heap: HeapPanel | undefined): void {
  let grid = content.querySelector<HTMLElement>(".heap");
  if (!grid) {
    grid = el("div", "heap");
    const roots = el("div", "heap-roots");
    const objects = el("div", "heap-objects");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("heap-arrows");
    svg.setAttribute("aria-hidden", "true");
    grid.append(roots, objects, svg);
    content.append(grid);
    new ResizeObserver(() => drawArrows(grid as HTMLElement)).observe(grid);
  }
  const roots = grid.querySelector<HTMLElement>(".heap-roots");
  const objects = grid.querySelector<HTMLElement>(".heap-objects");
  if (!roots || !objects) return;
  syncSlots(roots, heap?.roots ?? []);

  // Objects are placed in columns by how many references away from a
  // variable they are, so every arrow points to the right.
  const columns = heapColumns(heap);
  grid.style.setProperty("--heap-cols", String(Math.max(1, columns.length)));
  sync(
    objects,
    columns.map((column, index) => ({ column, index })),
    (entry) => String(entry.index),
    () => el("div", "heap-col"),
    (col, entry) => {
      sync(
        col,
        entry.column,
        (object) => object.id,
        () => {
          const card = el("div", "heap-object");
          card.append(el("p", "heap-label"), el("div", "heap-slots"));
          return card;
        },
        (card, object) => {
          card.dataset.obj = object.id;
          const [label, slots] = Array.from(card.children) as HTMLElement[];
          if (!label || !slots) return;
          label.textContent = object.label;
          syncSlots(slots, object.slots);
          setMark(card, object.mark);
        },
      );
    },
  );
  const target = grid;
  requestAnimationFrame(() => drawArrows(target));
  // Cards that are still fading in or out move the layout: redraw after.
  window.setTimeout(() => drawArrows(target), 340);
}

function drawArrows(grid: HTMLElement): void {
  const svg = grid.querySelector("svg");
  if (!svg) return;
  const box = grid.getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  svg.setAttribute("width", String(box.width));
  svg.setAttribute("height", String(box.height));
  const paths: string[] = [
    '<defs><marker id="heap-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>',
  ];
  for (const source of grid.querySelectorAll<HTMLElement>("[data-ref]")) {
    if (source.closest("[data-leaving]")) continue;
    const target = grid.querySelector<HTMLElement>(
      `.heap-object[data-obj="${CSS.escape(source.dataset.ref ?? "")}"]:not([data-leaving])`,
    );
    const dot = source.querySelector(".slot-value");
    if (!target || !dot) continue;
    const from = dot.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const x1 = from.right - box.left - 2;
    const y1 = from.top + from.height / 2 - box.top;
    const sameColumn = from.left > to.left - 8;
    let d: string;
    if (sameColumn) {
      const x2 = to.right - box.left;
      const y2 = to.top + 18 - box.top;
      const bend = Math.max(x1, x2) + 36;
      d = `M${x1},${y1} C${bend},${y1} ${bend},${y2} ${x2 + 2},${y2}`;
    } else {
      const x2 = to.left - box.left - 2;
      const y2 = to.top + 18 - box.top;
      const mid = (x1 + x2) / 2;
      d = `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`;
    }
    paths.push(`<path d="${d}" marker-end="url(#heap-head)"/>`);
  }
  svg.innerHTML = paths.join("");
}

/** Approximate width in em: CJK characters are about twice as wide as Latin. */
function visualWidth(text: string): number {
  let width = 0;
  for (const char of text) width += /[⺀-￿]/.test(char) ? 1 : 0.6;
  return width;
}

function renderArrays(
  content: HTMLElement,
  arrays: readonly ArrayPanel[] | undefined,
): void {
  sync(
    content,
    arrays ?? [],
    (array) => array.name,
    () => {
      const block = el("div", "array");
      const name = el("p", "array-name");
      const track = el("div", "array-track");
      track.append(el("div", "array-cells"), el("div", "array-pointers"));
      block.append(name, track);
      return block;
    },
    (block, array) => {
      const name = block.querySelector<HTMLElement>(".array-name");
      const cells = block.querySelector<HTMLElement>(".array-cells");
      const pointers = block.querySelector<HTMLElement>(".array-pointers");
      if (!name || !cells || !pointers) return;
      name.textContent =
        array.items.length === 0 ? `${array.name}（空陣列）` : array.name;
      // Every cell in one array gets the same width, so pointers line up.
      const widest = Math.max(1, ...array.items.map(visualWidth));
      const track = block.querySelector<HTMLElement>(".array-track");
      track?.style.setProperty(
        "--cell",
        `${Math.max(2.6, widest * 0.82 + 1.1).toFixed(2)}rem`,
      );
      sync(
        cells,
        array.items.map((value, index) => ({ value, index })),
        (cell) => String(cell.index),
        () => {
          const cell = el("div", "cell");
          cell.append(el("span", "cell-value"), el("span", "cell-index"));
          return cell;
        },
        (cell, item, isNew) => {
          const [value, index] = Array.from(cell.children) as HTMLElement[];
          if (!value || !index) return;
          if (!isNew && value.textContent !== item.value) flash(value);
          value.textContent = item.value;
          index.textContent = String(item.index);
          setMark(cell, array.marks?.[item.index]);
        },
      );
      const stacked = new Map<number, number>();
      const entries = Object.entries(array.pointers ?? {});
      sync(
        pointers,
        entries,
        ([label]) => label,
        () => el("span", "pointer"),
        (pointer, [label, index]) => {
          const level = stacked.get(index) ?? 0;
          stacked.set(index, level + 1);
          pointer.textContent = `↑ ${label}`;
          pointer.style.setProperty("--i", String(index));
          pointer.style.setProperty("--level", String(level));
        },
      );
      const levels = Math.max(1, ...stacked.values());
      pointers.style.setProperty(
        "--levels",
        String(entries.length === 0 ? 0 : levels),
      );
    },
  );
}

function renderMap(content: HTMLElement, map: MapPanel | undefined): void {
  if (!map) return;
  let table = content.querySelector<HTMLElement>(".kv");
  if (!table) {
    table = el("div", "kv");
    content.append(el("p", "kv-name"), table);
  }
  const name = content.querySelector<HTMLElement>(".kv-name");
  if (name)
    name.textContent =
      map.entries.length === 0 ? `${map.name}（空的）` : map.name;
  const isSet = map.kind === "set";
  table.dataset.kind = isSet ? "set" : "map";
  const title =
    content.parentElement?.querySelector<HTMLElement>(".panel-title");
  if (title) title.textContent = isSet ? "Set" : "Map";
  sync(
    table,
    map.entries,
    ([key]) => key,
    () => {
      const row = el("div", "kv-row");
      row.append(el("span", "kv-key"), el("span", "kv-value"));
      return row;
    },
    (row, [key, value], isNew) => {
      const [keyCell, valueCell] = Array.from(row.children) as HTMLElement[];
      if (!keyCell || !valueCell) return;
      keyCell.textContent = key;
      if (!isNew && valueCell.textContent !== value) flash(valueCell);
      valueCell.textContent = value;
      setMark(row, map.focus === key ? (map.focusMark ?? "active") : undefined);
    },
  );
}

function renderTable(
  content: HTMLElement,
  table: TablePanel | undefined,
): void {
  if (!table) return;
  let grid = content.querySelector<HTMLElement>(".dbtable");
  if (!grid) {
    grid = el("div", "dbtable");
    content.append(el("p", "dbtable-name"), grid);
  }
  const name = content.querySelector<HTMLElement>(".dbtable-name");
  if (name) name.textContent = table.name;
  grid.style.setProperty("--cols", String(table.columns.length));
  let head = grid.querySelector<HTMLElement>(".dbtable-head");
  if (!head) {
    head = el("div", "dbtable-head");
    grid.append(head, el("div", "dbtable-body"));
  }
  head.replaceChildren(
    ...table.columns.map((column) => el("span", "dbtable-th", column)),
  );
  const body = grid.querySelector<HTMLElement>(".dbtable-body");
  if (!body) return;
  if (table.rows.length === 0) {
    body.replaceChildren(el("p", "panel-empty", "（沒有資料列）"));
    return;
  }
  body.querySelector(".panel-empty")?.remove();
  sync(
    body,
    table.rows,
    (row) => row.key,
    () => el("div", "dbtable-row"),
    (row, data, isNew) => {
      const before = Array.from(row.children).map((cell) => cell.textContent);
      row.replaceChildren(
        ...data.cells.map((cell) => el("span", "dbtable-td", cell)),
      );
      if (!isNew) {
        data.cells.forEach((cell, index) => {
          const node = row.children[index];
          if (before[index] !== cell && node instanceof HTMLElement)
            flash(node);
        });
      }
      setMark(row, data.mark);
    },
  );
}

function renderLanes(
  content: HTMLElement,
  lanes: LanesPanel | undefined,
): void {
  if (!lanes) return;
  let track = content.querySelector<HTMLElement>(".lanes");
  if (!track) {
    track = el("div", "lanes");
    track.append(el("div", "lanes-row"), el("div", "lanes-token"));
    content.append(track);
  }
  track.style.setProperty("--n", String(lanes.lanes.length));
  const row = track.querySelector<HTMLElement>(".lanes-row");
  const token = track.querySelector<HTMLElement>(".lanes-token");
  if (!row || !token) return;
  sync(
    row,
    lanes.lanes,
    (lane) => lane,
    (lane) => el("div", "lane", lane),
    (node, lane) => {
      node.dataset.active = String(lanes.lanes.indexOf(lane) === lanes.active);
    },
  );
  if (lanes.token) {
    token.hidden = false;
    token.textContent = lanes.token.label;
    token.dataset.kind = lanes.token.kind ?? "request";
    token.style.setProperty("--at", String(lanes.token.at));
  } else {
    token.hidden = true;
  }
}

function renderQueues(
  content: HTMLElement,
  queues: QueuesPanel | undefined,
): void {
  sync(
    content,
    queues?.lists ?? [],
    (list) => list.name,
    () => {
      const block = el("div", "queue");
      block.append(el("p", "queue-name"), el("div", "queue-items"));
      return block;
    },
    (block, list) => {
      const [name, items] = Array.from(block.children) as HTMLElement[];
      if (!name || !items) return;
      name.textContent = list.name;
      items.dataset.empty = String(list.items.length === 0);
      sync(
        items,
        list.items,
        (item, index) => `${index}:${item}`,
        () => el("span", "chip"),
        (chip, item) => {
          chip.textContent = item;
        },
      );
    },
  );
}

function renderOutput(content: HTMLElement, output: readonly string[]): void {
  let console = content.querySelector<HTMLElement>(".console");
  if (!console) {
    console = el("div", "console");
    content.append(console);
  }
  sync(
    console,
    output,
    (_line, index) => String(index),
    () => el("div", "console-line"),
    (line, text) => {
      line.textContent = text;
    },
  );
  console.scrollTop = console.scrollHeight;
}

export function renderPanels(panels: PanelElements, snapshot: Snapshot): void {
  for (const [kind, content] of panels) {
    if (kind === "vars") renderVars(content, snapshot.vars);
    if (kind === "stack") renderStack(content, snapshot.stack);
    if (kind === "heap") renderHeap(content, snapshot.heap);
    if (kind === "arrays") renderArrays(content, snapshot.arrays);
    if (kind === "map") renderMap(content, snapshot.map);
    if (kind === "table") renderTable(content, snapshot.table);
    if (kind === "lanes") renderLanes(content, snapshot.lanes);
    if (kind === "queues") renderQueues(content, snapshot.queues);
    if (kind === "output") renderOutput(content, snapshot.output);
  }
}
