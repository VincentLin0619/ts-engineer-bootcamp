// Local study mode: a Monaco editor under each exercise file on the page.
// Changes are saved straight back to the file through site/study.ts, then
// checked with `bun check`; a button runs the exercise's `bun test`.

import { el } from "../ui.ts";
import { findPracticeSpot } from "./anchor.ts";

const MONACO = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min";
const AUTOSAVE_MS = 800;

// --- the small part of Monaco's API this file uses -------------------------

type Disposable = { dispose(): void };
type Range = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

type MonacoModel = {
  getValue(): string;
  getLineCount(): number;
  getLineMaxColumn(line: number): number;
  getFullModelRange(): Range;
  pushEditOperations(
    selections: [],
    operations: Array<{ range: Range; text: string }>,
    cursor: () => null,
  ): void;
};

type MonacoEditor = {
  onDidChangeModelContent(listener: () => void): Disposable;
  onDidBlurEditorText(listener: () => void): Disposable;
  addCommand(keybinding: number, handler: () => void): void;
  layout(): void;
  revealLineInCenter(line: number): void;
  setPosition(position: { lineNumber: number; column: number }): void;
  focus(): void;
  pushUndoStop(): void;
};

type Marker = Range & { message: string; severity: number; source: string };

type Monaco = {
  editor: {
    create(
      container: HTMLElement,
      options: Record<string, unknown>,
    ): MonacoEditor;
    createModel(value: string, language: string, uri: unknown): MonacoModel;
    setModelMarkers(model: MonacoModel, owner: string, markers: Marker[]): void;
    defineTheme(name: string, data: Record<string, unknown>): void;
    setTheme(name: string): void;
  };
  languages: {
    typescript: {
      typescriptDefaults: {
        setDiagnosticsOptions(options: Record<string, boolean>): void;
        setCompilerOptions(options: Record<string, unknown>): void;
      };
    };
  };
  // biome-ignore lint/style/useNamingConvention: Monaco's API name
  Uri: { parse(value: string): unknown };
  // biome-ignore lint/style/useNamingConvention: Monaco's API names
  KeyMod: { CtrlCmd: number };
  // biome-ignore lint/style/useNamingConvention: Monaco's API names
  KeyCode: { KeyS: number; Enter: number };
  // biome-ignore lint/style/useNamingConvention: Monaco's API names
  MarkerSeverity: { Error: number };
};

type AmdRequire = ((
  deps: string[],
  ready: () => void,
  failed?: (error: unknown) => void,
) => void) & {
  config(options: { paths: Record<string, string> }): void;
};

declare global {
  interface Window {
    monaco?: Monaco;
    require?: AmdRequire;
    // biome-ignore lint/style/useNamingConvention: name required by Monaco
    MonacoEnvironment?: { getWorkerUrl(): string };
  }
}

function loadMonaco(): Promise<Monaco> {
  return new Promise((resolve, reject) => {
    const worker = `self.MonacoEnvironment={baseUrl:"${MONACO}/"};importScripts("${MONACO}/vs/base/worker/workerMain.js");`;
    window.MonacoEnvironment = {
      getWorkerUrl: () =>
        `data:text/javascript;charset=utf-8,${encodeURIComponent(worker)}`,
    };
    const script = document.createElement("script");
    script.src = `${MONACO}/vs/loader.js`;
    script.onerror = () =>
      reject(new Error("無法載入編輯器，請確認網路連線。"));
    script.onload = () => {
      const amd = window.require;
      if (!amd) {
        reject(new Error("編輯器載入器沒有正確啟動。"));
        return;
      }
      amd.config({ paths: { vs: `${MONACO}/vs` } });
      amd(
        ["vs/editor/editor.main"],
        () =>
          window.monaco
            ? resolve(window.monaco)
            : reject(new Error("編輯器沒有正確載入。")),
        reject,
      );
    };
    document.head.append(script);
  });
}

// --- themes (Rosé Pine Moon / Dawn, matching the site) ---------------------

function defineThemes(monaco: Monaco): void {
  const rules = (palette: Record<string, string>) => [
    { token: "comment", foreground: palette.muted, fontStyle: "italic" },
    { token: "keyword", foreground: palette.pine },
    { token: "string", foreground: palette.gold },
    { token: "number", foreground: palette.rose },
    { token: "type", foreground: palette.foam },
    { token: "type.identifier", foreground: palette.foam },
    { token: "delimiter", foreground: palette.subtle },
    { token: "regexp", foreground: palette.iris },
  ];
  const moon = {
    muted: "6e6a86",
    subtle: "908caa",
    pine: "3e8fb0",
    gold: "f6c177",
    rose: "ea9a97",
    foam: "9ccfd8",
    iris: "c4a7e7",
  };
  const dawn = {
    muted: "9893a5",
    subtle: "797593",
    pine: "286983",
    gold: "ea9d34",
    rose: "d7827e",
    foam: "56949f",
    iris: "907aa9",
  };
  monaco.editor.defineTheme("rose-pine-moon", {
    base: "vs-dark",
    inherit: true,
    rules: rules(moon),
    colors: {
      "editor.background": "#232136",
      "editor.foreground": "#e0def4",
      "editorLineNumber.foreground": "#6e6a86",
      "editorLineNumber.activeForeground": "#c4a7e7",
      "editor.lineHighlightBackground": "#2a283e",
      "editor.selectionBackground": "#44415a",
      "editorCursor.foreground": "#e0def4",
      "editorWidget.background": "#2a273f",
      "editorError.foreground": "#eb6f92",
    },
  });
  monaco.editor.defineTheme("rose-pine-dawn", {
    base: "vs",
    inherit: true,
    rules: rules(dawn),
    colors: {
      "editor.background": "#faf4ed",
      "editor.foreground": "#575279",
      "editorLineNumber.foreground": "#9893a5",
      "editorLineNumber.activeForeground": "#907aa9",
      "editor.lineHighlightBackground": "#f4ede8",
      "editor.selectionBackground": "#dfdad9",
      "editorCursor.foreground": "#575279",
      "editorWidget.background": "#fffaf3",
      "editorError.foreground": "#b4637a",
    },
  });
}

function siteTheme(): string {
  const forced = document.documentElement.dataset.theme;
  const dark =
    forced === "dark" ||
    (forced !== "light" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  return dark ? "rose-pine-moon" : "rose-pine-dawn";
}

// --- API -------------------------------------------------------------------

class StudyApi {
  readonly #token: string;

  constructor(token: string) {
    this.#token = token;
  }

  async #call<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<{ status: number; data: T }> {
    const response = await fetch(path, {
      method,
      headers: {
        "x-study-token": this.#token,
        "content-type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data: T = await response.json();
    return { status: response.status, data };
  }

  read(file: string) {
    return this.#call<{ content: string; hash: string; error?: string }>(
      "GET",
      `/api/file?path=${encodeURIComponent(file)}`,
    );
  }

  save(file: string, content: string, baseHash: string, force = false) {
    return this.#call<{ hash?: string; content?: string; error?: string }>(
      "PUT",
      "/api/file",
      {
        path: file,
        content,
        baseHash,
        force,
      },
    );
  }

  check(file: string) {
    return this.#call<{
      diagnostics?: Array<{
        line: number;
        column: number;
        code: string;
        message: string;
      }>;
      elsewhere?: number;
      error?: string;
    }>("POST", "/api/check", { path: file });
  }

  test(file: string) {
    return this.#call<{
      passed?: number;
      failed?: number;
      cases?: Array<{ name: string; passed: boolean; message?: string }>;
      testFile?: string;
      crashed?: string;
      error?: string;
    }>("POST", "/api/test", { path: file });
  }

  original(file: string) {
    return this.#call<{ content?: string; error?: string }>(
      "POST",
      "/api/original",
      { path: file },
    );
  }
}

// --- one editor block -------------------------------------------------------

function time(): string {
  return new Date().toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

class ExerciseEditor {
  readonly #file: string;
  readonly #api: StudyApi;
  readonly #monaco: Monaco;
  readonly #root = el("section", "study-block");
  readonly #status = el("span", "study-status", "載入中…");
  readonly #host = el("div", "study-editor");
  readonly #results = el("div", "study-results");
  readonly #conflict = el("div", "study-conflict");
  readonly #testButton = el("button", "study-button study-primary", "執行測試");
  readonly #resetButton = el("button", "study-button", "還原成題目");
  readonly #summary = el("span", "study-summary");

  #editor: MonacoEditor | undefined;
  #model: MonacoModel | undefined;
  #hash = "";
  #dirty = false;
  #saving: Promise<boolean> | undefined;
  #timer: number | undefined;
  #applyingRemote = false;

  constructor(file: string, api: StudyApi, monaco: Monaco) {
    this.#file = file;
    this.#api = api;
    this.#monaco = monaco;
    const name = file.split("/").slice(-2).join("/");
    const head = el("div", "study-head");
    head.append(el("span", "study-file", name), this.#status);
    const toolbar = el("div", "study-toolbar");
    this.#testButton.type = "button";
    this.#testButton.title = "執行這個練習的測試（⌘↵）";
    this.#resetButton.type = "button";
    toolbar.append(this.#testButton, this.#resetButton, this.#summary);
    this.#results.setAttribute("aria-live", "polite");
    this.#conflict.hidden = true;
    this.#root.append(head, this.#host, toolbar, this.#conflict, this.#results);
    this.#testButton.addEventListener("click", () => void this.runTests());
    this.#resetButton.addEventListener("click", () => void this.#reset());
  }

  get element(): HTMLElement {
    return this.#root;
  }

  get hasUnsavedWork(): boolean {
    return this.#dirty || this.#saving !== undefined;
  }

  async start(): Promise<void> {
    const { status, data } = await this.#api.read(this.#file);
    if (status !== 200) {
      this.#status.textContent = data.error ?? "讀取失敗";
      return;
    }
    this.#hash = data.hash;
    const monaco = this.#monaco;
    this.#model = monaco.editor.createModel(
      data.content,
      "typescript",
      monaco.Uri.parse(`file:///${this.#file}`),
    );
    this.#editor = monaco.editor.create(this.#host, {
      model: this.#model,
      theme: siteTheme(),
      fontFamily:
        '"Fira Mono", "Noto Sans Mono CJK TC", ui-monospace, monospace',
      fontSize: 14,
      lineHeight: 21,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      fixedOverflowWidgets: true,
      // Lesson strings use full-width Chinese punctuation on purpose.
      unicodeHighlight: { ambiguousCharacters: false },
      scrollbar: { alwaysConsumeMouseWheel: false },
      padding: { top: 10, bottom: 10 },
    });
    this.#fitHeight();
    this.#status.textContent = "已載入";

    const editor = this.#editor;
    editor.onDidChangeModelContent(() => {
      this.#fitHeight();
      if (this.#applyingRemote) return;
      this.#dirty = true;
      this.#status.textContent = "有未儲存的修改";
      window.clearTimeout(this.#timer);
      this.#timer = window.setTimeout(() => void this.save(), AUTOSAVE_MS);
    });
    editor.onDidBlurEditorText(() => {
      if (this.#dirty) void this.save();
    });
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => void this.save(),
    );
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => void this.runTests(),
    );
    void this.#check();
  }

  #fitHeight(): void {
    const lines = Math.min(32, Math.max(10, this.#model?.getLineCount() ?? 10));
    this.#host.style.height = `${lines * 21 + 20}px`;
    this.#editor?.layout();
  }

  /** Replaces the whole text while keeping it undoable. */
  #replaceText(text: string, remote: boolean): void {
    const model = this.#model;
    if (!model || !this.#editor) return;
    this.#applyingRemote = remote;
    this.#editor.pushUndoStop();
    model.pushEditOperations(
      [],
      [{ range: model.getFullModelRange(), text }],
      () => null,
    );
    this.#editor.pushUndoStop();
    this.#applyingRemote = false;
  }

  async save(force = false): Promise<boolean> {
    window.clearTimeout(this.#timer);
    if (this.#saving) await this.#saving;
    if (!this.#model || (!this.#dirty && !force)) return true;
    const content = this.#model.getValue();
    this.#dirty = false;
    this.#status.textContent = "儲存中…";
    this.#saving = (async () => {
      const { status, data } = await this.#api.save(
        this.#file,
        content,
        this.#hash,
        force,
      );
      if (status === 409) {
        this.#dirty = true;
        this.#showConflict(data.content ?? "", data.hash ?? "");
        return false;
      }
      if (status !== 200 || !data.hash) {
        this.#dirty = true;
        this.#status.textContent = `儲存失敗：${data.error ?? status}`;
        return false;
      }
      this.#hash = data.hash;
      this.#conflict.hidden = true;
      this.#status.textContent = `已儲存 ${time()}`;
      void this.#check();
      return true;
    })().finally(() => {
      this.#saving = undefined;
    });
    return this.#saving;
  }

  #showConflict(content: string, hash: string): void {
    this.#status.textContent = "檔案在別處被修改了";
    this.#conflict.hidden = false;
    this.#conflict.replaceChildren(
      el(
        "p",
        undefined,
        "這個檔案在網頁以外（例如 VS Code）被改過了。要用哪一個版本？",
      ),
    );
    const reload = el("button", "study-button", "載入檔案裡的版本");
    const overwrite = el("button", "study-button", "用網頁上的版本覆蓋");
    reload.type = "button";
    overwrite.type = "button";
    reload.addEventListener("click", () => {
      this.#hash = hash;
      this.#replaceText(content, true);
      this.#dirty = false;
      this.#conflict.hidden = true;
      this.#status.textContent = `已載入檔案裡的版本 ${time()}`;
      void this.#check();
    });
    overwrite.addEventListener("click", () => {
      this.#conflict.hidden = true;
      void this.save(true);
    });
    this.#conflict.append(reload, overwrite);
  }

  /** Called when the window regains focus: pick up edits made elsewhere. */
  async syncFromDisk(): Promise<void> {
    if (!this.#model || this.#saving) return;
    const { status, data } = await this.#api.read(this.#file);
    if (status !== 200 || data.hash === this.#hash) return;
    if (this.#dirty) {
      this.#showConflict(data.content, data.hash);
      return;
    }
    this.#hash = data.hash;
    this.#replaceText(data.content, true);
    this.#status.textContent = `已同步檔案的最新內容 ${time()}`;
    void this.#check();
  }

  async #check(): Promise<void> {
    const model = this.#model;
    if (!model) return;
    const { status, data } = await this.#api.check(this.#file);
    if (status !== 200) return;
    const diagnostics = data.diagnostics ?? [];
    this.#monaco.editor.setModelMarkers(
      model,
      "bun-check",
      diagnostics.map((item) => {
        const line = Math.min(item.line, model.getLineCount());
        return {
          startLineNumber: line,
          startColumn: item.column,
          endLineNumber: line,
          endColumn: model.getLineMaxColumn(line),
          message: `${item.code}: ${item.message}`,
          severity: this.#monaco.MarkerSeverity.Error,
          source: "bun check",
        };
      }),
    );
    this.#root.querySelector(".study-types")?.remove();
    if (diagnostics.length === 0 && !data.elsewhere) return;
    const box = el("div", "study-types");
    box.append(
      el("p", "study-types-title", `型別錯誤 ${diagnostics.length} 個`),
    );
    for (const item of diagnostics) {
      const row = el("button", "study-type-row");
      row.type = "button";
      row.textContent = `第 ${item.line} 行　${item.code}：${item.message}`;
      row.addEventListener("click", () => {
        this.#editor?.revealLineInCenter(item.line);
        this.#editor?.setPosition({
          lineNumber: item.line,
          column: item.column,
        });
        this.#editor?.focus();
      });
      box.append(row);
    }
    if (data.elsewhere) {
      box.append(
        el(
          "p",
          "study-note",
          `另外有 ${data.elsewhere} 個錯誤在它 import 的其他檔案裡。`,
        ),
      );
    }
    this.#results.before(box);
  }

  async runTests(): Promise<void> {
    if (!(await this.save())) return;
    this.#testButton.disabled = true;
    this.#summary.textContent = "測試執行中…";
    try {
      const { status, data } = await this.#api.test(this.#file);
      if (status !== 200) {
        this.#summary.textContent = data.error ?? "測試沒有執行";
        return;
      }
      this.#renderTests(data);
    } finally {
      this.#testButton.disabled = false;
    }
  }

  #renderTests(data: {
    passed?: number;
    failed?: number;
    cases?: Array<{ name: string; passed: boolean; message?: string }>;
    crashed?: string;
  }): void {
    const cases = data.cases ?? [];
    const passed = data.passed ?? 0;
    const total = cases.length;
    this.#results.replaceChildren();
    if (data.crashed) {
      this.#summary.textContent = "測試沒有跑完";
      this.#results.append(el("pre", "study-crash", data.crashed));
      return;
    }
    const allPassed = total > 0 && passed === total;
    this.#summary.textContent = allPassed
      ? `全部通過（${total} 個）`
      : `測試 ${passed} / ${total} 通過`;
    this.#summary.dataset.state = allPassed ? "pass" : "fail";
    const list = el("ul", "study-cases");
    for (const item of cases) {
      const row = el(
        "li",
        item.passed ? "study-case is-pass" : "study-case is-fail",
      );
      row.append(
        el(
          "span",
          "study-case-name",
          `${item.passed ? "✓" : "✗"} ${item.name}`,
        ),
      );
      if (item.message)
        row.append(el("pre", "study-case-message", item.message));
      list.append(row);
    }
    this.#results.append(list);
  }

  async #reset(): Promise<void> {
    const ok = window.confirm(
      "要把這個檔案還原成最初的題目嗎？\n你目前的內容會被取代，但可以在編輯器裡按 Cmd+Z 復原。",
    );
    if (!ok) return;
    const { status, data } = await this.#api.original(this.#file);
    if (status !== 200 || data.content === undefined) {
      this.#status.textContent = data.error ?? "還原失敗";
      return;
    }
    this.#replaceText(data.content, false);
    await this.save();
    this.#results.replaceChildren();
    this.#summary.textContent = "";
  }
}

// --- page setup --------------------------------------------------------------

export async function startStudyMode(token: string): Promise<void> {
  const spot = findPracticeSpot();
  if (!spot) return;
  const panel = el("div", "study-panel");
  const intro = el("p", "study-intro");
  intro.innerHTML =
    "<strong>本機學習模式</strong>：直接在這裡寫練習。停止打字後自動存檔，寫回 <code>exercises/</code> 裡的檔案；<kbd>⌘S</kbd> 立即儲存，<kbd>⌘↵</kbd> 執行測試。";
  panel.append(intro);
  spot.after.after(panel);

  let monaco: Monaco;
  try {
    monaco = await loadMonaco();
  } catch (error) {
    panel.append(
      el(
        "p",
        "study-error",
        error instanceof Error ? error.message : "編輯器載入失敗。",
      ),
    );
    return;
  }
  defineThemes(monaco);
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: 99,
    strict: true,
    allowNonTsExtensions: true,
  });
  // Type errors come from the real `bun check`; Monaco cannot see the other
  // repository files an exercise imports, so its own type check would misfire.
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });

  const api = new StudyApi(token);
  const editors = spot.files.map(
    (file) => new ExerciseEditor(file, api, monaco),
  );
  for (const editor of editors) panel.append(editor.element);
  await Promise.all(editors.map((editor) => editor.start()));

  const applyTheme = (): void => monaco.editor.setTheme(siteTheme());
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", applyTheme);
  window.addEventListener("focus", () => {
    for (const editor of editors) void editor.syncFromDisk();
  });
  window.addEventListener("beforeunload", (event) => {
    if (editors.some((editor) => editor.hasUnsavedWork)) event.preventDefault();
  });
}
