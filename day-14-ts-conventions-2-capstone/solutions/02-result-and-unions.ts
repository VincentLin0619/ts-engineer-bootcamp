// Reference solution for exercise 02.

export type Result<TValue, TError> =
  { ok: true; value: TValue } | { ok: false; error: TError };

export function parsePercent(text: string): Result<number, string> {
  const value = Number(text);
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    return { ok: false, error: `「${text}」不是 0 到 100 的整數` };
  }
  return { ok: true, value };
}

export function describeResult(result: Result<number, string>): string {
  if (result.ok) {
    // Narrowed to the success shape: `value` exists here.
    return `成功：${result.value}`;
  }
  // Narrowed to the failure shape: `error` exists here.
  return `失敗：${result.error}`;
}

export function valueOr<TValue, TError>(
  result: Result<TValue, TError>,
  fallback: TValue,
): TValue {
  return result.ok ? result.value : fallback;
}

export type TodoEvent =
  | { kind: "added"; title: string }
  | { kind: "completed"; id: number }
  | { kind: "renamed"; id: number; title: string }
  | { kind: "removed"; id: number };

export function assertNever(value: never): never {
  throw new Error(`沒有處理到的情況：${JSON.stringify(value)}`);
}

export function describeEvent(event: TodoEvent): string {
  switch (event.kind) {
    case "added":
      return `新增了「${event.title}」`;
    case "completed":
      return `完成了 ${event.id} 號`;
    case "renamed":
      return `${event.id} 號改名為「${event.title}」`;
    case "removed":
      return `刪除了 ${event.id} 號`;
    default:
      // Every kind is handled, so `event` is never here.
      return assertNever(event);
  }
}
