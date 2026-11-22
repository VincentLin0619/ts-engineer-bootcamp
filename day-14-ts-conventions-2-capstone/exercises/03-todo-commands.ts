// Exercise 03 (optional): rebuild the heart of the Todo CLI with today's
// tools. The CLI in examples/todo/cli.ts reads a line and runs it in one
// step. Here the work is split in two:
//
//   parseCommand: text -> Result<Command, string>   (no service involved)
//   runCommand:   Command -> text for the user      (uses the real TodoService)
//
// After parseCommand succeeds, the rest of the program never sees a
// half-checked line again: a Command is always complete and correct.
import type { TodoFilter, TodoService } from "../examples/todo/todo-service.ts";

export type Result<TValue, TError> =
  { ok: true; value: TValue } | { ok: false; error: TError };

// One shape per command. `kind` tells them apart.
export type Command =
  | { kind: "add"; title: string }
  | { kind: "list"; filter: TodoFilter }
  | { kind: "done"; id: number }
  | { kind: "rename"; id: number; title: string }
  | { kind: "remove"; id: number };

// This function is finished. Call it in the `default` branch of your switch.
export function assertNever(value: never): never {
  throw new Error(`沒有處理到的情況：${JSON.stringify(value)}`);
}

// Turn one line of text into a Command. Spaces around the line and between
// the parts do not matter. The first word decides the command:
//
//   add <title>         -> { kind: "add", title }
//                          no title: error "add 需要標題"
//   list                -> { kind: "list", filter: "all" }
//   list open|done|all  -> { kind: "list", filter }
//                          any other word: error "看不懂的篩選條件：<word>"
//   done <id>           -> { kind: "done", id }
//   rename <id> <title> -> { kind: "rename", id, title }
//                          no title: error "rename 需要新的標題"
//   rm <id>             -> { kind: "remove", id }
//   anything else       -> error "看不懂的指令：<first word>"
//
// An <id> must be a whole number of 1 or more. Otherwise: error "id 必須是正整數".
//
// parseCommand("add 買牛奶")       -> { ok: true, value: { kind: "add", title: "買牛奶" } }
// parseCommand("  list  open ")   -> { ok: true, value: { kind: "list", filter: "open" } }
// parseCommand("rename 2 買豆漿")  -> { ok: true, value: { kind: "rename", id: 2, title: "買豆漿" } }
// parseCommand("done abc")        -> { ok: false, error: "id 必須是正整數" }
// parseCommand("dance")           -> { ok: false, error: "看不懂的指令：dance" }
export function parseCommand(line: string): Result<Command, string> {
  // TODO: split the line, then return a success or a failure
  throw new Error("TODO：尚未完成 parseCommand");
}

// Run a command with the service and resolve to the text shown to the user.
// Use `switch (command.kind)` and finish with the assertNever check.
// Errors thrown by the service are not caught here.
//
//   add     -> "已新增 1 號：買牛奶"
//   list    -> one line per todo, joined with "\n":
//                "[ ] #1 買牛奶（優先度：中）"   (not done)
//                "[x] #2 寫作業（優先度：中）"   (done)
//             This is the one-line format used since Day 03
//             (low/medium/high -> 低/中/高).
//              no todos at all: "（沒有待辦事項）"
//   done    -> "已完成 1 號"
//   rename  -> "1 號改名為：買豆漿"
//   remove  -> "已刪除 1 號"
export async function runCommand(
  service: TodoService,
  command: Command,
): Promise<string> {
  // TODO: call the right service method for each kind of command
  throw new Error("TODO：尚未完成 runCommand");
}
