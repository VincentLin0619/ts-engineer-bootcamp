// Reference solution for exercise 01.

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

export async function describePrice(drink: string): Promise<string> {
  // No try / catch: a rejected findPrice makes this Promise reject too.
  const price = await findPrice(drink);
  return `${drink}：${price} 元`;
}

export async function findPriceOrZero(drink: string): Promise<number> {
  try {
    return await findPrice(drink);
  } catch {
    // The error is expected here, so it is replaced by a default value.
    return 0;
  }
}

export async function totalPrice(drinks: string[]): Promise<number> {
  // map starts every lookup right away and gives an array of Promises.
  const lookups = drinks.map((drink) => findPrice(drink));
  // Promise.all waits for all of them; total time is the slowest one.
  const prices = await Promise.all(lookups);
  return prices.reduce((sum, price) => sum + price, 0);
}
