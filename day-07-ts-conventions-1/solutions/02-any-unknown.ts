// Reference solution for exercise 02.

export type Order = {
  id: number;
  customer: string;
  total: number;
  paid: boolean;
};

type PaymentMethod = "cash" | "card";

// PROBLEM 1: with `order: Order`, `order.custmer` and `order.totel` are
// reported as TS2551, with a suggestion for the correct name.
export function orderSummary(order: Order): string {
  return `#${order.id} ${order.customer}：NT$${order.total}`;
}

// PROBLEM 2: with the parameter typed, `order.payed` is reported as well.
export function countPaid(orders: readonly Order[]): number {
  let count = 0;
  for (const order of orders) {
    if (order.paid) {
      count += 1;
    }
  }
  return count;
}

// PROBLEM 3: start from 0, so an empty list needs no special case and no
// element is read by index.
export function largestTotal(orders: readonly Order[]): number {
  let largest = 0;
  for (const order of orders) {
    if (order.total > largest) {
      largest = order.total;
    }
  }
  return largest;
}

// PROBLEM 4: a real check. After the comparison TypeScript knows that
// `method` is a PaymentMethod, so no `as` is needed.
function parsePaymentMethod(method: string): PaymentMethod {
  if (method === "cash" || method === "card") {
    return method;
  }
  throw new Error(`不支援的付款方式：${method}`);
}

export function paymentLabel(method: string): string {
  const checked = parsePaymentMethod(method);
  return checked === "cash" ? "現金" : "刷卡";
}

// PROBLEM 5: `unknown` forces a check before `.message` is read.
export function describeFailure(error: unknown): string {
  if (error instanceof Error) {
    return `失敗：${error.message}`;
  }
  return `失敗：${String(error)}`;
}
