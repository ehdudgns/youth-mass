/**
 * 청년미사 성가 페이지 — 공개 보기 + 관리(입력) 모드.
 */
import { parseKakaoHymn, describeParse } from "./parse-kakao-hymn.js";
import { HYMN_FIELDS, esc, seoulToday, comingSunday, longDate, kakaoText as buildKakaoText, songsPublicHTML, mountSiteChrome, } from "./hymns.js";
const FIELDS = HYMN_FIELDS;
function $(selector, el = document) {
    return el.querySelector(selector);
}
function must(el, name) {
    if (!el)
        throw new Error(`missing #${name}`);
    return el;
}
export async function mount(root) {
    let state = { masses: [], fixed: [] };
    let lastChange = null;
    let toastTimer = 0;
    root.innerHTML = `
<div class="wrap">
  <header>
    <div class="cross">✝</div>
    <h1>청년미사 성가</h1>
    <p>이번 미사에 부를 성가 번호예요</p>
  </header>

  <div class="public-panel">
    <div class="public-only">
      <button type="button" class="edit-cta" id="adminBtnTop">✏️ 성가 입력하기</button>
    </div>
    <main id="songsRoot"><div class="loading">불러오는 중…</div></main>
  </div>

  <section class="admin" id="admin">
    <div class="bar"><span class="badge">✏️ 성가 입력</span><button class="sm ghost" id="logout">입력 닫기</button></div>
    <div class="card undo-card">
      <div class="row" style="justify-content:space-between">
        <div><b>실수했나요?</b><div class="meta" id="undoInfo">최근 변경 확인 중…</div></div>
        <button class="sm" type="button" id="undoBtn">↶ 되돌리기</button>
      </div>
    </div>

    <div class="card">
      <h3 id="formTitle">미사 성가 등록</h3>
      <form id="massForm" autocomplete="off">
        <input type="hidden" id="fId">
        <div class="kakao-import" id="kakaoImport">
          <h3>카톡에서 가져오기</h3>
          <p class="hint">카톡 성가 안내나, 복사한 성가 문구를 붙여넣고 가져오기를 누르세요. 바로 저장되지는 않아요.</p>
          <div class="field" style="margin-bottom:0">
            <label for="fKakao">카톡 메시지 붙여넣기</label>
            <textarea id="fKakao" placeholder="성가를 입력해주세요" autocomplete="off" autocapitalize="off"></textarea>
          </div>
          <button type="button" id="importKakao">가져오기</button>
          <div id="kakaoImportResult" role="status"></div>
        </div>
        <div class="field"><label for="fDate">미사 날짜</label><input type="date" id="fDate" required></div>
        <div class="grid2">
          <div class="field"><label for="fEnt">입당</label><input id="fEnt" inputmode="numeric" placeholder="성가를 입력해주세요"></div>
          <div class="field"><label for="fOff">봉헌</label><input id="fOff" inputmode="numeric" placeholder="성가를 입력해주세요"></div>
        </div>
        <div class="field"><label>성체 (여러 곡 가능)</label>
          <div class="multi" id="fCom"></div>
          <button class="sm" type="button" id="addCom" style="margin-top:6px">+ 성체 성가 추가</button>
        </div>
        <div class="field"><label for="fRec">파견</label><input id="fRec" inputmode="numeric" placeholder="성가를 입력해주세요"></div>
        <div class="err" id="formErr"></div>
        <div class="row">
          <button class="navy" type="submit" style="flex:1" id="saveBtn">저장하기</button>
          <button type="button" class="ghost" id="cancelEdit" style="display:none">취소</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3>청년 미사곡 (고정)</h3>
      <p class="hint">매 미사 똑같이 보이는 목록이에요.</p>
      <div class="fx-view" id="fxView"></div>
      <div id="fxViewActions">
        <button class="sm" type="button" id="editFx">미사곡 수정</button>
      </div>
      <div class="fx-edit" id="fxEditPanel">
        <div id="fxEdit"></div>
        <button class="sm" type="button" id="addFx">+ 항목 추가</button>
        <div class="err" id="fxErr"></div>
        <div class="fx-edit-actions">
          <button class="navy" type="button" id="saveFx" style="flex:1">미사곡 저장</button>
          <button class="ghost" type="button" id="cancelFx">취소</button>
        </div>
      </div>
    </div>

    <details class="card admin-masses">
      <summary><span>등록된 미사 관리</span></summary>
      <div class="admin-list" id="adminList"></div>
    </details>
  </section>

  <footer>
    <div data-site-footer></div>
  </footer>
</div>

<button type="button" class="fab-edit public-only" id="adminFab" aria-label="성가 입력하기">✏️ 성가 입력</button>
<div class="toast" id="toast"></div>`;
    // Footer chrome needs the data-site-footer node that was just inserted.
    mountSiteChrome("songs");
    const songsRoot = must($("#songsRoot", root), "songsRoot");
    const toastEl = must($("#toast", root), "toast");
    const adminEl = must($("#admin", root), "admin");
    const fCom = must($("#fCom", root), "fCom");
    const fKakao = must($("#fKakao", root), "fKakao");
    const fId = must($("#fId", root), "fId");
    const fDate = must($("#fDate", root), "fDate");
    const fEnt = must($("#fEnt", root), "fEnt");
    const fOff = must($("#fOff", root), "fOff");
    const fRec = must($("#fRec", root), "fRec");
    const formTitle = must($("#formTitle", root), "formTitle");
    const saveBtn = must($("#saveBtn", root), "saveBtn");
    const cancelEdit = must($("#cancelEdit", root), "cancelEdit");
    const formErr = must($("#formErr", root), "formErr");
    const kakaoImportResult = must($("#kakaoImportResult", root), "kakaoImportResult");
    const undoInfo = must($("#undoInfo", root), "undoInfo");
    const undoBtn = must($("#undoBtn", root), "undoBtn");
    const fxView = must($("#fxView", root), "fxView");
    const fxViewActions = must($("#fxViewActions", root), "fxViewActions");
    const fxEditPanel = must($("#fxEditPanel", root), "fxEditPanel");
    const fxEdit = must($("#fxEdit", root), "fxEdit");
    const fxErr = must($("#fxErr", root), "fxErr");
    const adminList = must($("#adminList", root), "adminList");
    const massForm = must($("#massForm", root), "massForm");
    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add("show");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
    }
    async function copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        }
        catch {
            /* fallback */
        }
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        let ok = false;
        try {
            ok = document.execCommand("copy");
        }
        catch {
            /* ignore */
        }
        ta.remove();
        return ok;
    }
    async function api(path, opts = {}) {
        const headers = { "content-type": "application/json" };
        const r = await fetch("/api/" + path, { ...opts, headers });
        let data = {};
        try {
            data = (await r.json());
        }
        catch {
            /* empty */
        }
        if (!r.ok) {
            const e = new Error((typeof data.error === "string" ? data.error : null) || "오류가 났어요 (" + r.status + ")");
            e.status = r.status;
            throw e;
        }
        return data;
    }
    function kakaoText(m, withFixed) {
        return buildKakaoText(m, state.fixed, withFixed);
    }
    function render() {
        const { current: m, html } = songsPublicHTML(state);
        songsRoot.innerHTML = html;
        if (!m)
            return;
        const withFixed = must($("#withFixed", songsRoot), "withFixed");
        withFixed.onchange = (e) => {
            const checked = e.target.checked;
            localStorage.setItem("ym_withFixed", checked ? "1" : "0");
        };
        must($("#copyBtn", songsRoot), "copyBtn").onclick = async () => {
            (await copy(kakaoText(m, withFixed.checked)))
                ? toast("복사했어요! 카톡에 붙여넣기 하세요")
                : toast("복사에 실패했어요");
        };
        must($("#shareBtn", songsRoot), "shareBtn").onclick = () => {
            void share();
        };
        songsRoot.querySelectorAll("[data-copy]").forEach((b) => {
            b.onclick = async () => {
                const x = state.masses.find((y) => y.id === b.dataset.copy);
                if (!x)
                    return;
                (await copy(kakaoText(x, withFixed.checked))) ? toast("복사했어요!") : toast("복사에 실패했어요");
            };
        });
    }
    async function share() {
        const url = location.origin + "/songs/";
        if (navigator.share) {
            try {
                await navigator.share({ title: "청년미사 성가 🎶", text: "이번 미사 성가 번호예요", url });
                return;
            }
            catch (e) {
                if (e instanceof Error && e.name === "AbortError")
                    return;
            }
        }
        (await copy(url)) ? toast("링크를 복사했어요") : toast(url);
    }
    async function refresh() {
        state = (await api("data"));
        render();
        if (document.body.classList.contains("is-admin"))
            renderAdmin();
    }
    function enterAdmin() {
        document.body.classList.add("is-admin");
        if (location.hash !== "#edit" && location.hash !== "#admin") {
            history.replaceState(null, "", location.pathname + "#edit");
        }
        resetForm();
        renderAdmin();
        adminEl.scrollIntoView({ behavior: "smooth" });
    }
    must($("#adminBtnTop", root), "adminBtnTop").onclick = () => enterAdmin();
    must($("#adminFab", root), "adminFab").onclick = () => enterAdmin();
    must($("#logout", root), "logout").onclick = () => {
        document.body.classList.remove("is-admin");
        history.replaceState(null, "", location.pathname);
        window.scrollTo(0, 0);
    };
    function addComInput(v = "") {
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `<input inputmode="numeric" placeholder="성가를 입력해주세요" value="${esc(v)}"><button type="button" class="sm ghost" aria-label="삭제">✕</button>`;
        const btn = row.querySelector("button");
        if (btn) {
            btn.onclick = () => {
                if (fCom.children.length > 1)
                    row.remove();
                else {
                    const input = row.querySelector("input");
                    if (input)
                        input.value = "";
                }
            };
        }
        fCom.appendChild(row);
    }
    function comInputs(vals) {
        fCom.innerHTML = "";
        (vals.length ? vals : [""]).forEach((v) => addComInput(v));
    }
    must($("#addCom", root), "addCom").onclick = () => addComInput();
    const splitNums = (s) => String(s || "")
        .split(/[,，\/\s]+/)
        .map((x) => x.trim())
        .filter(Boolean);
    function importFieldEl(key) {
        const sel = {
            date: "#fDate",
            entrance: "#fEnt",
            offertory: "#fOff",
            communion: "#fCom",
            recessional: "#fRec",
        };
        const target = $(sel[key], root);
        return target?.closest(".field") ?? null;
    }
    function clearImportMarks() {
        root.querySelectorAll(".field.import-ok, .field.import-miss").forEach((el) => {
            el.classList.remove("import-ok", "import-miss");
        });
        kakaoImportResult.textContent = "";
        kakaoImportResult.className = "";
    }
    function applyKakaoImport() {
        clearImportMarks();
        const text = fKakao.value;
        if (!String(text || "").trim()) {
            kakaoImportResult.textContent = "카톡 메시지를 붙여넣은 뒤 가져오기를 눌러 주세요.";
            kakaoImportResult.className = "err";
            return;
        }
        const result = parseKakaoHymn(text, {
            year: Number(seoulToday().slice(0, 4)),
            fixed: state.fixed,
        });
        const useful = result.found.filter((k) => k !== "fixed");
        if (!useful.length) {
            kakaoImportResult.textContent =
                "성가 번호나 날짜를 찾지 못했어요. 메시지를 확인하고 다시 붙여넣어 주세요.";
            kakaoImportResult.className = "err";
            ["date", "entrance", "offertory", "communion", "recessional"].forEach((k) => importFieldEl(k)?.classList.add("import-miss"));
            return;
        }
        if (result.date)
            fDate.value = result.date;
        if (result.entrance.length)
            fEnt.value = result.entrance.join(", ");
        if (result.offertory.length)
            fOff.value = result.offertory.join(", ");
        if (result.recessional.length)
            fRec.value = result.recessional.join(", ");
        if (result.communion.length)
            comInputs(result.communion);
        useful
            .filter((k) => k !== "memo")
            .forEach((k) => importFieldEl(k)?.classList.add("import-ok"));
        result.missing
            .filter((k) => k !== "memo")
            .forEach((k) => importFieldEl(k)?.classList.add("import-miss"));
        kakaoImportResult.textContent = describeParse({
            ...result,
            found: result.found.filter((k) => k !== "memo"),
        });
        kakaoImportResult.className = "ok";
        toast("가져왔어요. 확인하고 저장하세요");
    }
    must($("#importKakao", root), "importKakao").onclick = applyKakaoImport;
    function resetForm() {
        fId.value = "";
        fDate.value = comingSunday();
        fEnt.value = fOff.value = fRec.value = "";
        comInputs([]);
        formTitle.textContent = "미사 성가 등록";
        saveBtn.textContent = "저장하기";
        cancelEdit.style.display = "none";
        formErr.textContent = "";
        clearImportMarks();
    }
    function fillForm(m) {
        clearImportMarks();
        fId.value = m.id || "";
        fDate.value = m.date || comingSunday();
        fEnt.value = (m.entrance || []).join(", ");
        fOff.value = (m.offertory || []).join(", ");
        fRec.value = (m.recessional || []).join(", ");
        comInputs(m.communion || []);
    }
    cancelEdit.onclick = resetForm;
    massForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = fId.value;
        const body = {
            date: fDate.value,
            memo: "",
            entrance: splitNums(fEnt.value),
            offertory: splitNums(fOff.value),
            communion: [...fCom.querySelectorAll("input")].flatMap((i) => splitNums(i.value)),
            recessional: splitNums(fRec.value),
        };
        if (!body.date) {
            formErr.textContent = "날짜를 골라 주세요.";
            return;
        }
        const dup = state.masses.find((m) => m.date === body.date && m.id !== id);
        if (dup &&
            !confirm(`${longDate(body.date, { withYear: true })}에 이미 등록된 미사가 있어요. 그래도 따로 추가할까요?`)) {
            return;
        }
        try {
            saveBtn.disabled = true;
            await api(id ? "masses/" + encodeURIComponent(id) : "masses", {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(body),
            });
            toast(id ? "수정했어요" : "저장했어요");
            resetForm();
            await refresh();
        }
        catch (err) {
            handleErr(err, formErr);
        }
        finally {
            saveBtn.disabled = false;
        }
    };
    function handleErr(err, el) {
        el.textContent = err.message;
    }
    function timeAgo(iso) {
        const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
        if (s < 60)
            return "방금";
        if (s < 3600)
            return Math.floor(s / 60) + "분 전";
        if (s < 86400)
            return Math.floor(s / 3600) + "시간 전";
        return Math.floor(s / 86400) + "일 전";
    }
    async function loadHistory() {
        try {
            const h = (await api("history"));
            lastChange = h.last;
            undoInfo.textContent = h.last
                ? `마지막 변경: ${h.last.action} (${timeAgo(h.last.at)}) · 되돌릴 수 있는 기록 ${h.count}개`
                : "되돌릴 변경이 없어요.";
            undoBtn.disabled = !h.last;
        }
        catch {
            undoInfo.textContent = "";
        }
    }
    undoBtn.onclick = async () => {
        if (!lastChange)
            return;
        if (!confirm(`'${lastChange.action}' 변경을 되돌릴까요?`))
            return;
        try {
            const r = (await api("undo", { method: "POST", body: "{}" }));
            toast(`'${r.undone}' 되돌렸어요`);
            resetForm();
            await refresh();
        }
        catch (err) {
            alert(err.message);
        }
    };
    function setFxEditOpen(open) {
        fxEditPanel.classList.toggle("is-open", open);
        fxView.style.display = open ? "none" : "";
        fxViewActions.style.display = open ? "none" : "";
        if (open) {
            fxEdit.innerHTML = "";
            (state.fixed.length ? state.fixed : [{ name: "", number: "" }]).forEach((f) => addFxRow(f));
            fxErr.textContent = "";
        }
    }
    function renderFxView() {
        if (!state.fixed.length) {
            fxView.innerHTML = `<p class="hint" style="grid-column:1/-1;margin:0">아직 등록된 청년 미사곡이 없어요.</p>`;
            return;
        }
        fxView.innerHTML = state.fixed
            .map((f) => `<div class="fx"><span class="n">${esc(f.name)}</span><span class="no">${esc(f.number)}</span></div>`)
            .join("");
    }
    function renderAdmin() {
        void loadHistory();
        setFxEditOpen(false);
        renderFxView();
        adminList.innerHTML =
            state.masses
                .map((m) => `
      <div class="item"><div><div><b>${esc(longDate(m.date, { withYear: true }))}</b></div>
        <div class="meta">${esc(FIELDS.map(([k, n]) => `${n} ${(m[k] || []).join(",") || "-"}`).join(" · "))}</div></div>
        <div class="row"><button class="sm" data-edit="${esc(m.id)}">수정</button><button class="sm danger" data-del="${esc(m.id)}">삭제</button></div></div>`)
                .join("") || `<p class="hint">등록된 미사가 없어요.</p>`;
        adminList.querySelectorAll("[data-edit]").forEach((b) => {
            b.onclick = () => {
                const m = state.masses.find((x) => x.id === b.dataset.edit);
                if (!m)
                    return;
                fillForm(m);
                formTitle.textContent = "미사 성가 수정";
                saveBtn.textContent = "수정 저장";
                cancelEdit.style.display = "";
                formTitle.scrollIntoView({ behavior: "smooth" });
            };
        });
        adminList.querySelectorAll("[data-del]").forEach((b) => {
            b.onclick = async () => {
                const m = state.masses.find((x) => x.id === b.dataset.del);
                if (!m)
                    return;
                if (!confirm(`${longDate(m.date, { withYear: true })} 성가를 삭제할까요?`))
                    return;
                try {
                    await api("masses/" + encodeURIComponent(m.id), { method: "DELETE" });
                    toast("삭제했어요");
                    await refresh();
                }
                catch (err) {
                    alert(err.message);
                }
            };
        });
    }
    function addFxRow(f = { name: "", number: "" }) {
        const item = document.createElement("div");
        item.className = "fx-item";
        item.innerHTML = `
      <div class="field"><label>곡 이름</label><input type="text" data-fx="name" placeholder="예: 자비송" value="${esc(f.name)}"></div>
      <div class="field"><label>번호</label><input inputmode="numeric" data-fx="number" placeholder="번호" value="${esc(f.number)}"></div>
      <div class="fx-item-actions"><button type="button" class="sm ghost" data-fx-del>이 항목 삭제</button></div>`;
        const del = item.querySelector("[data-fx-del]");
        if (del)
            del.onclick = () => item.remove();
        fxEdit.appendChild(item);
    }
    must($("#editFx", root), "editFx").onclick = () => setFxEditOpen(true);
    must($("#cancelFx", root), "cancelFx").onclick = () => setFxEditOpen(false);
    must($("#addFx", root), "addFx").onclick = () => addFxRow();
    must($("#saveFx", root), "saveFx").onclick = async () => {
        const fixed = [...fxEdit.children]
            .map((r) => {
            const name = r.querySelector('[data-fx="name"]')?.value.trim() || "";
            const number = r.querySelector('[data-fx="number"]')?.value.trim() || "";
            return { name, number };
        })
            .filter((x) => x.name || x.number);
        try {
            await api("fixed", { method: "PUT", body: JSON.stringify({ fixed }) });
            fxErr.textContent = "";
            toast("미사곡을 저장했어요");
            await refresh();
        }
        catch (err) {
            handleErr(err, fxErr);
        }
    };
    try {
        await refresh();
    }
    catch (e) {
        songsRoot.innerHTML = `<div class="card"><p>성가를 불러오지 못했어요. 잠시 후 다시 열어 주세요.</p><p class="hint">${esc(e.message)}</p></div>`;
    }
    if (location.hash === "#admin" || location.hash === "#edit")
        enterAdmin();
}
function boot() {
    const root = document.getElementById("app");
    if (!root)
        return;
    void mount(root);
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
}
else {
    boot();
}
