// Run from the project root:
//   bun run day-11-async-file-persistence/examples/02-async-await.ts

// Looks up the price of a drink. It is slow on purpose.
// return -> the Promise becomes fulfilled with that value.
// throw  -> the Promise becomes rejected with that error.
async function findPrice(drink: string): Promise<number> {
  await Bun.sleep(50);
  if (drink === "拿鐵") {
    return 120;
  }
  if (drink === "紅茶") {
    return 40;
  }
  throw new Error(`菜單上沒有「${drink}」`);
}

// 1. Fulfilled: `await` takes the value out of the Promise.
const lattePrice = await findPrice("拿鐵");
console.log(`拿鐵 ${lattePrice} 元`);

// 2. Rejected: `await` throws the error, so try / catch works as on Day 06.
try {
  const price = await findPrice("珍珠奶茶");
  console.log(`這一行不會執行：${price}`);
} catch (error) {
  if (error instanceof Error) {
    console.log(`查價失敗：${error.message}`);
  }
}

// 3. An async function can await other async functions.
// It always returns a Promise, here a Promise<string>.
async function describeOrder(drink: string, cups: number): Promise<string> {
  try {
    const price = await findPrice(drink);
    return `${drink} ${cups} 杯，共 ${price * cups} 元`;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "未知的錯誤";
    return `無法點餐：${reason}`;
  }
}

console.log(await describeOrder("紅茶", 2));
console.log(await describeOrder("可樂", 1));

// 4. Forgetting `await` gives you the Promise, not the number.
const forgotten = findPrice("紅茶");

// Try it: delete the `@ts-expect-error` line below, then run
//   bun check day-11-async-file-persistence/examples/02-async-await.ts
// to read the real error message. Put the line back when you are done.

// @ts-expect-error -- TS2365: Operator '+' cannot be applied to types 'Promise<number>' and '10'.
console.log(forgotten + 10); // prints "[object Promise]10", not 50

const remembered = await forgotten;
console.log(remembered + 10); // 50
