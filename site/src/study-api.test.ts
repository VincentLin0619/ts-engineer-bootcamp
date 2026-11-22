import { describe, expect, test } from "bun:test";
import {
  isAllowedHost,
  isAllowedOrigin,
  isExercisePath,
  parseCheck,
  parseJunit,
  testFileFor,
} from "./study-api.ts";

describe("isExercisePath", () => {
  test("accepts lesson and LeetCode exercise files", () => {
    expect(
      isExercisePath("day-01-setup-variables-types/exercises/01-variables.ts"),
    ).toBe(true);
    expect(isExercisePath("leetcode/0001-two-sum/exercises/two-sum.ts")).toBe(
      true,
    );
  });

  test("rejects tests, solutions, examples and other files", () => {
    expect(
      isExercisePath(
        "day-01-setup-variables-types/exercises/01-variables.test.ts",
      ),
    ).toBe(false);
    expect(
      isExercisePath("day-01-setup-variables-types/solutions/01-variables.ts"),
    ).toBe(false);
    expect(
      isExercisePath("day-01-setup-variables-types/examples/01-hello.ts"),
    ).toBe(false);
    expect(isExercisePath("package.json")).toBe(false);
    expect(isExercisePath("site/study.ts")).toBe(false);
  });

  test("rejects path tricks", () => {
    expect(
      isExercisePath("day-01-x/exercises/../solutions/01-variables.ts"),
    ).toBe(false);
    expect(isExercisePath("/day-01-x/exercises/01-variables.ts")).toBe(false);
    expect(isExercisePath("day-01-x/exercises/./01-variables.ts")).toBe(false);
    expect(isExercisePath("day-01-x\\exercises\\01-variables.ts")).toBe(false);
    expect(isExercisePath("day-01-x/exercises/sub/01-variables.ts")).toBe(
      false,
    );
  });
});

describe("testFileFor", () => {
  test("prefers the test with the same name", () => {
    expect(
      testFileFor("leetcode/0001-two-sum/exercises/two-sum.ts", [
        "two-sum.ts",
        "two-sum.test.ts",
      ]),
    ).toBe("leetcode/0001-two-sum/exercises/two-sum.test.ts");
  });

  test("falls back to the single test with the same number prefix", () => {
    const siblings = [
      "01-cart.ts",
      "01-cart-pricing.ts",
      "01-cart.test.ts",
      "02-score.test.ts",
    ];
    expect(testFileFor("day-06-x/exercises/01-cart-pricing.ts", siblings)).toBe(
      "day-06-x/exercises/01-cart.test.ts",
    );
  });

  test("gives up when no single test matches", () => {
    expect(
      testFileFor("day-06-x/exercises/03-a.ts", [
        "03-b.test.ts",
        "03-c.test.ts",
      ]),
    ).toBeUndefined();
    expect(
      testFileFor("day-06-x/exercises/helper.ts", ["01-a.test.ts"]),
    ).toBeUndefined();
  });
});

describe("host and origin checks", () => {
  test("only accept this machine on the study port", () => {
    expect(isAllowedHost("127.0.0.1:4322", 4322)).toBe(true);
    expect(isAllowedHost("localhost:4322", 4322)).toBe(true);
    expect(isAllowedHost("evil.example:4322", 4322)).toBe(false);
    expect(isAllowedHost("127.0.0.1:80", 4322)).toBe(false);
    expect(isAllowedHost(null, 4322)).toBe(false);
  });

  test("reject requests sent from other websites", () => {
    expect(isAllowedOrigin(null, 4322)).toBe(true);
    expect(isAllowedOrigin("http://127.0.0.1:4322", 4322)).toBe(true);
    expect(isAllowedOrigin("https://evil.example", 4322)).toBe(false);
    expect(isAllowedOrigin("http://127.0.0.1:9999", 4322)).toBe(false);
  });
});

describe("parseJunit", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="file">
    <testsuite name="練習 02">
      <testcase name="describeCourse 組出課程說明" classname="練習 02" time="0.001">
        <failure type="Error" message="TODO：尚未完成 describeCourse">Error: TODO：尚未完成 describeCourse&#10;      at describeCourse (x.ts:17:45)&#10;</failure>
      </testcase>
      <testcase name="toTotalMinutes &amp; more" classname="練習 02" time="0.001" />
      <testcase name="third" classname="練習 02" time="0.001"></testcase>
    </testsuite>
  </testsuite>
</testsuites>`;

  test("counts passes and failures", () => {
    const report = parseJunit(xml);
    expect(report.passed).toBe(2);
    expect(report.failed).toBe(1);
    expect(report.cases.map((item) => item.name)).toEqual([
      "describeCourse 組出課程說明",
      "toTotalMinutes & more",
      "third",
    ]);
  });

  test("keeps the failure message without the stack trace", () => {
    const [first] = parseJunit(xml).cases;
    expect(first?.passed).toBe(false);
    expect(first?.message).toBe("Error: TODO：尚未完成 describeCourse");
  });
});

describe("parseCheck", () => {
  const output = [
    "day-01-x/exercises/01-variables.ts(2,14): error TS2322: Type 'string' is not assignable to type 'number'.",
    "day-01-x/examples/helper.ts(1,1): error TS2304: Cannot find name 'x'.",
    "Found 2 errors in 2 files, checked 2 files [5.77ms]",
  ].join("\n");

  test("returns errors in the checked file and counts the rest", () => {
    const report = parseCheck(output, "day-01-x/exercises/01-variables.ts");
    expect(report.diagnostics).toEqual([
      {
        line: 2,
        column: 14,
        code: "TS2322",
        message: "Type 'string' is not assignable to type 'number'.",
      },
    ]);
    expect(report.elsewhere).toBe(1);
  });

  test("returns nothing for a clean file", () => {
    expect(
      parseCheck("✓ No type errors in 1 file", "a/exercises/b.ts"),
    ).toEqual({
      diagnostics: [],
      elsewhere: 0,
    });
  });
});
