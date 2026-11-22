/** 성가·날짜·사이트 네비 — 전 페이지 공통 */
export const HYMN_FIELDS = [
    ["entrance", "입당"],
    ["offertory", "봉헌"],
    ["communion", "성체"],
    ["recessional", "파견"],
];
export const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const SITE_LINKS = [
    { id: "home", href: "/", label: "← 메인", short: "← 메인" },
    { id: "songs", href: "/songs/", label: "🎶 이번 주 성가", short: "🎶 성가" },
    { id: "mass", href: "/mass/", label: "🕊️ 미사 순서", short: "🕊️ 미사 순서" },
    { id: "readings", href: "/readings/", label: "📖 오늘 독서", short: "📖 독서" },
    { id: "rosary", href: "/rosary/", label: "📿 묵주기도", short: "📿 묵주기도" },
];
export function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
export function seoulToday() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}
export function parseYMD(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}
export function fmtYMD(dt) {
    return dt.toISOString().slice(0, 10);
}
export function comingSunday(today = seoulToday()) {
    const t = parseYMD(today);
    const add = (7 - t.getUTCDay()) % 7;
    t.setUTCDate(t.getUTCDate() + add);
    return fmtYMD(t);
}
export function longDate(s, opts = {}) {
    const d = parseYMD(s);
    const body = `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${DOW[d.getUTCDay()]})`;
    return opts.withYear ? `${d.getUTCFullYear()}년 ${body}` : body;
}
export function shortDate(s) {
    const d = parseYMD(s);
    return `${d.getUTCMonth() + 1}.${d.getUTCDate()}`;
}
/** 묵주기도 저장용 · 예: 11월 12일 */
export function monthDayLabel(s = seoulToday()) {
    const d = parseYMD(s);
    return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
}
export function seoulWeekday(today = seoulToday()) {
    return parseYMD(today).getUTCDay();
}
export function currentMass(masses, today = seoulToday()) {
    if (!masses?.length)
        return null;
    const asc = [...masses].sort((a, b) => a.date.localeCompare(b.date));
    return asc.find((m) => m.date >= today) || asc[asc.length - 1] || null;
}
export function massWhenLabel(m, today, style = "full") {
    if (!m)
        return style === "short" ? "이번 미사" : "이번 미사 성가";
    if (m.date === today)
        return style === "short" ? "오늘 미사" : "오늘 미사 성가";
    if (m.date > today)
        return style === "short" ? "이번 미사" : "이번 미사 성가";
    return style === "short" ? "최근 미사" : "가장 최근 미사 성가";
}
export function massSongChipText(mass, today, loadError = false) {
    if (mass)
        return `${massWhenLabel(mass, today, "short")} 성가 · ${longDate(mass.date)}`;
    return loadError ? "성가 번호를 불러오지 못했어요" : "아직 등록된 성가가 없어요";
}
export function sundayChipText(today = seoulToday(), sunday = comingSunday(today)) {
    return today === sunday
        ? `오늘 · ${longDate(today)} 주일`
        : `다가오는 주일 ${longDate(sunday)}`;
}
/** 2차 헌금 목적 프리셋 (직접 입력도 가능) */
export const SECOND_COLLECTION_PURPOSES = [
    "성전 건축",
    "이웃돕기",
    "선교",
    "사회복지",
    "재해 구호",
    "청년부",
    "본당 행사",
];
export const SECOND_COLLECTION_MAX_LEN = 40;
export function eulReul(word) {
    const ch = word.trim().slice(-1);
    if (!ch)
        return "을";
    const code = ch.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3)
        return "을";
    return (code - 0xac00) % 28 === 0 ? "를" : "을";
}
export function normalizeSecondCollection(v) {
    const s = String(v ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, SECOND_COLLECTION_MAX_LEN);
    if (!s)
        return null;
    return s;
}
export function isPresetSecondCollection(v) {
    const s = String(v || "").trim();
    return SECOND_COLLECTION_PURPOSES.includes(s);
}
export function secondCollectionAnnounce(purpose, when) {
    const p = String(purpose || "").trim();
    if (!p)
        return "";
    const particle = eulReul(p);
    if (when === "pre")
        return `오늘은 ${p}${particle} 위한 2차 헌금이 있겠습니다.`;
    return `오늘은 ${p}${particle} 위한 2차 헌금이 있습니다.`;
}
export function songRowsHTML(m) {
    return HYMN_FIELDS.map(([k, n]) => {
        const nums = m[k] || [];
        const v = nums.length
            ? nums.map((x) => `<span class="num">${esc(x)}</span>`).join("")
            : `<span class="empty">–</span>`;
        return `<div class="song"><span class="k">${n}</span><span class="v">${v}</span></div>`;
    }).join("");
}
export function fixedCardHTML(fixed) {
    if (!fixed?.length)
        return "";
    return `<section class="card"><h3>청년 미사곡 <span style="font-weight:500;color:var(--muted);font-size:14px">· 매 미사 고정</span></h3>
    <div class="fixed">${fixed.map((f) => `<div class="fx"><span class="n">${esc(f.name)}</span><span class="no">${esc(f.number)}</span></div>`).join("")}</div></section>`;
}
export function songPreviewHTML(m, today = seoulToday()) {
    if (!m)
        return `<div class="empty">아직 등록된 성가가 없어요</div>`;
    const rows = HYMN_FIELDS.map(([k, n]) => {
        const nums = (m[k] || []).join(", ") || "–";
        return `<div class="row"><span class="k">${n}</span><span class="v">${esc(nums)}</span></div>`;
    }).join("");
    return `
    <div class="label">${massWhenLabel(m, today, "short")}</div>
    <div class="when">${esc(longDate(m.date))}</div>
    <div class="rows">${rows}</div>`;
}
export function kakaoText(m, fixed, withFixed) {
    let s = `${shortDate(m.date)} 성가 🎶\n`;
    s += HYMN_FIELDS.map(([k, n]) => `${n} : ${(m[k] || []).join(", ")}`).join("\n");
    if (withFixed && fixed?.length) {
        s += "\n\n미사중 청년 미사곡 🙏\n\n" + fixed.map((f) => `${f.name} ${f.number}`).join("\n");
    }
    return s;
}
export function songsPublicHTML(state, today = seoulToday()) {
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
export function siteNavHTML(current) {
    return `<nav class="site-nav" aria-label="페이지 이동">${SITE_LINKS
        .filter((l) => l.id !== current)
        .map((l) => `<a href="${l.href}">${esc(l.label)}</a>`)
        .join("")}</nav>`;
}
export function siteFooterLinksHTML(current) {
    return `<div class="site-nav site-nav-footer">${SITE_LINKS
        .filter((l) => l.id !== current)
        .map((l) => `<a href="${l.href}">${esc(l.short)}</a>`)
        .join("")}</div>`;
}
/** data-site-nav / data-site-footer 요소에 네비 채우기 */
export function mountSiteChrome(current) {
    document.querySelectorAll("[data-site-nav]").forEach((el) => {
        el.outerHTML = siteNavHTML(current);
    });
    document.querySelectorAll("[data-site-footer]").forEach((el) => {
        el.innerHTML = siteFooterLinksHTML(current);
    });
}
