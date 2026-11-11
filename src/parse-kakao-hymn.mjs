/** Parse KakaoTalk (or copy-button) hymn notices into mass form fields. */

const SLOT_KEYS = ["date", "entrance", "offertory", "communion", "recessional"];
const SLOT_LABELS = { date: "날짜", entrance: "입당", offertory: "봉헌", communion: "성체", recessional: "파견", memo: "메모" };

const SLOT_ALIASES = [
  ["communion", "영성체성가"],
  ["communion", "성체성가"],
  ["entrance", "입당성가"],
  ["offertory", "봉헌성가"],
  ["recessional", "파견성가"],
  ["communion", "영성체"],
  ["communion", "성체"],
  ["entrance", "입당"],
  ["offertory", "봉헌"],
  ["recessional", "파견"],
];

const DEFAULT_FIXED = [
  "자비송",
  "대영광송",
  "거룩하시도다",
  "신앙의신비여",
  "아멘",
  "주님의기도",
  "주님께나라와",
  "하느님의어린양",
];

const HEADER_RE =
  /^(?:\d{1,2}\.\d{1,2}\s*)?성가\s*$|미사중\s*청년\s*미사곡|청년\s*미사곡|이번\s*주\s*성가/;

export { SLOT_KEYS, SLOT_LABELS };

export function seoulYear(now = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric" }).format(now)
  );
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ymd(y, m, d) {
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    return null;
  }
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function extractDate(line, defaultYear) {
  let m = line.match(/(?:19|20)\d{2}\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{1,2})/);
  if (m) {
    const yearM = line.match(/((?:19|20)\d{2})\s*[./-]\s*\d{1,2}\s*[./-]\s*\d{1,2}/);
    return ymd(yearM[1], m[1], m[2]);
  }
  m = line.match(/((?:19|20)\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일?/);
  if (m) return ymd(m[1], m[2], m[3]);
  m = line.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (m) return ymd(defaultYear, m[1], m[2]);
  // 11/15 or 11.15 — avoid matching times like 9:12
  m = line.match(/(?<![.\d])(\d{1,2})\s*[./]\s*(\d{1,2})(?!\s*[:]\d)(?!\d)/);
  if (m && Number(m[1]) >= 1 && Number(m[1]) <= 12 && Number(m[2]) >= 1 && Number(m[2]) <= 31) {
    return ymd(defaultYear, m[1], m[2]);
  }
  m = line.match(/(?<![.\d])(\d{1,2})\s*\/\s*(\d{1,2})(?!\d)/);
  if (m && Number(m[1]) >= 1 && Number(m[1]) <= 12 && Number(m[2]) >= 1 && Number(m[2]) <= 31) {
    return ymd(defaultYear, m[1], m[2]);
  }
  return null;
}

function stripKakaoPrefix(line) {
  let s = line.replace(/\u200b|\ufeff/g, "").trim();
  // [홍길동] [오후 9:12] or [오후 9:12] [홍길동]
  for (let i = 0; i < 3; i++) {
    const next = s
      .replace(/^\[(?:오전|오후)\s*\d{1,2}\s*:\s*\d{2}\]\s*/u, "")
      .replace(/^\[[^[\]]{1,40}\]\s*/u, "");
    if (next === s) break;
    s = next.trim();
  }
  // Kakao export: 2026년 11월 15일 오후 9:12, 홍길동 :
  s = s.replace(
    /^(?:(?:19|20)\d{2}\s*년\s*)?(?:\d{1,2}\s*월\s*\d{1,2}\s*일)?\s*(?:오전|오후)\s*\d{1,2}\s*:\s*\d{2}\s*[,.]?\s*.{0,30}?\s*:\s*/u,
    ""
  );
  s = s.replace(/^(?:오전|오후)\s*\d{1,2}\s*:\s*\d{2}\s*[,:]?\s*/u, "");
  // "홍길동 : 입당 123"
  s = s.replace(/^.{1,20}?\s*:\s+(?=(?:입당|봉헌|영성체|성체|파견|(?:19|20)\d{2}|\d{1,2}\s*월))/u, "");
  return s.replace(/\s+/g, " ").trim();
}

function stripEmoji(s) {
  return String(s || "").replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]/gu, "");
}

function isHeaderLine(line) {
  const plain = stripEmoji(line).trim();
  return !plain || HEADER_RE.test(plain);
}

function extractNums(rest) {
  if (!rest) return [];
  const cleaned = rest
    .replace(/번/g, " ")
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]/gu, " ");
  const out = [];
  for (const part of cleaned.split(/[,，、\/·;]+|\s+/)) {
    const t = part.trim();
    if (/^\d{1,4}$/.test(t)) out.push(t);
  }
  return out;
}

function matchSlot(line) {
  for (const [key, label] of SLOT_ALIASES) {
    const re = new RegExp(
      "^" + label + "\\s*(?:성가)?\\s*[:：\\-–—=∙·]??\\s*(.*)$"
    );
    const m = line.match(re);
    if (m) return { key, rest: m[1] };
  }
  return null;
}

function normalizeFixedName(name) {
  return String(name || "").replace(/\s+/g, "").replace(/[.…]+$/, "");
}

function fixedNamesFrom(fixed) {
  const names = [];
  const seen = new Set();
  for (const item of [...(fixed || []), ...DEFAULT_FIXED.map((name) => ({ name }))]) {
    const name = typeof item === "string" ? item : item && item.name;
    const key = normalizeFixedName(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    names.push({ name: String(name).trim(), key, number: item && item.number != null ? String(item.number) : null });
  }
  return names;
}

function matchFixed(line, catalog) {
  for (const item of catalog) {
    const re = new RegExp("^" + item.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*[:：\\-–—=∙·]?\\s*(.*)$");
    const m = normalizeFixedName(line).length && line.replace(/\s+/g, "").match
      ? line.match(new RegExp("^" + item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*") + "\\s*[:：\\-–—=∙·]?\\s*(.*)$"))
      : null;
    if (m) {
      const nums = extractNums(m[1]);
      if (nums.length) return { name: item.name, number: nums[0], current: item.number };
    }
  }
  return null;
}

/**
 * @param {string} text
 * @param {{ year?: number, fixed?: {name:string,number?:string|number}[], now?: Date }} [options]
 */
export function parseKakaoHymn(text, options = {}) {
  const year = options.year ?? seoulYear(options.now);
  const catalog = fixedNamesFrom(options.fixed);
  const fields = { entrance: [], offertory: [], communion: [], recessional: [] };
  const seenSlots = new Set();
  const memoLines = [];
  const fixedChanged = [];
  const warnings = [];
  let date = null;

  const raw = String(text ?? "").replace(/\r\n/g, "\n");
  const lines = raw.split("\n");

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;
    const line = stripEmoji(stripKakaoPrefix(rawLine)).replace(/\s+/g, " ").trim();
    if (!line) continue;

    const foundDate = extractDate(line, year);
    if (foundDate && !date) date = foundDate;
    if (isHeaderLine(line)) continue;
    // A date-only line (or "11.15 성가") should not become memo.
    const afterDate = line
      .replace(/(?:19|20)\d{2}\s*[./-]\s*\d{1,2}\s*[./-]\s*\d{1,2}/, "")
      .replace(/(?:19|20)\d{2}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일?/, "")
      .replace(/\d{1,2}\s*월\s*\d{1,2}\s*일/, "")
      .replace(/\d{1,2}\s*[./]\s*\d{1,2}/, "")
      .replace(/성가/g, "")
      .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]/gu, "")
      .trim();
    if (foundDate && !afterDate) continue;

    const slot = matchSlot(line);
    if (slot) {
      const nums = extractNums(slot.rest);
      if (nums.length) {
        if (seenSlots.has(slot.key)) {
          // later line appends more numbers (e.g. two 성체 lines)
          for (const n of nums) {
            if (!fields[slot.key].includes(n)) fields[slot.key].push(n);
          }
        } else {
          fields[slot.key] = nums;
          seenSlots.add(slot.key);
        }
        continue;
      }
    }

    const fx = matchFixed(line, catalog);
    if (fx) {
      if (fx.current != null && String(fx.current) === String(fx.number)) continue;
      if (!fixedChanged.some((x) => x.name === fx.name)) {
        fixedChanged.push({ name: fx.name, number: fx.number, current: fx.current });
      }
      continue;
    }

    if (foundDate && !matchSlot(line)) {
      // leftover text on a date line — ignore rather than memo
      continue;
    }
    // leftover non-empty line → memo (skip pure punctuation/emoji)
    const memo = line.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]/gu, "").trim();
    if (memo) memoLines.push(memo);
  }

  const found = [];
  if (date) found.push("date");
  for (const key of ["entrance", "offertory", "communion", "recessional"]) {
    if (fields[key].length) found.push(key);
  }
  if (memoLines.length) found.push("memo");
  if (fixedChanged.length) found.push("fixed");

  const missing = SLOT_KEYS.filter((k) => (k === "date" ? !date : !fields[k].length));

  return {
    date,
    entrance: fields.entrance,
    offertory: fields.offertory,
    communion: fields.communion,
    recessional: fields.recessional,
    memo: memoLines.length ? memoLines.join("\n") : null,
    fixedChanged,
    found,
    missing,
    warnings,
  };
}

export function describeParse(result) {
  const foundLabels = result.found
    .filter((k) => k !== "fixed")
    .map((k) => SLOT_LABELS[k] || k);
  const missLabels = result.missing.map((k) => SLOT_LABELS[k] || k);
  const parts = [];
  if (foundLabels.length) parts.push(`인식한 항목: ${foundLabels.join(", ")}.`);
  else parts.push("성가 번호를 찾지 못했어요.");
  if (missLabels.length && foundLabels.length) {
    parts.push(`찾지 못한 항목: ${missLabels.join(", ")}.`);
  }
  if (result.fixedChanged.length) {
    const bits = result.fixedChanged.map((x) =>
      x.current != null ? `${x.name} ${x.number} (현재 ${x.current})` : `${x.name} ${x.number}`
    );
    parts.push(`고정 미사곡과 다른 번호: ${bits.join(", ")}.`);
  }
  if (foundLabels.length) parts.push("확인하고 저장하세요.");
  return parts.join(" ");
}

if (typeof globalThis !== "undefined" && typeof document !== "undefined") {
  globalThis.parseKakaoHymn = parseKakaoHymn;
  globalThis.describeKakaoParse = describeParse;
}
