// Run from the project root:
//   bun run day-10-oop-composition-layers/examples/03-custom-errors.ts
//
// Custom error classes: errors that code can tell apart with instanceof,
// and that can carry extra data.

import { TodoNotFoundError, ValidationError } from "./todo/errors.ts";

// 1. A custom error is still an Error: it has a message and can be thrown.
const validation = new ValidationError("標題不可以是空的");
console.log(validation.name, "|", validation.message);

// instanceof follows the family line: ValidationError extends Error.
console.log(validation instanceof ValidationError); // true
console.log(validation instanceof Error); // true
console.log(validation instanceof TodoNotFoundError); // false

// 2. A custom error can carry data. This one builds its own message from
//    the id and keeps the id as a number.
const notFound = new TodoNotFoundError(7);
console.log(notFound.name, "|", notFound.message, "|", notFound.id);

// 3. One catch block, different reactions. Check the specific classes
//    first and plain Error last: every custom error is also an Error.
function describeError(error: unknown): string {
  if (error instanceof ValidationError) {
    return `請修正輸入：${error.message}`;
  }
  if (error instanceof TodoNotFoundError) {
    return `請確認編號：#${error.id} 不存在`;
  }
  if (error instanceof Error) {
    return `程式出錯了：${error.message}`;
  }
  return "丟出來的不是 Error";
}

function riskyStep(step: number): void {
  if (step === 1) {
    throw new ValidationError("標題不可以超過 100 個字");
  }
  if (step === 2) {
    throw new TodoNotFoundError(42);
  }
  if (step === 3) {
    throw new Error("意料之外的狀況");
  }
  console.log(`步驟 ${step} 順利完成`);
}

for (const step of [1, 2, 3, 4]) {
  try {
    riskyStep(step);
  } catch (error) {
    console.log(describeError(error));
  }
}

// 4. Before today, with plain Error only, telling errors apart meant
//    comparing message text. Rewording a message would break this check.
try {
  throw new Error("找不到 id 為 42 的待辦事項");
} catch (error) {
  if (
    error instanceof Error &&
    error.message === "找不到 id 為 42 的待辦事項"
  ) {
    console.log("靠比對文字判斷錯誤種類：訊息改一個字就失效");
  }
}
