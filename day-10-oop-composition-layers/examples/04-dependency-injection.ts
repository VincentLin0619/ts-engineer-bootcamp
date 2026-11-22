// Run from the project root:
//   bun run day-10-oop-composition-layers/examples/04-dependency-injection.ts
//
// Constructor injection: TodoService receives its repository from outside,
// so the repository can be swapped without touching TodoService.

import { TodoNotFoundError, ValidationError } from "./todo/errors.ts";
import { InMemoryTodoRepository } from "./todo/in-memory-todo-repository.ts";
import type { Todo } from "./todo/todo.ts";
import type { NewTodo, TodoRepository } from "./todo/todo-repository.ts";
import { TodoService } from "./todo/todo-service.ts";

// A second TodoRepository, built by composition: it holds another
// repository, prints every call, and passes the call on.
class LoggingTodoRepository implements TodoRepository {
  readonly #inner: TodoRepository;

  constructor(inner: TodoRepository) {
    this.#inner = inner;
  }

  create(input: NewTodo): Todo {
    console.log(`    [repository] create(「${input.title}」)`);
    return this.#inner.create(input);
  }

  findAll(): Todo[] {
    console.log("    [repository] findAll()");
    return this.#inner.findAll();
  }

  findById(id: number): Todo | undefined {
    console.log(`    [repository] findById(${id})`);
    return this.#inner.findById(id);
  }

  save(todo: Todo): void {
    console.log(`    [repository] save(#${todo.id}，done: ${todo.done})`);
    this.#inner.save(todo);
  }

  delete(id: number): boolean {
    console.log(`    [repository] delete(${id})`);
    return this.#inner.delete(id);
  }
}

// Runs one action and prints how it ended. `run` is a function passed in
// as an argument, like the functions given to map() and filter().
function report(action: string, run: () => void): void {
  try {
    run();
    console.log(`  ${action}：成功`);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log(`  ${action}：ValidationError，${error.message}`);
    } else if (error instanceof TodoNotFoundError) {
      console.log(`  ${action}：TodoNotFoundError，id 是 ${error.id}`);
    } else {
      throw error;
    }
  }
}

// 1. Inject the in-memory repository and try the service-level rules.
console.log("1. TodoService 搭配 InMemoryTodoRepository");
const service = new TodoService(new InMemoryTodoRepository());

report("新增「買牛奶」", () => service.add("買牛奶"));
report("再新增一次「買牛奶」", () => service.add("  買牛奶  "));
report("新增空白標題", () => service.add("   "));
report("完成 #1", () => service.complete(1));
report("#1 完成後再新增「買牛奶」", () => service.add("買牛奶"));
report("完成 #99", () => service.complete(99));
report("刪除 #99", () => service.remove(99));

for (const todo of service.list("open")) {
  console.log(`  未完成：#${todo.id} ${todo.title}`);
}

// 2. Inject a different repository. TodoService is the same class, not a
//    single line of it changed, and now every call it makes is visible.
console.log("2. 同一個 TodoService 搭配 LoggingTodoRepository");
const loggedService = new TodoService(
  new LoggingTodoRepository(new InMemoryTodoRepository()),
);

console.log("  service.add(「寫報告」)");
loggedService.add("寫報告");

console.log("  service.complete(1)");
loggedService.complete(1);

console.log("  service.remove(1)");
loggedService.remove(1);
