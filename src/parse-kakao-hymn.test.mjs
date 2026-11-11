import { test } from "node:test";
import assert from "node:assert/strict";
import { parseKakaoHymn } from "./parse-kakao-hymn.mjs";

const FIXED = [
  { name: "자비송", number: "380" },
  { name: "대영광송", number: "381" },
  { name: "거룩하시도다", number: "382" },
  { name: "신앙의신비여", number: "412" },
  { name: "아멘", number: "419" },
  { name: "주님의기도", number: "430" },
  { name: "주님께나라와", number: "444" },
  { name: "하느님의어린양", number: "383" },
];

const YEAR = 2026;

function parse(text, extra = {}) {
  return parseKakaoHymn(text, { year: YEAR, fixed: FIXED, ...extra });
}

test("1. short labels with space, comma, and dash", () => {
  const r = parse("입당 123\n봉헌 - 45\n성체 67, 89\n파견 400");
  assert.deepEqual(r.entrance, ["123"]);
  assert.deepEqual(r.offertory, ["45"]);
  assert.deepEqual(r.communion, ["67", "89"]);
  assert.deepEqual(r.recessional, ["400"]);
  assert.equal(r.date, null);
  assert.deepEqual(r.found, ["entrance", "offertory", "communion", "recessional"]);
  assert.deepEqual(r.missing, ["date"]);
});

test("2. 입당성가: 123번 style labels", () => {
  const r = parse("입당성가: 123번\n봉헌성가 - 45\n성체성가 67, 89\n파견성가 400번");
  assert.deepEqual(r.entrance, ["123"]);
  assert.deepEqual(r.offertory, ["45"]);
  assert.deepEqual(r.communion, ["67", "89"]);
  assert.deepEqual(r.recessional, ["400"]);
});

test("3. Korean date 11월 15일 sets mass date", () => {
  const r = parse("11월 15일\n입당 355\n봉헌 260\n성체 148\n파견 180");
  assert.equal(r.date, "2026-11-15");
  assert.deepEqual(r.entrance, ["355"]);
  assert.ok(r.found.includes("date"));
  assert.deepEqual(r.missing, []);
});

test("4. 11/15 and 2026.11.15 date formats", () => {
  assert.equal(parse("11/15\n입당 1").date, "2026-11-15");
  assert.equal(parse("2026.11.15\n입당 1").date, "2026-11-15");
  assert.equal(parse("2026-11-15\n입당 1").date, "2026-11-15");
});

test("5. KakaoTalk name/time prefixes, emoji, and whitespace", () => {
  const r = parse(
    "  [홍길동] [오후 9:12] 입당 123  \n[김성가] [오전 10:05]\n봉헌 45\n🙏 성체 67, 89\n\n파견    400  "
  );
  assert.deepEqual(r.entrance, ["123"]);
  assert.deepEqual(r.offertory, ["45"]);
  assert.deepEqual(r.communion, ["67", "89"]);
  assert.deepEqual(r.recessional, ["400"]);
  assert.equal(r.memo, null);
});

test("6. copy-button output round-trip (date + four slots + memo)", () => {
  const copied = `11.15 성가 🎶
입당 : 355
봉헌 : 260
성체 : 148, 58
파견 : 180

오늘은 성가대 연습 7시`;
  const r = parse(copied);
  assert.equal(r.date, "2026-11-15");
  assert.deepEqual(r.entrance, ["355"]);
  assert.deepEqual(r.offertory, ["260"]);
  assert.deepEqual(r.communion, ["148", "58"]);
  assert.deepEqual(r.recessional, ["180"]);
  assert.equal(r.memo, "오늘은 성가대 연습 7시");
  assert.deepEqual(r.fixedChanged, []);
  assert.ok(!r.missing.includes("date"));
});

test("7. copy-button 미사곡 block: ignore matching numbers, flag differences", () => {
  const copied = `11.15 성가 🎶
입당 : 355
봉헌 : 260
성체 : 148
파견 : 180

미사중 청년 미사곡 🙏

자비송 380
대영광송 399
거룩하시도다 382
신앙의신비여 412
아멘 419
주님의기도 430
주님께나라와 444
하느님의어린양 383`;
  const r = parse(copied);
  assert.deepEqual(r.entrance, ["355"]);
  assert.equal(r.fixedChanged.length, 1);
  assert.deepEqual(r.fixedChanged[0], { name: "대영광송", number: "399", current: "381" });
});

test("8. missing slots stay missing; 영성체 alias; year-prefixed Korean date", () => {
  const r = parse("[홍길동] [오후 9:12]\n2026년 11월 15일 청년미사\n입당성가: 12번\n영성체 67 / 89");
  assert.equal(r.date, "2026-11-15");
  assert.deepEqual(r.entrance, ["12"]);
  assert.deepEqual(r.communion, ["67", "89"]);
  assert.deepEqual(r.offertory, []);
  assert.deepEqual(r.recessional, []);
  assert.ok(r.missing.includes("offertory"));
  assert.ok(r.missing.includes("recessional"));
  assert.ok(!r.missing.includes("date"));
  assert.ok(!r.missing.includes("entrance"));
});

test("empty or unrelated text does not throw and finds nothing", () => {
  const r = parse("내일 연습 있어?");
  assert.equal(r.date, null);
  assert.deepEqual(r.entrance, []);
  assert.ok(r.found.includes("memo") || r.found.length <= 1);
});
