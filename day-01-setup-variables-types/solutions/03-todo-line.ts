// Reference solution for exercise 03.

export function formatTodoLine(
  title: string,
  minutes: number,
  done: boolean,
): string {
  return `${title}（${minutes} 分鐘）完成：${done}`;
}

export function remainingMinutes(
  estimatedMinutes: number,
  workedMinutes: number,
): number {
  return estimatedMinutes - workedMinutes;
}
