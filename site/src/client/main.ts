// Browser entry point: theme switch, Mermaid diagrams, self-check lists,
// course progress and the animation players.

import { attachDiagramAnimators } from "./diagram/animator.ts";
import { Player } from "./player/engine.ts";
import { sceneLoaders } from "./player/scenes/registry.generated.ts";

const MERMAID_URL =
  "https://cdn.jsdelivr.net/npm/mermaid@12.3.0/dist/mermaid.esm.min.mjs";

// --- storage (per-viewer convenience only; the page works without it) ------

function readStore(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
}

// --- theme -----------------------------------------------------------------

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setupThemeToggle(onChange: () => void): void {
  const button = document.querySelector<HTMLButtonElement>(
    "[data-theme-toggle]",
  );
  if (!button) return;
  const label = (): void => {
    const next = currentTheme() === "dark" ? "淺色" : "深色";
    button.setAttribute("aria-label", `切換成${next}模式`);
    button.title = `切換成${next}模式`;
  };
  label();
  button.addEventListener("click", () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    writeStore("theme", next);
    label();
    onChange();
  });
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      label();
      onChange();
    });
}

// --- mermaid ---------------------------------------------------------------

type MermaidApi = {
  initialize(config: Record<string, unknown>): void;
  run(options: { nodes: HTMLElement[] }): Promise<void>;
};

let mermaidPromise: Promise<MermaidApi> | undefined;

function loadMermaid(): Promise<MermaidApi> {
  const url = MERMAID_URL;
  mermaidPromise ??= import(/* @vite-ignore */ url).then(
    (module: { default: MermaidApi }) => module.default,
  );
  return mermaidPromise;
}

function mermaidTheme(): Record<string, unknown> {
  const css = getComputedStyle(document.documentElement);
  const read = (name: string): string => css.getPropertyValue(name).trim();
  return {
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    fontFamily: read("--font-text"),
    themeVariables: {
      darkMode: currentTheme() === "dark",
      background: read("--surface"),
      primaryColor: read("--surface"),
      primaryTextColor: read("--text"),
      primaryBorderColor: read("--accent"),
      secondaryColor: read("--overlay"),
      tertiaryColor: read("--bg"),
      lineColor: read("--muted"),
      textColor: read("--text"),
      mainBkg: read("--surface"),
      clusterBkg: read("--bg"),
      clusterBorder: read("--line"),
      edgeLabelBackground: read("--bg"),
      noteBkgColor: read("--overlay"),
      noteTextColor: read("--text"),
      actorBkg: read("--surface"),
      actorBorder: read("--accent"),
      actorTextColor: read("--text"),
      signalColor: read("--text"),
      signalTextColor: read("--text"),
      fontSize: "15px",
    },
  };
}

async function renderDiagrams(): Promise<void> {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>("pre.mermaid"),
  );
  if (nodes.length === 0) return;
  try {
    const mermaid = await loadMermaid();
    for (const node of nodes) {
      node.removeAttribute("data-processed");
      node.textContent = node.dataset.src ?? node.textContent;
    }
    mermaid.initialize(mermaidTheme());
    await mermaid.run({ nodes });
    attachDiagramAnimators();
  } catch {
    for (const node of nodes) node.classList.add("mermaid-failed");
  }
}

// --- self-check lists and progress ------------------------------------------

function setupChecklists(): void {
  const page = document.body.dataset.page ?? "";
  for (const box of document.querySelectorAll<HTMLInputElement>(
    "input[data-check]",
  )) {
    const key = `check:${page}:${box.dataset.check}`;
    box.checked = readStore(key) === "1";
    box.addEventListener("change", () =>
      writeStore(key, box.checked ? "1" : null),
    );
  }
  for (const box of document.querySelectorAll<HTMLInputElement>(
    "input[data-progress]",
  )) {
    const key = `done:${box.dataset.progress}`;
    box.checked = readStore(key) === "1";
    box.addEventListener("change", () =>
      writeStore(key, box.checked ? "1" : null),
    );
  }
}

// --- players ---------------------------------------------------------------

async function mountPlayers(): Promise<void> {
  const roots = document.querySelectorAll<HTMLElement>("[data-scene]");
  await Promise.all(
    Array.from(roots).map(async (root) => {
      const id = root.dataset.scene ?? "";
      const load = sceneLoaders[id];
      if (!load) {
        root.textContent = `找不到動畫「${id}」。`;
        return;
      }
      try {
        const module = await load();
        new Player(root, module.default, {
          autoplay: root.dataset.autoplay === "true",
        });
      } catch (error) {
        root.textContent = "動畫載入失敗，請重新整理頁面。";
        throw error;
      }
    }),
  );
}

// --- mobile navigation -----------------------------------------------------

function setupNavigation(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.dataset.open !== "true";
    nav.dataset.open = String(open);
    toggle.setAttribute("aria-expanded", String(open));
  });
}

setupThemeToggle(() => void renderDiagrams());
setupNavigation();
setupChecklists();
void renderDiagrams();
void mountPlayers();
