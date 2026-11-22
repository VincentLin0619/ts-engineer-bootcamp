// Reference solution for exercise 01.

// PROBLEM 1: PascalCase for a type.
type TicketKind = "adult" | "student" | "senior";

// PROBLEM 2: CONSTANT_CASE for a fixed table, and `as const` so that every
// property is readonly.
const TICKET_PRICES = { adult: 300, student: 250, senior: 150 } as const;

const BOOKING_FEE = 20;
const TUESDAY_DISCOUNT = 50;

export function priceOf(kind: TicketKind): number {
  return TICKET_PRICES[kind];
}

// PROBLEM 3: calculate a new value. The price table is only read.
export function tuesdayPrice(kind: TicketKind): number {
  return priceOf(kind) - TUESDAY_DISCOUNT;
}

// PROBLEM 4: camelCase for a parameter.
export function totalPrice(kind: TicketKind, ticketCount: number): number {
  return priceOf(kind) * ticketCount;
}

// PROBLEM 5: with `: string` written out, forgetting a kind is a type error.
export function kindLabel(kind: TicketKind): string {
  if (kind === "adult") {
    return "全票";
  }
  if (kind === "student") {
    return "學生票";
  }
  return "敬老票";
}

// PROBLEM 6: `readonly` makes `prices.push(...)` a type error, so the only
// way left is to build a new array.
export function withBookingFee(prices: readonly number[]): number[] {
  return [...prices, BOOKING_FEE];
}
