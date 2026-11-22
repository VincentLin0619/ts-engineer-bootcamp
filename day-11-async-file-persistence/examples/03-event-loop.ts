// Run from the project root:
//   bun run day-11-async-file-persistence/examples/03-event-loop.ts
//
// The numbers show the order in which the lines are printed.

console.log("1. 主程式開始");

// setTimeout(callback, ms) asks the runtime to queue `callback` after `ms`
// milliseconds. Even with 0 ms it is queued, not run right now.
setTimeout(() => {
  console.log("4. 計時器的工作：等主程式的同步程式跑完才輪到我");
}, 0);

async function readMenu(): Promise<void> {
  // An async function runs like a normal function until its first `await`.
  console.log("2. readMenu 開始：第一個 await 之前照常執行");
  await Bun.sleep(20);
  // Everything after the await waits in the queue until the call stack is empty.
  console.log("5. readMenu 從 await 的下一行繼續");
}

const pendingMenu = readMenu();

// A slow synchronous loop. Date.now() is the current time in milliseconds.
// While this loop is busy, nothing else in the program can run.
const start = Date.now();
while (Date.now() - start < 100) {
  // Busy on purpose: this blocks the call stack for 100 ms.
}
console.log("3. 同步迴圈忙了 100 毫秒，這段時間沒有任何其他工作被執行");

// Now the main program waits, the call stack becomes empty, and the event
// loop can finally run the queued work.
await pendingMenu;
console.log("6. 全部結束");
