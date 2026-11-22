// Exercise 02: replace `any`, `!` and `as` with real checks.
//
// The code handles food delivery orders. Every problem is marked
// `PROBLEM n`. Work on one problem at a time, as in exercise 01:
// 1. When the problem has a suppression comment, delete that comment.
// 2. Run both checkers and read what they report:
//      bunx biome check day-07-ts-conventions-1/exercises
//      bun check day-07-ts-conventions-1/exercises
// 3. Fix the code properly. Do not put the comment back.
// When every problem is fixed, run: bun test day-07

export type Order = {
  id: number;
  customer: string;
  total: number;
  paid: boolean;
};

type PaymentMethod = "cash" | "card";

// PROBLEM 1: `any` switches checking off, so two typos went unnoticed.
// Replace `any` with the precise type, then let `bun check` find the typos.
// orderSummary({ id: 1, customer: "小明", total: 250, paid: false })
//   -> "#1 小明：NT$250"
// biome-ignore lint/suspicious/noExplicitAny: delete this comment, then replace `any`
export function orderSummary(order: any): string {
  return `#${order.id} ${order.custmer}：NT$${order.totel}`;
}

// PROBLEM 2: a parameter without a type silently becomes `any`, and one
// more typo is hiding behind it.
// countPaid(orders) -> how many orders have `paid: true`
// @ts-expect-error -- TS7006: Parameter 'orders' implicitly has an 'any' type. Delete this comment, then add the type.
export function countPaid(orders): number {
  let count = 0;
  for (const order of orders) {
    if (order.payed) {
      count += 1;
    }
  }
  return count;
}

// PROBLEM 3: `!` claims "this is never undefined". For an empty list the
// claim is false, and the program crashes.
// largestTotal(orders) -> the largest `total` in the list
// largestTotal([])     -> 0
export function largestTotal(orders: readonly Order[]): number {
  // biome-ignore lint/style/noNonNullAssertion: delete this comment, then handle the empty list
  let largest = orders[0]!.total;
  for (const order of orders) {
    if (order.total > largest) {
      largest = order.total;
    }
  }
  return largest;
}

// PROBLEM 4: `as` checks nothing. Any text is accepted, and everything that
// is not "cash" is then treated as a card payment. Compare the text with
// the allowed values instead, and throw for anything else.
// paymentLabel("cash")    -> "現金"
// paymentLabel("card")    -> "刷卡"
// paymentLabel("bitcoin") -> throws Error("不支援的付款方式：bitcoin")
export function paymentLabel(method: string): string {
  const checked = method as PaymentMethod;
  if (checked === "cash") {
    return "現金";
  }
  return "刷卡";
}

// PROBLEM 5: a value that was thrown can be anything, so its honest type is
// `unknown`. Check what it is before using it.
// describeFailure(new Error("餘額不足")) -> "失敗：餘額不足"
// describeFailure("網路斷線")            -> "失敗：網路斷線"
// describeFailure(404)                   -> "失敗：404"
// biome-ignore lint/suspicious/noExplicitAny: delete this comment, then replace `any` with `unknown`
export function describeFailure(error: any): string {
  return `失敗：${error.message}`;
}
