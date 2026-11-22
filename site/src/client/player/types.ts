// Data model for animated code walkthroughs ("scenes").
//
// A scene is plain data: source code plus a list of steps. Each step
// describes what the learner should see at that moment. Panels that a step
// does not mention keep their value from the previous step, so most steps
// only list what changed. See docs/animation-authoring-guide.md.

import type { Language } from "../../highlight.ts";

/** Visual emphasis for one item in a panel. */
export type Mark =
  "active" | "compare" | "done" | "dim" | "found" | "error" | "new";

/** One named value: a variable, a parameter, or an object field. */
export type Slot = {
  name: string;
  /** Display text for the value, for example `"買牛奶"` or `3`. */
  value?: string;
  /** Points at a heap object by id instead of showing a value. */
  ref?: string;
  /** Optional type shown next to the value, for example `number`. */
  type?: string;
  mark?: Mark;
};

/** One call-stack frame. The last frame in the array is the top. */
export type Frame = {
  /** Stable id so the same frame animates instead of being recreated. */
  id: string;
  name: string;
  slots?: Slot[];
  /** Short status line, for example `等待 addTax 回傳`. */
  status?: string;
  mark?: Mark;
};

export type ArrayPanel = {
  name: string;
  items: string[];
  /** Emphasis per index. */
  marks?: Record<number, Mark>;
  /** Labelled pointers under the cells, for example `{ i: 2 }`. */
  pointers?: Record<string, number>;
};

export type MapPanel = {
  name: string;
  entries: Array<[key: string, value: string]>;
  /** Key to emphasise. */
  focus?: string;
  focusMark?: Mark;
};

export type TableRow = { key: string; cells: string[]; mark?: Mark };

export type TablePanel = {
  name: string;
  columns: string[];
  rows: TableRow[];
};

export type HeapObject = {
  id: string;
  /** Heading of the object card, for example `Todo` or `Array`. */
  label: string;
  slots: Slot[];
  mark?: Mark;
};

/** Variables on the left, objects on the right, arrows for every `ref`. */
export type HeapPanel = {
  roots: Slot[];
  objects: HeapObject[];
};

export type Token = {
  /** Index of the lane the token is in. */
  at: number;
  label: string;
  kind?: "request" | "response" | "error";
};

/** Columns such as CLI → Service → Repository with a moving message. */
export type LanesPanel = {
  lanes: string[];
  /** Lane to emphasise. */
  active?: number;
  token?: Token;
};

/** Named lists, for example the event loop's queues. */
export type QueuesPanel = {
  lists: Array<{ name: string; items: string[] }>;
};

export type Question = {
  prompt: string;
  choices: string[];
  /** Index of the correct choice. */
  answer: number;
  /** Shown after the learner answers. */
  explain: string;
};

/** The full picture at one moment. */
export type Snapshot = {
  /** 1-based line(s) to highlight in the code panel. `null` clears it. */
  line: number | number[] | null;
  note: string;
  vars?: Slot[];
  stack?: Frame[];
  heap?: HeapPanel;
  arrays?: ArrayPanel[];
  map?: MapPanel;
  table?: TablePanel;
  lanes?: LanesPanel;
  queues?: QueuesPanel;
  output: string[];
  question?: Question;
};

/** What an author writes for each step. Unlisted panels carry over. */
export type Step = Partial<Omit<Snapshot, "note" | "output">> & {
  note: string;
  /** Appends lines to the output panel. */
  print?: string | string[];
  /** Replaces the whole output panel. */
  output?: string[];
};

export type SceneInput = {
  name: string;
  label: string;
  /** Initial value of the text field. */
  value: string;
  hint?: string;
};

/** Input values keyed by `SceneInput.name`. */
export type InputValues = Record<string, string>;

/** Thrown by a scene's `build` function when an input is not usable. */
export class SceneInputError extends Error {}

export type Scene = {
  id: string;
  title: string;
  /** One sentence under the title: what this animation shows. */
  summary: string;
  code: string | ((input: InputValues) => string);
  language?: Language;
  /** Static steps, or a function that builds steps from the inputs. */
  steps: Step[] | ((input: InputValues) => Step[]);
  /** Text fields the learner can edit before replaying. */
  inputs?: SceneInput[];
};
