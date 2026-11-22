// Helpers for scenes with editable inputs. They throw SceneInputError with a
// message the learner can act on; the player shows it under the form.

import { SceneInputError } from "./types.ts";

const LIMIT = 999;

export function parseInteger(text: string, label = "這個值"): number {
  const trimmed = text.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    throw new SceneInputError(`${label}要填一個整數，例如 9。`);
  }
  const value = Number(trimmed);
  if (Math.abs(value) > LIMIT) {
    throw new SceneInputError(
      `${label}請填 -${LIMIT} 到 ${LIMIT} 之間的整數。`,
    );
  }
  return value;
}

export function parseIntegerList(
  text: string,
  options: { min: number; max: number; label?: string },
): number[] {
  const label = options.label ?? "陣列";
  const parts = text
    .split(/[,，\s]+/)
    .map((part) => part.trim())
    .filter((part) => part !== "");
  if (parts.length < options.min || parts.length > options.max) {
    throw new SceneInputError(
      `${label}要有 ${options.min} 到 ${options.max} 個數字，用逗號分開，例如 2, 7, 11, 15。`,
    );
  }
  return parts.map((part) => parseInteger(part, `${label}裡的「${part}」`));
}

export function parseText(
  text: string,
  options: { max: number; label?: string },
): string {
  const label = options.label ?? "文字";
  if (text.length === 0) throw new SceneInputError(`${label}不可以是空的。`);
  if (text.length > options.max) {
    throw new SceneInputError(`${label}最多 ${options.max} 個字。`);
  }
  return text;
}
