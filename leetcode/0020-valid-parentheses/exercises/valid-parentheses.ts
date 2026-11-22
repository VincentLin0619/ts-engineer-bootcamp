// LeetCode 20: Valid Parentheses.
//
// Replace the `throw new Error(...)` line with your own code, then run:
// bun test leetcode/0020
//
// `s` contains only the characters ( ) [ ] { }. Return true when every
// bracket is matched correctly:
// - every opening bracket is closed by the same kind of bracket
// - the bracket opened last is closed first (brackets may nest, not cross)
// - every closing bracket has an open bracket of its kind waiting for it
//
// isValid("{[]()}") -> true
// isValid("[(])")   -> false  (the ( is still open when ] arrives)
// isValid("((")     -> false  (two brackets are never closed)
//
// Try the stack approach from the README: push opening brackets, and pop
// one whenever a closing bracket arrives.
export function isValid(s: string): boolean {
  // TODO: walk through s once, keeping the open brackets in an array
  throw new Error("TODO：尚未完成 isValid");
}
