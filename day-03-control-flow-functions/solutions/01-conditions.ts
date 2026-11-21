// Reference solution for exercise 01.

export function passLabel(score: number): string {
  return score >= 60 ? "及格" : "不及格";
}

export function ticketPrice(age: number): number {
  // Checked from top to bottom: the first condition that is true wins.
  if (age < 6) {
    return 0;
  } else if (age < 18) {
    return 150;
  } else {
    return 300;
  }
}

export function isValidTitle(title: string): boolean {
  // A comparison already produces a boolean, so it can be returned directly.
  return title.length >= 1 && title.length <= 20;
}

export function canRide(heightCm: number, withAdult: boolean): boolean {
  return heightCm >= 120 || withAdult;
}

export type Size = "S" | "M" | "L";

export function sizeToMl(size: Size): number {
  // Every case returns, so no `break` is needed.
  switch (size) {
    case "S":
      return 350;
    case "M":
      return 500;
    case "L":
      return 700;
  }
}
