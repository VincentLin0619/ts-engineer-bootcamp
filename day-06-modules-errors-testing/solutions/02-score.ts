// Reference solution for exercise 02.

export function parseScore(text: string): number {
  const trimmed = text.trim();
  // Check for empty text first: Number("") is 0, which would look valid.
  if (trimmed === "") {
    throw new Error("分數不可以是空白");
  }

  const score = Number(trimmed);
  if (!Number.isInteger(score)) {
    throw new Error(`分數必須是整數：${trimmed}`);
  }
  if (score < 0 || score > 100) {
    throw new Error(`分數必須介於 0 到 100：${score}`);
  }
  return score;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "未知的錯誤";
}

export function describeScore(text: string): string {
  try {
    return `分數：${parseScore(text)}`;
  } catch (error) {
    return `輸入錯誤：${errorMessage(error)}`;
  }
}

export function averageScore(texts: readonly string[]): number {
  if (texts.length === 0) {
    throw new Error("至少需要一個分數");
  }

  // No try/catch: an error from parseScore travels up to the caller.
  let total = 0;
  for (const text of texts) {
    total += parseScore(text);
  }
  return total / texts.length;
}
