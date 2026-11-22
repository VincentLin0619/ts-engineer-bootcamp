// Reference solution for exercise 02.

import type { Database } from "bun:sqlite";

export type Level = "easy" | "normal" | "hard";

export type Quest = {
  id: number;
  name: string;
  cleared: boolean;
  level: Level;
};

export type QuestRow = {
  id: number;
  name: string;
  cleared: number;
  level: string;
};

export function isLevel(value: string): value is Level {
  return value === "easy" || value === "normal" || value === "hard";
}

export function rowToQuest(row: QuestRow): Quest {
  // The guard narrows row.level from `string` to `Level`.
  if (!isLevel(row.level)) {
    throw new Error(`不認識的難度：${row.level}`);
  }
  return {
    id: row.id,
    name: row.name,
    cleared: row.cleared === 1,
    level: row.level,
  };
}

export function findAllQuests(db: Database): Quest[] {
  const rows = db
    .query<QuestRow, []>(
      "SELECT id, name, cleared, level FROM quests ORDER BY id",
    )
    .all();
  return rows.map((row) => rowToQuest(row));
}

export function findQuestById(db: Database, id: number): Quest | undefined {
  const row = db
    .query<QuestRow, [number]>(
      "SELECT id, name, cleared, level FROM quests WHERE id = ?",
    )
    .get(id);
  // The database says "no row" with null; the program uses undefined.
  return row === null ? undefined : rowToQuest(row);
}

export function setCleared(
  db: Database,
  id: number,
  cleared: boolean,
): boolean {
  const result = db
    .query("UPDATE quests SET cleared = ? WHERE id = ?")
    .run(cleared ? 1 : 0, id);
  return result.changes > 0;
}
