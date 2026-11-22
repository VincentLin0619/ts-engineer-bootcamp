// Exercise 02: throw, try/catch and the `unknown` error.
//
// Replace each `throw new Error("TODO...")` line, then run: bun test day-06

// Turn text typed by a user into an exam score from 0 to 100.
// Check in this order:
// 1. Remove the spaces at both ends of the text.
// 2. Nothing left          -> throw new Error("分數不可以是空白")
// 3. Not a whole number    -> throw new Error("分數必須是整數：<text>")
//                             (<text> is the text after step 1)
// 4. Below 0 or above 100  -> throw new Error("分數必須介於 0 到 100：<number>")
// 5. Otherwise return the number.
//
// parseScore(" 85 ") -> 85
// parseScore("abc")  -> throws Error("分數必須是整數：abc")
// parseScore("120")  -> throws Error("分數必須介於 0 到 100：120")
export function parseScore(text: string): number {
  // TODO: validate the text, then return the score
  throw new Error("TODO：尚未完成 parseScore");
}

// Return the message of a value caught by `catch`.
// - An Error object -> its `message`
// - Anything else   -> "未知的錯誤"
//
// errorMessage(new Error("壞掉了")) -> "壞掉了"
// errorMessage("just text")         -> "未知的錯誤"
export function errorMessage(error: unknown): string {
  // TODO: check with `instanceof Error` before reading `.message`
  throw new Error("TODO：尚未完成 errorMessage");
}

// Describe a score. This function must never throw: call parseScore inside
// try/catch and turn a failure into a sentence with errorMessage.
//
// describeScore("85")  -> "分數：85"
// describeScore("abc") -> "輸入錯誤：分數必須是整數：abc"
export function describeScore(text: string): string {
  // TODO: try parseScore, catch the error
  throw new Error("TODO：尚未完成 describeScore");
}

// The average of several scores given as text.
// - An empty array -> throw new Error("至少需要一個分數")
// - Do NOT catch here. When one text is not valid, the error thrown by
//   parseScore should pass through this function to the caller.
//
// averageScore(["80", "90"])  -> 85
// averageScore(["80", "abc"]) -> throws Error("分數必須是整數：abc")
export function averageScore(texts: readonly string[]): number {
  // TODO: parse every text, then return total / count
  throw new Error("TODO：尚未完成 averageScore");
}
