/**
 * 주일 독서·복음 — missa.cbck.or.kr 매일미사 본문
 */

import {
  esc,
  seoulToday,
  comingSunday,
  sundayChipText,
  mountSiteChrome,
} from "./hymns.js";

interface DailyMissaSection {
  text?: string;
  citation?: string;
  source?: string;
  ref?: string;
}

interface DailyMissa {
  date: string | null;
  title: string;
  titlePlain: string;
  weekLabel?: string | null;
  announce?: string | null;
  color?: string;
  sourceUrl?: string | null;
  sections: Record<string, DailyMissaSection>;
}

const READING_TABS = [
  { id: "reading1", key: "제1독서", label: "제1독서" },
  { id: "psalm", key: "화답송", label: "화답송" },
  { id: "reading2", key: "제2독서", label: "제2독서" },
  { id: "alleluia", key: "복음 환호송", label: "환호송" },
  { id: "gospel", key: "복음", label: "복음" },
] as const;

function liturgyTitle(daily: DailyMissa | null): string {
  if (!daily) return "";
  if (daily.weekLabel) return daily.weekLabel.replace(/\s+/g, " ").trim();
  return (daily.titlePlain || daily.title || "")
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionBody(sec: DailyMissaSection | undefined): { meta: string; text: string } {
  if (!sec) return { meta: "", text: "" };
  const meta = [sec.source, sec.ref || sec.citation].filter(Boolean).join(" · ");
  return { meta, text: (sec.text || "").trim() };
}

function renderReadings(opts: {
  today: string;
  sunday: string;
  daily: DailyMissa | null;
  error?: boolean;
  activeId?: string;
}): string {
  const { today, sunday, daily, error } = opts;
  const dateLine = sundayChipText(today, sunday);
  const title = liturgyTitle(daily);
  const litChip = daily && title
    ? `<div class="liturgy-chip">${esc(daily.color ? `[${daily.color}] ${title}` : title)}</div>`
    : error
      ? `<div class="liturgy-chip muted">매일미사를 불러오지 못했어요</div>`
      : "";

  const available = READING_TABS.filter((t) => {
    const sec = daily?.sections?.[t.key];
    return !!(sec?.text || sec?.source || sec?.citation);
  });
  const tabs = available.length ? available : [...READING_TABS];
  const active =
    tabs.find((t) => t.id === opts.activeId)?.id ||
    tabs[0]?.id ||
    "reading1";

  const tabButtons = tabs
    .map((t) => {
      const selected = t.id === active ? ' aria-selected="true"' : ' aria-selected="false"';
      return `<button type="button" role="tab" id="tab-${esc(t.id)}" data-tab="${esc(t.id)}"${selected}>${esc(t.label)}</button>`;
    })
    .join("");

  const panels = tabs
    .map((t) => {
      const { meta, text } = sectionBody(daily?.sections?.[t.key]);
      const hidden = t.id === active ? "" : " hidden";
      const body = text
        ? `${meta ? `<p class="reading-meta">${esc(meta)}</p>` : ""}
           <div class="reading-text">${esc(text)}</div>`
        : `<p class="empty">${error ? "본문을 불러오지 못했어요." : "이 구간의 본문이 아직 없어요."}</p>`;
      return `<div class="tab-panel" id="panel-${esc(t.id)}" role="tabpanel" data-panel="${esc(t.id)}"${hidden}>
        <h2 class="sec-title">${esc(t.label)}</h2>
        <div class="sec-body">${body}</div>
      </div>`;
    })
    .join("");

  const sourceDaily = daily?.sourceUrl
    ? `<a href="${esc(daily.sourceUrl)}" target="_blank" rel="noopener">missa.cbck.or.kr</a>`
    : `<a href="https://missa.cbck.or.kr/" target="_blank" rel="noopener">missa.cbck.or.kr</a>`;

  return `<header>
    <div class="cross">✝</div>
    <h1>오늘 독서</h1>
    <p>주일 청년미사 제1독서·화답송·제2독서·복음</p>
    <div class="date-chip">${esc(dateLine)}</div>
    ${litChip}
  </header>
  <div class="mass-tabs" role="tablist" aria-label="독서 구간">${tabButtons}</div>
  <div class="order">${panels}</div>
  <p class="source">본문은 ${sourceDaily} 매일미사에서 불러왔습니다.</p>`;
}

async function loadDailyMissa(date: string): Promise<{ daily?: DailyMissa; error?: boolean }> {
  try {
    const r = await fetch(`/api/daily-missa?date=${encodeURIComponent(date)}`);
    if (!r.ok) throw new Error(String(r.status));
    const daily = (await r.json()) as DailyMissa;
    if (!daily?.title && !daily?.sections) throw new Error("empty");
    return { daily };
  } catch {
    return { error: true };
  }
}

function initTabs(root: ParentNode, initialId: string): void {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = root.querySelectorAll<HTMLElement>(".tab-panel");

  function select(tabId: string): void {
    tabs.forEach((t) => {
      const on = t.dataset.tab === tabId;
      t.setAttribute("aria-selected", String(on));
      if (on) t.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
    panels.forEach((p) => {
      p.hidden = p.dataset.panel !== tabId;
    });
    try {
      history.replaceState(null, "", `#${tabId}`);
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;
      if (id) select(id);
    });
  });

  if (initialId) select(initialId);
}

export async function mount(root: HTMLElement): Promise<void> {
  root.innerHTML = `
<div class="wrap">
  <div data-site-nav></div>
  <main id="readings-root"><div class="loading">독서 불러오는 중…</div></main>
  <footer>
    <div data-site-footer></div>
  </footer>
</div>`;
  mountSiteChrome("readings");

  const today = seoulToday();
  const sunday = comingSunday(today);
  const main = document.getElementById("readings-root");
  if (!main) return;

  const { daily = null, error } = await loadDailyMissa(sunday);
  const hash = location.hash.replace(/^#/, "");
  const activeId = READING_TABS.some((t) => t.id === hash) ? hash : undefined;

  main.innerHTML = renderReadings({ today, sunday, daily, error: !!error, activeId });
  initTabs(main, activeId || READING_TABS[0].id);
}

function boot(): void {
  const root = document.getElementById("app");
  if (!root) return;
  void mount(root);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
