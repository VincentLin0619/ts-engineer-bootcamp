import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";
import type { StockRepository } from "./02-shop-service.ts";

const {
  InMemoryStockRepository,
  OutOfStockError,
  ShopService,
  UnknownProductError,
} = await loadExercise<typeof import("./02-shop-service.ts")>(
  import.meta.dir,
  "02-shop-service",
);

// A fake repository written only for these tests. It always reports the
// same quantity and remembers every save. ShopService accepts it because
// it asks for the StockRepository interface, not for one specific class.
class RecordingStockRepository implements StockRepository {
  readonly saved: string[] = [];
  #quantity: number | undefined;

  constructor(quantity: number | undefined) {
    this.#quantity = quantity;
  }

  findQuantity(): number | undefined {
    return this.#quantity;
  }

  saveQuantity(product: string, quantity: number): void {
    this.saved.push(`${product}=${quantity}`);
  }
}

// Runs a function and hands back whatever it throws.
function thrownBy(run: () => void): unknown {
  try {
    run();
  } catch (error) {
    return error;
  }
  return undefined;
}

describe("練習 02：自訂錯誤類別", () => {
  test("UnknownProductError 帶著訊息、名稱與商品", () => {
    const error = new UnknownProductError("珍珠奶茶");
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("沒有這項商品：珍珠奶茶");
    expect(error.name).toBe("UnknownProductError");
    expect(error.product).toBe("珍珠奶茶");
  });

  test("OutOfStockError 帶著訊息、名稱與剩餘數量", () => {
    const error = new OutOfStockError("紅茶", 2);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("紅茶庫存不足，只剩 2 件");
    expect(error.name).toBe("OutOfStockError");
    expect(error.available).toBe(2);
  });

  test("兩種錯誤可以用 instanceof 與 name 分辨", () => {
    const error: Error = new OutOfStockError("紅茶", 2);
    expect(error).toBeInstanceOf(OutOfStockError);
    expect(error).not.toBeInstanceOf(UnknownProductError);
    expect(error.name).not.toBe(new UnknownProductError("紅茶").name);
  });
});

describe("練習 02：ShopService", () => {
  test("restock 累加庫存，新商品從 0 開始", () => {
    const service = new ShopService(new InMemoryStockRepository());
    expect(service.restock("紅茶", 10)).toBe(10);
    expect(service.restock("紅茶", 5)).toBe(15);
    expect(service.restock("綠茶", 3)).toBe(3);
  });

  test("sell 扣掉庫存並回傳剩下的數量", () => {
    const service = new ShopService(new InMemoryStockRepository());
    service.restock("紅茶", 10);
    expect(service.sell("紅茶", 4)).toBe(6);
    expect(service.sell("紅茶", 6)).toBe(0);
  });

  test("sell 遇到沒有的商品丟出 UnknownProductError", () => {
    const service = new ShopService(new InMemoryStockRepository());
    const error = thrownBy(() => service.sell("珍珠奶茶", 1));
    expect(error).toBeInstanceOf(UnknownProductError);
    expect(error).toMatchObject({ product: "珍珠奶茶" });
  });

  test("sell 庫存不足時丟出 OutOfStockError，庫存不變", () => {
    const service = new ShopService(new InMemoryStockRepository());
    service.restock("紅茶", 2);
    const error = thrownBy(() => service.sell("紅茶", 3));
    expect(error).toBeInstanceOf(OutOfStockError);
    expect(error).toMatchObject({ available: 2 });
    expect(service.sell("紅茶", 2)).toBe(0);
  });

  test("庫存存在傳進來的 Repository 裡，不在 ShopService 自己身上", () => {
    const repository = new InMemoryStockRepository();
    const morningShift = new ShopService(repository);
    const eveningShift = new ShopService(repository);
    morningShift.restock("紅茶", 10);
    expect(eveningShift.sell("紅茶", 3)).toBe(7);
    expect(repository.findQuantity("紅茶")).toBe(7);
  });

  test("可以注入別的 Repository：成功時存一次", () => {
    const repository = new RecordingStockRepository(10);
    const service = new ShopService(repository);
    expect(service.sell("紅茶", 4)).toBe(6);
    expect(repository.saved).toEqual(["紅茶=6"]);
  });

  test("可以注入別的 Repository：失敗時什麼都不存", () => {
    const lowStock = new RecordingStockRepository(1);
    expect(() => new ShopService(lowStock).sell("紅茶", 5)).toThrow(
      "紅茶庫存不足，只剩 1 件",
    );
    expect(lowStock.saved).toEqual([]);

    const unknown = new RecordingStockRepository(undefined);
    expect(() => new ShopService(unknown).sell("紅茶", 5)).toThrow(
      "沒有這項商品：紅茶",
    );
    expect(unknown.saved).toEqual([]);
  });
});
