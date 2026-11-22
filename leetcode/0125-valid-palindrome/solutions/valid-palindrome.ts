// Reference solution for LeetCode 125: Valid Palindrome.

// True for "a" to "z" and "0" to "9". Lowercase a character before
// passing it in.
function isLowercaseOrDigit(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
}

export function isPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    const a = s.charAt(left).toLowerCase();
    const b = s.charAt(right).toLowerCase();
    if (!isLowercaseOrDigit(a)) {
      left++;
    } else if (!isLowercaseOrDigit(b)) {
      right--;
    } else if (a !== b) {
      return false;
    } else {
      left++;
      right--;
    }
  }
  return true;
}
