// This module only defines things, so it is not run directly. It is used by
// cli.ts and store.test.ts. From the project root:
//   bun run day-06-modules-errors-testing/examples/todo/cli.ts
//   bun test day-06-modules-errors-testing/examples/todo
//
// Input validation: decide whether a value from outside is acceptable.

const MAX_TITLE_LENGTH = 100;

// Checks a title and returns the cleaned-up version of it.
// - Spaces at both ends are removed.
// - An empty result, or one longer than 100 characters, throws an Error.
//
// validateTitle("  買牛奶 ") -> "買牛奶"
// validateTitle("   ")       -> throws Error("標題不可以是空白")
export function validateTitle(title: string): string {
  const trimmed = title.trim();

  if (trimmed === "") {
    throw new Error("標題不可以是空白");
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new Error(`標題不可以超過 ${MAX_TITLE_LENGTH} 個字`);
  }

  // Return the cleaned value, so the caller stores "買牛奶", not "  買牛奶 ".
  return trimmed;
}
