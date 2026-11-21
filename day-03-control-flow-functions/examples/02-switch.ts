// Run from the project root:
//   bun run day-03-control-flow-functions/examples/02-switch.ts

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

const todo: Todo = { id: 1, title: "買牛奶", done: false, priority: "high" };

// One value compared against several options, written with if / else if.
let labelFromIf: string;

if (todo.priority === "low") {
  labelFromIf = "低";
} else if (todo.priority === "medium") {
  labelFromIf = "中";
} else {
  labelFromIf = "高";
}

console.log(labelFromIf);

// The same decision with switch: one `case` per option.
// `break` ends the case and jumps out of the switch.
let label: string;

switch (todo.priority) {
  case "low":
    label = "低";
    break;
  case "medium":
    label = "中";
    break;
  case "high":
    label = "高";
    break;
}

console.log(`${todo.title}的優先度：${label}`);

// Several cases can share the same code: list them one after another.
switch (todo.priority) {
  case "low":
  case "medium":
    console.log("可以晚點再做");
    break;
  case "high":
    console.log("今天要做完");
    break;
}

// `default` catches every value that has no case of its own.
const command: string = "sing";

switch (command) {
  case "add":
    console.log("新增一筆待辦事項");
    break;
  case "list":
    console.log("列出所有待辦事項");
    break;
  default:
    console.log(`不認得的指令：${command}`);
}

// Try it: remove the `//` on the next three lines, then run
//   bun check day-03-control-flow-functions/examples/02-switch.ts
// switch (todo.priority) {
//   case "urgent":
// }
