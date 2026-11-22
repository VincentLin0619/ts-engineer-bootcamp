// Run from the project root:
//   bun run day-13-crud-http-api/examples/03-validate-body.ts
//
// A request body comes from outside the program. Its type is `unknown`
// until the code has checked it. No server is needed to practise that.
import { parseNewTodoBody } from "./todo/http-api.ts";

// --- Part 1: narrowing an unknown value, one question at a time ---

// JSON.parse turns JSON text into a value. It can produce anything.
const body: unknown = JSON.parse('{ "title": "買牛奶", "priority": "high" }');

// Try it: delete the `@ts-expect-error` line below, then run
//   bun check day-13-crud-http-api/examples/03-validate-body.ts
// to read the real error message. Put the line back when you are done.

// @ts-expect-error -- TS18046: 'body' is of type 'unknown'.
console.log("沒檢查就使用：", body.title);

// Question 1: is it an object? (typeof null is also "object", so rule it out.)
if (typeof body === "object" && body !== null) {
  // Question 2: does it have a property named "title"?
  if ("title" in body) {
    // Question 3: is that property text?
    if (typeof body.title === "string") {
      // Only here does TypeScript know body.title is a string.
      console.log("檢查後使用：", body.title.toUpperCase());
    }
  }
}

// --- Part 2: the same checks, packed into one function ---

// Runs the validator and reports what happened instead of crashing.
function tryParse(label: string, jsonText: string): void {
  try {
    const input = parseNewTodoBody(JSON.parse(jsonText));
    console.log(`${label} -> 通過：`, input);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`${label} -> ${error.name}：${error.message}`);
    }
  }
}

tryParse("完整的 body", '{ "title": "買牛奶", "priority": "high" }');
tryParse("只有 title", '{ "title": "買牛奶" }');
tryParse("沒有 title", '{ "name": "買牛奶" }');
tryParse("title 是數字", '{ "title": 123 }');
tryParse("priority 不認得", '{ "title": "買牛奶", "priority": "urgent" }');
tryParse("不是物件", '"買牛奶"');
tryParse("是 null", "null");
