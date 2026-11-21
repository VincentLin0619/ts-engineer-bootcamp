// Run from the project root:
//   bun run day-02-type-system/examples/05-todo.ts
//
// The Todo main line starts here. These two types stay the same until Day 07.

// A priority is one of exactly three values.
type Priority = "low" | "medium" | "high";

// One todo item: the three separate variables from Day 01 become one object.
type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

const buyMilk: Todo = {
  id: 1,
  title: "買牛奶",
  done: false,
  priority: "high",
};

const doHomework: Todo = {
  id: 2,
  title: "寫作業",
  done: true,
  priority: "medium",
};

const goJogging: Todo = {
  id: 3,
  title: "運動",
  done: false,
  priority: "low",
};

// A todo list is an array of Todo objects.
const todos: Todo[] = [buyMilk, doHomework, goJogging];

console.log(`共有 ${todos.length} 筆待辦事項`);
console.log(todos);

// Reading by index gives `Todo | undefined`, so narrow before using it.
const firstTodo = todos[0];
if (firstTodo !== undefined) {
  console.log(
    `#${firstTodo.id} ${firstTodo.title}（優先度：${firstTodo.priority}，完成：${firstTodo.done}）`,
  );
}

const missingTodo = todos[10];
if (missingTodo === undefined) {
  console.log("索引 10 的位置是空的");
}

// Try it: remove the `//` on the next line, then run
//   bun check day-02-type-system/examples/05-todo.ts
// const wrongPriority: Todo = { id: 4, title: "繳電費", done: false, priority: "urgent" };
