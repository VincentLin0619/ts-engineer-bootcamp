// Exercise 01: fix code that breaks the naming and "do not modify" rules.
//
// The code sells movie tickets. Every problem is marked `PROBLEM n`. Some
// problems are hidden from the checkers by a suppression comment
// (`// biome-ignore ...` or `// @ts-expect-error ...`).
//
// Work on one problem at a time:
// 1. When the problem has a suppression comment, delete that comment.
// 2. Run both checkers and read what they report:
//      bunx biome check day-07-ts-conventions-1/exercises
//      bun check day-07-ts-conventions-1/exercises
// 3. Fix the code properly. Do not put the comment back.
// When every problem is fixed, run: bun test day-07
//
// Do not rename anything that has `export` in front of it: the tests use
// those names.

// PROBLEM 1: a type name is written in PascalCase.
// biome-ignore lint/style/useNamingConvention: delete this comment, then rename the type
type ticket_kind = "adult" | "student" | "senior";

// PROBLEM 2: a fixed table of values. Name it in CONSTANT_CASE, and add the
// two words that stop anyone from changing it.
// biome-ignore lint/style/useNamingConvention: delete this comment, then rename the constant
const ticket_prices = { adult: 300, student: 250, senior: 150 };

const BOOKING_FEE = 20;

// The price of one ticket.
// priceOf("student") -> 250
export function priceOf(kind: ticket_kind): number {
  return ticket_prices[kind];
}

// PROBLEM 3: this function should only CALCULATE the Tuesday price, which
// is 50 less than usual. Instead it changes the shared price table, so
// tickets get cheaper with every call. After PROBLEM 2 is fixed, `bun check`
// reports the line. Work out the result without changing the table.
// tuesdayPrice("student") -> 200, no matter how often it is called
export function tuesdayPrice(kind: ticket_kind): number {
  ticket_prices[kind] = ticket_prices[kind] - 50;
  return ticket_prices[kind];
}

// PROBLEM 4: a parameter name is written in camelCase.
// totalPrice("adult", 2) -> 600
// biome-ignore lint/style/useNamingConvention: delete this comment, then rename the parameter
export function totalPrice(kind: ticket_kind, ticket_count: number): number {
  return priceOf(kind) * ticket_count;
}

// PROBLEM 5: an exported function states its return type. Add `: string`,
// and the checker shows which kind was forgotten. "senior" -> "敬老票"
// kindLabel("adult") -> "全票"
// @ts-expect-error -- TS7030: Not all code paths return a value. Delete this comment, then fix the function.
export function kindLabel(kind: ticket_kind) {
  if (kind === "adult") {
    return "全票";
  }
  if (kind === "student") {
    return "學生票";
  }
}

// PROBLEM 6: this function changes the array it receives. Promise not to do
// that in the parameter type, then return a new array instead.
// withBookingFee([300, 250]) -> [300, 250, 20]
// The array that was passed in must still be [300, 250] afterwards.
export function withBookingFee(prices: number[]): number[] {
  prices.push(BOOKING_FEE);
  return prices;
}
