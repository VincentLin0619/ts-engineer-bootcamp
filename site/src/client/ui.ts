// Small UI helpers shared by the code player and the diagram animator.

export const SPEEDS = [0.5, 1, 1.5, 2] as const;

export const ICONS = {
  first:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 5v14L6 12z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',
  pause:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg>',
  last: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
} as const;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function iconButton(
  icon: keyof typeof ICONS,
  label: string,
  extraClass?: string,
): HTMLButtonElement {
  const button = el("button", extraClass ? `ctl ${extraClass}` : "ctl");
  button.type = "button";
  setIcon(button, icon, label);
  return button;
}

/** Swaps a button's icon and its accessible label together. */
export function setIcon(
  button: HTMLButtonElement,
  icon: keyof typeof ICONS,
  label: string,
): void {
  button.innerHTML = ICONS[icon];
  button.setAttribute("aria-label", label);
  button.title = label;
}

export function speedSelect(
  onChange: (speed: number) => void,
): HTMLSelectElement {
  const select = el("select", "player-speed");
  select.name = "speed";
  select.setAttribute("aria-label", "播放速度");
  for (const value of SPEEDS) {
    const option = el("option", undefined, `${value}×`);
    option.value = String(value);
    option.selected = value === 1;
    select.append(option);
  }
  select.addEventListener("change", () => onChange(Number(select.value)));
  return select;
}

export const reducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The site's single motion language: three durations and two curves.
 * Motion only explains what just changed; nothing glows, flashes or bounces.
 * The same values exist as CSS variables in styles.css.
 */
export const MOTION = {
  fast: 160,
  base: 280,
  slow: 480,
  /** Things arriving: quick start, gentle stop. */
  enter: "cubic-bezier(0.2, 0.7, 0.2, 1)",
  /** Things moving from one place to another. */
  move: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

/** Reads a colour token such as `--iris` from the current theme. */
export function themeColor(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}
