// Run from the project root:
//   bun run day-06-modules-errors-testing/examples/02-import.ts

// `import type` brings in something that only exists for type checking.
// It is removed completely before the program runs.
import type { Product } from "./01-price-utils.ts";
// `import` brings in values: functions and constants that exist at run time.
// The path is relative to this file and includes the `.ts` extension.
import { formatPrice, priceWithTax, TAX_RATE } from "./01-price-utils.ts";

const milk: Product = { name: "牛奶", price: 65 };
const bread: Product = { name: "吐司", price: 40 };

console.log(`稅率：${TAX_RATE}`);

for (const product of [milk, bread]) {
  const total = priceWithTax(product.price);
  console.log(`${product.name} 含稅 ${formatPrice(total)}`);
}

// Try it: add `roundToInteger` to the import list above, then run
//   bun check day-06-modules-errors-testing/examples/02-import.ts
// You will see error TS2459: the function exists in 01-price-utils.ts, but
// it is not exported. Remove it again when you are done.
