import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import { TodoNotFoundError, ValidationError } from "../examples/todo/errors.ts";
import { InMemoryTodoRepository } from "../examples/todo/in-memory-todo-repository.ts";
import { TodoService } from "../examples/todo/todo-service.ts";

const { TodoMaintenanceService } = await loadExercise<
  typeof import("./03-todo-maintenance-service.ts")
>(import.meta.dir, "03-todo-maintenance-service");

// Runs a function and hands back whatever it throws.
function thrownBy(run: () => void): unknown {
  try {
    run();
  } catch (error) {
    return error;
  }
  return undefined;
}

// Two services that share one repository.
function setUp() {
  const repository = new InMemoryTodoRepository();
  return {
    repository,
    todoService: new TodoService(repository),
    maintenance: new TodoMaintenanceService(repository),
  };
}

describe("練習 03（加練）：TodoMaintenanceService", () => {
  test("summary 統計全部、未完成、已完成的筆數", () => {
    const { todoService, maintenance } = setUp();
    expect(maintenance.summary()).toEqual({ total: 0, open: 0, done: 0 });

    todoService.add("買牛奶");
    todoService.add("寫報告");
    todoService.add("倒垃圾");
    todoService.complete(1);
    expect(maintenance.summary()).toEqual({ total: 3, open: 2, done: 1 });
  });

  test("reopen 把已完成改回未完成，而且有存回 Repository", () => {
    const { repository, todoService, maintenance } = setUp();
    todoService.add("買牛奶");
    todoService.complete(1);

    const reopened = maintenance.reopen(1);
    expect(reopened.id).toBe(1);
    expect(reopened.done).toBe(false);
    expect(repository.findById(1)?.done).toBe(false);
  });

  test("reopen 遇到本來就未完成的，原樣回傳", () => {
    const { todoService, maintenance } = setUp();
    todoService.add("買牛奶");
    expect(maintenance.reopen(1).done).toBe(false);
  });

  test("reopen 找不到 id 時丟出 TodoNotFoundError", () => {
    const { maintenance } = setUp();
    const error = thrownBy(() => maintenance.reopen(99));
    expect(error).toBeInstanceOf(TodoNotFoundError);
    expect(error).toMatchObject({ id: 99 });
  });

  test("reopen 會造成兩筆未完成的同名待辦事項時丟出 ValidationError", () => {
    const { repository, todoService, maintenance } = setUp();
    todoService.add("買牛奶"); // #1
    todoService.complete(1);
    todoService.add("買牛奶"); // #2, allowed: #1 is done

    const error = thrownBy(() => maintenance.reopen(1));
    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ message: "已經有一筆未完成的「買牛奶」" });
    expect(repository.findById(1)?.done).toBe(true);
  });

  test("reopen 不會把自己當成同名的另一筆", () => {
    const { todoService, maintenance } = setUp();
    todoService.add("買牛奶");
    todoService.add("寫報告");
    todoService.complete(1);
    expect(maintenance.reopen(1).done).toBe(false);
  });

  test("clearDone 刪掉所有已完成的，回傳刪了幾筆", () => {
    const { todoService, maintenance } = setUp();
    todoService.add("買牛奶");
    todoService.add("寫報告");
    todoService.add("倒垃圾");
    todoService.complete(1);
    todoService.complete(3);

    expect(maintenance.clearDone()).toBe(2);
    expect(todoService.list().map((todo) => todo.title)).toEqual(["寫報告"]);
    expect(maintenance.clearDone()).toBe(0);
    expect(maintenance.summary()).toEqual({ total: 1, open: 1, done: 0 });
  });
});
