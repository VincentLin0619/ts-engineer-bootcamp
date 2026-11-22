// Exercise 01: async / await, try / catch and Promise.all.
//
// `findPrice` is already written. It pretends to ask a slow server for the
// price of a drink: every call takes 40 ms, and unknown drinks make the
// Promise reject. Do not change it.
//
// Complete the three functions marked TODO, then run: bun test day-11

const MENU = [
  { drink: "拿鐵", price: 120 },
  { drink: "紅茶", price: 40 },
  { drink: "美式", price: 90 },
  { drink: "可可", price: 100 },
  { drink: "抹茶", price: 110 },
];

export async function findPrice(drink: string): Promise<number> {
  await Bun.sleep(40);
  const found = MENU.find((entry) => entry.drink === drink);
  if (found === undefined) {
    throw new Error(`菜單上沒有「${drink}」`);
  }
  return found.price;
}

// Wait for the price, then build the label "<drink>：<price> 元".
// When the drink is unknown, let the error from findPrice pass through.
// describePrice("拿鐵") -> resolves to "拿鐵：120 元"
// describePrice("可樂") -> rejects with Error("菜單上沒有「可樂」")
export async function describePrice(drink: string): Promise<string> {
  // TODO: await findPrice(drink), then return the label
  throw new Error("TODO：尚未完成 describePrice");
}

// Like findPrice, but it never rejects: an unknown drink costs 0.
// findPriceOrZero("紅茶") -> resolves to 40
// findPriceOrZero("可樂") -> resolves to 0
export async function findPriceOrZero(drink: string): Promise<number> {
  // TODO: put try / catch around the await
  throw new Error("TODO：尚未完成 findPriceOrZero");
}

// Add up the prices of all the drinks. Look the prices up at the same time
// with Promise.all: five drinks must take about 40 ms, not 200 ms.
// totalPrice(["拿鐵", "紅茶"]) -> resolves to 160
// totalPrice([])               -> resolves to 0
// totalPrice(["拿鐵", "可樂"]) -> rejects with Error("菜單上沒有「可樂」")
export async function totalPrice(drinks: string[]): Promise<number> {
  // TODO: start one lookup per drink, wait for all of them, add them up
  throw new Error("TODO：尚未完成 totalPrice");
}
