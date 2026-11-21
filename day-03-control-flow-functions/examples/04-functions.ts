// Run from the project root:
//   bun run day-03-control-flow-functions/examples/04-functions.ts

// Function declaration: a named block of code with inputs and one output.
function add(first: number, second: number): number {
  return first + second;
}

// Calling the function runs its body. The call becomes the returned value.
const sum = add(2, 3);
console.log(sum);
console.log(add(10, 20));

// A function that returns nothing has the return type `void`.
function printLine(text: string): void {
  console.log(`> ${text}`);
}

printLine("哈囉");

// Arrow function: another way to write a function, stored in a const.
const double = (value: number): number => {
  return value * 2;
};

// When the body is one expression, the braces and `return` can be dropped.
const triple = (value: number): number => value * 3;

console.log(double(4), triple(4));

// Default parameter: used when the caller leaves that value out.
function greet(name: string, greeting: string = "你好"): string {
  return `${greeting}，${name}`;
}

console.log(greet("小明"));
console.log(greet("小明", "早安"));

// Scope: a variable only exists inside the braces where it is declared.
const taxRate = 0.05; // declared at the top level: visible in the whole file

function addTax(price: number): number {
  console.log("    進入 addTax");
  const tax = price * taxRate; // `tax` only exists inside addTax
  console.log("    離開 addTax");
  return price + tax;
}

// Try it: remove the `//` on the next line, then run
//   bun check day-03-control-flow-functions/examples/04-functions.ts
// console.log(tax);

// Call stack: formatPrice calls addTax, and waits until addTax returns.
function formatPrice(price: number): string {
  console.log("  進入 formatPrice");
  const total = addTax(price);
  console.log("  離開 formatPrice");
  return `含稅 ${total} 元`;
}

console.log("主程式開始");
console.log(formatPrice(100));
console.log("主程式結束");
