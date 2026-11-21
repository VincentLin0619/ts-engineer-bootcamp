// Reference solution for exercise 02.

export function describeCourse(courseName: string, days: number): string {
  return `${courseName} 共 ${days} 天`;
}

export function toTotalMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

export function addAsNumbers(first: string, second: string): number {
  // Without Number(...), "2" + "3" would be the text "23".
  return Number(first) + Number(second);
}
