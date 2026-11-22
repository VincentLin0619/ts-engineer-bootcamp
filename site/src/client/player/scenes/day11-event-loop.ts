import type { Frame, QueuesPanel, Scene } from "../types.ts";

const main = (options: { menu?: string; status?: string } = {}): Frame => ({
  id: "main",
  name: "主程式",
  slots: options.menu ? [{ name: "pendingMenu", value: options.menu }] : [],
  ...(options.status ? { status: options.status } : {}),
});

const readMenu: Frame = { id: "readMenu", name: "readMenu" };

const queues = (runtime: string[], ready: string[]): QueuesPanel => ({
  lists: [
    { name: "runtime 計時中", items: runtime },
    { name: "工作佇列", items: ready },
  ],
});

const TIMER = "setTimeout：印出 4 的函式";
const SLEEP = "Bun.sleep(20)：readMenu 的後半段";
const TIMER_READY = "印出 4 的函式";
const MENU_READY = "readMenu 從第 10 行繼續";

const scene: Scene = {
  id: "day11-event-loop",
  title: "event loop：誰先印出來",
  summary:
    "同步的 console.log、setTimeout、await 混在一起時，call stack 與佇列怎麼決定 1 到 6 的印出順序。",
  code: `console.log("1. 主程式開始");

setTimeout(() => {
  console.log("4. 計時器的工作：等主程式的同步程式跑完才輪到我");
}, 0);

async function readMenu(): Promise<void> {
  console.log("2. readMenu 開始：第一個 await 之前照常執行");
  await Bun.sleep(20);
  console.log("5. readMenu 從 await 的下一行繼續");
}

const pendingMenu = readMenu();

const start = Date.now();
while (Date.now() - start < 100) {
  // Busy on purpose: this blocks the call stack for 100 ms.
}
console.log("3. 同步迴圈忙了 100 毫秒，這段時間沒有任何其他工作被執行");

await pendingMenu;
console.log("6. 全部結束");`,
  steps: [
    {
      line: 1,
      note: "主程式從第一行開始執行，同步印出第 1 句。",
      stack: [main()],
      queues: queues([], []),
      print: "1. 主程式開始",
    },
    {
      line: [3, 5],
      note: "`setTimeout(函式, 0)` 請 runtime 計時 0 毫秒，時間到再把函式排進佇列。函式現在**不會**執行。",
      queues: queues([TIMER], []),
    },
    {
      line: 13,
      note: "呼叫 `readMenu()`，把它疊上 call stack。async 函式在第一個 `await` 之前照常執行。",
      stack: [main({ status: "等待 readMenu 回傳" }), readMenu],
    },
    {
      line: 8,
      note: "印出第 2 句。下一行就是 `await`。",
      print: "2. readMenu 開始：第一個 await 之前照常執行",
      question: {
        prompt: "readMenu 在第 9 行遇到 `await` 之後，接著執行的是哪裡？",
        choices: [
          "回到主程式第 13 行：`pendingMenu` 拿到一個 pending 的 Promise",
          "整支程式停在第 9 行，等 20 毫秒",
          "直接跳到第 10 行，印出第 5 句",
        ],
        answer: 0,
        explain:
          "`await` 只暫停它所在的函式。呼叫 async 函式的人會立刻拿到 Promise，繼續往下執行。",
      },
    },
    {
      line: 9,
      note: "`await Bun.sleep(20)`：把 20 毫秒的計時交給 runtime，readMenu 在這裡暫停，離開 call stack。",
      stack: [main({ status: "等待 readMenu 回傳" })],
      queues: queues([TIMER, SLEEP], []),
    },
    {
      line: 13,
      note: "回到主程式：`pendingMenu` 拿到 readMenu 回傳的 Promise，狀態是 pending。",
      stack: [main({ menu: "Promise（pending）" })],
    },
    {
      line: [15, 16],
      note: "`while` 迴圈讓 call stack 忙了 100 毫秒。這段時間計時器與 `Bun.sleep(20)` 都到期了，它們的工作排進佇列，但只能排隊。",
      queues: queues([], [TIMER_READY, MENU_READY]),
    },
    {
      line: 19,
      note: "迴圈結束，印出第 3 句。佇列裡的工作還在等。",
      print: "3. 同步迴圈忙了 100 毫秒，這段時間沒有任何其他工作被執行",
    },
    {
      line: 21,
      note: "`await pendingMenu`：主程式在這裡暫停，等 `pendingMenu` 完成。call stack 空了，event loop 開始從佇列取出工作。",
      stack: [],
      question: {
        prompt: "event loop 會先從佇列取出哪一件工作？",
        choices: [
          "印出 4 的函式：它最先排進佇列",
          "readMenu 的後半段：主程式正在等它",
          "主程式的第 22 行",
        ],
        answer: 0,
        explain:
          "佇列先排先走：0 毫秒的計時器最先到期、最先排隊，所以最先執行。主程式要等 `pendingMenu` 完成才能繼續。",
      },
    },
    {
      line: 4,
      note: "取出第一件：計時器的函式放上 call stack，印出第 4 句。",
      stack: [{ id: "timer", name: "setTimeout 的函式" }],
      queues: queues([], [MENU_READY]),
      print: "4. 計時器的工作：等主程式的同步程式跑完才輪到我",
    },
    {
      line: 10,
      note: "計時器的函式結束，call stack 又空了。取出下一件：readMenu 從 `await` 的下一行繼續，印出第 5 句。",
      stack: [readMenu],
      queues: queues([], []),
      print: "5. readMenu 從 await 的下一行繼續",
    },
    {
      line: 11,
      note: "readMenu 結束，`pendingMenu` 變成 fulfilled。主程式可以繼續了，它的後半段排進佇列。",
      stack: [],
      queues: queues([], ["主程式從第 22 行繼續"]),
    },
    {
      line: 22,
      note: "event loop 取出主程式的後半段，印出第 6 句，程式結束。",
      stack: [main({ menu: "Promise（fulfilled）" })],
      queues: queues([], []),
      print: "6. 全部結束",
    },
  ],
};

export default scene;
