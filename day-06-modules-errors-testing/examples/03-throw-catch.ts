// Run from the project root:
//   bun run day-06-modules-errors-testing/examples/03-throw-catch.ts

// --- throw: "I cannot finish this job" ---------------------------------------

// Turns text typed by a user into a quantity between 1 and 99.
// When the text is not acceptable there is no sensible number to return,
// so the function throws an Error that says what is wrong.
function parseQuantity(text: string): number {
  const quantity = Number(text);
  // Number.isInteger is false for 1.5 and for NaN (the result of Number("abc")).
  if (!Number.isInteger(quantity)) {
    // `throw` stops this function immediately. Nothing below it runs.
    throw new Error(`數量必須是整數：${text}`);
  }
  if (quantity < 1 || quantity > 99) {
    throw new Error(`數量必須介於 1 到 99：${quantity}`);
  }
  return quantity;
}

// This function has no try/catch. An error thrown inside parseQuantity
// passes straight through it to whoever called orderLine.
function orderLine(productName: string, quantityText: string): string {
  const quantity = parseQuantity(quantityText);
  console.log("  （orderLine：數量沒問題，繼續往下）");
  return `${productName} x ${quantity}`;
}

// --- catch receives `unknown` -------------------------------------------------

// JavaScript can throw any value, not only Error objects, so the value in
// `catch` has the type `unknown`. Check it before reading `.message`.
function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// --- try / catch / finally -----------------------------------------------------

function printOrder(productName: string, quantityText: string): void {
  console.log(`處理訂單：${productName}、「${quantityText}」`);
  try {
    // Code that might throw goes inside `try`.
    const line = orderLine(productName, quantityText);
    console.log(`  成功：${line}`);
  } catch (error) {
    // Runs only when something inside `try` threw.
    console.log(`  失敗：${errorMessage(error)}`);
  } finally {
    // Always runs, whether `try` succeeded or not.
    console.log("  處理結束");
  }
}

printOrder("牛奶", "2");
printOrder("牛奶", "很多");
printOrder("牛奶", "500");

// The program is still running: every error above was caught.
console.log("三筆訂單都處理完了");

// --- A value that is not an Error ------------------------------------------------

console.log(errorMessage(new Error("這是 Error 物件")));
console.log(errorMessage("這只是一段文字"));

// Try it: remove the `//` on the next line and run this file again.
// Nothing catches the error, so the program stops and prints the error
// together with the line it was thrown from.
// parseQuantity("abc");
