// Run from the project root:
//   bun run day-08-oop-classes/examples/03-private-and-getters.ts
//
// Encapsulation: `#` private fields, getters, `readonly`, and a constructor
// that refuses invalid data.

function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error("標題不可以是空的");
  }
  if (trimmed.length > 100) {
    throw new Error("標題不可以超過 100 個字");
  }
  return trimmed;
}

class Todo {
  // readonly: assigned once in the constructor, never again.
  readonly id: number;
  // `#` makes a field private: only code inside this class can use it.
  #title: string;
  #done = false;

  constructor(id: number, title: string) {
    this.id = id;
    // The rule is checked before the instance exists.
    this.#title = validateTitle(title);
  }

  // A getter looks like a property from outside: `todo.title`, no ().
  get title(): string {
    return this.#title;
  }

  get done(): boolean {
    return this.#done;
  }

  // Changing the title has to go through this method, which checks the rule.
  rename(title: string): void {
    this.#title = validateTitle(title);
  }

  complete(): void {
    this.#done = true;
  }
}

const milk = new Todo(1, "  買牛奶  ");
console.log(`「${milk.title}」`); // trimmed by the constructor
console.log(milk.done);

milk.rename("買低脂牛奶");
milk.complete();
console.log(milk.title, milk.done);

// 1. An invalid Todo cannot be created at all.
try {
  new Todo(2, "   ");
} catch (error) {
  if (error instanceof Error) {
    console.log(`建立失敗：${error.message}`);
  }
}

// 2. An invalid title cannot get in through rename() either.
try {
  milk.rename("");
} catch (error) {
  if (error instanceof Error) {
    console.log(`改名失敗：${error.message}`);
  }
}
console.log(milk.title); // still the last valid title

// 3. Try it: remove the `//` on one of the next three lines, then run
//      bun check day-08-oop-classes/examples/03-private-and-getters.ts
//    Put the `//` back when you are done.
// milk.#title = ""; // TS18013: '#title' is not accessible outside class 'Todo'
// milk.title = ""; // TS2540: 'title' is a read-only property (getter only)
// milk.id = 99; // TS2540: 'id' is a read-only property (readonly)

// 4. `#` versus the `private` keyword.
class KeywordSafe {
  private pin = "1234";

  check(guess: string): boolean {
    return guess === this.pin;
  }
}

class HashSafe {
  #pin = "1234";

  check(guess: string): boolean {
    return guess === this.#pin;
  }
}

const keywordSafe = new KeywordSafe();
const hashSafe = new HashSafe();
console.log(keywordSafe.check("1234"), hashSafe.check("1234"));

// `private` is only checked by TypeScript. Types are removed before the
// program runs, so at run time `pin` is an ordinary property: it shows up
// when the whole instance is printed.
console.log(keywordSafe);

// `#` is part of JavaScript itself: `#pin` stays hidden at run time.
console.log(hashSafe);

// @ts-expect-error -- TS2341: Property 'pin' is private and only accessible within class 'KeywordSafe'.
console.log(keywordSafe.pin); // "1234": the type error did not stop it
