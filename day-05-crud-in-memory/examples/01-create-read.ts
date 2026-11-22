// Run from the project root:
//   bun run day-05-crud-in-memory/examples/01-create-read.ts

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// What the caller provides when creating a todo. `id` and `done` are left
// out on purpose: the caller does not decide them, createTodo does.
type NewTodo = { title: string; priority: Priority };

// Works out the id for the next todo: the largest id so far, plus 1.
function nextId(todos: readonly Todo[]): number {
  let maxId = 0;
  for (const todo of todos) {
    if (todo.id > maxId) {
      maxId = todo.id;
    }
  }
  return maxId + 1;
}

// C = Create: returns a NEW array with one more todo at the end.
function createTodo(todos: readonly Todo[], input: NewTodo): Todo[] {
  const todo: Todo = {
    id: nextId(todos),
    title: input.title,
    done: false,
    priority: input.priority,
  };
  return [...todos, todo];
}

// R = Read: returns the todo with this id, or undefined when there is none.
function findTodoById(todos: readonly Todo[], id: number): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

// --- Create ---------------------------------------------------------------

const empty: Todo[] = [];
console.log(nextId(empty)); // 1: nothing yet, so 0 + 1

const one = createTodo(empty, { title: "買牛奶", priority: "high" });
const two = createTodo(one, { title: "寫作業", priority: "medium" });

// Each call returned a new array. The earlier arrays did not change.
console.log(empty.length, one.length, two.length); // 0 1 2
console.log(two);

// --- Why not `todos.length + 1`? -------------------------------------------

// Imagine #1 was deleted: only #2 is left.
const afterDelete: Todo[] = [
  { id: 2, title: "寫作業", done: false, priority: "medium" },
];
console.log(afterDelete.length + 1); // 2: the same id as an existing todo!
console.log(nextId(afterDelete)); // 3: safe

// --- Read -----------------------------------------------------------------

// `found` has the type `Todo | undefined`, so check it before using it.
const found = findTodoById(two, 2);
if (found === undefined) {
  console.log("找不到 id 為 2 的待辦事項");
} else {
  // Inside this branch TypeScript knows `found` is a Todo.
  console.log(`找到了：${found.title}`);
}

const missing = findTodoById(two, 99);
console.log(missing); // undefined
