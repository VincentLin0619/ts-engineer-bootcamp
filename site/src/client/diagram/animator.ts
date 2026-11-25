// Step-by-step playback for Mermaid diagrams. Lighting and dimming are CSS
// classes on the SVG elements. While a step plays, a dotted line flows along
// the step's edge (or message) and a chip with the edge's text rides on it.
// Both are temporary SVG elements animated with animejs; the edge itself
// keeps its own solid or dashed style.

import {
  animate,
  svg as animeSvg,
  createTimeline,
  type JSAnimation,
} from "animejs";
import {
  el,
  iconButton,
  MOTION,
  reducedMotion,
  setIcon,
  speedSelect,
} from "../ui.ts";
import { type DiagramPlan, type DiagramStep, planDiagram } from "./steps.ts";

const SVG_NS = "http://www.w3.org/2000/svg";
/** Diagrams with more steps than this show a progress line instead of dots. */
const MAX_DOTS = 12;

const instances = new WeakMap<HTMLElement, DiagramAnimator>();

/** (Re)attaches an animator to every rendered Mermaid diagram. */
export function attachDiagramAnimators(root: ParentNode = document): void {
  for (const pre of root.querySelectorAll<HTMLElement>("pre.mermaid")) {
    instances.get(pre)?.destroy();
    instances.delete(pre);
    const svg = pre.querySelector("svg");
    if (!svg) continue;
    const plan = planDiagram(svg, pre.dataset.src ?? "");
    if (!plan) continue;
    instances.set(pre, new DiagramAnimator(pre, svg, plan));
  }
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  className: string,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, tag);
  element.setAttribute("class", className);
  return element;
}

/** The route of a step as path data, in its element's own coordinates. */
function routeOf(step: DiagramStep): string | undefined {
  const motion = step.motion;
  if (!motion) return undefined;
  if (motion.kind === "path") {
    return motion.element.getAttribute("d") ?? undefined;
  }
  const line = motion.element;
  return `M ${line.x1.baseVal.value} ${line.y1.baseVal.value} L ${line.x2.baseVal.value} ${line.y2.baseVal.value}`;
}

class DiagramAnimator {
  readonly #svg: SVGSVGElement;
  readonly #plan: DiagramPlan;
  readonly #bar = el("div", "diagram-bar");
  readonly #caption = el("p", "diagram-caption");
  readonly #badge = el("span", "diagram-step");
  readonly #text = el("span", "diagram-caption-text");
  readonly #progress = el("span", "diagram-dots");
  readonly #marks: HTMLElement[] = [];
  readonly #first = iconButton("first", "回到完整的圖");
  readonly #prev = iconButton("prev", "上一步");
  readonly #play = iconButton("play", "播放流程", "ctl-play");
  readonly #next = iconButton("next", "下一步");

  /** -1 means idle: the whole diagram is shown and nothing is dimmed. */
  #index = -1;
  #speed = 1;
  #playing = false;
  #timer: number | undefined;
  /** Bumped on every cancel, so a stale flow cannot finish later. */
  #flowToken = 0;
  /** Undo actions for the running flow: stop animations, remove elements. */
  #cleanups: (() => void)[] = [];

  constructor(pre: HTMLElement, svg: SVGSVGElement, plan: DiagramPlan) {
    this.#svg = svg;
    this.#plan = plan;

    this.#caption.setAttribute("aria-live", "polite");
    this.#caption.append(this.#badge, this.#text);
    this.#buildProgress();
    const speed = speedSelect((value) => {
      this.#speed = value;
    });
    this.#bar.append(
      this.#first,
      this.#prev,
      this.#play,
      this.#next,
      this.#caption,
      this.#progress,
      speed,
    );
    const container = pre.closest(".diagram") ?? pre.parentElement;
    container?.append(this.#bar);

    this.#first.addEventListener("click", () => this.#goIdle());
    this.#prev.addEventListener("click", () => {
      this.#pause();
      if (this.#index <= 0) this.#goIdle();
      else this.#show(this.#index - 1, false);
    });
    this.#next.addEventListener("click", () => {
      this.#pause();
      this.#show(Math.min(this.#index + 1, this.#plan.steps.length - 1), true);
    });
    this.#play.addEventListener("click", () => this.#toggle());

    this.#goIdle();
  }

  destroy(): void {
    this.#pause();
    this.#cancelFlow();
    this.#bar.remove();
    this.#clearClasses();
  }

  // --- caption bar ---------------------------------------------------------

  /** Number of real steps; the closing "whole diagram" step is not counted. */
  get #total(): number {
    return this.#plan.steps.length - 1;
  }

  #buildProgress(): void {
    this.#progress.setAttribute("role", "img");
    if (this.#total <= MAX_DOTS) {
      for (let index = 0; index < this.#total; index += 1) {
        const dot = el("i");
        this.#marks.push(dot);
        this.#progress.append(dot);
      }
      return;
    }
    const line = el("span", "diagram-progress");
    const fill = el("i");
    line.append(fill);
    this.#marks.push(fill);
    this.#progress.append(line);
  }

  #setProgress(index: number): void {
    const total = this.#total;
    const done = index >= total ? total : index + 1;
    if (total <= MAX_DOTS) {
      this.#marks.forEach((dot, at) => {
        dot.classList.toggle("on", at < done);
      });
    } else if (this.#marks[0]) {
      this.#marks[0].style.width = `${(done / total) * 100}%`;
    }
    this.#progress.setAttribute(
      "aria-label",
      index < 0
        ? `共 ${total} 步`
        : index >= total
          ? "完成"
          : `第 ${index + 1} / ${total} 步`,
    );
  }

  // --- state ---------------------------------------------------------------

  #clearClasses(): void {
    this.#svg.classList.remove("is-animating");
    for (const element of this.#svg.querySelectorAll(
      ".anim-lit, .anim-focus",
    )) {
      element.classList.remove("anim-lit", "anim-focus");
    }
  }

  #goIdle(): void {
    // Reset the step first: #pause() names the play button after it.
    this.#index = -1;
    this.#pause();
    this.#cancelFlow();
    this.#clearClasses();
    this.#badge.hidden = true;
    this.#text.textContent = `這張圖有 ${this.#total} 個步驟，按 ▶ 從頭一步一步看。`;
    this.#setProgress(-1);
    this.#first.disabled = true;
    this.#prev.disabled = true;
    this.#next.disabled = false;
  }

  #litUpTo(index: number): Set<Element> {
    const lit = new Set<Element>();
    for (const step of this.#plan.steps.slice(0, index + 1)) {
      for (const element of step.reveal) lit.add(element);
    }
    return lit;
  }

  #applyLit(lit: Set<Element>, focus: readonly Element[]): void {
    for (const element of this.#plan.dimmable) {
      element.classList.toggle("anim-lit", lit.has(element));
    }
    for (const element of this.#svg.querySelectorAll(".anim-focus")) {
      element.classList.remove("anim-focus");
    }
    for (const element of focus) element.classList.add("anim-focus");
  }

  #show(index: number, animate: boolean): void {
    const step = this.#plan.steps[index];
    if (!step) return;
    this.#cancelFlow();
    this.#index = index;
    this.#svg.classList.add("is-animating");
    const after = this.#litUpTo(index);
    const travelling = animate && step.motion !== undefined && !reducedMotion();
    if (travelling) {
      // Light where the flow starts; the edge, its label and the target
      // appear once the flow has reached the end.
      const start = this.#litUpTo(index - 1);
      for (const element of step.revealFirst ?? []) start.add(element);
      this.#applyLit(start, []);
      this.#drawFlow(step, () => this.#applyLit(after, step.focus));
    } else {
      this.#applyLit(after, step.focus);
    }

    const last = this.#plan.steps.length - 1;
    this.#badge.hidden = index === last;
    this.#badge.textContent = String(index + 1);
    this.#text.textContent = step.caption;
    this.#setProgress(index);
    this.#first.disabled = false;
    this.#prev.disabled = false;
    this.#next.disabled = index === last;
  }

  // --- playback ------------------------------------------------------------

  #toggle(): void {
    if (this.#playing) {
      this.#pause();
      return;
    }
    this.#playing = true;
    setIcon(this.#play, "pause", "暫停");
    const last = this.#plan.steps.length - 1;
    const start = this.#index < 0 || this.#index >= last ? 0 : this.#index + 1;
    this.#show(start, true);
    this.#schedule();
  }

  #pause(): void {
    this.#playing = false;
    window.clearTimeout(this.#timer);
    setIcon(this.#play, "play", this.#index >= 0 ? "繼續播放" : "播放流程");
  }

  #stepDuration(step: DiagramStep): number {
    const travel = step.motion && !reducedMotion() ? this.#travelTime() : 0;
    const reading = Math.min(
      4200,
      Math.max(1300, 700 + step.caption.length * 60),
    );
    return travel + reading / this.#speed;
  }

  #schedule(): void {
    window.clearTimeout(this.#timer);
    const step = this.#plan.steps[this.#index];
    if (!step) return;
    this.#timer = window.setTimeout(() => {
      if (!this.#playing) return;
      const last = this.#plan.steps.length - 1;
      if (this.#index >= last) {
        this.#pause();
        setIcon(this.#play, "play", "再播一次");
        return;
      }
      this.#show(this.#index + 1, true);
      this.#schedule();
    }, this.#stepDuration(step));
  }

  // --- flow ----------------------------------------------------------------

  #travelTime(): number {
    return (MOTION.slow + 160) / this.#speed;
  }

  #cancelFlow(): void {
    this.#flowToken += 1;
    for (const cleanup of this.#cleanups) cleanup();
    this.#cleanups = [];
  }

  /** Flows dots (and the chip) along the step's route, then calls `done`. */
  #drawFlow(step: DiagramStep, done: () => void): void {
    const source = step.motion?.element;
    const route = routeOf(step);
    if (!source || !route) {
      done();
      return;
    }
    // The layer sits next to the edge, so it shares the edge's coordinates.
    const layer = svgEl("g", "anim-layer");
    const transform = source.getAttribute("transform");
    if (transform) layer.setAttribute("transform", transform);
    const flow = svgEl("path", "anim-flow");
    flow.setAttribute("d", route);
    layer.append(flow);
    source.after(layer);

    const travel = this.#travelTime();
    const token = this.#flowToken;
    let fade: JSAnimation | undefined;
    const timeline = createTimeline({
      onComplete: () => {
        if (token !== this.#flowToken) return;
        done();
        fade = animate(layer, {
          opacity: 0,
          duration: MOTION.fast,
          ease: "out(2)",
          onComplete: () => layer.remove(),
        });
        this.#pop(step.pulse);
      },
    });
    this.#cleanups.push(() => {
      timeline.cancel();
      fade?.cancel();
      layer.remove();
    });

    timeline.add(
      flow,
      { opacity: [0, 1], duration: MOTION.fast, ease: "out(2)" },
      0,
    );
    timeline.add(
      flow,
      { strokeDashoffset: [0, -42], duration: travel, ease: "linear" },
      0,
    );
    if (step.chip) {
      const chip = this.#chip(step.chip);
      layer.append(chip);
      const path = animeSvg.createMotionPath(flow);
      timeline.add(
        chip,
        {
          translateX: path.translateX,
          translateY: path.translateY,
          duration: travel,
          ease: "inOut(3)",
        },
        0,
      );
      timeline.add(chip, { opacity: [0, 1], duration: 140, ease: "out(2)" }, 0);
      timeline.add(
        chip,
        { opacity: [1, 0], duration: 180, ease: "in(2)" },
        Math.max(0, travel - 100),
      );
    }
  }

  /** A pill with the edge's text, centred on its own origin. */
  #chip(text: string): SVGGElement {
    const chip = svgEl("g", "anim-chip");
    chip.style.opacity = "0";
    const pill = svgEl("rect", "");
    const label = svgEl("text", "");
    label.textContent = text;
    chip.append(pill, label);
    // Measure inside the document so the text has a length.
    this.#svg.append(chip);
    const width = label.getComputedTextLength() + 16;
    chip.remove();
    pill.setAttribute("x", String(-width / 2));
    pill.setAttribute("y", "-10");
    pill.setAttribute("width", String(width));
    pill.setAttribute("height", "20");
    pill.setAttribute("rx", "10");
    return chip;
  }

  /** A slight 0.96 → 1 scale on arrival, without disturbing its position. */
  #pop(target: Element | undefined): void {
    if (!target || reducedMotion()) return;
    const base = target.getAttribute("transform");
    if (base?.startsWith("translate")) {
      // Mermaid positions nodes with this attribute; a CSS transform would
      // replace it, so the scale is appended to the attribute instead.
      const state = { scale: 0.96 };
      const pop = animate(state, {
        scale: 1,
        duration: MOTION.base,
        ease: "out(3)",
        onUpdate: () =>
          target.setAttribute("transform", `${base} scale(${state.scale})`),
        onComplete: () => target.setAttribute("transform", base),
      });
      this.#cleanups.push(() => {
        pop.cancel();
        target.setAttribute("transform", base);
      });
      return;
    }
    if (base || !(target instanceof SVGGraphicsElement)) return;
    target.style.transformBox = "fill-box";
    target.style.transformOrigin = "center";
    const pop = animate(target, {
      scale: [0.96, 1],
      duration: MOTION.base,
      ease: "out(3)",
    });
    this.#cleanups.push(() => pop.revert());
  }
}
