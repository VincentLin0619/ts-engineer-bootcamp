// Run from the project root:
//   bun run day-10-oop-composition-layers/examples/02-inheritance-vs-composition.ts
//
// Two ways to give a service access to stored todos: inherit from the
// repository, or hold a repository in a field.

import { ValidationError } from "./todo/errors.ts";
import { InMemoryTodoRepository } from "./todo/in-memory-todo-repository.ts";
import type { Todo } from "./todo/todo.ts";
import type { TodoRepository } from "./todo/todo-repository.ts";

function countTitle(todos: readonly Todo[], title: string): number {
  return todos.filter((todo) => todo.title === title).length;
}

// Attempt 1: inheritance.
// "The service needs create() and findAll(). The repository already has
// them. So let the service extend the repository."
class InheritedTodoService extends InMemoryTodoRepository {
  // The rule this service wants to protect: no two open todos may share
  // a title.
  add(title: string): Todo {
    const duplicate = this.findAll().some(
      (todo) => !todo.done && todo.title === title,
    );
    if (duplicate) {
      throw new ValidationError(`已經有一筆未完成的「${title}」`);
    }
    return this.create({ title, priority: "medium" });
  }
}

console.log("--- 繼承 ---");
const inherited = new InheritedTodoService();
inherited.add("買牛奶");

try {
  inherited.add("買牛奶");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`add() 擋下來了：${error.message}`);
  }
}

// Problem 1: inheritance takes EVERYTHING. create(), save() and delete()
// are public methods of the service now, and they skip the rule.
inherited.create({ title: "買牛奶", priority: "medium" });
console.log(
  `create() 繞過了規則：「買牛奶」有 ${countTitle(inherited.findAll(), "買牛奶")} 筆`,
);

// Problem 2: the service IS an InMemoryTodoRepository, for good. Moving
// the data to a file or a database means rewriting the service.

// Attempt 2: composition.
// The service HAS a repository, kept in a private field, and offers only
// the methods it chooses to offer.
class ComposedTodoService {
  readonly #repository: TodoRepository;

  constructor(repository: TodoRepository) {
    this.#repository = repository;
  }

  add(title: string): Todo {
    const duplicate = this.#repository
      .findAll()
      .some((todo) => !todo.done && todo.title === title);
    if (duplicate) {
      throw new ValidationError(`已經有一筆未完成的「${title}」`);
    }
    return this.#repository.create({ title, priority: "medium" });
  }

  countTitle(title: string): number {
    return countTitle(this.#repository.findAll(), title);
  }
}

console.log("--- 組合 ---");
const composed = new ComposedTodoService(new InMemoryTodoRepository());
composed.add("買牛奶");

try {
  composed.add("買牛奶");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`add() 擋下來了：${error.message}`);
  }
}

// There is no way around add(): the repository is private.
console.log(`沒有別的入口：「買牛奶」有 ${composed.countTitle("買牛奶")} 筆`);

// Try it: remove the `//` on the next line, then run
//   bun check day-10-oop-composition-layers/examples/02-inheritance-vs-composition.ts
// TS2339: Property 'create' does not exist on type 'ComposedTodoService'.
// composed.create({ title: "買牛奶", priority: "medium" });
