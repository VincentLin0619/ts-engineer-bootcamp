// Pure functions shared by the browser player and the build-time checker.
// Nothing in this file touches the DOM.

import type { InputValues, Scene, Snapshot, Step } from "./types.ts";

/** Folds author steps into full snapshots: unlisted panels carry over. */
export function toSnapshots(steps: readonly Step[]): Snapshot[] {
  const snapshots: Snapshot[] = [];
  let previous: Snapshot = { line: null, note: "", output: [] };
  for (const step of steps) {
    const { print, output, question, note, ...panels } = step;
    let lines = output ?? previous.output;
    if (print !== undefined) {
      lines = [...lines, ...(Array.isArray(print) ? print : [print])];
    }
    const snapshot: Snapshot = { ...previous, ...panels, note, output: lines };
    if (question) {
      snapshot.question = question;
    } else {
      delete snapshot.question;
    }
    snapshots.push(snapshot);
    previous = snapshot;
  }
  return snapshots;
}

export function defaultInputs(scene: Scene): InputValues {
  const values: InputValues = {};
  for (const input of scene.inputs ?? []) values[input.name] = input.value;
  return values;
}

export function resolveScene(
  scene: Scene,
  input: InputValues,
): { code: string; steps: Step[] } {
  return {
    code: typeof scene.code === "function" ? scene.code(input) : scene.code,
    steps: typeof scene.steps === "function" ? scene.steps(input) : scene.steps,
  };
}

/** Returns human-readable problems with a scene; an empty array means OK. */
export function validateScene(
  scene: Scene,
  input: InputValues = defaultInputs(scene),
): string[] {
  const problems: string[] = [];
  const { code, steps } = resolveScene(scene, input);
  const lineCount = code.replace(/\n$/, "").split("\n").length;
  if (steps.length === 0) problems.push("沒有任何步驟");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(scene.id)) {
    problems.push(`id「${scene.id}」只能用小寫英數字與連字號`);
  }

  toSnapshots(steps).forEach((snapshot, index) => {
    const at = `第 ${index + 1} 步`;
    if (snapshot.note.trim() === "") problems.push(`${at}：note 是空的`);

    const lines =
      snapshot.line === null
        ? []
        : Array.isArray(snapshot.line)
          ? snapshot.line
          : [snapshot.line];
    for (const line of lines) {
      if (!Number.isInteger(line) || line < 1 || line > lineCount) {
        problems.push(`${at}：line ${line} 超出程式碼範圍 1–${lineCount}`);
      }
    }

    const question = snapshot.question;
    if (
      question &&
      (question.answer < 0 || question.answer >= question.choices.length)
    ) {
      problems.push(`${at}：question.answer 不在 choices 的範圍內`);
    }

    if (snapshot.heap) {
      const ids = new Set(snapshot.heap.objects.map((object) => object.id));
      const slots = [
        ...snapshot.heap.roots,
        ...snapshot.heap.objects.flatMap((object) => object.slots),
      ];
      for (const slot of slots) {
        if (slot.ref !== undefined && !ids.has(slot.ref)) {
          problems.push(`${at}：${slot.name} 指向不存在的物件「${slot.ref}」`);
        }
      }
      if (ids.size !== snapshot.heap.objects.length)
        problems.push(`${at}：heap 物件 id 重複`);
    }

    if (snapshot.stack) {
      const ids = new Set(snapshot.stack.map((frame) => frame.id));
      if (ids.size !== snapshot.stack.length)
        problems.push(`${at}：stack frame id 重複`);
    }

    for (const array of snapshot.arrays ?? []) {
      for (const [label, position] of Object.entries(array.pointers ?? {})) {
        if (
          !Number.isInteger(position) ||
          position < -1 ||
          position > array.items.length
        ) {
          problems.push(
            `${at}：陣列 ${array.name} 的指標 ${label} 位置 ${position} 不合理`,
          );
        }
      }
    }

    if (snapshot.lanes) {
      const count = snapshot.lanes.lanes.length;
      const token = snapshot.lanes.token;
      if (token && (token.at < 0 || token.at >= count)) {
        problems.push(`${at}：lanes.token.at 超出範圍`);
      }
      const active = snapshot.lanes.active;
      if (active !== undefined && (active < 0 || active >= count)) {
        problems.push(`${at}：lanes.active 超出範圍`);
      }
    }

    if (snapshot.table) {
      const width = snapshot.table.columns.length;
      for (const row of snapshot.table.rows) {
        if (row.cells.length !== width) {
          problems.push(`${at}：資料表列 ${row.key} 的欄位數不是 ${width}`);
        }
      }
    }
  });
  return problems;
}
