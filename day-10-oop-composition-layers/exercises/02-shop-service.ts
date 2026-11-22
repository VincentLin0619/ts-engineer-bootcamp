// Exercise 02: custom error classes, composition and constructor injection.
//
// Change the lines marked TODO, then run: bun test day-10
//
//   const service = new ShopService(new InMemoryStockRepository());
//   service.restock("紅茶", 10)   -> 10
//   service.restock("紅茶", 5)    -> 15
//   service.sell("紅茶", 4)       -> 11
//   service.sell("紅茶", 50)      // throws OutOfStockError, available is 11
//   service.sell("珍珠奶茶", 1)   // throws UnknownProductError

// ----- Given: this part is complete, do not change it -----

// The contract for the place where stock quantities are kept.
export interface StockRepository {
  // The quantity in stock, or undefined when the product is unknown.
  findQuantity(product: string): number | undefined;
  // Store the quantity of a product. An unknown product is added.
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

// ----- Part 1: two custom error classes -----

// Thrown when a product has never been stocked.
//
//   const error = new UnknownProductError("珍珠奶茶");
//   error.message  -> "沒有這項商品：珍珠奶茶"
//   error.name     -> "UnknownProductError"
//   error.product  -> "珍珠奶茶"
export class UnknownProductError extends Error {
  readonly product: string;

  constructor(product: string) {
    // TODO: pass the right message to super(...)
    super("TODO：尚未完成 UnknownProductError");
    // TODO: set this.name to "UnknownProductError"
    // TODO: store the product that was passed in, not an empty string
    this.product = "";
  }
}

// Thrown when there is less in stock than the customer wants.
//
//   const error = new OutOfStockError("紅茶", 2);
//   error.message    -> "紅茶庫存不足，只剩 2 件"
//   error.name       -> "OutOfStockError"
//   error.available  -> 2
export class OutOfStockError extends Error {
  readonly available: number;

  constructor(product: string, available: number) {
    // TODO: pass the right message to super(...)
    super("TODO：尚未完成 OutOfStockError");
    // TODO: set this.name to "OutOfStockError"
    // TODO: store the available quantity that was passed in, not -1
    this.available = -1;
  }
}

// ----- Part 2: a service composed with a repository -----

export class ShopService {
  // TODO: declare a private field that holds the repository

  // Constructor injection: the repository comes from outside.
  // Do not write `new InMemoryStockRepository()` inside this class.
  constructor(repository: StockRepository) {
    // TODO: keep the repository in the private field
    throw new Error("TODO：尚未完成 ShopService 的建構子");
  }

  // Add `quantity` pieces of a product and return the new quantity in
  // stock. A product that is not known yet starts from 0.
  restock(product: string, quantity: number): number {
    // TODO: find the current quantity, add to it, save it, return it
    throw new Error("TODO：尚未完成 restock");
  }

  // Sell `quantity` pieces of a product and return what is left.
  // - The product is unknown: throw new UnknownProductError(product)
  // - Less in stock than `quantity`:
  //     throw new OutOfStockError(product, <the quantity in stock>)
  // When it throws, nothing may be saved.
  sell(product: string, quantity: number): number {
    // TODO: find, check both rules, save, return
    throw new Error("TODO：尚未完成 sell");
  }
}
