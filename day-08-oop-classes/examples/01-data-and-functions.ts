// Run from the project root:
//   bun run day-08-oop-classes/examples/01-data-and-functions.ts
//
// Week 1 style: the data is a plain object, and the functions that guard it
// live somewhere else. Nothing forces anyone to go through those functions.

type Priority = "low" | "medium" | "high";

type TodoData = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// The rule from Day 06: a title must have 1 to 100 characters after trimming.
function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error("標題不可以是空的");
  }
  if (trimmed.length > 100) {
    throw new Error("標題不可以超過 100 個字");
  }
  return trimmed;
}

function renameTodo(todo: TodoData, title: string): TodoData {
  return { ...todo, title: validateTitle(title) };
}

const milk: TodoData = {
  id: 1,
  title: "買牛奶",
  done: false,
  priority: "medium",
};

// 1. Going through the function: the rule is checked.
const renamed = renameTodo(milk, "  買低脂牛奶  ");
console.log(`改名成功：「${renamed.title}」`);

try {
  renameTodo(milk, "   ");
} catch (error) {
  if (error instanceof Error) {
    console.log(`改名失敗：${error.message}`);
  }
}

// 2. Going around the function: nothing stops a direct assignment.
milk.title = "";
console.log(`直接改屬性：「${milk.title}」`);

// 3. An object literal skips the rule as well.
const broken: TodoData = { id: 2, title: "   ", done: false, priority: "low" };
console.log(`直接建立物件：「${broken.title}」`);

// Both objects have the right TYPE (title is a string), but they break the
// RULE (a title must not be empty). Types alone cannot protect a rule.
console.log("結論：型別正確，規則卻被繞過了");
