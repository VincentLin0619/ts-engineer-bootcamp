// Exercise 01: conditions.
//
// From today on you write the whole function body yourself. Replace the
// `throw new Error(...)` line inside each function with your own code,
// then run: bun test day-03

// Use the ternary operator. A score of 60 or higher passes.
// passLabel(72) -> "及格"
// passLabel(59) -> "不及格"
export function passLabel(score: number): string {
  // TODO: return "及格" or "不及格"
  throw new Error("TODO：尚未完成 passLabel");
}

// Use if / else if / else. The ticket price depends on the age:
//   younger than 6       -> 0
//   6 to 17              -> 150
//   18 and older         -> 300
// ticketPrice(5) -> 0
// ticketPrice(6) -> 150
// ticketPrice(18) -> 300
export function ticketPrice(age: number): number {
  // TODO: return the price for this age
  throw new Error("TODO：尚未完成 ticketPrice");
}

// Use `&&`. A title is valid when it has at least 1 character and at most
// 20 characters. `title.length` is the number of characters.
// isValidTitle("買牛奶") -> true
// isValidTitle("") -> false
export function isValidTitle(title: string): boolean {
  // TODO: return true when the length is between 1 and 20
  throw new Error("TODO：尚未完成 isValidTitle");
}

// Use `||`. A child may take the ride when the child is at least 120 cm
// tall, or when an adult comes along.
// canRide(130, false) -> true
// canRide(100, true) -> true
// canRide(100, false) -> false
export function canRide(heightCm: number, withAdult: boolean): boolean {
  // TODO: return true when at least one of the two conditions is true
  throw new Error("TODO：尚未完成 canRide");
}

export type Size = "S" | "M" | "L";

// Use switch. Each cup size holds a different amount:
//   "S" -> 350, "M" -> 500, "L" -> 700
// sizeToMl("M") -> 500
export function sizeToMl(size: Size): number {
  // TODO: return the amount for this size
  throw new Error("TODO：尚未完成 sizeToMl");
}
