import { parseIntegerList } from "../inputs.ts";
import {
  type InputValues,
  type Mark,
  type Question,
  type Scene,
  SceneInputError,
  type Slot,
  type Step,
} from "../types.ts";

const CODE_LINES = {
  call: 16,
  minPrice: 2,
  best: 3,
  loop: 4,
  checkMin: 5,
  updateMin: 6,
  profit: 8,
  checkBest: 9,
  updateBest: 10,
  done: 13,
} as const;

function code(prices: number[]): string {
  return `function maxProfit(prices: number[]): number {
  let minPrice = Infinity; // lowest price seen so far
  let best = 0; // best profit seen so far
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    }
    const profit = price - minPrice;
    if (profit > best) {
      best = profit;
    }
  }
  return best;
}

console.log(maxProfit([${prices.join(", ")}]));`;
}

function parsePrices(input: InputValues): number[] {
  const prices = parseIntegerList(input.prices ?? "", { min: 1, max: 8 });
  if (prices.some((price) => price < 0)) {
    throw new SceneInputError("價格要是 0 以上的整數。");
  }
  return prices;
}

const firstQuestion = (price: number): Question => ({
  prompt: `\`minPrice\` 現在是 \`Infinity\`。第一天的價格 ${price} 比它低嗎？`,
  choices: [
    `比較低，minPrice 會換成 ${price}`,
    "不比較低，minPrice 維持 `Infinity`",
    "會出錯，數字不能和 `Infinity` 比較",
  ],
  answer: 0,
  explain:
    "`Infinity` 比任何數字都大，所以第一天的價格一定比它低，第一圈就會換成第一天的價格。",
});

const keepQuestion = (price: number, min: number, best: number): Question => ({
  prompt: `今天的價格 ${price} 比 \`minPrice\` 的 ${min} 還低，minPrice 會換成 ${price}。那 \`best\`（目前是 ${best}）會怎樣？`,
  choices: [`維持 ${best}`, "歸零，從新的最低價重新算"],
  answer: 0,
  explain:
    "`best` 記住的是「到目前為止」最好的獲利。換了更低的買進價，只會讓之後有機會賺更多，已經算過的獲利不會消失。",
});

function buildSteps(prices: number[]): Step[] {
  const items = prices.map(String);
  let minPrice = Number.POSITIVE_INFINITY;
  let minIndex = -1;
  let best = 0;
  let bestBuy = -1;
  let bestSell = -1;

  const panel = (day: number) => {
    const marks: Record<number, Mark> = {};
    for (let k = 0; k < day; k++) marks[k] = "dim";
    marks[day] = "active";
    const pointers: Record<string, number> = {};
    if (minIndex >= 0) {
      marks[minIndex] = "compare";
      pointers.min = minIndex;
    }
    pointers.price = day;
    return [{ name: "prices", items, marks, pointers }];
  };
  const minSlot = (mark?: Mark): Slot => ({
    name: "minPrice",
    value: minIndex < 0 ? "Infinity" : String(minPrice),
    type: "number",
    ...(mark ? { mark } : {}),
  });
  const bestSlot = (mark?: Mark): Slot => ({
    name: "best",
    value: String(best),
    type: "number",
    ...(mark ? { mark } : {}),
  });

  const steps: Step[] = [
    {
      line: CODE_LINES.call,
      note: `呼叫 \`maxProfit\`：共有 ${prices.length} 天的價格，要找出買一次、賣一次最多能賺多少。`,
      arrays: [{ name: "prices", items }],
      vars: [],
    },
    {
      line: CODE_LINES.minPrice,
      note: "`minPrice` 從 `Infinity` 開始，代表「還沒看過任何價格」。",
      vars: [minSlot("new")],
    },
    {
      line: CODE_LINES.best,
      note: "`best` 從 0 開始：完全不交易就是賺 0，答案不會比 0 小。",
      vars: [minSlot(), bestSlot("new")],
    },
  ];

  let askedKeep = false;
  for (const [day, price] of prices.entries()) {
    const priceSlot: Slot = { name: "price", value: String(price) };
    const isNewMin = price < minPrice;
    let question: Question | undefined;
    if (day === 0) {
      question = firstQuestion(price);
    } else if (isNewMin && best > 0 && !askedKeep) {
      question = keepQuestion(price, minPrice, best);
      askedKeep = true;
    }
    steps.push({
      line: CODE_LINES.loop,
      note: `第 ${day + 1} 圈：\`price\` 是位置 ${day} 的價格 ${price}。`,
      arrays: panel(day),
      vars: [minSlot(), bestSlot(), { ...priceSlot, mark: "new" }],
      ...(question ? { question } : {}),
    });

    const shownMin = minIndex < 0 ? "Infinity" : String(minPrice);
    if (isNewMin) {
      minPrice = price;
      minIndex = day;
      steps.push({
        line: [CODE_LINES.checkMin, CODE_LINES.updateMin],
        note: `\`${price} < ${shownMin}\` 成立，今天是新的最低價，\`minPrice\` 換成 ${price}。`,
        arrays: panel(day),
        vars: [minSlot("new"), bestSlot(), priceSlot],
      });
    } else {
      steps.push({
        line: CODE_LINES.checkMin,
        note: `\`${price} < ${shownMin}\` 不成立，最低價還是 ${shownMin}。`,
        vars: [minSlot(), bestSlot(), priceSlot],
      });
    }

    const profit = price - minPrice;
    const profitSlot: Slot = {
      name: "profit",
      value: String(profit),
      mark: "new",
    };
    const sell = `今天賣出能賺 ${price} - ${minPrice} = ${profit}`;
    if (profit > best) {
      const before = best;
      best = profit;
      bestBuy = minIndex;
      bestSell = day;
      steps.push({
        line: [CODE_LINES.profit, CODE_LINES.checkBest, CODE_LINES.updateBest],
        note: `${sell}，比 \`best\` 的 ${before} 多，\`best\` 換成 ${profit}。`,
        vars: [minSlot(), bestSlot("new"), priceSlot, profitSlot],
      });
    } else {
      const reason =
        minIndex === day
          ? "今天就是最低價，等於不交易"
          : `沒有比 \`best\` 的 ${best} 多`;
      steps.push({
        line: [CODE_LINES.profit, CODE_LINES.checkBest],
        note: `${sell}，${reason}，\`best\` 不變。`,
        vars: [minSlot(), bestSlot(), priceSlot, profitSlot],
      });
    }
  }

  const finalMarks: Record<number, Mark> = {};
  for (let k = 0; k < prices.length; k++) finalMarks[k] = "dim";
  const finalPointers: Record<string, number> = {};
  let ending = "沒有任何一組買賣能賺到錢。";
  if (best > 0) {
    finalMarks[bestBuy] = "found";
    finalMarks[bestSell] = "found";
    finalPointers.buy = bestBuy;
    finalPointers.sell = bestSell;
    ending = `對應的買賣是：位置 ${bestBuy} 的價格 ${prices[bestBuy]} 買進、位置 ${bestSell} 的價格 ${prices[bestSell]} 賣出。`;
  }
  steps.push({
    line: CODE_LINES.done,
    note: `每一天都只看了一次，迴圈結束。回傳 \`best\`，也就是 ${best}。${ending}`,
    arrays: [
      { name: "prices", items, marks: finalMarks, pointers: finalPointers },
    ],
    vars: [minSlot(), bestSlot()],
  });
  steps.push({
    line: CODE_LINES.call,
    note: "印出最大的獲利。",
    print: String(best),
  });
  return steps;
}

const scene: Scene = {
  id: "leetcode-0121-best-time-to-buy-and-sell-stock",
  title: "買賣股票：走一次，記住目前最低價",
  summary:
    "從左往右走一次，一路記住最低價 minPrice 和最好的獲利 best。改改看價格，觀察最低價換掉時 best 會不會跟著變。",
  inputs: [
    {
      name: "prices",
      label: "prices",
      value: "8, 3, 6, 2, 7",
      hint: "1 到 8 個 0 以上的整數，用逗號分開",
    },
  ],
  code: (input) => code(parsePrices(input)),
  steps: (input) => buildSteps(parsePrices(input)),
};

export default scene;

/** Extra inputs checked by `bun site/check-scenes.ts`. */
export const testInputs: InputValues[] = [
  { prices: "9, 7, 5, 2" },
  { prices: "5" },
  { prices: "4, 4, 4" },
  { prices: "1, 9, 0, 6, 10, 3, 2, 8" },
];
