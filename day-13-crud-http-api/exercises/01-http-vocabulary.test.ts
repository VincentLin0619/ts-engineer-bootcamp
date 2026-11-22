import { describe, expect, test } from "bun:test";
import { loadExercise } from "../../support/load-exercise.ts";

const {
  crudLetterOf,
  InvalidBodyError,
  NoteNotFoundError,
  parseNewNote,
  statusCodeOf,
  statusGroupOf,
} = await loadExercise<typeof import("./01-http-vocabulary.ts")>(
  import.meta.dir,
  "01-http-vocabulary",
);

describe("練習 01：HTTP 詞彙、驗證 body、錯誤對應狀態碼", () => {
  test("crudLetterOf 把 HTTP 方法對應到 CRUD", () => {
    expect(crudLetterOf("POST")).toBe("C");
    expect(crudLetterOf("GET")).toBe("R");
    expect(crudLetterOf("PATCH")).toBe("U");
    expect(crudLetterOf("DELETE")).toBe("D");
    expect(crudLetterOf("HELLO")).toBeUndefined();
  });

  test("statusGroupOf 分辨成功、client 的錯、server 的錯", () => {
    expect(statusGroupOf(200)).toBe("success");
    expect(statusGroupOf(201)).toBe("success");
    expect(statusGroupOf(204)).toBe("success");
    expect(statusGroupOf(400)).toBe("client-error");
    expect(statusGroupOf(404)).toBe("client-error");
    expect(statusGroupOf(500)).toBe("server-error");
    expect(statusGroupOf(302)).toBeUndefined();
  });

  test("parseNewNote 接受合格的 body", () => {
    expect(parseNewNote({ text: "記得帶傘" })).toEqual({
      text: "記得帶傘",
      pinned: false,
    });
    expect(parseNewNote({ text: "記得帶傘", pinned: true })).toEqual({
      text: "記得帶傘",
      pinned: true,
    });
  });

  test("parseNewNote 拒絕不是物件的 body", () => {
    expect(() => parseNewNote("記得帶傘")).toThrow(InvalidBodyError);
    expect(() => parseNewNote(null)).toThrow("body 必須是 JSON 物件");
    expect(() => parseNewNote(42)).toThrow("body 必須是 JSON 物件");
  });

  test("parseNewNote 拒絕缺少 text 或型別不對的 body", () => {
    expect(() => parseNewNote({})).toThrow(InvalidBodyError);
    expect(() => parseNewNote({ text: 42 })).toThrow("text 必須是文字");
    expect(() => parseNewNote({ title: "記得帶傘" })).toThrow(
      "text 必須是文字",
    );
  });

  test("parseNewNote 拒絕型別不對的 pinned", () => {
    expect(() => parseNewNote({ text: "記得帶傘", pinned: "yes" })).toThrow(
      InvalidBodyError,
    );
    expect(() => parseNewNote({ text: "記得帶傘", pinned: 1 })).toThrow(
      "pinned 必須是 true 或 false",
    );
  });

  test("statusCodeOf 把錯誤對應到狀態碼", () => {
    expect(statusCodeOf(new InvalidBodyError("text 必須是文字"))).toBe(400);
    expect(statusCodeOf(new NoteNotFoundError(7))).toBe(404);
    expect(statusCodeOf(new Error("資料庫壞了"))).toBe(500);
    expect(statusCodeOf("不是 Error 物件")).toBe(500);
  });
});
