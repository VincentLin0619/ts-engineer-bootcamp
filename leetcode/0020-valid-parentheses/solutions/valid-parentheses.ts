// Reference solution for LeetCode 20: Valid Parentheses.

// closing bracket -> its opening bracket
const OPENING_OF = new Map<string, string>([
  [")", "("],
  ["]", "["],
  ["}", "{"],
]);

export function isValid(s: string): boolean {
  const stack: string[] = [];
  for (const ch of s) {
    const opening = OPENING_OF.get(ch);
    if (opening === undefined) {
      stack.push(ch); // an opening bracket: wait for its partner
    } else {
      const top = stack.pop();
      if (top !== opening) {
        return false; // wrong partner, or nothing left to close
      }
    }
  }
  return stack.length === 0; // every opening bracket was closed
}
