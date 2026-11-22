// LeetCode 125: Valid Palindrome.
//
// Replace the `throw new Error(...)` line with your own code, then run:
// bun test leetcode/0125
//
// Return true when `s` reads the same from left to right as from right to
// left, after two rules:
// - only letters and digits count; skip spaces and punctuation
// - upper case and lower case are the same letter
// A string with no letters or digits at all counts as a palindrome.
//
// isPalindrome("Top spot!")     -> true   (compares "topspot")
// isPalindrome("Step on a pet") -> false  (compares "steponapet")
// isPalindrome("?!")            -> true   (nothing left to compare)

// Ready to use: true for "a" to "z" and "0" to "9". Lowercase a character
// before passing it in.
function isLowercaseOrDigit(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
}

export function isPalindrome(s: string): boolean {
  // TODO: move `left` and `right` towards each other, skipping characters
  // that are not letters or digits, and compare the rest
  throw new Error("TODO：尚未完成 isPalindrome");
}
