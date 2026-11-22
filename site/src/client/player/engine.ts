// The animation player: turns a Scene into an interactive, step-by-step
// walkthrough with playback controls, quizzes and editable inputs.

import { highlightLines } from "../../highlight.ts";
import { iconButton, MOTION, setIcon, speedSelect } from "../ui.ts";
import {
  createPanels,
  el,
  formatNote,
  type PanelElements,
  panelsUsed,
  reducedMotion,
  renderPanels,
} from "./render.ts";
import { defaultInputs, resolveScene, toSnapshots } from "./snapshots.ts";
import {
  type InputValues,
  type Scene,
  SceneInputError,
  type Snapshot,
  type Step,
} from "./types.ts";

type QuizRecord = { chosen: number };

export class Player {
  readonly #scene: Scene;
  readonly #root: HTMLElement;
  readonly #autoplayDemo: boolean;

  #snapshots: Snapshot[] = [];
  #index = 0;
  #speed = 1;
  #timer: number | undefined;
  #playing = false;
  #answers = new Map<number, QuizRecord>();
  #panels: PanelElements = new Map();
  #code: string[] = [];

  readonly #codeList = el("ol", "code-lines");
  readonly #codeBox = el("div", "player-code");
  readonly #panelBox = el("div", "player-panels");
  readonly #note = el("div", "player-note");
  readonly #quiz = el("div", "player-quiz");
  readonly #counter = el("span", "player-counter");
  readonly #range = el("input", "player-range");
  readonly #playButton = iconButton("play", "播放", "ctl-play");
  readonly #cursor = Object.assign(el("li", "code-cursor"), {
    ariaHidden: "true",
  });
  readonly #prevButton = iconButton("prev", "上一步");
  readonly #nextButton = iconButton("next", "下一步");
  readonly #firstButton = iconButton("first", "回到第一步");
  readonly #lastButton = iconButton("last", "跳到最後一步");
  readonly #error = el("p", "player-error");

  constructor(
    root: HTMLElement,
    scene: Scene,
    options: { autoplay?: boolean } = {},
  ) {
    this.#root = root;
    this.#scene = scene;
    this.#autoplayDemo = options.autoplay === true;
    this.#build();
    this.#load(defaultInputs(scene));
    if (this.#autoplayDemo) this.#watchVisibility();
  }

  #build(): void {
    const root = this.#root;
    root.classList.add("player");
    root.tabIndex = -1;
    root.replaceChildren();

    const head = el("div", "player-head");
    head.append(
      el("p", "player-title", this.#scene.title),
      el("p", "player-summary", this.#scene.summary),
    );
    root.append(head);

    if (this.#scene.inputs && this.#scene.inputs.length > 0) {
      root.append(this.#buildInputs());
    }

    this.#codeBox.append(this.#codeList);
    const body = el("div", "player-body");
    body.append(this.#codeBox, this.#panelBox);
    this.#note.setAttribute("aria-live", "polite");
    this.#quiz.hidden = true;

    const controls = el("div", "player-controls");
    this.#range.type = "range";
    this.#range.name = "step";
    this.#range.min = "0";
    this.#range.setAttribute("aria-label", "跳到第幾步");
    const speed = speedSelect((value) => {
      this.#speed = value;
      if (this.#playing) this.#schedule();
    });
    controls.append(
      this.#firstButton,
      this.#prevButton,
      this.#playButton,
      this.#nextButton,
      this.#lastButton,
      this.#range,
      this.#counter,
      speed,
    );

    root.append(body, this.#note, this.#quiz, controls);

    this.#firstButton.addEventListener("click", () => this.#go(0, true));
    this.#prevButton.addEventListener("click", () =>
      this.#go(this.#index - 1, true),
    );
    this.#nextButton.addEventListener("click", () =>
      this.#go(this.#index + 1, true),
    );
    this.#lastButton.addEventListener("click", () =>
      this.#go(this.#snapshots.length - 1, true),
    );
    this.#playButton.addEventListener("click", () => this.#toggle());
    this.#range.addEventListener("input", () =>
      this.#go(Number(this.#range.value), true),
    );
    root.addEventListener("keydown", (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type === "text") return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        this.#go(this.#index + 1, true);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.#go(this.#index - 1, true);
      }
    });
  }

  #buildInputs(): HTMLFormElement {
    const form = el("form", "player-inputs");
    for (const input of this.#scene.inputs ?? []) {
      const label = el("label", "player-input");
      const caption = el("span", "player-input-label", input.label);
      const field = el("input");
      field.type = "text";
      field.name = input.name;
      field.value = input.value;
      field.spellcheck = false;
      field.autocomplete = "off";
      label.append(caption, field);
      if (input.hint) label.append(el("span", "player-input-hint", input.hint));
      form.append(label);
    }
    const submit = el("button", "player-replay", "用這些值重新執行");
    submit.type = "submit";
    form.append(submit, this.#error);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values: InputValues = {};
      for (const input of this.#scene.inputs ?? []) {
        const field = form.elements.namedItem(input.name);
        values[input.name] =
          field instanceof HTMLInputElement ? field.value : input.value;
      }
      this.#load(values);
    });
    return form;
  }

  #load(values: InputValues): void {
    let steps: Step[];
    let code: string;
    try {
      ({ code, steps } = resolveScene(this.#scene, values));
    } catch (error) {
      if (error instanceof SceneInputError) {
        this.#error.textContent = error.message;
        return;
      }
      throw error;
    }
    if (steps.length === 0) {
      this.#error.textContent = "這組輸入沒有可以播放的步驟。";
      return;
    }
    this.#error.textContent = "";
    this.#pause();
    this.#answers.clear();
    this.#snapshots = toSnapshots(steps);
    this.#renderCode(code);
    this.#panels = createPanels(this.#panelBox, panelsUsed(this.#snapshots));
    this.#range.max = String(this.#snapshots.length - 1);
    this.#index = 0;
    this.#show();
  }

  #renderCode(code: string): void {
    this.#code = highlightLines(code, this.#scene.language ?? "ts");
    this.#codeList.replaceChildren(
      this.#cursor,
      ...this.#code.map((html) => {
        const line = el("li", "code-line");
        line.innerHTML = html.length > 0 ? html : " ";
        return line;
      }),
    );
    this.#cursor.classList.add("is-hidden");
  }

  /** Slides the highlight bar to cover the active lines. */
  #moveCursor(lines: HTMLElement[]): void {
    const first = lines[0];
    const last = lines.at(-1);
    if (!first || !last) {
      this.#cursor.classList.add("is-hidden");
      return;
    }
    const top = first.offsetTop;
    const height = last.offsetTop + last.offsetHeight - top;
    const wasHidden = this.#cursor.classList.contains("is-hidden");
    // The first appearance should not slide in from the top of the list.
    this.#cursor.classList.toggle("no-slide", wasHidden);
    this.#cursor.style.transform = `translateY(${top}px)`;
    this.#cursor.style.height = `${height}px`;
    this.#cursor.classList.remove("is-hidden");
  }

  #go(index: number, byUser: boolean): void {
    const clamped = Math.max(0, Math.min(this.#snapshots.length - 1, index));
    if (byUser) this.#pause();
    if (clamped === this.#index && byUser) return;
    this.#index = clamped;
    this.#show();
  }

  #show(): void {
    const snapshot = this.#snapshots[this.#index];
    if (!snapshot) return;
    const active = new Set(
      snapshot.line === null
        ? []
        : Array.isArray(snapshot.line)
          ? snapshot.line
          : [snapshot.line],
    );
    const lines = Array.from(
      this.#codeList.querySelectorAll<HTMLElement>(".code-line"),
    );
    const activeLines = lines.filter((node, index) => {
      const isActive = active.has(index + 1);
      node.classList.toggle("is-active", isActive);
      return isActive;
    });
    this.#moveCursor(activeLines);
    const firstActive = activeLines[0];
    if (firstActive) this.#scrollCode(firstActive);

    const note = formatNote(snapshot.note);
    if (this.#note.innerHTML !== note) {
      this.#note.innerHTML = note;
      if (!reducedMotion()) {
        this.#note.animate(
          [
            { opacity: 0, transform: "translateY(4px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: MOTION.base, easing: MOTION.enter },
        );
      }
    }
    renderPanels(this.#panels, snapshot);
    this.#renderQuiz(snapshot);

    const total = this.#snapshots.length;
    this.#range.value = String(this.#index);
    const progress = total > 1 ? (this.#index / (total - 1)) * 100 : 100;
    this.#range.style.setProperty("--progress", `${progress}%`);
    this.#counter.textContent = `第 ${this.#index + 1} / ${total} 步`;
    this.#prevButton.disabled = this.#index === 0;
    this.#firstButton.disabled = this.#index === 0;
    this.#nextButton.disabled = this.#index === total - 1;
    this.#lastButton.disabled = this.#index === total - 1;
  }

  #scrollCode(line: HTMLElement): void {
    const box = this.#codeBox;
    if (box.scrollHeight <= box.clientHeight) return;
    const boxRect = box.getBoundingClientRect();
    const lineRect = line.getBoundingClientRect();
    const margin = lineRect.height * 2;
    if (
      lineRect.top >= boxRect.top + margin &&
      lineRect.bottom <= boxRect.bottom - margin
    )
      return;
    const top =
      lineRect.top - boxRect.top + box.scrollTop - box.clientHeight / 3;
    box.scrollTo({
      top: Math.max(0, top),
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }

  #renderQuiz(snapshot: Snapshot): void {
    const question = snapshot.question;
    if (!question) {
      this.#quiz.hidden = true;
      this.#quiz.replaceChildren();
      return;
    }
    if (this.#playing) this.#pause();
    this.#quiz.hidden = false;
    const record = this.#answers.get(this.#index);
    const prompt = el("p", "quiz-prompt");
    prompt.innerHTML = `先猜猜看：${formatNote(question.prompt)}`;
    const choices = el("div", "quiz-choices");
    question.choices.forEach((choice, index) => {
      const button = el("button", "quiz-choice");
      button.type = "button";
      button.innerHTML = formatNote(choice);
      if (record) {
        button.disabled = true;
        if (index === question.answer) button.dataset.result = "correct";
        else if (index === record.chosen) button.dataset.result = "wrong";
      }
      button.addEventListener("click", () => {
        this.#answers.set(this.#index, { chosen: index });
        this.#renderQuiz(snapshot);
      });
      choices.append(button);
    });
    this.#quiz.replaceChildren(prompt, choices);
    if (record) {
      const verdict = record.chosen === question.answer ? "答對了。" : "不對。";
      const explain = el("p", "quiz-explain");
      explain.innerHTML = `${verdict}${formatNote(question.explain)}`;
      this.#quiz.append(explain);
    } else {
      this.#quiz.append(
        el("p", "quiz-hint", "選一個答案，或直接按「下一步」看結果。"),
      );
    }
  }

  #toggle(): void {
    if (this.#playing) {
      this.#pause();
      return;
    }
    if (this.#index >= this.#snapshots.length - 1) {
      this.#index = 0;
      this.#show();
    }
    this.#playing = true;
    setIcon(this.#playButton, "pause", "暫停");
    this.#schedule();
  }

  #pause(): void {
    this.#playing = false;
    window.clearTimeout(this.#timer);
    setIcon(this.#playButton, "play", "播放");
  }

  #delay(): number {
    const note = this.#snapshots[this.#index]?.note ?? "";
    const reading = Math.min(5200, Math.max(1700, 900 + note.length * 55));
    return reading / this.#speed;
  }

  #schedule(): void {
    window.clearTimeout(this.#timer);
    this.#timer = window.setTimeout(() => {
      if (!this.#playing) return;
      if (this.#index >= this.#snapshots.length - 1) {
        if (this.#autoplayDemo) {
          this.#index = 0;
          this.#show();
          this.#schedule();
        } else {
          this.#pause();
        }
        return;
      }
      this.#index += 1;
      this.#show();
      if (this.#playing) this.#schedule();
    }, this.#delay());
  }

  #watchVisibility(): void {
    if (reducedMotion()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.#playing) this.#toggle();
          if (!entry.isIntersecting && this.#playing) this.#pause();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(this.#root);
  }
}
