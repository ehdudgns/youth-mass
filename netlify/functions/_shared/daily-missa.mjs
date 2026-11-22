/** missa.cbck.or.kr DailyMissa HTML → structured JSON */

const SECTION_KEYS = [
  "오늘 전례",
  "입당송",
  "본기도",
  "제1독서",
  "화답송",
  "제2독서",
  "복음 환호송",
  "복음",
  "보편 지향 기도",
  "예물 기도",
  "감사송",
  "영성체송",
  "영성체 후 묵상",
  "영성체 후 기도",
  "오늘의 묵상",
];

function stripTags(html) {
  let s = String(html || "");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(?:div|p|h[1-6]|li|tr|blockquote)>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rsquo;/g, "’")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
  s = s.replace(/\u00a0/g, " ");
  s = s.replace(/\r\n?/g, "\n");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/[ \t]{2,}/g, " ");
  return s.trim();
}

function ymdToCompact(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  return `${m[1]}${m[2]}${m[3]}`;
}

function compactToYmd(compact) {
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(compact);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function matchSectionKey(h4Text) {
  const raw = stripTags(h4Text).replace(/\s+/g, " ").trim();
  const compact = raw.replace(/\s+/g, "");
  for (const key of SECTION_KEYS) {
    if (raw === key || raw.startsWith(key) || compact.startsWith(key.replace(/\s+/g, ""))) {
      return key;
    }
  }
  return null;
}

function extractCitation(h4Html) {
  const m = /class="float-right"[^>]*>([\s\S]*?)<\/span>/i.exec(h4Html);
  if (!m) return "";
  return stripTags(m[1]).replace(/^&nbsp;|^[\s\u00a0]+/, "").trim();
}

function parseReadingFromHtml(bodyHtml) {
  const sourceMatch = /[▥✠]\s*([^<]+)/.exec(bodyHtml);
  const refMatch = /<h5[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/i.exec(bodyHtml);
  const source = sourceMatch ? stripTags(sourceMatch[1]).replace(/\s+/g, " ").trim() : "";
  const ref = refMatch ? stripTags(refMatch[1]).trim() : "";

  let text = stripTags(bodyHtml);
  if (source) {
    const joined = `${source}${ref || ""}`;
    // "에제키엘…말씀입니다.34,11-12" 처럼 붙어 나온 줄 제거
    text = text.replace(new RegExp(`[▥✠]?\\s*${escapeReg(joined)}`, "g"), "");
    text = text.replace(new RegExp(`[▥✠]?\\s*${escapeReg(source)}\\s*${ref ? escapeReg(ref) : ""}`, "g"), "");
  }
  text = text
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { source, ref, text };
}

function escapeReg(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseDailyMissaHtml(html, { date, sourceUrl } = {}) {
  const dateLabelMatch = /id="missa-date"[^>]*>\s*<h2>([\s\S]*?)<\/h2>/i.exec(html);
  const titleMatch = /id="missa_title"[^>]*>([\s\S]*?)<\/h3>/i.exec(html);
  const metaTitle = /property="og:title"\s+content="([^"]+)"/i.exec(html);

  let title = titleMatch ? stripTags(titleMatch[1]) : "";
  title = title.replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
  if (!title && metaTitle) {
    title = metaTitle[1].replace(/^\d{4}\.\d{2}\.\d{2}\s*/, "").trim();
  }

  const colorMatch = /^\[([^\]]+)\]\s*/.exec(title);
  const color = colorMatch ? colorMatch[1] : "";
  const titlePlain = title.replace(/^\[([^\]]+)\]\s*/, "").replace(/\s*\([^)]*\)\s*$/, "").trim();

  // 연중/사순/대림/부활 제N주일 (대축일로 대체된 주일에는 없을 수 있음)
  const weekMatch = titlePlain.match(
    /((?:연중|사순|대림|부활)\s*제\s*\d+\s*주일)/
  );
  const weekLabel = weekMatch ? weekMatch[1].replace(/\s+/g, " ").replace(/제\s+/, "제") : "";

  const detailMatch = /id="missa-detail"[^>]*>([\s\S]*?)(?:<div id="footer"|<\/body>)/i.exec(html);
  const chunk = detailMatch ? detailMatch[1] : html;
  const parts = chunk.split(/<h4>([\s\S]*?)<\/h4>/i);

  const sections = {};
  for (let i = 1; i < parts.length; i += 2) {
    const h4 = parts[i];
    const body = parts[i + 1] || "";
    const key = matchSectionKey(h4);
    if (!key) continue;
    const citation = extractCitation(h4);
    const entry = { citation: citation || undefined };
    if (key === "제1독서" || key === "제2독서" || key === "복음") {
      const extras = parseReadingFromHtml(body);
      entry.source = extras.source || undefined;
      entry.ref = extras.ref || citation || undefined;
      entry.text = extras.text;
    } else {
      entry.text = stripTags(body);
    }
    sections[key] = entry;
  }

  // 「오늘 전례」 첫 문장: "오늘은 연중 제33주일이며 …입니다."
  let announce = "";
  const todayLiturgy = sections["오늘 전례"]?.text || "";
  const announceMatch = todayLiturgy.match(/오늘은\s+.+?입니다\./);
  if (announceMatch) {
    announce = announceMatch[0].replace(/\s+/g, " ").trim();
  }

  return {
    date: date || null,
    dateLabel: dateLabelMatch ? stripTags(dateLabelMatch[1]) : null,
    title,
    titlePlain,
    weekLabel: weekLabel || null,
    announce: announce || null,
    color,
    sourceUrl: sourceUrl || null,
    sections,
  };
}

export async function fetchDailyMissa(ymd) {
  const compact = ymdToCompact(ymd);
  if (!compact) throw new Error("날짜 형식이 올바르지 않아요. (YYYY-MM-DD)");
  const sourceUrl = `https://missa.cbck.or.kr/DailyMissa/${compact}`;
  const res = await fetch(sourceUrl, {
    headers: {
      "user-agent": "youth-mass/1.0 (+https://missa.cbck.or.kr; liturgy aide)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) throw new Error(`매일미사를 가져오지 못했어요. (${res.status})`);
  const html = await res.text();
  if (!/missa_title|missa-detail/i.test(html)) {
    throw new Error("매일미사 페이지 형식을 읽지 못했어요.");
  }
  return parseDailyMissaHtml(html, { date: ymd, sourceUrl });
}

export { ymdToCompact, compactToYmd, SECTION_KEYS };
