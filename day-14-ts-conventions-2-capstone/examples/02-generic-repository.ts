// Run from the project root:
//   bun run day-14-ts-conventions-2-capstone/examples/02-generic-repository.ts
//
// One generic contract, filled in twice: once for Todo, once for Tag.
import { InMemoryTodoRepository } from "./todo/in-memory-todo-repository.ts";
import type { Repository, TodoRepository } from "./todo/todo-repository.ts";

// --- Fill-in 1: the mainline ---
// TodoRepository is Repository<Todo, NewTodo>. InMemoryTodoRepository was
// written on Day 09 and did not change today.
const todoRepository: TodoRepository = new InMemoryTodoRepository();

// --- Fill-in 2: a brand-new kind of data ---
type Tag = { id: number; name: string };
type NewTag = { name: string };

// Repository<Tag, NewTag> means: read every TEntity as Tag and every TNew
// as NewTag. `implements` then checks all five methods against that.
class InMemoryTagRepository implements Repository<Tag, NewTag> {
  #tags: Tag[] = [];
  #nextId = 1;

  async create(input: NewTag): Promise<Tag> {
    const tag: Tag = { id: this.#nextId, name: input.name };
    this.#nextId += 1;
    this.#tags.push(tag);
    return tag;
  }

  async findAll(): Promise<Tag[]> {
    return [...this.#tags];
  }

  async findById(id: number): Promise<Tag | undefined> {
    return this.#tags.find((tag) => tag.id === id);
  }

  async save(entity: Tag): Promise<void> {
    this.#tags = this.#tags.map((tag) => (tag.id === entity.id ? entity : tag));
  }

  async delete(id: number): Promise<boolean> {
    const remaining = this.#tags.filter((tag) => tag.id !== id);
    const deleted = remaining.length < this.#tags.length;
    this.#tags = remaining;
    return deleted;
  }
}

const tagRepository = new InMemoryTagRepository();

// Same method names, different types flowing through them.
const todo = await todoRepository.create({ title: "買牛奶", priority: "high" });
const tag = await tagRepository.create({ name: "家事" });
await tagRepository.create({ name: "學校" });

console.log(`待辦事項：${todo.id}. ${todo.title}`);
console.log(`標籤：${tag.id}. ${tag.name}`);

const allTags = await tagRepository.findAll(); // Tag[]
console.log(
  "所有標籤：",
  allTags.map((item) => item.name),
);

console.log("刪除 1 號標籤：", await tagRepository.delete(1));
console.log("再刪一次：", await tagRepository.delete(1));

// Each fill-in is checked separately: a tag has no title.
// Try it: delete the `@ts-expect-error` line, then run bun check on this file.
// @ts-expect-error -- TS2353: Object literal may only specify known properties, and 'title' does not exist in type 'NewTag'.
await tagRepository.create({ title: "買牛奶" });
console.log("標籤數量：", (await tagRepository.findAll()).length);
