// Run from the project root:
//   bun run day-11-async-file-persistence/examples/01-sync-vs-async.ts

// A synchronous function: the caller gets the value right away.
function takeNapkin(): string {
  return "紙巾";
}

// An asynchronous function: making coffee takes time. The caller gets a
// Promise first (like a pick-up number) and the coffee later.
async function makeCoffee(): Promise<string> {
  console.log("   店員：開始煮咖啡");
  // Bun.sleep(300) returns a Promise that finishes after 300 ms.
  // We use it to pretend that a job is slow.
  await Bun.sleep(300);
  console.log("   店員：咖啡煮好了");
  return "熱拿鐵";
}

console.log("1. 點一杯咖啡");

// No `await` here: `ticket` is the Promise itself, not the coffee.
const ticket = makeCoffee();
console.log("2. 拿到號碼牌：", ticket);

// The program is not stuck. It can do something else while the coffee brews.
console.log(`3. 等咖啡的時候先去拿${takeNapkin()}`);

// `await` pauses here until the Promise is done, then gives us the value.
const coffee = await ticket;
console.log(`4. 拿到${coffee}`);
console.log("5. 號碼牌現在的狀態：", ticket);
