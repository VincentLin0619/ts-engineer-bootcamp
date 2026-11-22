// Step-by-step playback for Mermaid diagrams. The diagram stays an SVG; a
// <canvas> laid over it draws the travelling dot, its fading trail and the
// pulse when the dot arrives. Lighting and dimming are CSS classes on the
// SVG elements.

import {
  el,
  iconButton,
  MOTION,
  reducedMotion,
  setIcon,
  speedSelect,
  themeColor,
} from "../ui.ts";
import {
  type DiagramPlan,
  type DiagramStep,
  type Motion,
  planDiagram,
} from "./steps.ts";

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

type Point = { x: number; y: number };

function toScreen(
  element: SVGGraphicsElement,
  x: number,
  y: number,
): Point | undefined {
  const matrix = element.getScreenCTM();
  if (!matrix) return undefined;
  return {
    x: x * matrix.a + y * matrix.c + matrix.e,
    y: x * matrix.b + y * matrix.d + matrix.f,
  };
}

/** Returns a function giving the dot's screen position for t in [0, 1]. */
function route(motion: Motion): ((t: number) => Point | undefined) | undefined {
  if (motion.kind === "path") {
    const path = motion.element;
    const length = path.getTotalLength();
    return (t) => {
      const point = path.getPointAtLength(length * t);
      return toScreen(path, point.x, point.y);
    };
  }
  const line = motion.element;
  const x1 = line.x1.baseVal.value;
  const y1 = line.y1.baseVal.value;
  const x2 = line.x2.baseVal.value;
  const y2 = line.y2.baseVal.value;
  return (t) => toScreen(line, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
}

const ease = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

class DiagramAnimator {
  readonly #pre: HTMLElement;
  readonly #svg: SVGSVGElement;
  readonly #plan: DiagramPlan;
  readonly #canvas = el("canvas", "diagram-canvas");
  readonly #bar = el("div", "diagram-bar");
  readonly #caption = el("p", "diagram-caption");
  readonly #counter = el("span", "diagram-counter");
  readonly #first = iconButton("first", "回到完整的圖");
  readonly #prev = iconButton("prev", "上一步");
  readonly #play = iconButton("play", "播放流程", "ctl-play");
  readonly #next = iconButton("next", "下一步");
  readonly #resize: ResizeObserver;

  /** -1 means idle: the whole diagram is shown and nothing is dimmed. */
  #index = -1;
  #speed = 1;
  #playing = false;
  #timer: number | undefined;
  #frame: number | undefined;

  constructor(pre: HTMLElement, svg: SVGSVGElement, plan: DiagramPlan) {
    this.#pre = pre;
    this.#svg = svg;
    this.#plan = plan;

    this.#canvas.setAttribute("aria-hidden", "true");
    pre.append(this.#canvas);

    this.#caption.setAttribute("aria-live", "polite");
    const speed = speedSelect((value) => {
      this.#speed = value;
    });
    this.#bar.append(
      this.#first,
      this.#prev,
      this.#play,
      this.#next,
      this.#caption,
      this.#counter,
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

    this.#resize = new ResizeObserver(() => this.#fitCanvas());
    this.#resize.observe(svg);
    this.#goIdle();
  }

  destroy(): void {
    this.#pause();
    if (this.#frame !== undefined) cancelAnimationFrame(this.#frame);
    this.#resize.disconnect();
    this.#canvas.remove();
    this.#bar.remove();
    this.#clearClasses();
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
    this.#clearClasses();
    this.#clearCanvas();
    const total = this.#plan.steps.length - 1;
    this.#caption.textContent = `這張圖有 ${total} 個步驟，按 ▶ 從頭一步一步看。`;
    this.#counter.textContent = `共 ${total} 步`;
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
    this.#index = index;
    this.#svg.classList.add("is-animating");
    const after = this.#litUpTo(index);
    const travelling = animate && step.motion !== undefined && !reducedMotion();
    if (travelling) {
      // Light where the line starts; the edge, its label and the target
      // appear once the line has been drawn all the way.
      const start = this.#litUpTo(index - 1);
      for (const element of step.revealFirst ?? []) start.add(element);
      this.#applyLit(start, []);
      this.#drawLine(step, () => this.#applyLit(after, step.focus));
    } else {
      this.#clearCanvas();
      this.#applyLit(after, step.focus);
    }

    const last = this.#plan.steps.length - 1;
    this.#caption.textContent = step.caption;
    this.#counter.textContent =
      index === last ? "完成" : `第 ${index + 1} / ${last} 步`;
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

  // --- canvas --------------------------------------------------------------

  #travelTime(): number {
    return (MOTION.slow + 160) / this.#speed;
  }

  #fitCanvas(): void {
    const preBox = this.#pre.getBoundingClientRect();
    const box = this.#svg.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    this.#canvas.style.left = `${box.left - preBox.left}px`;
    this.#canvas.style.top = `${box.top - preBox.top}px`;
    this.#canvas.style.width = `${box.width}px`;
    this.#canvas.style.height = `${box.height}px`;
    const width = Math.round(box.width * ratio);
    const height = Math.round(box.height * ratio);
    if (this.#canvas.width !== width) this.#canvas.width = width;
    if (this.#canvas.height !== height) this.#canvas.height = height;
    this.#canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  #clearCanvas(): void {
    if (this.#frame !== undefined) cancelAnimationFrame(this.#frame);
    this.#frame = undefined;
    const context = this.#canvas.getContext("2d");
    context?.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  /** Draws the step's route as a growing line, then calls `done`. */
  #drawLine(step: DiagramStep, done: () => void): void {
    this.#clearCanvas();
    this.#fitCanvas();
    const context = this.#canvas.getContext("2d");
    const position = step.motion ? route(step.motion) : undefined;
    if (!context || !position) {
      done();
      return;
    }
    const color = themeColor("--iris", "#c4a7e7");
    const travel = this.#travelTime();
    const started = performance.now();

    const local = (point: Point): Point => {
      const box = this.#canvas.getBoundingClientRect();
      return { x: point.x - box.left, y: point.y - box.top };
    };

    const draw = (now: number): void => {
      const box = this.#canvas.getBoundingClientRect();
      const progress = ease(Math.min(1, (now - started) / travel));
      context.clearRect(0, 0, box.width, box.height);
      const samples = Math.max(2, Math.ceil(48 * progress));
      context.beginPath();
      let tip: Point | undefined;
      for (let index = 0; index <= samples; index += 1) {
        const screen = position((progress * index) / samples);
        if (!screen) continue;
        tip = local(screen);
        if (index === 0) context.moveTo(tip.x, tip.y);
        else context.lineTo(tip.x, tip.y);
      }
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
      if (tip) {
        context.beginPath();
        context.fillStyle = color;
        context.arc(tip.x, tip.y, 3.5, 0, Math.PI * 2);
        context.fill();
      }
      if (progress < 1) {
        this.#frame = requestAnimationFrame(draw);
        return;
      }
      this.#frame = undefined;
      done();
      context.clearRect(0, 0, box.width, box.height);
    };
    this.#frame = requestAnimationFrame(draw);
  }
}
