// Exercise 02: turn database rows into program objects.
//
// The table `quests` already exists when your functions are called:
//
//   id       INTEGER PRIMARY KEY AUTOINCREMENT
//   name     TEXT NOT NULL
//   cleared  INTEGER NOT NULL DEFAULT 0     (0 or 1)
//   level    TEXT NOT NULL                  (should be easy / normal / hard)
//
// In the program a quest looks different: `cleared` is a boolean and
// `level` is one of three exact words.

import type { Database } from "bun:sqlite";

export type Level = "easy" | "normal" | "hard";

// A quest as the program wants it.
export type Quest = {
  id: number;
  name: string;
  cleared: boolean;
  level: Level;
};

// A quest as the database returns it.
export type QuestRow = {
  id: number;
  name: string;
  cleared: number;
  level: string;
};

// Type guard: true only for "easy", "normal" and "hard".
// isLevel("hard")   -> true
// isLevel("insane") -> false
export function isLevel(value: string): value is Level {
  // TODO: compare the value with the three allowed words
  throw new Error("TODO：尚未完成 isLevel");
}

// Convert one row. cleared: 1 -> true, 0 -> false.
// An unknown level must throw new Error(`不認識的難度：${row.level}`).
// rowToQuest({ id: 1, name: "打史萊姆", cleared: 1, level: "easy" })
//   -> { id: 1, name: "打史萊姆", cleared: true, level: "easy" }
// rowToQuest({ id: 2, name: "屠龍", cleared: 0, level: "insane" })
//   -> throws Error("不認識的難度：insane")
export function rowToQuest(row: QuestRow): Quest {
  // TODO: check the level with isLevel, then build the Quest
  throw new Error("TODO：尚未完成 rowToQuest");
}

// R: every quest, ordered by id, converted with rowToQuest.
// An empty table gives [].
export function findAllQuests(db: Database): Quest[] {
  // TODO: SELECT id, name, cleared, level FROM quests ORDER BY id
  throw new Error("TODO：尚未完成 findAllQuests");
}

// R: one quest, or undefined when no quest has that id.
// Remember: get() returns null, but this function returns undefined.
export function findQuestById(db: Database, id: number): Quest | undefined {
  // TODO: SELECT ... WHERE id = ?
  throw new Error("TODO：尚未完成 findQuestById");
}

// U: store whether a quest is cleared. The boolean must go into the
// database as 1 or 0. Return true when a row was changed.
// setCleared(db, 1, true)  -> true, and the row now has cleared = 1
// setCleared(db, 99, true) -> false
export function setCleared(
  db: Database,
  id: number,
  cleared: boolean,
): boolean {
  // TODO: UPDATE quests SET cleared = ? WHERE id = ?
  throw new Error("TODO：尚未完成 setCleared");
}
