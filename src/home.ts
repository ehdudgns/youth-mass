/**
 * 청년미사 도우미 홈.
 */

import {
  seoulToday,
  comingSunday,
  longDate,
  currentMass,
  songPreviewHTML,
  sundayChipText,
  mountSiteChrome,
} from "./hymns.js";

function redirectLegacyEdit(): boolean {
  const h = location.hash;
  const q = location.search;
  if (h === "#edit" || h === "#admin" || /[?&](edit|admin)=/.test(q)) {
    location.replace("/songs/" + q + h);
    return true;
  }
  return false;
}

export function mount(root: HTMLElement): void {
  root.innerHTML = `
<div class="wrap">
  <header>
    <div class="cross">✝</div>
    <h1>청년미사 도우미</h1>
    <p>주일 미사 순서와 성가, 묵주기도를 한곳에서</p>
    <div class="date-chip" id="dateChip">날짜 확인 중…</div>
  </header>

  <div class="cards">
    <a class="card" href="/mass/">
      <span class="arrow">→</span>
      <div class="emoji">🕊️</div>
      <h2>주일 미사 순서</h2>
      <p class="desc">청년미사 전례 순서와 이번 주 성가 번호</p>
    </a>

    <div class="card" style="padding:0;overflow:hidden">
      <a href="/songs/" style="display:block;text-decoration:none;color:inherit;padding:20px 18px 8px">
        <span class="arrow">→</span>
        <div class="emoji">🎶</div>
        <h2>이번 주 성가</h2>
        <p class="desc">입당·봉헌·성체·파견 번호와 카톡 복사</p>
        <div class="preview" id="songPreview">
          <div class="loading">성가 불러오는 중…</div>
        </div>
      </a>
      <div style="padding:0 18px 18px">
        <a class="edit-link" href="/songs/#edit">✏️ 성가 입력하기</a>
      </div>
    </div>

    <a class="card" href="/rosary/">
      <span class="arrow">→</span>
      <div class="emoji">📿</div>
      <h2>묵주기도 도우미</h2>
      <p class="desc">한 알씩 넘기며 따라 바치는 기도</p>
    </a>
  </div>

  <footer>
    <div data-site-footer></div>
    <p style="margin:8px 0 0">청년미사를 위한 작은 도우미예요</p>
  </footer>
</div>`;

  mountSiteChrome("home");

  const today = seoulToday();
  const sun = comingSunday();
  const chip = document.getElementById("dateChip");
  if (chip) {
    chip.textContent =
      today === sun
        ? sundayChipText(today, sun)
        : `오늘 ${longDate(today)} · 다가오는 주일 ${longDate(sun)}`;
  }

  const box = document.getElementById("songPreview");
  if (!box) return;

  fetch("/api/data")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((data: { masses?: { date: string; entrance?: string[]; offertory?: string[]; communion?: string[]; recessional?: string[] }[] }) => {
      box.innerHTML = songPreviewHTML(currentMass(data.masses || []), today);
    })
    .catch(() => {
      box.innerHTML = `<div class="empty">미리보기를 불러오지 못했어요 · 눌러서 확인하세요</div>`;
    });
}

function boot(): void {
  if (redirectLegacyEdit()) return;
  const root = document.getElementById("app");
  if (!root) return;
  mount(root);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
