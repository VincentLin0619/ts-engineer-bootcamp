// Reference solution for exercise 02.

export type Size = "S" | "M" | "L";

export const largestSize: Size = "L";

export type Drink = {
  name: string;
  price: number;
  note?: string;
};

export function noteOrDefault(drink: Drink): string {
  if (drink.note !== undefined) {
    // Here the type of `drink.note` is string.
    return drink.note;
  }
  return "無備註";
}

export function formatId(id: string | number): string {
  if (typeof id === "number") {
    // Here the type of `id` is number.
    return `#${id}`;
  }
  // The number case already returned, so only string is left here.
  return id;
}

export type Member = {
  name: string;
  nickname: string | null;
};

export function displayName(member: Member): string {
  if (member.nickname !== null) {
    // Here the type of `member.nickname` is string.
    return member.nickname;
  }
  return member.name;
}

export function firstOrFallback(titles: string[], fallback: string): string {
  // The type of `first` is `string | undefined`: the position may be empty.
  const first = titles[0];
  if (first !== undefined) {
    return first;
  }
  return fallback;
}
