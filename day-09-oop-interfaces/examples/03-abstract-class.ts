// Run from the project root:
//   bun run day-09-oop-interfaces/examples/03-abstract-class.ts
//
// An abstract class is a half-finished class: it fixes the overall
// procedure and leaves a few steps for other classes to fill in.

import { Todo } from "./todo/todo.ts";

abstract class TodoFormatter {
  // The template method: the procedure is written once, here. Every
  // formatter prints a header, then one line per todo, then a summary.
  format(todos: readonly Todo[]): string {
    let text = this.header();
    for (const todo of todos) {
      // "\n" is the newline character: what follows starts on a new line.
      text = `${text}\n${this.formatLine(todo)}`;
    }
    return `${text}\n${this.summary(todos)}`;
  }

  // An ordinary method: written once, shared by every formatter.
  summary(todos: readonly Todo[]): string {
    const doneCount = todos.filter((todo) => todo.done).length;
    return `共 ${todos.length} 筆，已完成 ${doneCount} 筆`;
  }

  // Abstract methods: a signature without a body. Each formatter must
  // provide its own version of these two steps.
  abstract header(): string;
  abstract formatLine(todo: Todo): string;
}

// `extends TodoFormatter`: this class is built on top of TodoFormatter, so
// it already has format() and summary(). It only fills in the two missing
// steps. (Copy `extends` for now: Day 10 explains it in full.)
class PlainTextFormatter extends TodoFormatter {
  header(): string {
    return "待辦事項";
  }

  // The same one-line format used since week 1.
  formatLine(todo: Todo): string {
    const mark = todo.done ? "x" : " ";
    const label = { low: "低", medium: "中", high: "高" }[todo.priority];
    return `[${mark}] #${todo.id} ${todo.title}（優先度：${label}）`;
  }
}

class MarkdownFormatter extends TodoFormatter {
  header(): string {
    return "## 待辦事項";
  }

  formatLine(todo: Todo): string {
    const mark = todo.done ? "x" : " ";
    return `- [${mark}] **${todo.title}**（${todo.priority}）`;
  }
}

const milk = new Todo(1, "買牛奶");
const report = new Todo(2, "寫報告", "high");
milk.complete();
const todos = [milk, report];

// The same call, format(todos), on two different formatters.
const formatters: TodoFormatter[] = [
  new PlainTextFormatter(),
  new MarkdownFormatter(),
];

for (const formatter of formatters) {
  console.log(formatter.format(todos));
  console.log("");
}

// Try it: remove the `//` on the next line, then run
//   bun check day-09-oop-interfaces/examples/03-abstract-class.ts
// TS2511: Cannot create an instance of an abstract class.
// const formatter = new TodoFormatter();
