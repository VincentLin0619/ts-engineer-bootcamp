// Reference solution for exercise 02.

export interface StockRepository {
  findQuantity(product: string): number | undefined;
  saveQuantity(product: string, quantity: number): void;
}

type StockRow = { product: string; quantity: number };

export class InMemoryStockRepository implements StockRepository {
  #rows: StockRow[] = [];

  findQuantity(product: string): number | undefined {
    const row = this.#rows.find((item) => item.product === product);
    if (row === undefined) {
      return undefined;
    }
    return row.quantity;
  }

  saveQuantity(product: string, quantity: number): void {
    const otherRows = this.#rows.filter((item) => item.product !== product);
    this.#rows = [...otherRows, { product, quantity }];
  }
}

export class UnknownProductError extends Error {
  readonly product: string;

  constructor(product: string) {
    super(`沒有這項商品：${product}`);
    this.name = "UnknownProductError";
    this.product = product;
  }
}

export class OutOfStockError extends Error {
  readonly available: number;

  constructor(product: string, available: number) {
    super(`${product}庫存不足，只剩 ${available} 件`);
    this.name = "OutOfStockError";
    this.available = available;
  }
}

export class ShopService {
  // Composition: the service HAS a repository.
  readonly #repository: StockRepository;

  constructor(repository: StockRepository) {
    this.#repository = repository;
  }

  restock(product: string, quantity: number): number {
    const current = this.#repository.findQuantity(product);
    const updated = (current === undefined ? 0 : current) + quantity;
    this.#repository.saveQuantity(product, updated);
    return updated;
  }

  sell(product: string, quantity: number): number {
    const current = this.#repository.findQuantity(product);
    if (current === undefined) {
      throw new UnknownProductError(product);
    }
    if (current < quantity) {
      throw new OutOfStockError(product, current);
    }
    // Both checks passed. Only now is anything saved.
    const remaining = current - quantity;
    this.#repository.saveQuantity(product, remaining);
    return remaining;
  }
}
