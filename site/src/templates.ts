// HTML templates for every page type. Paths are relative so the site works
// both under GitHub Pages (/ts-engineer-bootcamp/) and the local preview.

import { escapeHtml } from "./highlight.ts";
import type { Heading } from "./markdown.ts";

export const SITE = {
  name: "TypeScript 工程師基礎課程",
  shortName: "TS 基礎課程",
  repoUrl: "https://github.com/VincentLin0619/ts-engineer-bootcamp",
  siteUrl: "https://vincentlin0619.github.io/ts-engineer-bootcamp",
  description:
    "兩週、每天 1–3 小時的 TypeScript 入門課程：CRUD、物件導向、TypeScript 設計規範，每一課都有可以逐步播放的程式動畫。",
} as const;

export type DayInfo = {
  number: number;
  /** Two-digit label, for example `03`. */
  label: string;
  folder: string;
  slug: string;
  title: string;
  lead: string | undefined;
  week: 1 | 2;
  /** Short mainline progress text from the root README, if any. */
  mainline: string;
};

export type ProblemInfo = {
  folder: string;
  slug: string;
  /** LeetCode problem number. */
  id: number;
  title: string;
  lead: string | undefined;
  afterDay: number | undefined;
  technique: string;
  leetcodeUrl: string | undefined;
};

const rel = (depth: number): string => "../".repeat(depth);

const ICON_THEME =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/></svg>';
const ICON_GITHUB =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1a3.6 3.6 0 0 1 .1 2.7 3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>';

type PageOptions = {
  title: string;
  description?: string;
  depth: number;
  /** Used as the storage key for self-check lists. */
  page: string;
  body: string;
  active?: "home" | "lessons" | "leetcode" | "roadmap";
};

export function page(options: PageOptions): string {
  const base = rel(options.depth);
  const fullTitle =
    options.title === SITE.name
      ? SITE.name
      : `${options.title}｜${SITE.shortName}`;
  const current = (name: PageOptions["active"]): string =>
    options.active === name ? ' aria-current="page"' : "";
  return `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(options.description ?? SITE.description)}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500&family=Noto+Sans+TC:wght@400;500;700&display=swap">
<link rel="stylesheet" href="${base}assets/site.css">
<script>try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}</script>
<script type="module" src="${base}assets/main.js"></script>
</head>
<body data-page="${escapeHtml(options.page)}">
<a class="skip-link" href="#main">跳到主要內容</a>
<header class="site-header">
  <a class="brand" href="${base}">${SITE.name}</a>
  <nav class="site-nav" aria-label="網站">
    <a href="${base}#syllabus"${current("lessons")}>課綱</a>
    <a href="${base}leetcode/"${current("leetcode")}>LeetCode 副線</a>
    <a href="${base}roadmap/"${current("roadmap")}>之後怎麼學</a>
    <a class="icon-link" href="${SITE.repoUrl}" aria-label="GitHub 原始碼" title="GitHub 原始碼">${ICON_GITHUB}</a>
    <button class="icon-link" type="button" data-theme-toggle aria-label="切換深淺色">${ICON_THEME}</button>
  </nav>
</header>
${options.body}
<footer class="site-footer">
  <p>課文、範例與練習都在 <a href="${SITE.repoUrl}">GitHub</a>。這個網站由 <code>bun run site:build</code> 從同一份課文產生。</p>
</footer>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Course navigation

function sidebar(
  days: DayInfo[],
  current: DayInfo,
  headings: Heading[],
  depth: number,
): string {
  const base = rel(depth);
  const weeks = [1, 2] as const;
  const toc = headings
    .filter((heading) => heading.level === 2)
    .map(
      (heading) =>
        `<li><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`,
    )
    .join("");
  const groups = weeks
    .map((week) => {
      const items = days
        .filter((day) => day.week === week)
        .map((day) => {
          const isCurrent = day.slug === current.slug;
          const link = `<a href="${base}${day.slug}/"${isCurrent ? ' aria-current="page"' : ""}><span class="toc-num">${day.label}</span>${escapeHtml(day.title)}</a>`;
          return `<li>${link}${isCurrent && toc ? `<ol class="toc-sections">${toc}</ol>` : ""}</li>`;
        })
        .join("");
      return `<p class="toc-week">第 ${week} 週</p><ol class="toc-days">${items}</ol>`;
    })
    .join("");
  return `<nav class="course-nav" data-nav aria-label="課程目錄">${groups}</nav>`;
}

export function lessonPage(
  days: DayInfo[],
  day: DayInfo,
  html: string,
  headings: Heading[],
): string {
  const depth = 1;
  const base = rel(depth);
  const index = days.findIndex((item) => item.slug === day.slug);
  const prev = days[index - 1];
  const next = days[index + 1];
  const pager = `<nav class="pager" aria-label="上一課與下一課">
    ${prev ? `<a class="pager-prev" href="${base}${prev.slug}/"><span>上一課</span>Day ${prev.label} ${escapeHtml(prev.title)}</a>` : "<span></span>"}
    ${next ? `<a class="pager-next" href="${base}${next.slug}/"><span>下一課</span>Day ${next.label} ${escapeHtml(next.title)}</a>` : `<a class="pager-next" href="${base}roadmap/"><span>課程結束之後</span>之後怎麼學</a>`}
  </nav>`;
  const body = `<div class="course-layout">
  <aside class="course-aside">
    <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false">課程目錄</button>
    ${sidebar(days, day, headings, depth)}
  </aside>
  <main id="main" class="lesson">
    <header class="lesson-head">
      <p class="lesson-num" aria-hidden="true">${day.label}</p>
      <div>
        <h1><span class="visually-hidden">Day ${day.label}：</span>${escapeHtml(day.title)}</h1>
        ${day.lead ? `<p class="lesson-lead">${escapeHtml(day.lead)}</p>` : ""}
        <p class="lesson-source"><a href="${SITE.repoUrl}/tree/main/${day.folder}">在 GitHub 打開這一課的資料夾</a></p>
      </div>
    </header>
    <div class="prose">${html}</div>
    ${pager}
  </main>
</div>`;
  return page({
    title: `Day ${day.label} ${day.title}`,
    description: day.lead ?? SITE.description,
    depth,
    page: day.slug,
    body,
    active: "lessons",
  });
}

// ---------------------------------------------------------------------------
// Home

export function homePage(days: DayInfo[], problems: ProblemInfo[]): string {
  const week = (number: 1 | 2, heading: string, note: string): string => {
    const items = days
      .filter((day) => day.week === number)
      .map(
        (day) => `<li class="day">
        <input type="checkbox" name="done-${day.slug}" data-progress="${day.slug}" aria-label="Day ${day.label} 已完成">
        <a href="${day.slug}/"><span class="day-num">${day.label}</span><span class="day-title">${escapeHtml(day.title)}</span></a>
        ${day.mainline ? `<span class="day-mainline">${escapeHtml(day.mainline)}</span>` : ""}
      </li>`,
      )
      .join("");
    return `<section class="week" aria-labelledby="week-${number}">
      <h3 id="week-${number}">${heading}</h3>
      <p class="week-note">${note}</p>
      <ol class="days">${items}</ol>
    </section>`;
  };

  const problemRows = problems
    .map(
      (problem) =>
        `<li><a href="leetcode/${problem.slug}/"><span class="lc-id">${problem.id}</span>${escapeHtml(problem.title)}</a><span class="lc-when">${problem.afterDay ? `Day ${String(problem.afterDay).padStart(2, "0")} 之後` : ""}</span></li>`,
    )
    .join("");

  const body = `<main id="main" class="home">
  <section class="hero">
    <div class="hero-text">
      <h1>看著程式<br>一步一步跑</h1>
      <p class="hero-lead">兩週、每天 1–3 小時。從只會寫簡單的 todolist 開始，寫到一個有型別、有分層、有測試，還接上資料庫與 HTTP API 的 Todo App。</p>
      <p class="hero-actions"><a class="button" href="${days[0]?.slug ?? ""}/">從 Day 01 開始</a><a class="text-link" href="#syllabus">先看兩週課綱</a></p>
    </div>
    <figure class="player-slot hero-player" data-scene="day03-count-done" data-autoplay="true"><p class="player-loading">動畫載入中。</p></figure>
  </section>

  <section class="goals" aria-labelledby="goals-title">
    <h2 id="goals-title">兩週後你會懂的三件事</h2>
    <dl class="goal-list">
      <div><dt>CRUD</dt><dd>新增、讀取、更新、刪除資料。先存在記憶體，再存進 JSON 檔、SQLite，最後做成 HTTP API。<span class="goal-days">Day 05、11、12、13</span></dd></div>
      <div><dt>物件導向</dt><dd>類別與封裝、介面與多型、繼承與組合，以及把程式分成 CLI、Service、Repository 三層。<span class="goal-days">Day 08、09、10</span></dd></div>
      <div><dt>TypeScript 設計規範</dt><dd>strict 設定、命名、<code>unknown</code> 與 <code>any</code>、泛型、discriminated union，以及用工具自動把關。<span class="goal-days">Day 07、14，每一課的「規範重點」</span></dd></div>
    </dl>
  </section>

  <section class="syllabus" id="syllabus" aria-labelledby="syllabus-title">
    <h2 id="syllabus-title">兩週課綱</h2>
    <p class="section-lead">同一個 Todo App 從 Day 05 開始，每天多學一個觀念就演進一步。完成一天就勾起來，進度只存在這個瀏覽器。</p>
    <div class="weeks">
      ${week(1, "第 1 週：TypeScript 基礎與第一版 CRUD", "型別、函式、陣列，接著用函式做出記憶體版的 CRUD，再拆成模組、加上測試。")}
      ${week(2, "第 2 週：物件導向、資料持久化與 API", "把 Todo 改寫成類別與分層架構，資料存進檔案與資料庫，最後做成 HTTP API。")}
    </div>
  </section>

  <section class="how" aria-labelledby="how-title">
    <h2 id="how-title">每天怎麼上課</h2>
    <ol class="how-steps">
      <li><strong>讀觀念說明</strong>，看懂每一張圖。</li>
      <li><strong>播放動畫</strong>：一步一步看程式怎麼執行，遇到「先猜猜看」就先想答案。</li>
      <li><strong>執行範例</strong>：在專案根目錄用 <code>bun run</code> 跑 <code>examples/</code> 裡的程式，改一個值再跑一次。</li>
      <li><strong>做練習</strong>：完成 <code>exercises/</code> 裡標著 TODO 的地方，用 <code>bun test day-NN</code> 檢查。也可以執行 <code>bun run study</code>，直接在網頁上寫、一鍵執行測試。</li>
      <li><strong>勾完自我檢查清單</strong>，再進入下一天。</li>
    </ol>
    <p class="how-setup">第一次使用：安裝 <a href="https://bun.com">Bun</a>，把 <a href="${SITE.repoUrl}">GitHub 上的專案</a> clone 下來，在根目錄執行 <code>bun install</code>。</p>
  </section>

  <section class="side-track" aria-labelledby="lc-title">
    <h2 id="lc-title">LeetCode 副線</h2>
    <p class="section-lead">十題經典的 Easy 題，每題都有可以自己改輸入的動畫。主線學到哪裡，就做對應的那一題，當作每天的加練。</p>
    <ol class="lc-list">${problemRows}</ol>
    <p><a class="text-link" href="leetcode/">看副線怎麼練</a></p>
  </section>
</main>`;
  return page({
    title: SITE.name,
    depth: 0,
    page: "home",
    body,
    active: "home",
  });
}

// ---------------------------------------------------------------------------
// LeetCode

export function leetcodeIndexPage(
  html: string,
  title: string,
  problems: ProblemInfo[],
): string {
  const rows = problems
    .map(
      (problem) => `<tr>
      <td class="lc-id">${problem.id}</td>
      <td><a href="${problem.slug}/">${escapeHtml(problem.title)}</a></td>
      <td>${escapeHtml(problem.technique)}</td>
      <td>${problem.afterDay ? `Day ${String(problem.afterDay).padStart(2, "0")} 之後` : ""}</td>
    </tr>`,
    )
    .join("");
  const body = `<main id="main" class="doc">
  <h1>${escapeHtml(title)}</h1>
  <div class="table-wrap"><table class="lc-table">
    <thead><tr><th>題號</th><th>題目</th><th>用到的技巧</th><th>建議時機</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <div class="prose">${html}</div>
</main>`;
  return page({ title, depth: 1, page: "leetcode", body, active: "leetcode" });
}

export function problemPage(
  problems: ProblemInfo[],
  problem: ProblemInfo,
  html: string,
): string {
  const depth = 2;
  const base = rel(depth);
  const index = problems.findIndex((item) => item.slug === problem.slug);
  const prev = problems[index - 1];
  const next = problems[index + 1];
  const pager = `<nav class="pager" aria-label="上一題與下一題">
    ${prev ? `<a class="pager-prev" href="${base}leetcode/${prev.slug}/"><span>上一題</span>${prev.id}. ${escapeHtml(prev.title)}</a>` : `<a class="pager-prev" href="${base}leetcode/"><span>回到</span>LeetCode 副線</a>`}
    ${next ? `<a class="pager-next" href="${base}leetcode/${next.slug}/"><span>下一題</span>${next.id}. ${escapeHtml(next.title)}</a>` : `<a class="pager-next" href="${base}leetcode/"><span>回到</span>LeetCode 副線</a>`}
  </nav>`;
  const facts = [
    `LeetCode ${problem.id}`,
    "Easy",
    problem.afterDay
      ? `建議在 Day ${String(problem.afterDay).padStart(2, "0")} 之後`
      : "",
    problem.technique ? `技巧：${problem.technique}` : "",
  ].filter((fact) => fact !== "");
  const body = `<main id="main" class="doc">
  <p class="crumb"><a href="${base}leetcode/">LeetCode 副線</a></p>
  <h1>${escapeHtml(problem.title)}</h1>
  <ul class="facts">${facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>
  <p class="lesson-source">${problem.leetcodeUrl ? `<a href="${escapeHtml(problem.leetcodeUrl)}">在 LeetCode 看原題</a>｜` : ""}<a href="${SITE.repoUrl}/tree/main/${problem.folder}">在 GitHub 打開練習檔</a></p>
  <div class="prose">${html}</div>
  ${pager}
</main>`;
  return page({
    title: problem.title,
    depth,
    page: problem.slug,
    body,
    active: "leetcode",
  });
}

export function docPage(options: {
  title: string;
  html: string;
  depth: number;
  page: string;
  active?: PageOptions["active"];
}): string {
  const body = `<main id="main" class="doc"><h1>${escapeHtml(options.title)}</h1><div class="prose">${options.html}</div></main>`;
  return page({
    title: options.title,
    depth: options.depth,
    page: options.page,
    body,
    ...(options.active ? { active: options.active } : {}),
  });
}
