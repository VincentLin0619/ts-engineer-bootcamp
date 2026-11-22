// Run from the project root:
//   bun run day-05-crud-in-memory/examples/02-update-delete.ts

type Priority = "low" | "medium" | "high";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
};

// Every property is optional: pass only the ones you want to change.
type TodoChanges = { title?: string; done?: boolean; priority?: Priority };

// U = Update: returns a NEW array. The todo with this id is replaced by a
// copy that has the changes applied. Every other todo is kept as it is.
function updateTodo(
  todos: readonly Todo[],
  id: number,
  changes: TodoChanges,
): Todo[] {
  return todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo));
}

// D = Delete: returns a NEW array without the todo that has this id.
function deleteTodo(todos: readonly Todo[], id: number): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}

const todos: Todo[] = [
  { id: 1, title: "買牛奶", done: false, priority: "high" },
  { id: 2, title: "寫作業", done: false, priority: "medium" },
  { id: 3, title: "倒垃圾", done: false, priority: "low" },
];

// --- Update ---------------------------------------------------------------

const updated = updateTodo(todos, 2, { done: true });
console.log(updated[1]); // #2 in the new array: done is true
console.log(todos[1]); // #2 in the old array: done is still false

// The new array is a different array...
console.log(todos === updated); // false
// ...but an unchanged todo is the very same object in both arrays.
console.log(todos[0] === updated[0]); // true
// The changed todo is a new object: the old one was copied, not edited.
console.log(todos[1] === updated[1]); // false

// Several properties can change in one call.
const renamed = updateTodo(todos, 3, {
  title: "倒垃圾與回收",
  priority: "high",
});
console.log(renamed[2]);

// --- Delete ---------------------------------------------------------------

const remaining = deleteTodo(todos, 2);
console.log(remaining.map((todo) => todo.id)); // [ 1, 3 ]
console.log(todos.length); // 3: the old array still has all three

// --- An id that does not exist --------------------------------------------

// Nothing matches, so both functions return an array with the same contents.
console.log(updateTodo(todos, 99, { done: true }).length); // 3
console.log(deleteTodo(todos, 99).length); // 3
