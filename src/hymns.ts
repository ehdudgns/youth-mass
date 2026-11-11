/** 성가·날짜·사이트 네비 — 전 페이지 공통 */

export type SitePage = "home" | "songs" | "mass" | "rosary";

export const HYMN_FIELDS = [
  ["entrance", "입당"],
  ["offertory", "봉헌"],
  ["communion", "성체"],
  ["recessional", "파견"],
] as const;

export const DOW = ["일", "월", "화", "수", "목", "금", "토"] as const;

const SITE_LINKS: { id: SitePage; href: string; label: string; short: string }[] = [
  { id: "home", href: "/", label: "← 메인", short: "← 메인" },
  { id: "songs", href: "/songs/", label: "🎶 이번 주 성가", short: "🎶 성가" },
  { id: "mass", href: "/mass/", label: "🕊️ 미사 순서", short: "🕊️ 미사 순서" },
  { id: "rosary", href: "/rosary/", label: "📿 묵주기도", short: "📿 묵주기도" },
];

export function esc(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

export function seoulToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseYMD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function fmtYMD(dt: Date): string {
  return dt.toISOString().slice(0, 10);
}

export function comingSunday(today = seoulToday()): string {
  const t = parseYMD(today);
  const add = (7 - t.getUTCDay()) % 7;
  t.setUTCDate(t.getUTCDate() + add);
  return fmtYMD(t);
}

export function longDate(s: string, opts: { withYear?: boolean } = {}): string {
  const d = parseYMD(s);
  const body = `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${DOW[d.getUTCDay()]})`;
  return opts.withYear ? `${d.getUTCFullYear()}년 ${body}` : body;
}

export function shortDate(s: string): string {
  const d = parseYMD(s);
  return `${d.getUTCMonth() + 1}.${d.getUTCDate()}`;
}

/** 묵주기도 저장용 · 예: 11월 12일 */
export function monthDayLabel(s = seoulToday()): string {
  const d = parseYMD(s);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
}

export function seoulWeekday(today = seoulToday()): number {
  return parseYMD(today).getUTCDay();
}

export function currentMass<T extends { date: string }>(
  masses: T[],
  today = seoulToday()
): T | null {
  if (!masses?.length) return null;
  const asc = [...masses].sort((a, b) => a.date.localeCompare(b.date));
  return asc.find((m) => m.date >= today) || asc[asc.length - 1] || null;
}

export function massWhenLabel(
  m: { date: string } | null,
  today: string,
  style: "full" | "short" = "full"
): string {
  if (!m) return style === "short" ? "이번 미사" : "이번 미사 성가";
  if (m.date === today) return style === "short" ? "오늘 미사" : "오늘 미사 성가";
  if (m.date > today) return style === "short" ? "이번 미사" : "이번 미사 성가";
  return style === "short" ? "최근 미사" : "가장 최근 미사 성가";
}

export function massSongChipText(
  mass: { date: string } | null,
  today: string,
  loadError = false
): string {
  if (mass) return `${massWhenLabel(mass, today, "short")} 성가 · ${longDate(mass.date)}`;
  return loadError ? "성가 번호를 불러오지 못했어요" : "아직 등록된 성가가 없어요";
}

export function sundayChipText(today = seoulToday(), sunday = comingSunday(today)): string {
  return today === sunday
    ? `오늘 · ${longDate(today)} 주일`
    : `다가오는 주일 ${longDate(sunday)}`;
}

type MassSongs = {
  entrance?: string[];
  offertory?: string[];
  communion?: string[];
  recessional?: string[];
  date: string;
  id?: string;
};

export function songRowsHTML(m: MassSongs): string {
  return HYMN_FIELDS.map(([k, n]) => {
    const nums = m[k] || [];
    const v = nums.length
      ? nums.map((x) => `<span class="num">${esc(x)}</span>`).join("")
      : `<span class="empty">–</span>`;
    return `<div class="song"><span class="k">${n}</span><span class="v">${v}</span></div>`;
  }).join("");
}

export function fixedCardHTML(fixed: { name: string; number: string }[]): string {
  if (!fixed?.length) return "";
  return `<section class="card"><h3>청년 미사곡 <span style="font-weight:500;color:var(--muted);font-size:14px">· 매 미사 고정</span></h3>
    <div class="fixed">${fixed.map((f) =>
      `<div class="fx"><span class="n">${esc(f.name)}</span><span class="no">${esc(f.number)}</span></div>`
    ).join("")}</div></section>`;
}

export function songPreviewHTML(m: MassSongs | null, today = seoulToday()): string {
  if (!m) return `<div class="empty">아직 등록된 성가가 없어요</div>`;
  const rows = HYMN_FIELDS.map(([k, n]) => {
    const nums = (m[k] || []).join(", ") || "–";
    return `<div class="row"><span class="k">${n}</span><span class="v">${esc(nums)}</span></div>`;
  }).join("");
  return `
    <div class="label">${massWhenLabel(m, today, "short")}</div>
    <div class="when">${esc(longDate(m.date))}</div>
    <div class="rows">${rows}</div>`;
}

export function kakaoText(
  m: MassSongs,
  fixed: { name: string; number: string }[],
  withFixed: boolean
): string {
  let s = `${shortDate(m.date)} 성가 🎶\n`;
  s += HYMN_FIELDS.map(([k, n]) => `${n} : ${(m[k] || []).join(", ")}`).join("\n");
  if (withFixed && fixed?.length) {
    s += "\n\n미사중 청년 미사곡 🙏\n\n" + fixed.map((f) => `${f.name} ${f.number}`).join("\n");
  }
  return s;
}

export function songsPublicHTML(
  state: { masses: MassSongs[]; fixed: { name: string; number: string }[] },
  today = seoulToday()
): { html: string; current: MassSongs | null } {
  const m = currentMass(state.masses, today);
  if (!m) {
    return {
      current: null,
      html: `<div class="card hero"><div class="label">이번 미사 성가</div><p>아직 등록된 성가가 없어요.</p></div>${fixedCardHTML(state.fixed)}`,
    };
  }
  const others = state.masses.filter((x) => x.id !== m.id);
  const html = `
    <section class="card hero">
      <div class="label">${massWhenLabel(m, today, "full")}</div>
      <h2>${esc(longDate(m.date, { withYear: true }))}</h2>
      <div class="songs">${songRowsHTML(m)}</div>
      <label class="opt"><input type="checkbox" id="withFixed" ${localStorage.getItem("ym_withFixed") === "1" ? "checked" : ""}> 청년 미사곡도 같이 복사</label>
      <div class="btns">
        <button class="primary" id="copyBtn">💬 카톡으로 복사</button>
        <button class="share" id="shareBtn">🔗 링크 공유</button>
      </div>
    </section>
    ${fixedCardHTML(state.fixed)}
    <section class="card">
      <h3>지난 미사 기록</h3>
      ${others.length ? others.map((x) => `
        <details>
          <summary><span>${esc(longDate(x.date, { withYear: true }))}<span class="pre">${esc(HYMN_FIELDS.map(([k]) => (x[k] || [])[0]).filter(Boolean).slice(0, 2).join(" · "))}…</span></span></summary>
          <div class="hist-body">${songRowsHTML(x)}
            <button class="sm" data-copy="${esc(x.id || "")}" style="margin-top:8px">💬 이 날 성가 복사</button></div>
        </details>`).join("") : `<p class="hint">아직 지난 기록이 없어요.</p>`}
    </section>`;
  return { current: m, html };
}

export function siteNavHTML(current: SitePage): string {
  return `<nav class="site-nav" aria-label="페이지 이동">${SITE_LINKS
    .filter((l) => l.id !== current)
    .map((l) => `<a href="${l.href}">${esc(l.label)}</a>`)
    .join("")}</nav>`;
}

export function siteFooterLinksHTML(current: SitePage): string {
  return `<div class="site-nav site-nav-footer">${SITE_LINKS
    .filter((l) => l.id !== current)
    .map((l) => `<a href="${l.href}">${esc(l.short)}</a>`)
    .join("")}</div>`;
}

/** data-site-nav / data-site-footer 요소에 네비 채우기 */
export function mountSiteChrome(current: SitePage): void {
  document.querySelectorAll<HTMLElement>("[data-site-nav]").forEach((el) => {
    el.outerHTML = siteNavHTML(current);
  });
  document.querySelectorAll<HTMLElement>("[data-site-footer]").forEach((el) => {
    el.innerHTML = siteFooterLinksHTML(current);
  });
}
