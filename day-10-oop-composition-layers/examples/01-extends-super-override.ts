// Run from the project root:
//   bun run day-10-oop-composition-layers/examples/01-extends-super-override.ts
//
// Inheritance: a class built on top of another class with `extends`,
// `super` and `override`.

// The parent class (also called the base class).
class Member {
  readonly name: string;
  #points = 0;

  constructor(name: string) {
    this.name = name;
  }

  get points(): number {
    return this.#points;
  }

  // How many points a purchase earns: 1 point per dollar.
  pointsFor(amount: number): number {
    return amount;
  }

  spend(amount: number): void {
    // `this.pointsFor` runs the version of the instance's own class.
    this.#points = this.#points + this.pointsFor(amount);
  }

  describe(): string {
    return `${this.name}：${this.#points} 點`;
  }
}

// The child class (also called the subclass). `extends Member` gives it
// everything Member has: name, points, pointsFor(), spend(), describe().
class VipMember extends Member {
  // Something new that only VIP members have.
  readonly since: number;

  constructor(name: string, since: number) {
    // super(...) runs the parent's constructor. It must come first:
    // `this` does not exist before the parent has set up its part.
    super(name);
    this.since = since;
  }

  // `override` says: "I am replacing a method of the parent on purpose."
  // super.pointsFor(...) calls the parent's version, then this one doubles it.
  override pointsFor(amount: number): number {
    return super.pointsFor(amount) * 2;
  }

  override describe(): string {
    return `[VIP] ${super.describe()}（${this.since} 年加入）`;
  }

  // A brand-new method: no `override`, the parent has nothing by this name.
  freeParkingHours(): number {
    return 2;
  }
}

const regular = new Member("小明");
const vip = new VipMember("小華", 2024);

// spend() is written once, in Member. For the VIP it uses the overridden
// pointsFor(), so the same purchase earns twice the points.
regular.spend(500);
vip.spend(500);
console.log(regular.describe());
console.log(vip.describe());

// Only the child has the new members.
console.log(vip.freeParkingHours(), vip.since);

// A VipMember IS a Member: it can go wherever a Member is expected.
function printPoints(member: Member): void {
  console.log(`${member.name} 有 ${member.points} 點`);
}

printPoints(regular);
printPoints(vip);

// instanceof follows the family line.
console.log(vip instanceof VipMember, vip instanceof Member); // true true
console.log(regular instanceof VipMember); // false

// Try it, one at a time, each followed by
//   bun check day-10-oop-composition-layers/examples/01-extends-super-override.ts
// 1. Delete the word `override` before pointsFor  -> TS4114
// 2. Delete the line `super(name);`               -> TS2377
// Undo each change when you have read the message.
//
// Note: `#points` is private to Member itself. Even VipMember cannot touch
// it and has to go through `points`, spend() and super.describe().
