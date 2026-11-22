import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const { findAllQuests, findQuestById, isLevel, rowToQuest, setCleared } =
  await loadExercise<typeof import("./02-row-mapping.ts")>(
    import.meta.dir,
    "02-row-mapping",
  );

type RawQuestRow = { id: number; name: string; cleared: number; level: string };

// Every test gets its own in-memory database with the `quests` table.
function createDatabase(): Database {
  const db = new Database(":memory:");
  db.run(`
    CREATE TABLE IF NOT EXISTS quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cleared INTEGER NOT NULL DEFAULT 0,
      level TEXT NOT NULL
    )
  `);
  return db;
}

function addRow(
  db: Database,
  name: string,
  cleared: number,
  level: string,
): void {
  db.query("INSERT INTO quests (name, cleared, level) VALUES (?, ?, ?)").run(
    name,
    cleared,
    level,
  );
}

function readRows(db: Database): RawQuestRow[] {
  return db
    .query<RawQuestRow, []>(
      "SELECT id, name, cleared, level FROM quests ORDER BY id",
    )
    .all();
}

describe("練習 02：把資料列轉成物件", () => {
  test("isLevel 只接受三個難度", () => {
    expect(isLevel("easy")).toBe(true);
    expect(isLevel("normal")).toBe(true);
    expect(isLevel("hard")).toBe(true);
    expect(isLevel("insane")).toBe(false);
    expect(isLevel("")).toBe(false);
    expect(isLevel("Easy")).toBe(false);
  });

  test("rowToQuest 把 cleared 的 1／0 轉成 true／false", () => {
    expect(
      rowToQuest({ id: 1, name: "打史萊姆", cleared: 1, level: "easy" }),
    ).toEqual({ id: 1, name: "打史萊姆", cleared: true, level: "easy" });
    expect(
      rowToQuest({ id: 2, name: "屠龍", cleared: 0, level: "hard" }),
    ).toEqual({ id: 2, name: "屠龍", cleared: false, level: "hard" });
  });

  test("rowToQuest 遇到不認識的難度時丟出錯誤", () => {
    expect(() =>
      rowToQuest({ id: 2, name: "屠龍", cleared: 0, level: "insane" }),
    ).toThrow("不認識的難度：insane");
  });

  test("findAllQuests 讀出所有任務並依 id 排序", () => {
    const db = createDatabase();
    expect(findAllQuests(db)).toEqual([]);

    addRow(db, "打史萊姆", 1, "easy");
    addRow(db, "護送商隊", 0, "normal");

    expect(findAllQuests(db)).toEqual([
      { id: 1, name: "打史萊姆", cleared: true, level: "easy" },
      { id: 2, name: "護送商隊", cleared: false, level: "normal" },
    ]);
  });

  test("findAllQuests 遇到壞掉的資料列時丟出錯誤", () => {
    const db = createDatabase();
    addRow(db, "打史萊姆", 1, "easy");
    addRow(db, "屠龍", 0, "insane");

    expect(() => findAllQuests(db)).toThrow("不認識的難度：insane");
  });

  test("findQuestById 找到時回傳任務，找不到時回傳 undefined", () => {
    const db = createDatabase();
    addRow(db, "打史萊姆", 1, "easy");
    addRow(db, "護送商隊", 0, "normal");

    expect(findQuestById(db, 2)).toEqual({
      id: 2,
      name: "護送商隊",
      cleared: false,
      level: "normal",
    });
    expect(findQuestById(db, 99)).toBeUndefined();
  });

  test("setCleared 把 boolean 存成 1 或 0，並回傳有沒有改到", () => {
    const db = createDatabase();
    addRow(db, "打史萊姆", 0, "easy");
    addRow(db, "護送商隊", 1, "normal");

    expect(setCleared(db, 1, true)).toBe(true);
    expect(setCleared(db, 2, false)).toBe(true);
    expect(setCleared(db, 99, true)).toBe(false);

    expect(readRows(db)).toEqual([
      { id: 1, name: "打史萊姆", cleared: 1, level: "easy" },
      { id: 2, name: "護送商隊", cleared: 0, level: "normal" },
    ]);
  });
});
