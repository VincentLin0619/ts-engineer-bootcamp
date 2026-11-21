// Reference solution for exercise 02.

export function sumTo(limit: number): number {
  let total = 0;

  for (let i = 1; i <= limit; i++) {
    total += i;
  }

  return total;
}

export function keepPassing(scores: number[]): number[] {
  const passing: number[] = [];

  for (const score of scores) {
    if (score >= 60) {
      passing.push(score);
    }
  }

  return passing;
}

export function daysToSave(target: number, perDay: number): number {
  let saved = 0;
  let days = 0;

  // The condition is checked before every round, so a target of 0
  // never enters the loop.
  while (saved < target) {
    saved += perDay;
    days++;
  }

  return days;
}

export const isLongTitle = (title: string, minLength: number): boolean =>
  title.length >= minLength;

export function countLongTitles(
  titles: string[],
  minLength: number = 4,
): number {
  let count = 0;

  for (const title of titles) {
    // A function calling another function: isLongTitle goes on top of
    // the call stack, returns a boolean, and this loop continues.
    if (isLongTitle(title, minLength)) {
      count++;
    }
  }

  return count;
}
