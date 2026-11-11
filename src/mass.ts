/**
 * 주일 청년미사 순서.
 * 순서와 짧은 응답은 한국천주교주교회의 『미사 통상문』(로마 미사 경본)에 따른다.
 * 긴 고유 기도문·독서·신경·대영광송 전문 등은 싣지 않는다.
 */

import {
  esc,
  seoulToday,
  comingSunday,
  longDate,
  currentMass,
  sundayChipText,
  massSongChipText,
  mountSiteChrome,
} from "./hymns.js";

export { seoulToday, comingSunday, longDate, currentMass };

export type Role = "사제" | "부제" | "해설자" | "독서자" | "선창자" | "신자" | "성가대";

export type WeekHymnSlot = "entrance" | "offertory" | "communion" | "recessional";

export interface MassRecord {
  id: string;
  date: string;
  memo?: string;
  entrance: string[];
  offertory: string[];
  communion: string[];
  recessional: string[];
  updatedAt?: string;
}

export interface FixedHymn {
  name: string;
  number: string;
}

export interface ApiData {
  masses: MassRecord[];
  fixed: FixedHymn[];
}

export interface HymnBinding {
  kind: "week" | "fixed";
  slot?: WeekHymnSlot;
  fixedName?: string;
  label: string;
}

/** 해설자(○)·신자(●) 한 줄 대화, 또는 성모송 블록 */
export type LiturgyPart =
  | { kind: "verse"; lead: string; response: string }
  | { kind: "hail" }
  | { kind: "collect"; lead: string; response: string };

export interface MassStep {
  id: string;
  title: string;
  roles: Role[];
  response?: string;
  note?: string;
  hymns?: HymnBinding[];
  /** 주님의 천사처럼 긴 교송·기도문 */
  liturgy?: LiturgyPart[];
}

export interface MassSection {
  id: string;
  title: string;
  steps: MassStep[];
}

/** 통상문에 고정된 미사곡 기본 번호. /api/data의 fixed가 있으면 그 값을 우선한다. */
export const DEFAULT_FIXED: Readonly<Record<string, string>> = {
  "자비송": "380",
  "대영광송": "381",
  "거룩하시도다": "382",
  "신앙의 신비여": "412",
  "아멘": "419",
  "주님의 기도": "430",
  "주님께 나라와…": "444",
  "하느님의 어린양": "383",
};

/** 묵주기도(미사 전 기도)와 같은 성모송 교송 */
const HAIL_MARY = {
  lead: "은총이 가득하신 마리아님, 기뻐하소서!\n주님께서 함께 계시니 여인 중에 복되시며\n태중의 아들 예수님 또한 복되시나이다.",
  response:
    "천주의 성모 마리아님,\n이제와 저희 죽을 때에\n저희 죄인을 위하여 빌어주소서. 아멘.",
} as const;

export const MASS_SECTIONS: readonly MassSection[] = [
  {
    id: "intro",
    title: "시작 예식",
    steps: [
      {
        id: "pre-mass-announce",
        title: "안내",
        roles: ["해설자"],
        response:
          "찬미예수님!\n거룩한 미사에 방해가 되지않도록 휴대폰은 무음으로하시고 \n알람은 꺼주시기 바랍니다.\n삼종기도를 바치겠습니다.",
      },
      {
        id: "angelus",
        title: "삼종기도",
        roles: ["해설자", "신자"],
        note: "입당 성가에 앞서 바칩니다. ○ 해설자 · ● 신자.",
        liturgy: [
          {
            kind: "verse",
            lead: "주님의 천사가 마리아께 아뢰니",
            response: "성령으로 잉태하셨나이다.",
          },
          { kind: "hail" },
          {
            kind: "verse",
            lead: "“주님의 종이오니",
            response: "그대로 제게 이루어지소서!”",
          },
          { kind: "hail" },
          {
            kind: "verse",
            lead: "이에 말씀이 사람이 되시어",
            response: "저희 가운데 계시나이다.",
          },
          { kind: "hail" },
          {
            kind: "verse",
            lead: "천주의 성모님, 저희를 위하여 빌어주시어",
            response: "그리스도께서 약속하신 영원한 생명을 얻게 하소서.",
          },
          {
            kind: "collect",
            lead:
              "기도합시다.\n하느님, 천사의 아룀으로\n성자께서 사람이 되심을 알았으니\n성자의 수난과 십자가로\n부활의 영광에 이르는 은총을\n저희에게 내려 주소서.\n우리 주 그리스도를 통하여 비나이다.",
            response: "아멘.",
          },
        ],
      },
      {
        id: "entrance",
        title: "입당 성가",
        roles: ["성가대"],
        note: "사제와 봉사자들이 제대로 나아가는 동안 입당 노래를 합니다.",
        hymns: [{ kind: "week", slot: "entrance", label: "입당" }],
      },
      {
        id: "greeting",
        title: "성호경·인사",
        roles: ["사제", "신자"],
        response: "사제: 성부와 성자와 성령의 이름으로.\n신자: 아멘.\n사제가 인사하면 신자: 또한 사제의 영과 함께.",
        note: "사제나 부제, 또는 다른 봉사자(해설자)가 그날 미사의 뜻을 짧게 풀이할 수 있습니다.",
      },
      {
        id: "penitential",
        title: "참회·자비송",
        roles: ["사제", "신자", "성가대"],
        response: "사죄 기도 후 신자: 아멘.",
        note: "주일, 특히 부활 시기 주일에는 참회 예식 대신 성수 예식을 할 수 있습니다. 참회 예식에서 이미 자비송을 바쳤으면 따로 반복하지 않습니다.",
        hymns: [{ kind: "fixed", fixedName: "자비송", label: "자비송" }],
      },
      {
        id: "gloria",
        title: "대영광송",
        roles: ["성가대", "신자"],
        note: "대림·사순 시기에는 대영광송을 하지 않습니다.",
        hymns: [{ kind: "fixed", fixedName: "대영광송", label: "대영광송" }],
      },
      {
        id: "collect",
        title: "본기도",
        roles: ["사제", "신자"],
        response: "사제: 기도합시다.\n신자(마침): 아멘.",
      },
    ],
  },
  {
    id: "word",
    title: "말씀 전례",
    steps: [
      {
        id: "first-reading",
        title: "제1독서",
        roles: ["독서자", "신자"],
        response: "독서자: 주님의 말씀입니다.\n신자: 하느님, 감사합니다.",
      },
      {
        id: "psalm",
        title: "화답송",
        roles: ["선창자", "신자"],
        note: "시편 담당자나 선창자가 시편을 노래하거나 낭송하고, 신자는 후렴으로 응답합니다. 후렴은 그날 전례에 따릅니다.",
      },
      {
        id: "second-reading",
        title: "제2독서",
        roles: ["독서자", "신자"],
        response: "독서자: 주님의 말씀입니다.\n신자: 하느님, 감사합니다.",
        note: "주일 미사에는 제2독서가 있습니다.",
      },
      {
        id: "gospel-acclamation",
        title: "복음 환호송",
        roles: ["성가대", "신자"],
        note: "알렐루야를 합니다. 사순 시기에는 알렐루야 대신 다른 환호를 할 수 있습니다.",
      },
      {
        id: "gospel",
        title: "복음",
        roles: ["사제", "부제", "신자"],
        response: "사제(부제): 주님께서 여러분과 함께.\n신자: 또한 사제(부제)의 영과 함께.\n신자: 주님, 영광받으소서.\n사제(부제): 주님의 말씀입니다.\n신자: 그리스도님, 찬미합니다.",
      },
      {
        id: "homily",
        title: "강론",
        roles: ["사제"],
        note: "모든 주일과 의무 축일에는 강론을 합니다.",
      },
      {
        id: "creed",
        title: "신앙 고백",
        roles: ["신자"],
        note: "신경을 노래하거나 낭송합니다. 특히 사순 시기와 부활 시기에는 사도 신경을 바칠 수 있습니다.",
      },
      {
        id: "intercessions",
        title: "보편 지향 기도",
        roles: ["해설자", "신자"],
        note: "신자들의 기도를 바칩니다. 지향과 응답 가사는 그날 준비에 따릅니다.",
      },
    ],
  },
  {
    id: "eucharist",
    title: "성찬 전례",
    steps: [
      {
        id: "offertory",
        title: "봉헌 성가·예물 준비",
        roles: ["성가대", "사제", "신자"],
        note: "신경과 보편 지향 기도가 끝나면 봉헌 노래를 시작합니다. 사제의 초대에 신자가 응답한 뒤 예물 기도로 이어집니다.",
        hymns: [{ kind: "week", slot: "offertory", label: "봉헌" }],
      },
      {
        id: "prayer-over-gifts",
        title: "예물 기도",
        roles: ["사제", "신자"],
        response: "신자: 아멘.",
      },
      {
        id: "preface",
        title: "감사송",
        roles: ["사제", "신자"],
        response: "사제: 주님께서 여러분과 함께.\n신자: 또한 사제의 영과 함께.\n사제: 마음을 드높이.\n신자: 주님께 올립니다.\n사제: 우리 주 하느님께 감사합시다.\n신자: 마땅하고 옳은 일입니다.",
        note: "이어서 사제가 그날의 감사송을 바칩니다.",
      },
      {
        id: "sanctus",
        title: "거룩하시도다",
        roles: ["성가대", "신자"],
        hymns: [{ kind: "fixed", fixedName: "거룩하시도다", label: "거룩하시도다" }],
      },
      {
        id: "eucharistic-prayer",
        title: "성찬 기도",
        roles: ["사제"],
        note: "사제가 감사 기도(성찬 기도)를 바칩니다.",
      },
      {
        id: "mystery",
        title: "신앙의 신비여",
        roles: ["사제", "신자", "성가대"],
        response: "사제: 신앙의 신비여!\n신자: 주님께서 오실 때까지 주님의 죽음을 전하며 부활을 선포하나이다.",
        note: "통상문에 다른 환호 양식도 있습니다.",
        hymns: [{ kind: "fixed", fixedName: "신앙의 신비여", label: "신앙의 신비여" }],
      },
      {
        id: "doxology",
        title: "마침 영광송·아멘",
        roles: ["사제", "신자", "성가대"],
        response: "신자: 아멘.",
        hymns: [{ kind: "fixed", fixedName: "아멘", label: "아멘" }],
      },
    ],
  },
  {
    id: "communion-rite",
    title: "영성체 예식",
    steps: [
      {
        id: "our-father",
        title: "주님의 기도",
        roles: ["사제", "신자", "성가대"],
        response: "사제: 하느님의 자녀 되어, 구세주의 분부대로 삼가 아뢰오니\n이어서 사제와 신자가 함께 주님의 기도를 바칩니다.",
        hymns: [{ kind: "fixed", fixedName: "주님의 기도", label: "주님의 기도" }],
      },
      {
        id: "embolism",
        title: "주님께 나라와…",
        roles: ["신자", "성가대"],
        response: "사제의 이음 기도 후 신자: 주님께 나라와 권능과 영광이 영원히 있나이다.",
        hymns: [{ kind: "fixed", fixedName: "주님께 나라와…", label: "주님께 나라와…" }],
      },
      {
        id: "peace",
        title: "평화의 인사",
        roles: ["사제", "신자"],
        response: "사제: 주님의 평화가 항상 여러분과 함께.\n신자: 또한 사제의 영과 함께.",
        note: "이어서 서로 평화의 인사를 나눌 수 있습니다.",
      },
      {
        id: "agnus",
        title: "하느님의 어린양",
        roles: ["성가대", "신자"],
        hymns: [{ kind: "fixed", fixedName: "하느님의 어린양", label: "하느님의 어린양" }],
      },
      {
        id: "communion",
        title: "영성체·성체 성가",
        roles: ["사제", "신자", "성가대"],
        response: "사제와 신자: 주님, 제 안에 주님을 모시기에 합당치 않사오나 한 말씀만 하소서. 제 영혼이 곧 나으리이다.\n사제: 그리스도의 몸.\n신자: 아멘.",
        note: "영성체 노래는 사제가 성체를 모실 때에 시작합니다.",
        hymns: [{ kind: "week", slot: "communion", label: "성체" }],
      },
      {
        id: "prayer-after-communion",
        title: "영성체 후 기도",
        roles: ["사제", "신자"],
        response: "사제: 기도합시다.\n신자: 아멘.",
        note: "그전에 잠깐 침묵하며 기도할 수 있습니다.",
      },
    ],
  },
  {
    id: "concluding",
    title: "마침 예식",
    steps: [
      {
        id: "announcements",
        title: "공지",
        roles: ["사제", "해설자"],
        note: "필요에 따라 사목 권고나 공지 사항을 짧게 전합니다.",
      },
      {
        id: "blessing",
        title: "강복",
        roles: ["사제", "신자"],
        response: "사제: 주님께서 여러분과 함께.\n신자: 또한 사제의 영과 함께.\n강복 후 신자: 아멘.",
      },
      {
        id: "dismissal",
        title: "파견",
        roles: ["사제", "부제", "신자"],
        response: "부제 또는 사제: 미사가 끝났으니 가서 복음을 전합시다.\n신자: 하느님, 감사합니다.",
        note: "통상문에 다른 파견 양식도 있습니다.",
      },
      {
        id: "recessional",
        title: "파견 성가",
        roles: ["성가대"],
        note: "사제와 봉사자들이 제대에 절하고 물러갈 때 부릅니다.",
        hymns: [{ kind: "week", slot: "recessional", label: "파견" }],
      },
    ],
  },
];

export function normHymnName(s: string): string {
  return s.replace(/[\s.…·⋯]/g, "").toLowerCase();
}

export function resolveFixedNumber(name: string, fixed: readonly FixedHymn[]): string {
  const key = normHymnName(name);
  const fromApi = fixed.find((f) => normHymnName(f.name) === key);
  if (fromApi?.number) return fromApi.number;
  const fallback = Object.entries(DEFAULT_FIXED).find(([n]) => normHymnName(n) === key);
  return fallback?.[1] ?? "";
}

export function formatNumbers(nums: string[] | undefined): string {
  const list = (nums || []).map((n) => n.trim()).filter(Boolean);
  return list.length ? list.join(", ") : "–";
}

function rolesHTML(roles: Role[]): string {
  return roles.map((r) => `<span class="role">${esc(r)}</span>`).join("");
}

function hymnsHTML(bindings: HymnBinding[] | undefined, mass: MassRecord | null, fixed: FixedHymn[]): string {
  if (!bindings?.length) return "";
  return `<div class="hymns">${bindings.map((b) => {
    let nums = "–";
    if (b.kind === "week" && b.slot) nums = formatNumbers(mass?.[b.slot]);
    else if (b.kind === "fixed" && b.fixedName) nums = resolveFixedNumber(b.fixedName, fixed) || "–";
    const empty = nums === "–" ? " empty" : "";

    // 주간 성가(입당·봉헌·성체·파견): "입당 성가 (123) 입니다." 안내 문구
    if (b.kind === "week") {
      const name = /성가$/.test(b.label) ? b.label : `${b.label} 성가`;
      const cls = empty ? " hymn-announce empty" : " hymn-announce";
      return `<div class="hymn${cls}"><span class="hymn-sentence">${esc(name)} (${esc(nums)})번 입니다.</span></div>`;
    }

    return `<div class="hymn"><span class="hymn-label">${esc(b.label)}</span><span class="hymn-num${empty}">${esc(nums)}</span></div>`;
  }).join("")}</div>`;
}

function roleBlock(role: "commentator" | "faithful", label: string, text: string): string {
  return `<div class="role-block" data-role="${role}"><div class="role-label">${esc(label)}</div><div class="role-text">${esc(text)}</div></div>`;
}

function liturgyHTML(parts: LiturgyPart[] | undefined): string {
  if (!parts?.length) return "";
  const blocks = parts.map((p) => {
    if (p.kind === "hail") {
      return `<div class="liturgy-unit">
        <div class="liturgy-tag">성모송</div>
        ${roleBlock("commentator", "해설자", HAIL_MARY.lead)}
        ${roleBlock("faithful", "신자", HAIL_MARY.response)}
      </div>`;
    }
    if (p.kind === "collect") {
      return `<div class="liturgy-unit">
        <div class="liturgy-tag">마침 기도</div>
        ${roleBlock("commentator", "해설자", p.lead)}
        ${roleBlock("faithful", "신자", p.response)}
      </div>`;
    }
    return `<div class="liturgy-unit">
      ${roleBlock("commentator", "해설자", p.lead)}
      ${roleBlock("faithful", "신자", p.response)}
    </div>`;
  });
  return `<div class="liturgy">${blocks.join("")}</div>`;
}

function stepHTML(step: MassStep, mass: MassRecord | null, fixed: FixedHymn[]): string {
  const resp = step.response
    ? `<div class="resp">${esc(step.response).replace(/\n/g, "<br>")}</div>`
    : "";
  const note = step.note ? `<p class="note">${esc(step.note)}</p>` : "";
  const body = `
    ${hymnsHTML(step.hymns, mass, fixed)}
    ${liturgyHTML(step.liturgy)}
    ${resp}
    ${note}`;

  // 긴 기도문(삼종기도 등)은 접었다 펼 수 있게
  if (step.liturgy?.length) {
    return `<details class="step step-fold" id="step-${esc(step.id)}">
      <summary class="step-head">
        <h3>${esc(step.title)}</h3>
        <div class="roles">${rolesHTML(step.roles)}</div>
      </summary>
      <div class="step-fold-body">${body}</div>
    </details>`;
  }

  return `<article class="step" id="step-${esc(step.id)}">
    <div class="step-head">
      <h3>${esc(step.title)}</h3>
      <div class="roles">${rolesHTML(step.roles)}</div>
    </div>
    ${body}
  </article>`;
}

export function renderOrder(opts: {
  mass: MassRecord | null;
  fixed: FixedHymn[];
  today: string;
  sunday: string;
  loadError?: boolean;
}): string {
  const { mass, fixed, today, sunday, loadError } = opts;
  const dateLine = sundayChipText(today, sunday);
  const songLine = massSongChipText(mass, today, !!loadError);

  const sections = MASS_SECTIONS.map((sec) => {
    const body = sec.steps.map((st) => stepHTML(st, mass, fixed)).join("");
    return `<details class="section" open>
      <summary><span class="sec-title">${esc(sec.title)}</span></summary>
      <div class="sec-body">${body}</div>
    </details>`;
  }).join("");

  return `<header>
    <div class="cross">✝</div>
    <h1>주일 청년미사 순서</h1>
    <p>전례부와 성가대를 위한 주일 미사 안내</p>
    <div class="date-chip">${esc(dateLine)}</div>
    <div class="song-chip${mass ? "" : " muted"}">${esc(songLine)}</div>
  </header>
  <div class="order">${sections}</div>
  <p class="source">순서와 짧은 응답은 한국천주교주교회의 『미사 통상문』(로마 미사 경본)을 따랐습니다. 긴 기도문과 그날의 독서는 싣지 않았습니다.</p>`;
}

async function loadData(): Promise<{ data?: ApiData; error?: boolean }> {
  try {
    const r = await fetch("/api/data");
    if (!r.ok) throw new Error(String(r.status));
    const data = (await r.json()) as ApiData;
    return { data };
  } catch {
    return { error: true };
  }
}

export async function mount(root: HTMLElement): Promise<void> {
  root.innerHTML = `
<div class="wrap">
  <div data-site-nav></div>
  <main id="mass-root"><div class="loading">불러오는 중…</div></main>
  <footer>
    <div data-site-footer></div>
  </footer>
</div>`;
  mountSiteChrome("mass");

  const today = seoulToday();
  const sunday = comingSunday(today);
  const main = document.getElementById("mass-root");
  if (!main) return;
  const { data, error } = await loadData();
  const masses = data?.masses ?? [];
  const fixed = data?.fixed ?? [];
  const mass = currentMass(masses, today);
  main.innerHTML = renderOrder({ mass, fixed, today, sunday, loadError: !!error });
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
