/**
 * 묵주기도 도우미 — UI·상태·알 SVG·모드/단 수/로컬 저장.
 */
import { DOW, monthDayLabel, seoulWeekday, mountSiteChrome, } from "./hymns.js";
/* ---------- 기도문 (한국천주교주교회의) ---------- */
const P = {
    sign: {
        name: "성호경",
        text: "성부와 성자와 성령의 이름으로. 아멘.",
        note: "십자가를 잡고 이마, 가슴, 왼쪽 어깨, 오른쪽 어깨 순으로 십자 성호를 긋습니다.",
    },
    creed: {
        name: "사도신경",
        text: "전능하신 천주 성부\n천지의 창조주를 저는 믿나이다.\n그 외아들 우리 주 예수 그리스도님,\n<u>성령으로 인하여 동정 마리아께 잉태되어 나시고</u>\n본시오 빌라도 통치 아래서 고난을 받으시고\n십자가에 못 박혀 돌아가시고 묻히셨으며\n저승에 가시어 사흗날에 죽은 이들 가운데서 부활하시고\n하늘에 올라 전능하신 천주 성부 오른편에 앉으시며\n그리로부터 산 이와 죽은 이를 심판하러 오시리라 믿나이다.\n성령을 믿으며\n거룩하고 보편된 교회와\n모든 성인의 통공을 믿으며\n죄의 용서와\n육신의 부활을 믿으며\n영원한 삶을 믿나이다. 아멘.",
        note: "밑줄 부분에서 모두 깊은 절을 합니다.",
    },
    our: {
        name: "주님의 기도",
        text: "하늘에 계신 우리 아버지,\n아버지의 이름이 거룩히 빛나시며\n아버지의 나라가 오시며\n아버지의 뜻이 하늘에서와 같이 땅에서도 이루어지소서.\n오늘 저희에게 일용할 양식을 주시고\n저희에게 잘못한 이를 저희가 용서하오니\n저희 죄를 용서하시고\n저희를 유혹에 빠지지 않게 하시고\n악에서 구하소서. 아멘.",
    },
    hail: {
        name: "성모송",
        text: "은총이 가득하신 마리아님, 기뻐하소서!\n주님께서 함께 계시니 여인 중에 복되시며\n태중의 아들 예수님 또한 복되시나이다.\n천주의 성모 마리아님,\n이제와 저희 죽을 때에\n저희 죄인을 위하여 빌어주소서. 아멘.",
    },
    glory: {
        name: "영광송",
        text: "<u>영광이 성부와 성자와 성령께</u>\n처음과 같이\n이제와 항상 영원히. 아멘.",
        note: "밑줄 부분에서 고개를 숙입니다.",
    },
    fatima: {
        name: "구원을 비는 기도",
        text: "예수님, 저희 죄를 용서하시며\n저희를 지옥 불에서 구하시고\n연옥 영혼을 돌보시며\n가장 버림받은 영혼을 돌보소서.",
    },
    salve: {
        name: "성모 찬송",
        text: "○ 모후이시며 사랑이 넘친 어머니,\n우리의 생명, 기쁨, 희망이시여,\n● 당신 우러러 하와의 그 자손들이\n눈물을 흘리며 부르짖나이다,\n슬픔의 골짜기에서.\n○ 우리들의 보호자 성모님,\n불쌍한 저희를\n인자로운 눈으로 굽어보소서.\n● 귀양살이 끝날 때에\n당신의 아들 우리 주 예수님 뵙게 하소서.\n너그러우시고 자애로우시며\n오! 아름다우신 동정 마리아님.",
        note: "○ 인도자(또는 한쪽) ● 모두(또는 다른 쪽). 혼자 바칠 때는 모두 이어서 바칩니다.",
    },
    closing: {
        name: "마침 기도",
        text: "○ 천주의 성모님, 저희를 위하여 빌어 주시어\n● 그리스도께서 약속하신 영원한 생명을 얻게 하소서.\n✝ 기도합시다.\n하느님,\n외아드님께서 삶과 죽음과 부활로\n저희에게 영원한 구원을 마련해 주셨나이다.\n복되신 동정 마리아와 함께\n이 신비를 묵상하며 묵주 기도를 바치오니\n저희가 그 가르침을 따라\n영원한 생명을 얻게 하소서.\n우리 주 그리스도를 통하여 비나이다.\n◎ 아멘.",
        note: "○ 인도자(또는 한쪽) ● 모두(또는 다른 쪽). ✝ 인도자. 혼자 바칠 때는 모두 이어서 바칩니다.",
    },
    signEnd: {
        name: "성호경",
        text: "성부와 성자와 성령의 이름으로. 아멘.",
        note: "성호를 긋고 십자가에 친구(입맞춤)하며 마칩니다.",
    },
};
/* ---------- 신비 ---------- */
const M = {
    joyful: {
        name: "환희의 신비",
        days: "월·토",
        list: [
            ["마리아께서 예수님을 잉태하심을 묵상합시다.", "루카 1,26-38"],
            ["마리아께서 엘리사벳을 찾아보심을 묵상합시다.", "루카 1,39-56"],
            ["마리아께서 예수님을 낳으심을 묵상합시다.", "루카 2,1-20"],
            ["마리아께서 예수님을 성전에 바치심을 묵상합시다.", "루카 2,22-38"],
            ["마리아께서 잃으셨던 예수님을 성전에서 찾으심을 묵상합시다.", "루카 2,41-52"],
        ],
    },
    luminous: {
        name: "빛의 신비",
        days: "목",
        list: [
            ["예수님께서 세례받으심을 묵상합시다.", "마태 3,13-17"],
            ["예수님께서 카나에서 첫 기적을 행하심을 묵상합시다.", "요한 2,1-11"],
            ["예수님께서 하느님 나라를 선포하심을 묵상합시다.", "마르 1,14-15"],
            ["예수님께서 거룩하게 변모하심을 묵상합시다.", "마태 17,1-8"],
            ["예수님께서 성체성사를 세우심을 묵상합시다.", "마태 26,26-29"],
        ],
    },
    sorrowful: {
        name: "고통의 신비",
        days: "화·금",
        list: [
            ["예수님께서 우리를 위하여 피땀 흘리심을 묵상합시다.", "루카 22,39-46"],
            ["예수님께서 우리를 위하여 매맞으심을 묵상합시다.", "요한 19,1"],
            ["예수님께서 우리를 위하여 가시관 쓰심을 묵상합시다.", "마태 27,27-31"],
            ["예수님께서 우리를 위하여 십자가 지심을 묵상합시다.", "요한 19,16-17"],
            ["예수님께서 우리를 위하여 십자가에 못 박혀 돌아가심을 묵상합시다.", "루카 23,33-46"],
        ],
    },
    glorious: {
        name: "영광의 신비",
        days: "수·일",
        list: [
            ["예수님께서 부활하심을 묵상합시다.", "마태 28,1-10"],
            ["예수님께서 승천하심을 묵상합시다.", "사도 1,6-11"],
            ["예수님께서 성령을 보내심을 묵상합시다.", "사도 2,1-4"],
            ["예수님께서 마리아를 하늘에 불러올리심을 묵상합시다.", "묵시 12,1 참조 (교회 전승)"],
            ["예수님께서 마리아께 천상 모후의 관을 씌우심을 묵상합시다.", "묵시 12,1 참조 (교회 전승)"],
        ],
    },
};
// 일요일=0 ... 토요일=6
const BY_DAY = [
    "glorious",
    "joyful",
    "sorrowful",
    "glorious",
    "luminous",
    "sorrowful",
    "joyful",
];
const DAY_KO = DOW;
function seoulDateStr() {
    return monthDayLabel();
}
function isMysteryKey(v) {
    return typeof v === "string" && v in M;
}
/* ---------- 순서 ---------- */
const REMAIN_TEXT = "남은 단은 각자 바쳐 주시면 감사하겠습니다.";
const PENDING = {
    open: "시작 안내문 · 확인 후 추가 예정",
    close: "마침 안내문 · 확인 후 추가 예정",
};
const PENDING_HELP = "실제 문구는 확인되는 대로 넣을 예정입니다. 지금은 내용이 없으니 다음으로 넘기셔도 됩니다.";
const ROLE_SPLITS = {
    hail: {
        commentator: "은총이 가득하신 마리아님, 기뻐하소서!\n주님께서 함께 계시니 여인 중에 복되시며\n태중의 아들 예수님 또한 복되시나이다.",
        faithful: "천주의 성모 마리아님,\n이제와 저희 죽을 때에\n저희 죄인을 위하여 빌어주소서. 아멘.",
    },
    our: {
        commentator: "하늘에 계신 우리 아버지,\n아버지의 이름이 거룩히 빛나시며\n아버지의 나라가 오시며\n아버지의 뜻이 하늘에서와 같이 땅에서도 이루어지소서.",
        faithful: "오늘 저희에게 일용할 양식을 주시고\n저희에게 잘못한 이를 저희가 용서하오니\n저희 죄를 용서하시고\n저희를 유혹에 빠지지 않게 하시고\n악에서 구하소서. 아멘.",
    },
    glory: {
        commentator: "<u>영광이 성부와 성자와 성령께</u>",
        faithful: "처음과 같이\n이제와 항상 영원히. 아멘.",
    },
    closing: [
        {
            commentator: "천주의 성모님, 저희를 위하여 빌어 주시어",
            faithful: "그리스도께서 약속하신 영원한 생명을 얻게 하소서.",
        },
        {
            commentator: "기도합시다.\n하느님,\n외아드님께서 삶과 죽음과 부활로\n저희에게 영원한 구원을 마련해 주셨나이다.\n복되신 동정 마리아와 함께\n이 신비를 묵상하며 묵주 기도를 바치오니\n저희가 그 가르침을 따라\n영원한 생명을 얻게 하소서.\n우리 주 그리스도를 통하여 비나이다.",
            faithful: "아멘.",
        },
    ],
};
function samePrayerText(a, b) {
    const norm = (s) => String(s)
        .replace(/<[^>]+>/g, "")
        .replace(/[○●◎✝┼†]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    return norm(a) === norm(b);
}
function assertSplits() {
    Object.keys(ROLE_SPLITS).forEach((k) => {
        const parts = ROLE_SPLITS[k];
        const pairs = Array.isArray(parts) ? parts : [parts];
        const joined = pairs.map((p) => p.commentator + "\n" + p.faithful).join("\n");
        const prayer = P[k];
        if (prayer && !samePrayerText(joined, prayer.text)) {
            console.warn("기도문 분할이 원문과 다릅니다:", k);
        }
    });
}
assertSplits();
function addStep(list, key, bead, extra) {
    list.push(Object.assign({ key, bead }, extra || {}));
}
function buildPersonalSteps() {
    const list = [];
    addStep(list, "sign", "cross", { phase: "intro" });
    addStep(list, "creed", "cross", { phase: "intro" });
    addStep(list, "our", "P1", { phase: "intro" });
    for (let i = 1; i <= 3; i++)
        addStep(list, "hail", "a" + i, { phase: "intro", n: i });
    addStep(list, "glory", "P2", { phase: "intro" });
    for (let d = 1; d <= 5; d++) {
        const start = d === 1 ? "P2" : "L" + (d - 1);
        addStep(list, "announce", start, { decade: d });
        addStep(list, "our", start, { decade: d });
        for (let i = 1; i <= 10; i++)
            addStep(list, "hail", "d" + d + "-" + i, { decade: d, n: i });
        const end = d < 5 ? "L" + d : "M";
        addStep(list, "glory", end, { decade: d });
        addStep(list, "fatima", end, { decade: d });
    }
    addStep(list, "salve", "M", { phase: "end" });
    addStep(list, "closing", "M", { phase: "end" });
    addStep(list, "signEnd", "cross", { phase: "end" });
    return list;
}
function buildMassSteps(decades) {
    const n = Math.max(1, Math.min(5, decades | 0));
    const list = [];
    addStep(list, "openGuide", "cross", {
        phase: "intro",
        pending: true,
        pendingLabel: PENDING.open,
    });
    addStep(list, "sign", "cross", { phase: "intro" });
    addStep(list, "creed", "cross", { phase: "intro" });
    addStep(list, "our", "P1", { phase: "intro" });
    for (let i = 1; i <= 3; i++)
        addStep(list, "hail", "a" + i, { phase: "intro", n: i });
    addStep(list, "glory", "P2", { phase: "intro" });
    for (let d = 1; d <= n; d++) {
        const start = d === 1 ? "P2" : "L" + (d - 1);
        addStep(list, "announce", start, { decade: d });
        addStep(list, "our", start, { decade: d });
        for (let i = 1; i <= 10; i++)
            addStep(list, "hail", "d" + d + "-" + i, { decade: d, n: i });
        const end = d < 5 ? "L" + d : "M";
        addStep(list, "glory", end, { decade: d });
        addStep(list, "fatima", end, { decade: d });
    }
    addStep(list, "salve", "M", { phase: "end" });
    addStep(list, "closing", "M", { phase: "end" });
    if (n < 5)
        addStep(list, "remainRemark", "M", { phase: "end" });
    addStep(list, "closeGuide", "M", {
        phase: "end",
        pending: true,
        pendingLabel: PENDING.close,
    });
    addStep(list, "signEnd", "cross", { phase: "end" });
    return list;
}
function stepSig(s) {
    if (!s)
        return "";
    return [s.key, s.phase || "", s.decade || "", s.n || "", s.pending ? s.pendingLabel : ""].join("|");
}
function remapStep(oldSteps, oldIndex, newSteps, decades) {
    const cur = oldSteps[oldIndex];
    if (!cur)
        return 0;
    const sig = stepSig(cur);
    const exact = newSteps.findIndex((s) => stepSig(s) === sig);
    if (exact >= 0)
        return exact;
    if (cur.decade && cur.decade > decades) {
        const endIdx = newSteps.findIndex((s) => s.phase === "end");
        return endIdx >= 0 ? endIdx : newSteps.length - 1;
    }
    return Math.max(0, Math.min(newSteps.length - 1, oldIndex));
}
function pageHTML() {
    return `
<div data-site-nav></div>
<header>
  <h1>묵주기도</h1>
  <p>한 알씩 넘기며 성모님과 함께 예수님의 생애를 묵상합니다</p>
</header>

<div class="mode-tabs" role="tablist" aria-label="기도 모드">
  <button type="button" role="tab" id="tabPersonal" aria-selected="true">개인 기도</button>
  <button type="button" role="tab" id="tabMass" aria-selected="false">미사 전 기도</button>
</div>
<div class="decade-pick" id="decadePick">
  <strong>함께 바칠 단 수</strong>
  <div class="decade-btns" id="decadeBtns" role="group" aria-label="함께 바칠 단 수">
    <button type="button" data-decades="1" aria-pressed="false">1</button>
    <button type="button" data-decades="2" aria-pressed="false">2</button>
    <button type="button" data-decades="3" aria-pressed="true">3</button>
    <button type="button" data-decades="4" aria-pressed="false">4</button>
    <button type="button" data-decades="5" aria-pressed="false">5</button>
  </div>
  <p class="decade-hint">선택한 단까지 함께 바친 뒤 성모 찬송으로 이어집니다.</p>
</div>

<div class="controls">
  <span class="today" id="today"></span>
  <select id="mysterySel" aria-label="신비 선택">
    <option value="joyful">환희의 신비 (월·토)</option>
    <option value="luminous">빛의 신비 (목)</option>
    <option value="sorrowful">고통의 신비 (화·금)</option>
    <option value="glorious">영광의 신비 (수·일)</option>
  </select>
  <label><input type="checkbox" id="vib" checked> 진동</label>
  <button id="reset" type="button">처음부터</button>
</div>

<main>
  <div class="rosary-wrap">
    <svg id="rosary" viewBox="0 0 300 470" role="img" aria-label="묵주 그림, 현재 알이 금색으로 표시됩니다"></svg>
    <div class="legend">알을 누르면 그 자리로 이동합니다</div>
  </div>

  <div class="panel">
    <div class="step-sticky" id="stepSticky">
      <div class="status">
        <div class="status-main">
          <span class="where" id="where"></span>
          <span class="bead-frac" id="beadFrac"></span>
        </div>
        <span class="count" id="count"></span>
      </div>
      <div class="progress" aria-hidden="true"><div id="bar"></div></div>
      <div class="sticky-mystery" id="stickyMystery"></div>
    </div>
    <div class="mystery-slot">
    <div class="mystery" id="mystery">
      <div class="mlabel" id="mlabel"></div>
      <div class="mtitle" id="mtitle"></div>
      <div class="mref" id="mref"></div>
    </div>
    </div>
    <div class="prayer-stage" id="prayerStage">
    <div class="prayer" id="prayer" title="눌러서 다음 기도로">
      <h2 id="pname"></h2>
      <div class="text" id="ptext"></div>
      <div class="note" id="pnote"></div>
      <div class="tap">눌러서 다음으로 ›</div>
    </div>
    </div>
    <div class="done-msg" id="doneMsg">묵주기도를 모두 마쳤습니다. 평화를 빕니다. 🙏</div>
    <div class="nav">
      <button id="prev" type="button" aria-label="이전 기도">‹ 이전</button>
      <button id="next" type="button" aria-label="다음 기도">다음 ›</button>
    </div>
    <div class="hint">키보드: 스페이스 · → 다음 / ← 이전</div>
  </div>
</main>

<section class="info">
  <details>
    <summary>묵주기도란?</summary>
    <p>묵주기도는 묵주 알을 한 알씩 넘기며 주님의 기도, 성모송 열 번, 영광송을 한 ‘단’으로 하여 다섯 단을 바치는 기도입니다. 각 단마다 예수님과 성모님의 생애 가운데 한 장면(신비)을 묵상합니다. 정해진 기도문을 그 뜻을 새기며 바치는 염경기도와, 신비를 깊이 생각하는 묵상기도가 어우러진 기도입니다.</p>
    <p>신비는 환희·빛·고통·영광의 네 가지이며, 빛의 신비는 2002년 성 요한 바오로 2세 교황의 교서 「동정 마리아의 묵주기도」로 더해졌습니다. 보통 요일에 따라 바칩니다.</p>
    <ol>
      <li>십자가에서 성호경을 긋고 사도신경을 바칩니다.</li>
      <li>큰 알에서 주님의 기도, 작은 알 세 개에서 성모송, 다음 알에서 영광송을 바칩니다.</li>
      <li>신비 제1단을 알리고 주님의 기도, 작은 알 열 개에서 성모송 열 번, 영광송과 구원의 기도를 바칩니다.</li>
      <li>같은 방법으로 제5단까지 바친 뒤 성모 찬송을 바치고 성호경으로 마칩니다.</li>
    </ol>
  </details>
  <details>
    <summary>네 가지 신비 전체 보기</summary>
    <div id="mystTable"></div>
  </details>
</section>

<footer>
  <div data-site-footer></div>
  기도문은 한국천주교주교회의 번역(『가톨릭 기도서』)을 따랐습니다.<br>
  이 페이지는 상업적 목적이 없는 개인 기도 도우미입니다. 성경 구절 표기는 참고용입니다.<br>
  진행 상황은 이 기기의 브라우저에만 저장됩니다.
</footer>`;
}
export function mount(root) {
    root.innerHTML = pageHTML();
    mountSiteChrome("rosary");
    initRosary();
}
function initRosary() {
    let STEPS = buildPersonalSteps();
    let TOTAL = STEPS.length;
    let TOTAL_HAIL = STEPS.filter((s) => s.key === "hail").length;
    function useSteps(list) {
        STEPS = list;
        TOTAL = STEPS.length;
        TOTAL_HAIL = STEPS.filter((s) => s.key === "hail").length;
    }
    /* ---------- 묵주 그림 ---------- */
    const svg = document.getElementById("rosary");
    const NS = "http://www.w3.org/2000/svg";
    const beadEls = {};
    const C = { x: 150, y: 145, r: 118 };
    function el(tag, attrs) {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs)
            e.setAttribute(k, String(attrs[k]));
        return e;
    }
    svg.appendChild(el("circle", { cx: C.x, cy: C.y, r: C.r, class: "cord" }));
    svg.appendChild(el("line", { x1: 150, y1: C.y + C.r, x2: 150, y2: 420, class: "cord" }));
    const SLOTS = 55;
    const loopOrder = [];
    for (let d = 1; d <= 5; d++) {
        for (let i = 1; i <= 10; i++)
            loopOrder.push("d" + d + "-" + i);
        if (d < 5)
            loopOrder.push("L" + d);
    }
    loopOrder.forEach((id, idx) => {
        const k = idx + 1;
        const a = Math.PI / 2 + (k * 2 * Math.PI) / SLOTS;
        const x = C.x + C.r * Math.cos(a);
        const y = C.y + C.r * Math.sin(a);
        const large = id[0] === "L";
        const c = el("circle", {
            cx: x.toFixed(1),
            cy: y.toFixed(1),
            r: large ? 8 : 5.2,
            class: "bead" + (large ? " large" : ""),
        });
        c.dataset.id = id;
        svg.appendChild(c);
        beadEls[id] = c;
    });
    const medal = el("path", {
        d: `M150 ${C.y + C.r - 12} C 162 ${C.y + C.r - 12} 166 ${C.y + C.r + 2} 150 ${C.y + C.r + 16} C 134 ${C.y + C.r + 2} 138 ${C.y + C.r - 12} 150 ${C.y + C.r - 12} Z`,
        class: "medal",
    });
    medal.dataset.id = "M";
    svg.appendChild(medal);
    beadEls.M = medal;
    const pend = [
        ["P2", 296, 8, true],
        ["a3", 318, 5.2],
        ["a2", 336, 5.2],
        ["a1", 354, 5.2],
        ["P1", 378, 8, true],
    ];
    pend.forEach(([id, y, r, large]) => {
        const c = el("circle", {
            cx: 150,
            cy: y,
            r,
            class: "bead" + (large ? " large" : ""),
        });
        c.dataset.id = id;
        svg.appendChild(c);
        beadEls[id] = c;
    });
    const cross = el("path", {
        d: "M146 396 h8 v12 h12 v8 h-12 v28 h-8 v-28 h-12 v-8 h12 z",
        class: "cross",
    });
    cross.dataset.id = "cross";
    svg.appendChild(cross);
    beadEls.cross = cross;
    const halo = el("circle", { cx: 150, cy: 420, r: 13, class: "halo" });
    svg.appendChild(halo);
    function centerOf(e) {
        const b = e.getBBox();
        return [b.x + b.width / 2, b.y + b.height / 2, Math.max(b.width, b.height) / 2];
    }
    /* ---------- 상태 ---------- */
    const KEY_V1 = "rosary-helper-v1";
    const KEY = "rosary-helper-v2";
    const sel = document.getElementById("mysterySel");
    const vib = document.getElementById("vib");
    const todayKey = BY_DAY[seoulWeekday()];
    function clampDecades(n) {
        const v = parseInt(String(n), 10);
        return v >= 1 && v <= 5 ? v : 3;
    }
    function emptySlice(mystery) {
        return { step: 0, mystery, day: seoulDateStr() };
    }
    let store = {
        mode: "personal",
        vib: true,
        personal: emptySlice(todayKey),
        mass: Object.assign(emptySlice(todayKey), { decades: 3 }),
    };
    try {
        const v2 = JSON.parse(localStorage.getItem(KEY) || "null");
        if (v2 && typeof v2 === "object") {
            if (v2.mode === "mass" || v2.mode === "personal")
                store.mode = v2.mode;
            if (typeof v2.vib === "boolean")
                store.vib = v2.vib;
            if (v2.personal && typeof v2.personal.step === "number" && isMysteryKey(v2.personal.mystery)) {
                store.personal = Object.assign(emptySlice(todayKey), v2.personal);
            }
            if (v2.mass && typeof v2.mass.step === "number" && isMysteryKey(v2.mass.mystery)) {
                store.mass = Object.assign(emptySlice(todayKey), { decades: 3 }, v2.mass);
            }
        }
        else {
            const v1 = JSON.parse(localStorage.getItem(KEY_V1) || "null");
            if (v1 && typeof v1.step === "number" && isMysteryKey(v1.mystery)) {
                store.vib = v1.vib !== false;
                store.personal = {
                    step: v1.step,
                    mystery: v1.mystery,
                    day: v1.day || seoulDateStr(),
                };
            }
        }
    }
    catch {
        /* ignore corrupt storage */
    }
    store.mass.decades = clampDecades(store.mass.decades);
    if (location.hash === "#mass")
        store.mode = "mass";
    if (location.hash === "#personal")
        store.mode = "personal";
    const state = {
        mode: store.mode,
        vib: store.vib !== false,
        step: 0,
        mystery: todayKey,
        decades: store.mass.decades,
    };
    function applySlice() {
        const sl = state.mode === "mass" ? store.mass : store.personal;
        state.mystery = isMysteryKey(sl.mystery) ? sl.mystery : todayKey;
        if (sl.day !== seoulDateStr() && sl.step === 0)
            state.mystery = todayKey;
        if (state.mode === "mass") {
            state.decades = clampDecades(store.mass.decades);
            useSteps(buildMassSteps(state.decades));
        }
        else {
            useSteps(buildPersonalSteps());
        }
        state.step = Math.max(0, Math.min(TOTAL - 1, sl.step | 0));
    }
    function save() {
        const sl = {
            step: state.step,
            mystery: state.mystery,
            day: seoulDateStr(),
        };
        if (state.mode === "mass") {
            store.mass = Object.assign({}, sl, { decades: state.decades });
        }
        else {
            store.personal = sl;
        }
        store.mode = state.mode;
        store.vib = state.vib;
        try {
            localStorage.setItem(KEY, JSON.stringify(store));
        }
        catch {
            /* ignore quota */
        }
    }
    applySlice();
    sel.value = state.mystery;
    vib.checked = state.vib !== false;
    const todayEl = document.getElementById("today");
    if (todayEl) {
        todayEl.textContent = `오늘 ${seoulDateStr()} (${DAY_KO[seoulWeekday()]}) · ${M[todayKey].name}`;
    }
    const $ = (id) => document.getElementById(id);
    function syncModeUI() {
        const mass = state.mode === "mass";
        document.body.classList.toggle("mode-mass", mass);
        $("tabPersonal").setAttribute("aria-selected", mass ? "false" : "true");
        $("tabMass").setAttribute("aria-selected", mass ? "true" : "false");
        document.querySelectorAll("#decadeBtns button").forEach((b) => {
            const btn = b;
            btn.setAttribute("aria-pressed", String(Number(btn.dataset.decades) === state.decades));
        });
        const want = mass ? "#mass" : "#personal";
        if (location.hash !== want &&
            (location.hash === "#mass" || location.hash === "#personal" || location.hash === "")) {
            try {
                history.replaceState(null, "", location.pathname + location.search + want);
            }
            catch {
                /* ignore */
            }
        }
    }
    function setMode(mode) {
        if (mode !== "personal" && mode !== "mass")
            return;
        if (mode === state.mode) {
            syncModeUI();
            return;
        }
        finishAnim();
        save();
        state.mode = mode;
        applySlice();
        sel.value = state.mystery;
        syncModeUI();
        render();
        window.scrollTo({ top: 0, behavior: prefersReduce() ? "auto" : "smooth" });
    }
    function setDecades(n) {
        n = clampDecades(n);
        if (state.mode !== "mass") {
            state.decades = n;
            store.mass.decades = n;
            save();
            syncModeUI();
            return;
        }
        if (n === state.decades) {
            syncModeUI();
            return;
        }
        finishAnim();
        const oldSteps = STEPS;
        const oldIndex = state.step;
        state.decades = n;
        const nextSteps = buildMassSteps(n);
        const mapped = remapStep(oldSteps, oldIndex, nextSteps, n);
        useSteps(nextSteps);
        state.step = mapped;
        save();
        syncModeUI();
        render();
    }
    /* ---------- 화면 ---------- */
    function roleHTML(parts) {
        const pairs = Array.isArray(parts) ? parts : [parts];
        return pairs
            .map((p) => `<div class="role-block" data-role="commentator"><div class="role-label">해설자</div><div class="role-text">${p.commentator}</div></div>` +
            `<div class="role-block" data-role="faithful"><div class="role-label">신자</div><div class="role-text">${p.faithful}</div></div>`)
            .join("");
    }
    function pendingHTML(label) {
        return `<div class="pending-box"><div class="pending-badge">확인 후 추가 예정</div><p class="pending-marker">${label}</p><p class="pending-help">${PENDING_HELP}</p></div>`;
    }
    function render() {
        const s = STEPS[state.step];
        const m = M[state.mystery];
        let name;
        let text = "";
        let note = "";
        let html = null;
        if (s.pending) {
            name = s.pendingLabel || "";
            html = pendingHTML(s.pendingLabel || "");
            note = "확인 전이니 다음으로 넘기셔도 됩니다.";
        }
        else if (s.key === "remainRemark") {
            name = "해설자 안내";
            html = `<div class="role-block" data-role="commentator"><div class="role-label">해설자</div><div class="role-text">${REMAIN_TEXT}</div></div>`;
            note = "";
        }
        else if (s.key === "announce") {
            name = `${m.name} 제${s.decade}단`;
            text = m.list[(s.decade || 1) - 1][0];
            note = "신비를 알리고 잠시 그 장면을 마음에 그려 봅니다.";
        }
        else {
            const p = P[s.key];
            name = p.name;
            text = p.text;
            note = p.note || "";
            if (state.mode === "mass" && ROLE_SPLITS[s.key])
                html = roleHTML(ROLE_SPLITS[s.key]);
        }
        $("pname").textContent = name;
        $("ptext").innerHTML = html != null ? html : text;
        $("pnote").textContent = note;
        const tap = $("prayer").querySelector(".tap");
        if (tap)
            tap.textContent = s.pending ? "건너뛰고 다음으로 ›" : "눌러서 다음으로 ›";
        let where;
        if (s.pending) {
            where = s.key === "openGuide" ? "시작 안내" : "마침 안내";
        }
        else if (s.key === "remainRemark") {
            where = "해설자 안내";
        }
        else if (s.decade) {
            const lbl = {
                announce: "신비 묵상",
                our: "주님의 기도",
                glory: "영광송",
                fatima: "구원을 비는 기도",
            };
            where =
                s.key === "hail"
                    ? `${s.decade}단 · ${s.n}번째 성모송`
                    : `${s.decade}단 · ${lbl[s.key]}`;
        }
        else if (s.phase === "intro") {
            where =
                s.key === "hail"
                    ? `시작 기도 · 성모송 ${s.n}/3`
                    : `시작 기도 · ${P[s.key].name}`;
        }
        else {
            where = `마침 기도 · ${P[s.key].name}`;
        }
        $("where").textContent = where;
        const hailDone = STEPS.slice(0, state.step + 1).filter((x) => x.key === "hail").length;
        $("count").textContent = `${state.step + 1} / ${TOTAL} · 성모송 ${hailDone}/${TOTAL_HAIL}`;
        $("bar").style.width = ((state.step + 1) / TOTAL) * 100 + "%";
        const frac = $("beadFrac");
        if (s.key === "hail") {
            frac.textContent = `성모송 ${s.n}/${s.decade ? 10 : 3}`;
        }
        else {
            frac.textContent = "";
        }
        const introHail = s.key === "hail" && s.phase === "intro" && !s.decade;
        if (introHail) {
            $("stickyMystery").textContent = "";
        }
        else if (state.mode === "mass") {
            $("stickyMystery").textContent = s.decade
                ? `${m.name} 제${s.decade}단 · 함께 ${state.decades}단`
                : `${m.name} · 함께 ${state.decades}단`;
        }
        else {
            $("stickyMystery").textContent = s.decade ? `${m.name} 제${s.decade}단` : m.name;
        }
        const mc = $("mystery");
        if (introHail) {
            mc.classList.add("hidden");
        }
        else if (s.decade) {
            mc.classList.remove("hidden");
            $("mlabel").textContent = `${m.name} 제${s.decade}단`;
            $("mtitle").textContent = m.list[s.decade - 1][0];
            $("mref").textContent = "📖 " + m.list[s.decade - 1][1];
        }
        else if (s.phase === "end") {
            mc.classList.remove("hidden");
            $("mlabel").textContent = m.name;
            $("mtitle").textContent =
                state.mode === "mass" && state.decades < 5
                    ? `함께 바친 단: ${state.decades}단`
                    : "다섯 단을 모두 바쳤습니다.";
            $("mref").textContent = "";
        }
        else if (s.pending && s.key === "openGuide") {
            mc.classList.add("hidden");
        }
        else {
            mc.classList.remove("hidden");
            $("mlabel").textContent = `오늘 바칠 신비 · ${m.name}`;
            $("mtitle").textContent = "1단 " + m.list[0][0];
            $("mref").textContent = "";
        }
        const used = new Set(STEPS.map((x) => x.bead));
        const curBead = s.bead;
        const doneBeads = new Set(STEPS.slice(0, state.step).map((x) => x.bead));
        for (const id in beadEls) {
            const on = used.has(id);
            beadEls[id].classList.toggle("unused", !on);
            beadEls[id].classList.toggle("current", on && id === curBead);
            beadEls[id].classList.toggle("done", on && doneBeads.has(id) && id !== curBead);
        }
        const [hx, hy, hr] = centerOf(beadEls[curBead]);
        halo.setAttribute("cx", hx.toFixed(1));
        halo.setAttribute("cy", hy.toFixed(1));
        halo.setAttribute("r", (Math.min(hr, 16) + 6).toFixed(1));
        $("prev").disabled = state.step === 0;
        $("next").textContent = state.step === TOTAL - 1 ? "마침 ✓" : "다음 ›";
        $("doneMsg").classList.toggle("show", false);
        save();
    }
    function prefersReduce() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    function isWideScreen() {
        return window.matchMedia("(min-width: 761px)").matches;
    }
    const ANIM_MS = 300;
    const ANIM_MS_REDUCE = 220;
    const ANIM_MS_DESKTOP = 280;
    const ANIM_CLASSES = [
        "anim-in-next",
        "anim-in-prev",
        "anim-out-next",
        "anim-out-prev",
    ];
    function animMs() {
        if (prefersReduce())
            return ANIM_MS_REDUCE;
        if (isWideScreen())
            return ANIM_MS_DESKTOP;
        return ANIM_MS;
    }
    let animating = false;
    let animTimer = 0;
    function finishAnim() {
        clearTimeout(animTimer);
        animTimer = 0;
        document.querySelectorAll(".prayer-ghost").forEach((node) => node.remove());
        const prayer = $("prayer");
        if (prayer)
            ANIM_CLASSES.forEach((c) => prayer.classList.remove(c));
        animating = false;
    }
    function pulseCues() {
        const sticky = $("stepSticky");
        sticky.classList.remove("flash");
        void sticky.offsetWidth;
        sticky.classList.add("flash");
        const frac = $("beadFrac");
        const where = $("where");
        const pulseEl = frac && frac.textContent ? frac : where;
        [frac, where].forEach((node) => node && node.classList.remove("pulse"));
        void pulseEl.offsetWidth;
        pulseEl.classList.add("pulse");
        document.querySelectorAll(".bead-pop").forEach((node) => node.classList.remove("bead-pop"));
        const cur = document.querySelector("#rosary .current");
        if (cur) {
            requestAnimationFrame(() => cur.classList.add("bead-pop"));
        }
    }
    function scrollToPrayer(reduce) {
        const prayer = $("prayer");
        const sticky = $("stepSticky");
        const rect = prayer.getBoundingClientRect();
        if (isWideScreen()) {
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const outOfView = rect.bottom <= 0 || rect.top >= vh || rect.top < 0;
            if (!outOfView)
                return;
            const y = window.scrollY + rect.top - 12;
            window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
            return;
        }
        const stickyH = sticky.getBoundingClientRect().height;
        const y = window.scrollY + rect.top - stickyH - 6;
        window.scrollTo({ top: Math.max(0, y), behavior: reduce ? "auto" : "smooth" });
    }
    function startTransition(dir, toStep) {
        if (animating)
            return false;
        const target = toStep != null ? toStep : state.step + dir;
        if (target === state.step || target < 0 || target > TOTAL - 1)
            return false;
        dir = target > state.step ? 1 : -1;
        animating = true;
        const stage = $("prayerStage");
        const prayerBefore = $("prayer");
        const ghost = prayerBefore.cloneNode(true);
        ghost.id = "prayerGhost";
        ghost.classList.add("prayer-ghost");
        ghost.setAttribute("aria-hidden", "true");
        ANIM_CLASSES.forEach((c) => ghost.classList.remove(c));
        // Keep ghost the same size as the live card while it slides out
        ghost.style.height = `${prayerBefore.getBoundingClientRect().height}px`;
        stage.appendChild(ghost);
        state.step = target;
        buzz();
        render();
        const prayer = $("prayer");
        const reduce = prefersReduce();
        const outClass = dir > 0 ? "anim-out-next" : "anim-out-prev";
        const inClass = dir > 0 ? "anim-in-next" : "anim-in-prev";
        ghost.classList.add(outClass);
        ANIM_CLASSES.forEach((c) => prayer.classList.remove(c));
        void prayer.offsetWidth;
        prayer.classList.add(inClass);
        pulseCues();
        scrollToPrayer(reduce);
        clearTimeout(animTimer);
        animTimer = window.setTimeout(finishAnim, animMs());
        return true;
    }
    function buzz() {
        if (state.vib && navigator.vibrate) {
            try {
                navigator.vibrate(12);
            }
            catch {
                /* ignore */
            }
        }
    }
    function next() {
        if (animating)
            return;
        if (state.step < TOTAL - 1) {
            startTransition(1);
        }
        else {
            $("doneMsg").classList.add("show");
            if (state.vib && navigator.vibrate) {
                try {
                    navigator.vibrate([20, 60, 20]);
                }
                catch {
                    /* ignore */
                }
            }
        }
    }
    function prev() {
        if (animating)
            return;
        if (state.step > 0)
            startTransition(-1);
    }
    $("next").addEventListener("click", next);
    $("prev").addEventListener("click", prev);
    $("prayer").addEventListener("click", next);
    $("reset").addEventListener("click", () => {
        if (state.step === 0 || confirm("처음부터 다시 시작할까요?")) {
            finishAnim();
            state.step = 0;
            state.mystery = todayKey;
            sel.value = todayKey;
            render();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
    sel.addEventListener("change", () => {
        if (isMysteryKey(sel.value))
            state.mystery = sel.value;
        render();
        sel.blur();
    });
    vib.addEventListener("change", () => {
        state.vib = vib.checked;
        save();
    });
    svg.addEventListener("click", (e) => {
        const t = e.target;
        const id = t?.dataset?.id;
        if (!id)
            return;
        const idx = STEPS.findIndex((x) => x.bead === id);
        if (idx >= 0)
            startTransition(idx > state.step ? 1 : -1, idx);
    });
    document.addEventListener("keydown", (e) => {
        const target = e.target;
        if (!target)
            return;
        if (target.tagName === "SELECT" ||
            target.tagName === "INPUT" ||
            e.altKey ||
            e.ctrlKey ||
            e.metaKey)
            return;
        if (target.closest && target.closest(".mode-tabs, .decade-btns"))
            return;
        if ([" ", "ArrowRight", "ArrowDown", "Enter", "PageDown"].includes(e.key)) {
            if (target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " "))
                return;
            e.preventDefault();
            next();
        }
        else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)) {
            e.preventDefault();
            prev();
        }
    });
    $("tabPersonal").addEventListener("click", () => setMode("personal"));
    $("tabMass").addEventListener("click", () => setMode("mass"));
    document.querySelectorAll("#decadeBtns button").forEach((b) => {
        b.addEventListener("click", () => setDecades(Number(b.dataset.decades)));
    });
    window.addEventListener("hashchange", () => {
        if (location.hash === "#mass")
            setMode("mass");
        else if (location.hash === "#personal")
            setMode("personal");
    });
    let mystHtml = "";
    for (const k of Object.keys(M)) {
        mystHtml += `<p><strong>${M[k].name}</strong> (${M[k].days})</p><table class="myst">`;
        M[k].list.forEach((x, i) => {
            mystHtml += `<tr><td style="white-space:nowrap">${i + 1}단</td><td>${x[0]}</td><td style="white-space:nowrap;color:#8a8072">${x[1]}</td></tr>`;
        });
        mystHtml += `</table>`;
    }
    $("mystTable").innerHTML = mystHtml;
    window.__rosary = {
        get STEPS() {
            return STEPS;
        },
        get TOTAL() {
            return TOTAL;
        },
        get TOTAL_HAIL() {
            return TOTAL_HAIL;
        },
        get step() {
            return state.step;
        },
        get mode() {
            return state.mode;
        },
        get decades() {
            return state.decades;
        },
        get state() {
            return state;
        },
        get animating() {
            return animating;
        },
        ANIM_MS,
        ANIM_MS_REDUCE,
        ANIM_MS_DESKTOP,
        prefersReduce,
        isWideScreen,
        animMs,
        startTransition,
        finishAnim,
        P,
        ROLE_SPLITS,
        PENDING,
        REMAIN_TEXT,
        buildPersonalSteps,
        buildMassSteps,
        remapStep,
        setMode,
        setDecades,
        next,
        prev,
        render,
        save,
    };
    syncModeUI();
    render();
}
function boot() {
    const root = document.getElementById("app");
    if (!root)
        return;
    mount(root);
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
}
else {
    boot();
}
