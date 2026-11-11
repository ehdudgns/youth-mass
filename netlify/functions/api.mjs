import { getStore } from "@netlify/blobs";
import { timingSafeEqual, createHash, randomUUID } from "node:crypto";

const SEED_FIXED = [
  { name: "자비송", number: "380" },
  { name: "대영광송", number: "381" },
  { name: "거룩하시도다", number: "382" },
  { name: "신앙의 신비여", number: "412" },
  { name: "아멘", number: "419" },
  { name: "주님의 기도", number: "430" },
  { name: "주님께 나라와…", number: "444" },
  { name: "하느님의 어린양", number: "383" },
];
const SEED_MASSES = [
  {
    id: "seed-2026-11-08",
    date: "2026-11-08",
    memo: "",
    entrance: ["355"],
    offertory: ["260"],
    communion: ["148", "58"],
    recessional: ["180"],
    updatedAt: "2026-11-08T00:00:00.000Z",
  },
];

const MAX_HISTORY = 30;
const MAX_MASSES = 500;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const store = () => getStore({ name: "youth-mass", consistency: "strong" });

async function load() {
  const s = store();
  let masses = await s.get("masses", { type: "json" });
  let fixed = await s.get("fixed", { type: "json" });
  if (!masses) { masses = SEED_MASSES; await s.setJSON("masses", masses); }
  if (!fixed) { fixed = SEED_FIXED; await s.setJSON("fixed", fixed); }
  return { masses, fixed };
}

const sha = (v) => createHash("sha256").update(String(v)).digest();
function checkAuth(req) {
  const expected = process.env.ADMIN_PASSWORD || (typeof Netlify !== "undefined" ? Netlify.env.get("ADMIN_PASSWORD") : "");
  if (!expected) return { ok: false, status: 503, error: "관리자 비밀번호가 아직 설정되지 않았어요. (ADMIN_PASSWORD)" };
  const given = req.headers.get("x-admin-password") || "";
  if (!given || !timingSafeEqual(sha(given), sha(expected))) return { ok: false, status: 401, error: "비밀번호가 맞지 않아요." };
  return { ok: true };
}

const NUM_RE = /^[0-9A-Za-z가-힣\-\s.()]{1,20}$/;
function cleanNums(v) {
  const arr = Array.isArray(v) ? v : String(v ?? "").split(/[,，\/]+/);
  return arr.map((x) => String(x).trim()).filter(Boolean).slice(0, 8).filter((x) => NUM_RE.test(x));
}
function cleanMass(b, id) {
  const date = String(b.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("날짜 형식이 올바르지 않아요.");
  return {
    id,
    date,
    memo: String(b.memo || "").slice(0, 500),
    entrance: cleanNums(b.entrance),
    offertory: cleanNums(b.offertory),
    communion: cleanNums(b.communion),
    recessional: cleanNums(b.recessional),
    updatedAt: new Date().toISOString(),
  };
}
const sortMasses = (m) => m.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export default async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
  const parts = path.split("/").filter(Boolean);
  const method = req.method.toUpperCase();

  try {
    if (method === "GET" && parts[0] === "data") {
      const d = await load();
      return json({ masses: sortMasses(d.masses), fixed: d.fixed });
    }

    if (method === "GET" && parts[0] === "history") {
      const hist = (await store().get("history", { type: "json" })) || [];
      const last = hist[hist.length - 1];
      return json({ count: hist.length, last: last ? { action: last.action, at: last.at } : null });
    }

    if (!["POST", "PUT", "DELETE"].includes(method)) return json({ error: "Not found" }, 404);

    // reset-seed stays protected by ADMIN_PASSWORD
    if (parts[0] === "reset-seed") {
      const auth = checkAuth(req);
      if (!auth.ok) return json({ error: auth.error }, auth.status);
    }

    let body = {};
    if (method !== "DELETE") {
      try { body = await req.json(); } catch { body = {}; }
    }
    const s = store();
    const d = await load();

    if (parts[0] === "undo" && method === "POST") {
      const hist = (await s.get("history", { type: "json" })) || [];
      const snap = hist.pop();
      if (!snap) return json({ error: "되돌릴 변경이 없어요." }, 409);
      await s.setJSON("masses", snap.masses);
      await s.setJSON("fixed", snap.fixed);
      await s.setJSON("history", hist);
      return json({ ok: true, undone: snap.action, at: snap.at, remaining: hist.length });
    }

    // snapshot current data before any write
    const snapshot = async (action) => {
      const hist = (await s.get("history", { type: "json" })) || [];
      hist.push({ at: new Date().toISOString(), action, masses: d.masses, fixed: d.fixed });
      while (hist.length > MAX_HISTORY) hist.shift();
      await s.setJSON("history", hist);
    };

    if (parts[0] === "masses") {
      if (method === "POST" && parts.length === 1) {
        if (d.masses.length >= MAX_MASSES) return json({ error: "기록이 너무 많아요." }, 400);
        const m = cleanMass(body, randomUUID());
        await snapshot(`${m.date} 추가`);
        d.masses = [...d.masses, m];
        await s.setJSON("masses", sortMasses(d.masses));
        return json({ ok: true, mass: m }, 201);
      }
      const id = parts[1];
      const idx = d.masses.findIndex((x) => x.id === id);
      if (idx < 0) return json({ error: "해당 미사를 찾을 수 없어요." }, 404);
      if (method === "PUT") {
        const m = cleanMass(body, id);
        await snapshot(`${d.masses[idx].date} 수정`);
        d.masses = d.masses.map((x) => (x.id === id ? m : x));
        await s.setJSON("masses", sortMasses(d.masses));
        return json({ ok: true, mass: d.masses.find((x) => x.id === id) });
      }
      if (method === "DELETE") {
        await snapshot(`${d.masses[idx].date} 삭제`);
        d.masses = d.masses.filter((x) => x.id !== id);
        await s.setJSON("masses", d.masses);
        return json({ ok: true });
      }
    }

    if (parts[0] === "fixed" && method === "PUT") {
      const list = Array.isArray(body.fixed) ? body.fixed : null;
      if (!list) return json({ error: "목록이 필요해요." }, 400);
      const fixed = list
        .map((x) => ({ name: String(x.name || "").trim().slice(0, 40), number: String(x.number || "").trim().slice(0, 40) }))
        .filter((x) => x.name || x.number)
        .slice(0, 30);
      await snapshot("청년 미사곡 수정");
      await s.setJSON("fixed", fixed);
      return json({ ok: true, fixed });
    }

    if (parts[0] === "reset-seed" && method === "POST") {
      if (body.confirm !== "RESET") return json({ error: "confirm 필요" }, 400);
      await snapshot("초기화");
      await s.setJSON("masses", SEED_MASSES);
      await s.setJSON("fixed", SEED_FIXED);
      return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    return json({ error: e.message || "서버 오류" }, 400);
  }
};

export const config = { path: "/api/*" };
