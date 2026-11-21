// Exercise 02: union types, literal types, optional properties, narrowing.
//
// Change the lines marked TODO, then run: bun test day-02

// --- Part 1: a union of literal types --------------------------------------

// TODO: this union is missing one size. Add "L" so three sizes are allowed.
export type Size = "S" | "M";

// TODO: after fixing the type above, change this value to "L".
export const largestSize: Size = "M";

// --- Part 2: narrow with `if`, then return ---------------------------------
//
// Each function below receives a value that might be missing, or might be
// one of two types. Check it with `if` first.
//
// `return` hands back the result and ends the function, so nothing after it
// runs. Example of a finished function:
//
//   export function cityOrUnknown(city: string | undefined): string {
//     if (city !== undefined) {
//       return city;
//     }
//     return "不明";
//   }

export type Drink = {
  name: string;
  price: number;
  note?: string;
};

// Return the note of the drink. When there is no note, return "無備註".
// noteOrDefault({ name: "紅茶", price: 30, note: "去冰" }) -> "去冰"
// noteOrDefault({ name: "綠茶", price: 25 }) -> "無備註"
export function noteOrDefault(drink: Drink): string {
  // TODO: check `drink.note` with `if`, then return the right text
  throw new Error("TODO：尚未完成 noteOrDefault");
}

// An id is either a number or a text. A number gets a "#" in front of it,
// a text is returned unchanged.
// formatId(7) -> "#7"
// formatId("A-7") -> "A-7"
export function formatId(id: string | number): string {
  // TODO: check `typeof id` with `if`, then return the right text
  throw new Error("TODO：尚未完成 formatId");
}

export type Member = {
  name: string;
  nickname: string | null;
};

// Return the nickname of the member. When the nickname is null, return
// the name instead.
// displayName({ name: "王小明", nickname: "小明" }) -> "小明"
// displayName({ name: "陳大文", nickname: null }) -> "陳大文"
export function displayName(member: Member): string {
  // TODO: check `member.nickname` with `if`, then return the right text
  throw new Error("TODO：尚未完成 displayName");
}

// Return the first title in the list. When the list is empty, return the
// fallback text instead.
// firstOrFallback(["買牛奶", "運動"], "沒有事項") -> "買牛奶"
// firstOrFallback([], "沒有事項") -> "沒有事項"
export function firstOrFallback(titles: string[], fallback: string): string {
  // TODO: read index 0 into a const, check it with `if`, then return
  throw new Error("TODO：尚未完成 firstOrFallback");
}
