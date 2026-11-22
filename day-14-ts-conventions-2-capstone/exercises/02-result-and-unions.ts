// Exercise 02: Result, discriminated unions and the `never` check.
//
// Replace each `throw new Error("TODO...")` line, then run: bun test day-14

// A value that is either a success carrying a value, or a failure carrying
// an error. The `ok` property tells the two shapes apart.
export type Result<TValue, TError> =
  { ok: true; value: TValue } | { ok: false; error: TError };

// Turn text into a whole number from 0 to 100.
// Anything else is a failure whose error is the message
//   「<text>」不是 0 到 100 的整數
// parsePercent("42")  -> { ok: true, value: 42 }
// parsePercent("0")   -> { ok: true, value: 0 }
// parsePercent("101") -> { ok: false, error: "「101」不是 0 到 100 的整數" }
// parsePercent("4.5") -> { ok: false, error: "「4.5」不是 0 到 100 的整數" }
// parsePercent("abc") -> { ok: false, error: "「abc」不是 0 到 100 的整數" }
export function parsePercent(text: string): Result<number, string> {
  // TODO: return a success or a failure
  throw new Error("TODO：尚未完成 parsePercent");
}

// Describe a result in one line. Check `ok` first: only then does
// TypeScript let you read `value` or `error`.
// describeResult({ ok: true, value: 42 })        -> "成功：42"
// describeResult({ ok: false, error: "沒有資料" }) -> "失敗：沒有資料"
export function describeResult(result: Result<number, string>): string {
  // TODO: return the line for a success or for a failure
  throw new Error("TODO：尚未完成 describeResult");
}

// Return the value of a success, or `fallback` for a failure.
// This one is generic: it works for a Result of anything.
// valueOr({ ok: true, value: 42 }, 0)           -> 42
// valueOr({ ok: false, error: "沒有資料" }, 0)    -> 0
// valueOr({ ok: false, error: 404 }, "（無）")   -> "（無）"
export function valueOr<TValue, TError>(
  result: Result<TValue, TError>,
  fallback: TValue,
): TValue {
  // TODO: return the value or the fallback
  throw new Error("TODO：尚未完成 valueOr");
}

// Something that happened to a todo. Every shape has `kind`, and each kind
// has its own extra properties.
export type TodoEvent =
  | { kind: "added"; title: string }
  | { kind: "completed"; id: number }
  | { kind: "renamed"; id: number; title: string }
  | { kind: "removed"; id: number };

// This function is finished. Call it in the `default` branch of your switch.
export function assertNever(value: never): never {
  throw new Error(`沒有處理到的情況：${JSON.stringify(value)}`);
}

// Describe an event in one line. Use `switch (event.kind)` with one case per
// kind, and `default: return assertNever(event);` at the end.
// describeEvent({ kind: "added", title: "買牛奶" })          -> "新增了「買牛奶」"
// describeEvent({ kind: "completed", id: 3 })               -> "完成了 3 號"
// describeEvent({ kind: "renamed", id: 3, title: "買豆漿" }) -> "3 號改名為「買豆漿」"
// describeEvent({ kind: "removed", id: 3 })                 -> "刪除了 3 號"
export function describeEvent(event: TodoEvent): string {
  // TODO: return the line for each kind of event
  throw new Error("TODO：尚未完成 describeEvent");
}
