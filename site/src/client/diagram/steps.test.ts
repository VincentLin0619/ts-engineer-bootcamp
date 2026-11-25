import { expect, test } from "bun:test";
import { chipText } from "./steps.ts";

test("chipText keeps the first line and trims to 24 characters", () => {
  expect(chipText("呼叫")).toBe("呼叫");
  expect(chipText("POST /todos\nbody 是 JSON")).toBe("POST /todos");
  expect(chipText("  a   b  ")).toBe("a b");
  expect(chipText("x".repeat(30))).toBe(`${"x".repeat(23)}…`);
  expect(chipText("")).toBe("");
});
