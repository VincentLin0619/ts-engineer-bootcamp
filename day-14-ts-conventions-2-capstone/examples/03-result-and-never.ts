// Run from the project root:
//   bun run day-14-ts-conventions-2-capstone/examples/03-result-and-never.ts
import type { Priority } from "./todo/todo.ts";

// --- Part 1: Result, a value that is either a success or a failure ---

// Both shapes have the property `ok`, and its type is a literal: true or
// false. That shared property is what tells the two shapes apart.
type Result<TValue, TError> =
  { ok: true; value: TValue } | { ok: false; error: TError };

// The return type says out loud that this can fail, and with what.
function parsePositiveInteger(text: string): Result<number, string> {
  const value = Number(text);
  if (!Number.isInteger(value) || value < 1) {
    return { ok: false, error: `「${text}」不是正整數` };
  }
  return { ok: true, value };
}

for (const text of ["42", "abc", "-3"]) {
  const result = parsePositiveInteger(text);
  if (result.ok) {
    // Narrowed to { ok: true; value: number }
    console.log(`成功：${result.value}，加一是 ${result.value + 1}`);
  } else {
    // Narrowed to { ok: false; error: string }
    console.log(`失敗：${result.error}`);
  }
}

// Before `ok` is checked, TypeScript does not let you read `value`.
// Try it: delete the `@ts-expect-error` line, then run bun check on this file.
const unchecked = parsePositiveInteger("7");
// @ts-expect-error -- TS2339: Property 'value' does not exist on type 'Result<number, string>'.
console.log("沒檢查就讀取：", unchecked.value);

// --- Part 2: a discriminated union with more than two shapes ---

// Every shape has `kind`, and each one has its own extra properties.
type Command =
  | { kind: "add"; title: string; priority: Priority }
  | { kind: "done"; id: number }
  // Try it: remove the `//` on the next line, then run bun check on this file.
  // | { kind: "remove"; id: number }
  | { kind: "list" };

// `never` is the type that has no values. A parameter of type never can
// only be reached when every possible case was handled before it.
function assertNever(value: never): never {
  throw new Error(`沒有處理到的情況：${JSON.stringify(value)}`);
}

function describeCommand(command: Command): string {
  switch (command.kind) {
    case "add":
      // Here command is { kind: "add"; title: string; priority: Priority }
      return `新增「${command.title}」，優先度 ${command.priority}`;
    case "done":
      // Here command is { kind: "done"; id: number }
      return `完成 ${command.id} 號`;
    case "list":
      return "列出全部";
    default:
      // All three kinds are handled, so nothing is left: command is never.
      return assertNever(command);
  }
}

const commands: Command[] = [
  { kind: "add", title: "買牛奶", priority: "high" },
  { kind: "done", id: 1 },
  { kind: "list" },
];
for (const command of commands) {
  console.log(describeCommand(command));
}
