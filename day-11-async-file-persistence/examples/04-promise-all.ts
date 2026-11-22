// Run from the project root:
//   bun run day-11-async-file-persistence/examples/04-promise-all.ts

// Pretends to ask a warehouse how many items are in stock. Takes 100 ms.
async function countStock(item: string): Promise<number> {
  await Bun.sleep(100);
  if (item === "牛奶") {
    return 12;
  }
  if (item === "雞蛋") {
    return 30;
  }
  if (item === "吐司") {
    return 8;
  }
  throw new Error(`倉庫裡沒有「${item}」這個品項`);
}

// Rounds to the nearest 100 so the output is the same on every run.
function roughly(milliseconds: number): number {
  return Math.round(milliseconds / 100) * 100;
}

// 1. One after another: each await finishes before the next call starts.
const sequentialStart = Date.now();
const milk = await countStock("牛奶");
const eggs = await countStock("雞蛋");
const toast = await countStock("吐司");
const sequentialTime = Date.now() - sequentialStart;
console.log(
  `一個一個等：共 ${milk + eggs + toast} 件，約 ${roughly(sequentialTime)} 毫秒`,
);

// 2. All at once: start the three jobs first, then wait for all of them.
// Promise.all takes an array of Promises and gives back one Promise of an
// array. The results are in the same order as the input.
const parallelStart = Date.now();
const [milkCount, eggCount, toastCount] = await Promise.all([
  countStock("牛奶"),
  countStock("雞蛋"),
  countStock("吐司"),
]);
const parallelTime = Date.now() - parallelStart;
console.log(
  `同時等：牛奶 ${milkCount}、雞蛋 ${eggCount}、吐司 ${toastCount}，約 ${roughly(parallelTime)} 毫秒`,
);

// 3. Works with map: one Promise per item.
const items = ["吐司", "牛奶"];
const counts = await Promise.all(items.map((item) => countStock(item)));
console.log(counts);

// 4. If any Promise rejects, Promise.all rejects with that error.
try {
  await Promise.all([countStock("牛奶"), countStock("鮭魚")]);
} catch (error) {
  if (error instanceof Error) {
    console.log(`其中一件失敗，整批就算失敗：${error.message}`);
  }
}
