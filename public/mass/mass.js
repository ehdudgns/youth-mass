/**
 * 주일 청년미사 순서.
 * 순서와 짧은 응답은 한국천주교주교회의 『미사 통상문』(로마 미사 경본)에 따른다.
 * 공식 기도문은 missale.cbck.or.kr 미사 통상문을 출처로 삼는다.
 */
import { esc, seoulToday, comingSunday, longDate, currentMass, sundayChipText, massSongChipText, mountSiteChrome, secondCollectionAnnounce, SECOND_COLLECTION_PURPOSES, normalizeSecondCollection, isPresetSecondCollection, SECOND_COLLECTION_MAX_LEN, } from "./hymns.js";
export { seoulToday, comingSunday, longDate, currentMass };
/** 미사 탭에서 독서 페이지로 이동하는 메뉴 */
const MASS_READING_LINKS = [
    { href: "/readings/#reading1", label: "제1독서" },
    { href: "/readings/#psalm", label: "화답송" },
    { href: "/readings/#reading2", label: "제2독서" },
    { href: "/readings/#gospel", label: "복음" },
];
/** 공식 기도문 – CBCK 미사 통상문 (missale.cbck.or.kr/OrdoMissae) 출처 */
export const PRAYERS = {
    고백기도: "전능하신 하느님과\n형제들에게 고백하오니\n생각과 말과 행위로 죄를 많이 지었으며\n자주 의무를 소홀히 하였나이다.\n제 탓이요, 제 탓이요, 저의 큰 탓이옵니다.\n그러므로 간절히 바라오니\n평생 동정이신 성모 마리아와\n모든 천사와 성인과 형제들은\n저를 위하여 하느님께 빌어 주소서.",
    자비송: "주님, 자비를 베푸소서.\n주님, 자비를 베푸소서.\n그리스도님, 자비를 베푸소서.\n그리스도님, 자비를 베푸소서.\n주님, 자비를 베푸소서.\n주님, 자비를 베푸소서.",
    대영광송: "하늘 높은 데서는 하느님께 영광.\n땅에서는 주님께서 사랑하시는 사람들에게 평화.\n주 하느님, 하늘의 임금님\n전능하신 아버지 하느님\n주님을 기리나이다, 찬미하나이다.\n주님을 흠숭하나이다, 찬양하나이다.\n주님 영광 크시오니 감사하나이다.\n\n외아들 주 예수 그리스도님\n주 하느님, 성부의 아드님\n하느님의 어린양\n세상의 죄를 없애시는 주님, 저희에게 자비를 베푸소서.\n세상의 죄를 없애시는 주님, 저희의 기도를 들어주소서.\n성부 오른편에 앉아 계신 주님, 저희에게 자비를 베푸소서.\n\n홀로 거룩하시고, 홀로 주님이시며,\n홀로 높으신 예수 그리스도님\n성령과 함께\n아버지 하느님의 영광 안에 계시나이다.\n아멘.",
    사도신경: "전능하신 천주 성부\n천지의 창조주를 저는 믿나이다.\n\n그 외아들 우리 주 예수 그리스도님\n성령으로 인하여 동정 마리아께 잉태되어 나시고\n본시오 빌라도 통치 아래서 고난을 받으시고\n십자가에 못 박혀 돌아가시고 묻히셨으며\n저승에 가시어 사흗날에 죽은 이들 가운데서 부활하시고\n하늘에 올라 전능하신 천주 성부 오른편에 앉으시며\n그리로부터 산 이와 죽은 이를 심판하러 오시리라 믿나이다.\n\n성령을 믿으며\n거룩하고 보편된 교회와 모든 성인의 통공을 믿으며\n죄의 용서와 육신의 부활을 믿으며\n영원한 삶을 믿나이다.\n아멘.",
    거룩하시도다: "거룩하시도다! 거룩하시도다! 거룩하시도다!\n온 누리의 주 하느님!\n하늘과 땅에 가득 찬 그 영광!\n높은 데서 호산나!\n주님의 이름으로 오시는 분, 찬미받으소서.\n높은 데서 호산나!",
    주님의기도: "하늘에 계신 우리 아버지,\n아버지의 이름이 거룩히 빛나시며\n아버지의 나라가 오시며\n아버지의 뜻이 하늘에서와 같이\n땅에서도 이루어지소서!\n\n오늘 저희에게 일용할 양식을 주시고\n저희에게 잘못한 이를 저희가 용서하오니\n저희 죄를 용서하시고\n저희를 유혹에 빠지지 않게 하시고\n악에서 구하소서.",
    하느님의어린양: "하느님의 어린양, 세상의 죄를 없애시는 주님,\n자비를 베푸소서.\n하느님의 어린양, 세상의 죄를 없애시는 주님,\n자비를 베푸소서.\n하느님의 어린양, 세상의 죄를 없애시는 주님,\n평화를 주소서.",
    영성체전응답: "주님, 제 안에 주님을 모시기에 합당치 않사오나\n한 말씀만 하소서.\n제 영혼이 곧 나으리이다.",
    /** 2027 서울 세계청년대회 공식 기도문 (wyd.catholic.or.kr) */
    WYD공식기도문: "젊은이를 사랑하시는 주님,\n저희를 주님의 무한한 사랑과 자비로 초대해 주심에 감사드립니다.\n\n하느님 아버지,\n저희 자신을 당신께 맡겨 드리오니,\n온 세상 젊은이들이 교회의 품 안에서 위로받고\n친교와 일치의 기쁨을 누리게 하소서.\n\n'이미 그리고 영원히' 세상을 이기신 그리스도님,\n\"용기를 내어라.\" 하신 당신의 말씀 안에서\n온 세상 모든 이가 희망을 발견하고,\n사랑과 용서의 십자가가 세상에 대한 승리임을 깨닫게 하소서.\n\n사랑의 불꽃이신 성령님,\n당신의 놀라운 손길로 이 땅에 복음의 씨앗을 심으셨으니,\n한국 순교 성인들의 믿음이 저희 가슴에도 타올라\n평화와 사랑과 진리의 복음을 살아가는 제자가 되게 하소서.\n\n주님, 이 세계청년대회의 순례 여정을 통해\n저희 모두가 서로의 목소리를 경청하고\n그 안에서 당신의 뜻을 찾으며,\n모든 하느님 백성이 함께 걷는 시노드 교회가 되게 하소서.\n아멘.",
};
export function normalizeClosingPrayerMode(v) {
    return v === "daily" ? "daily" : "wyd";
}
/** 매일미사 인쇄본 쪽수 (숫자만, 웹에는 쪽수 정보가 없음) */
export function normalizeMissaPage(v) {
    return String(v ?? "")
        .replace(/[^\d]/g, "")
        .slice(0, 4);
}
/** 통상문에 고정된 미사곡 기본 번호. /api/data의 fixed가 있으면 그 값을 우선한다. */
export const DEFAULT_FIXED = {
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
    response: "천주의 성모 마리아님,\n이제와 저희 죽을 때에\n저희 죄인을 위하여 빌어주소서. 아멘.",
};
export const MASS_SECTIONS = [
    {
        id: "intro",
        title: "시작 예식",
        steps: [
            {
                id: "pre-mass-announce",
                title: "안내",
                roles: ["해설자"],
                liturgy: [
                    {
                        kind: "commentator",
                        text: "찬미예수님!\n거룩한 미사에 방해가 되지 않도록 휴대폰은 무음으로 하시고 알람은 꺼 주시기 바랍니다.\n삼종기도를 바치겠습니다.",
                    },
                ],
                note: "2차 헌금은 위쪽 칩에서 고르면 안내·봉헌 멘트에 들어갑니다.",
            },
            {
                id: "angelus",
                title: "삼종기도",
                roles: ["해설자", "신자"],
                note: "입당 성가에 앞서 바칩니다. ○ 해설자 · ● 신자. (부활 시기에는 부활 삼종기도)",
                liturgy: [
                    { kind: "verse", lead: "주님의 천사가 마리아께 아뢰니", response: "성령으로 잉태하셨나이다." },
                    { kind: "hail" },
                    { kind: "verse", lead: "\"주님의 종이오니", response: "그대로 제게 이루어지소서!\"" },
                    { kind: "hail" },
                    { kind: "verse", lead: "이에 말씀이 사람이 되시어", response: "저희 가운데 계시나이다." },
                    { kind: "hail" },
                    { kind: "verse", lead: "천주의 성모님, 저희를 위하여 빌어주시어", response: "그리스도께서 약속하신 영원한 생명을 얻게 하소서." },
                    { kind: "collect", lead: "기도합시다.\n하느님, 천사의 아룀으로\n성자께서 사람이 되심을 알았으니\n성자의 수난과 십자가로\n부활의 영광에 이르는 은총을\n저희에게 내려 주소서.\n우리 주 그리스도를 통하여 비나이다.", response: "아멘." },
                ],
            },
            {
                id: "entrance",
                title: "입당 성가",
                roles: ["해설자", "성가대"],
                note: "사제와 봉사자들이 제대로 나아가는 동안 입당 노래를 합니다.",
                liturgy: [
                    { kind: "commentator", text: "오늘은 ○○ 주일(대축일)입니다." },
                    { kind: "hymn-announce", slot: "entrance", template: "입당성가 {num}번입니다." },
                ],
                hymns: [{ kind: "week", slot: "entrance", label: "입당" }],
            },
            {
                id: "greeting",
                title: "성호경·인사",
                roles: ["사제", "신자"],
                response: "사제: 성부와 성자와 성령의 이름으로.\n신자: 아멘.\n사제: 주님께서 여러분과 함께.\n신자: 또한 사제의 영과 함께.",
            },
            {
                id: "penitential",
                title: "참회·자비송",
                roles: ["사제", "신자", "성가대"],
                note: "참회 예식에서 이미 자비송을 바쳤으면 따로 반복하지 않습니다.",
                liturgy: [
                    { kind: "prayer", title: "고백기도", role: "모두", text: PRAYERS.고백기도, collapsible: true },
                    { kind: "prayer", title: "자비송", role: "모두", text: PRAYERS.자비송, collapsible: false },
                ],
                hymns: [{ kind: "fixed", fixedName: "자비송", label: "자비송" }],
            },
            {
                id: "gloria",
                title: "대영광송",
                roles: ["성가대", "신자"],
                note: "대림·사순 시기에는 대영광송을 하지 않습니다.",
                liturgy: [
                    { kind: "prayer", title: "대영광송", role: "모두", text: PRAYERS.대영광송, collapsible: true },
                ],
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
                roles: ["해설자", "선창자", "신자"],
                note: "시편 담당자나 선창자가 시편을 노래하거나 낭송하고, 신자는 후렴으로 응답합니다. 토요 6시·주일 7시·9시·저녁 6시 미사에서는 해설자가 봉독합니다.",
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
                response: "사제(부제): 주님께서 여러분과 함께.\n신자: 또한 사제(부제)의 영과 함께.\n신자: 주님, 영광받으소서.\n\n(복음 봉독 후)\n사제(부제): 주님의 말씀입니다.\n신자: 그리스도님, 찬미합니다.",
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
                note: "사도 신경을 노래하거나 낭송합니다.",
                liturgy: [
                    { kind: "prayer", title: "사도 신경", role: "모두", text: PRAYERS.사도신경, collapsible: false },
                ],
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
                roles: ["해설자", "성가대", "사제", "신자"],
                note: "신경과 보편 지향 기도가 끝나면 봉헌 노래를 시작합니다.",
                liturgy: [
                    { kind: "hymn-announce", slot: "offertory", template: "예물 봉헌성가 {num}번입니다." },
                ],
                hymns: [{ kind: "week", slot: "offertory", label: "봉헌" }],
            },
            {
                id: "prayer-over-gifts",
                title: "예물 기도",
                roles: ["사제", "신자"],
                response: "사제: 형제 여러분, 우리가 바치는 이 제사를 전능하신 하느님 아버지께서 기꺼이 받아 주시도록 기도합시다.\n신자: 사제의 손으로 바치는 이 제사가 주님의 이름에는 찬미와 영광이 되고 저희와 온 교회에는 도움이 되게 하소서.",
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
                roles: ["해설자", "성가대", "신자"],
                note: "토요 6시·주일 7시·9시·저녁 6시 미사에서 해설자가 선창합니다.",
                liturgy: [
                    { kind: "commentator", text: "거룩하시도다~~" },
                    { kind: "prayer", title: "거룩하시도다", role: "모두", text: PRAYERS.거룩하시도다, collapsible: false },
                ],
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
                note: "사제의 초대에 따라 모두 함께 주님의 기도를 바칩니다.",
                liturgy: [
                    { kind: "prayer", title: "주님의 기도", role: "모두", text: PRAYERS.주님의기도, collapsible: false },
                ],
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
                response: "사제: 주님의 평화가 항상 여러분과 함께.\n신자: 또한 사제의 영과 함께.\n사제: 평화의 인사를 나누십시오.\n신자: 평화를 빕니다.",
            },
            {
                id: "agnus",
                title: "하느님의 어린양",
                roles: ["해설자", "성가대", "신자"],
                note: "토요 6시·주일 7시·9시·저녁 6시 미사: 평화의 인사를 나누고 신부님이 성체를 쪼개실 때 해설자가 선창합니다.",
                liturgy: [
                    { kind: "commentator", text: "하느님의 어린양~~" },
                    { kind: "prayer", title: "하느님의 어린양", role: "모두", text: PRAYERS.하느님의어린양, collapsible: false },
                ],
                hymns: [{ kind: "fixed", fixedName: "하느님의 어린양", label: "하느님의 어린양" }],
            },
            {
                id: "communion",
                title: "영성체·성체 성가",
                roles: ["해설자", "사제", "신자", "성가대"],
                note: "사제가 성체를 모실 때(복사가 종을 칠 때) 영성체 성가를 안내합니다.",
                liturgy: [
                    { kind: "prayer", title: "영성체 전 응답", role: "모두", text: PRAYERS.영성체전응답, collapsible: false },
                    { kind: "hymn-announce", slot: "communion", template: "영성체성가 {num}번입니다." },
                ],
                response: "사제: 보라, 하느님의 어린양, 세상의 죄를 없애시는 분이시니, 이 성찬에 초대받은 이는 복되도다.\n신자: 주님, 제 안에 주님을 모시기에 합당치 않사오나 한 말씀만 하소서. 제 영혼이 곧 나으리이다.\n사제: 그리스도의 몸.\n신자: 아멘.",
                hymns: [{ kind: "week", slot: "communion", label: "성체" }],
            },
            {
                id: "prayer-after-communion",
                title: "영성체 후 기도",
                roles: ["사제", "신자"],
                response: "사제: 기도합시다.\n신자: 아멘.",
                note: "그전에 잠깐 침묵하며 기도할 수 있습니다. 미사 후 마침기도는 「마침기도」에서 이어서 바칩니다.",
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
                response: "사제: 주님께서 여러분과 함께.\n신자: 또한 사제의 영과 함께.\n사제: 전능하신 천주 성부와 성자와 성령께서는 여기 모인 모든 이에게 강복하소서.\n신자: 아멘.",
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
                roles: ["해설자", "성가대"],
                note: "사제와 봉사자들이 제대에 절하고 물러갈 때 부릅니다.",
                liturgy: [
                    { kind: "hymn-announce", slot: "recessional", template: "파견성가 {num}번입니다." },
                ],
                hymns: [{ kind: "week", slot: "recessional", label: "파견" }],
            },
        ],
    },
    {
        id: "closing-prayer",
        title: "마침기도",
        steps: [
            {
                id: "closing-prayer-body",
                title: "마침기도",
                roles: ["해설자", "신자"],
                note: "미사 후 마침기도를 이어서 바칩니다. 위쪽에서 WYD·매일미사를 고를 수 있어요.",
                liturgy: [
                    { kind: "commentator", text: "2027 서울 세계청년대회 공식 기도문을 바치겠습니다." },
                    { kind: "prayer", title: "WYD 공식 기도문", role: "모두", text: PRAYERS.WYD공식기도문, collapsible: false },
                    { kind: "verse", lead: "자비와 평화의 모후이시여,", response: "저희를 위하여 빌어 주소서." },
                    {
                        kind: "verse",
                        lead: "서울 세계청년대회의 주보성인들이여,",
                        response: "모든 젊은이들을 위하여 빌어 주소서.",
                    },
                ],
            },
        ],
    },
];
export function normHymnName(s) {
    return s.replace(/[\s.…·⋯]/g, "").toLowerCase();
}
export function resolveFixedNumber(name, fixed) {
    const key = normHymnName(name);
    const fromApi = fixed.find((f) => normHymnName(f.name) === key);
    if (fromApi?.number)
        return fromApi.number;
    const fallback = Object.entries(DEFAULT_FIXED).find(([n]) => normHymnName(n) === key);
    return fallback?.[1] ?? "";
}
export function formatNumbers(nums) {
    const list = (nums || []).map((n) => n.trim()).filter(Boolean);
    return list.length ? list.join(", ") : "–";
}
function sectionText(daily, key) {
    return (daily?.sections?.[key]?.text || "").trim();
}
/** 출처·성경 구절만 (본문은 /readings/) */
function readingCite(daily, key) {
    const sec = daily.sections?.[key];
    if (!sec)
        return "";
    return [sec.source, sec.ref || sec.citation].filter(Boolean).join(" · ");
}
function readingPageNote(cite, hash) {
    const link = `<a href="/readings/#${esc(hash)}">오늘 독서에서 보기</a>`;
    return cite ? `${esc(cite)} · ${link}` : link;
}
/** 해설자용 짧은 전례명 (연중 제N주일 우선) */
export function liturgyAnnounceTitle(daily) {
    if (!daily)
        return "";
    if (daily.weekLabel)
        return daily.weekLabel.replace(/\s+/g, " ").trim();
    const raw = daily.titlePlain ||
        daily.title.replace(/^\[[^\]]+\]\s*/, "").replace(/\s*\([^)]*\)\s*$/, "").trim();
    return raw.replace(/\s+/g, " ").trim();
}
/** 해설자 멘트 한 줄: 「오늘 전례」 문장 우선 */
export function liturgyTodayLine(daily) {
    if (!daily)
        return "오늘은 ○○ 주일(대축일)입니다.";
    if (daily.announce)
        return daily.announce.replace(/\s+/g, " ").trim();
    const title = liturgyAnnounceTitle(daily);
    return title ? `오늘은 ${title}입니다.` : "오늘은 ○○ 주일(대축일)입니다.";
}
/** 2차 헌금 멘트를 안내·봉헌에 끼워 넣는다. */
export function applySecondCollection(sections, mass) {
    const purpose = mass?.secondCollection?.trim() || "";
    const preLine = secondCollectionAnnounce(purpose, "pre");
    const offLine = secondCollectionAnnounce(purpose, "offertory");
    return sections.map((sec) => ({
        ...sec,
        steps: sec.steps.map((step) => {
            if (step.id === "pre-mass-announce") {
                const base = "찬미예수님!\n거룩한 미사에 방해가 되지 않도록 휴대폰은 무음으로 하시고 알람은 꺼 주시기 바랍니다.";
                const text = preLine
                    ? `${base}\n${preLine}\n삼종기도를 바치겠습니다.`
                    : `${base}\n삼종기도를 바치겠습니다.`;
                return {
                    ...step,
                    liturgy: [{ kind: "commentator", text }],
                };
            }
            if (step.id === "offertory") {
                const rest = (step.liturgy || []).filter((p) => p.kind !== "commentator");
                return {
                    ...step,
                    liturgy: offLine
                        ? [{ kind: "commentator", text: offLine }, ...rest]
                        : rest,
                };
            }
            return step;
        }),
    }));
}
/** 매일미사 본문을 해당 단계에 끼워 넣는다. */
export function applyDailyMissa(sections, daily) {
    if (!daily)
        return sections.map((s) => ({ ...s, steps: s.steps.map((st) => ({ ...st })) }));
    const todayLine = liturgyTodayLine(daily);
    return sections.map((sec) => ({
        ...sec,
        steps: sec.steps.map((step) => {
            if (step.id === "entrance") {
                return {
                    ...step,
                    liturgy: [
                        { kind: "commentator", text: todayLine },
                        ...(step.liturgy || []).filter((p) => p.kind !== "commentator"),
                    ],
                };
            }
            if (step.id === "collect") {
                const text = sectionText(daily, "본기도");
                if (!text)
                    return step;
                return {
                    ...step,
                    liturgy: [{ kind: "prayer", title: "본기도", role: "사제", text, collapsible: true }],
                };
            }
            // 제1·제2독서·복음 본문은 /readings/ — 화답송·복음 환호송은 미사 도우미에 표시
            if (step.id === "first-reading") {
                return { ...step, note: readingPageNote(readingCite(daily, "제1독서"), "reading1") };
            }
            if (step.id === "psalm") {
                const text = sectionText(daily, "화답송");
                if (!text)
                    return step;
                const cite = daily.sections["화답송"]?.citation;
                return {
                    ...step,
                    note: step.note,
                    liturgy: [
                        {
                            kind: "prayer",
                            title: cite ? `화답송 · ${cite}` : "화답송",
                            role: "모두",
                            text,
                            collapsible: false,
                        },
                    ],
                };
            }
            if (step.id === "second-reading") {
                return { ...step, note: readingPageNote(readingCite(daily, "제2독서"), "reading2") };
            }
            if (step.id === "gospel-acclamation") {
                const text = sectionText(daily, "복음 환호송");
                if (!text)
                    return step;
                const cite = daily.sections["복음 환호송"]?.citation;
                return {
                    ...step,
                    note: step.note,
                    liturgy: [
                        {
                            kind: "prayer",
                            title: cite ? `복음 환호송 · ${cite}` : "복음 환호송",
                            role: "모두",
                            text,
                            collapsible: false,
                        },
                    ],
                };
            }
            if (step.id === "gospel") {
                return { ...step, note: readingPageNote(readingCite(daily, "복음"), "gospel") };
            }
            if (step.id === "intercessions") {
                const text = sectionText(daily, "보편 지향 기도");
                if (!text)
                    return step;
                return {
                    ...step,
                    liturgy: [{ kind: "prayer", title: "보편 지향 기도", role: "모두", text, collapsible: true }],
                };
            }
            if (step.id === "prayer-over-gifts") {
                const text = sectionText(daily, "예물 기도");
                if (!text)
                    return step;
                return {
                    ...step,
                    liturgy: [{ kind: "prayer", title: "예물 기도", role: "사제", text, collapsible: true }],
                };
            }
            if (step.id === "communion") {
                const antiphon = sectionText(daily, "영성체송");
                if (!antiphon)
                    return step;
                const cite = daily.sections["영성체송"]?.citation;
                const antiphonPart = {
                    kind: "prayer",
                    title: cite ? `영성체송 · ${cite}` : "영성체송",
                    role: "모두",
                    text: antiphon,
                    collapsible: true,
                };
                // 영성체 전 응답 → 영성체송 → 성가 안내
                const liturgy = [...(step.liturgy || [])];
                const hymnIdx = liturgy.findIndex((p) => p.kind === "hymn-announce");
                if (hymnIdx >= 0)
                    liturgy.splice(hymnIdx, 0, antiphonPart);
                else
                    liturgy.push(antiphonPart);
                return { ...step, liturgy };
            }
            return step;
        }),
    }));
}
/** 마침기도: WYD 공식 / 매일미사(쪽수) 전환 */
export function applyClosingPrayer(sections, opts) {
    const mode = normalizeClosingPrayerMode(opts.mode);
    const page = normalizeMissaPage(opts.page);
    const titleForAnnounce = liturgyAnnounceTitle(opts.daily);
    const sourceUrl = opts.daily?.sourceUrl || "https://missa.cbck.or.kr/";
    return sections.map((sec) => {
        if (sec.id !== "closing-prayer")
            return sec;
        return {
            ...sec,
            steps: sec.steps.map((step) => {
                if (step.id !== "closing-prayer-body")
                    return step;
                if (mode === "daily") {
                    const pageLabel = page || "○";
                    const titleBit = titleForAnnounce ? `「${titleForAnnounce}」 ` : "";
                    return {
                        ...step,
                        title: "매일미사 기도",
                        note: page
                            ? `인쇄본 ${esc(page)}쪽 · <a href="${esc(sourceUrl)}" target="_blank" rel="noopener">missa.cbck.or.kr</a>（쪽수는 인쇄본 기준, 웹에는 없어요）`
                            : `쪽수를 위쪽에서 입력하세요 · <a href="${esc(sourceUrl)}" target="_blank" rel="noopener">missa.cbck.or.kr</a>`,
                        liturgy: [
                            {
                                kind: "commentator",
                                text: `매일미사 ${titleBit}${pageLabel}쪽 기도를 바치겠습니다.`,
                            },
                        ],
                    };
                }
                return {
                    ...step,
                    title: "WYD 공식 기도문",
                    note: `출처: <a href="https://wyd.catholic.or.kr/prayer.asp" target="_blank" rel="noopener">2027 서울 WYD 공식 기도문</a>`,
                    liturgy: [
                        { kind: "commentator", text: "2027 서울 세계청년대회 공식 기도문을 바치겠습니다." },
                        {
                            kind: "prayer",
                            title: "WYD 공식 기도문",
                            role: "모두",
                            text: PRAYERS.WYD공식기도문,
                            collapsible: false,
                        },
                        { kind: "verse", lead: "자비와 평화의 모후이시여,", response: "저희를 위하여 빌어 주소서." },
                        {
                            kind: "verse",
                            lead: "서울 세계청년대회의 주보성인들이여,",
                            response: "모든 젊은이들을 위하여 빌어 주소서.",
                        },
                    ],
                };
            }),
        };
    });
}
function rolesHTML(roles) {
    return roles.map((r) => `<span class="role">${esc(r)}</span>`).join("");
}
function hymnsHTML(bindings, mass, fixed) {
    if (!bindings?.length)
        return "";
    return `<div class="hymns">${bindings.map((b) => {
        let nums = "–";
        if (b.kind === "week" && b.slot)
            nums = formatNumbers(mass?.[b.slot]);
        else if (b.kind === "fixed" && b.fixedName)
            nums = resolveFixedNumber(b.fixedName, fixed) || "–";
        const empty = nums === "–" ? " empty" : "";
        return `<div class="hymn"><span class="hymn-label">${esc(b.label)}</span><span class="hymn-num${empty}">${esc(nums)}</span></div>`;
    }).join("")}</div>`;
}
/** 큰 성가 번호 + 「입당성가 ○번입니다」만 (주일 멘트와 분리) */
function hymnHeroHTML(step, mass) {
    const announce = (step.liturgy || []).find((p) => p.kind === "hymn-announce");
    const week = (step.hymns || []).find((h) => h.kind === "week" && h.slot);
    if (!announce || !week?.slot)
        return "";
    const nums = formatNumbers(mass?.[week.slot]);
    const hasNum = nums !== "–";
    const say = announce.template.replace("{num}", hasNum ? nums : "○○");
    return `<div class="hymn-hero${hasNum ? "" : " empty"}">
    <div class="hymn-hero-num">${esc(hasNum ? nums : "○○")}</div>
    <div class="hymn-hero-say">${esc(say)}</div>
  </div>`;
}
function liturgyWithoutHymnHero(parts, mass) {
    if (!parts?.length)
        return "";
    // 성가 안내만 hero로 빼고, 「오늘은 ○○입니다」 등 해설자 멘트는 그대로
    const filtered = parts.filter((p) => p.kind !== "hymn-announce");
    return liturgyHTML(filtered.length ? filtered : undefined, mass);
}
function roleBlock(role, label, text) {
    return `<div class="role-block" data-role="${role}"><div class="role-label">${esc(label)}</div><div class="role-text">${esc(text)}</div></div>`;
}
function liturgyHTML(parts, mass) {
    if (!parts?.length)
        return "";
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
        if (p.kind === "verse") {
            return `<div class="liturgy-unit">
        ${roleBlock("commentator", "해설자", p.lead)}
        ${roleBlock("faithful", "신자", p.response)}
      </div>`;
        }
        if (p.kind === "commentator") {
            return `<div class="commentator-block">
        <div class="commentator-label">해설자</div>
        <div class="commentator-text">${esc(p.text).replace(/\n/g, "<br>")}</div>
      </div>`;
        }
        if (p.kind === "posture") {
            return `<div class="posture-cue">${esc(p.text)}</div>`;
        }
        if (p.kind === "hymn-announce") {
            const nums = formatNumbers(mass?.[p.slot]);
            const hasNum = nums !== "–";
            const sentence = p.template.replace("{num}", hasNum ? nums : "○○");
            const cls = hasNum ? "hymn-announce-line" : "hymn-announce-line empty";
            return `<div class="${cls}">${esc(sentence)}</div>`;
        }
        if (p.kind === "prayer") {
            const roleLabel = p.role === "모두" ? "모두" : p.role;
            if (p.collapsible) {
                return `<details class="prayer-block collapsible">
          <summary class="prayer-title">${esc(p.title)} <span class="prayer-role">${esc(roleLabel)}</span></summary>
          <div class="prayer-text">${esc(p.text).replace(/\n/g, "<br>")}</div>
        </details>`;
            }
            return `<div class="prayer-block">
        <div class="prayer-title">${esc(p.title)} <span class="prayer-role">${esc(roleLabel)}</span></div>
        <div class="prayer-text">${esc(p.text).replace(/\n/g, "<br>")}</div>
      </div>`;
        }
        return "";
    });
    return `<div class="liturgy">${blocks.join("")}</div>`;
}
function stepHTML(step, mass, fixed) {
    const resp = step.response
        ? `<div class="resp">${esc(step.response).replace(/\n/g, "<br>")}</div>`
        : "";
    const noteText = step.note || "";
    const note = noteText ? `<p class="note">${noteText}</p>` : "";
    const hero = hymnHeroHTML(step, mass);
    const liturgy = hero
        ? liturgyWithoutHymnHero(step.liturgy, mass)
        : liturgyHTML(step.liturgy, mass);
    // hero에 주일 성가를 넣었으면 작은 번호 카드는 생략 (고정곡은 그대로)
    const weekInHero = !!hero;
    const hymnBindings = weekInHero
        ? (step.hymns || []).filter((h) => h.kind !== "week")
        : step.hymns;
    const hymns = hymnsHTML(hymnBindings, mass, fixed);
    // 영성체: 사제·신자 대화 → 영성체 전 응답 → 영성체송·성가
    const body = step.id === "communion"
        ? `${resp}${liturgy}${hero}${hymns}${note}`
        : `${liturgy}${hero}${hymns}${resp}${note}`;
    if (step.liturgy?.length || hero) {
        return `<details class="step step-fold" id="step-${esc(step.id)}" open>
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
function secondCollectionChipsHTML(selected) {
    const value = selected || "";
    const custom = value && !isPresetSecondCollection(value);
    const chips = [
        `<button type="button" class="chip${value === "" ? " is-on" : ""}" data-purpose="">없음</button>`,
        ...SECOND_COLLECTION_PURPOSES.map((p) => `<button type="button" class="chip${value === p ? " is-on" : ""}" data-purpose="${esc(p)}">${esc(p)}</button>`),
        `<button type="button" class="chip${custom ? " is-on" : ""}" data-purpose="__custom__">직접 입력</button>`,
    ];
    return `<div class="sc-picker">
    <div class="sc-picker-label">2차 헌금</div>
    <div class="chips" id="secondCollectionChips" role="group" aria-label="2차 헌금 목적">${chips.join("")}</div>
    <div class="sc-custom${custom ? "" : " is-hidden"}" id="scCustomWrap">
      <input type="text" id="scCustomInput" maxlength="${SECOND_COLLECTION_MAX_LEN}"
        placeholder="목적 직접 입력 (예: 성서 주간)"
        value="${esc(custom ? value : "")}"
        autocomplete="off" enterkeyhint="done">
      <button type="button" class="sc-custom-apply" id="scCustomApply">적용</button>
    </div>
  </div>`;
}
function closingPrayerPickerHTML(mode, page) {
    const m = normalizeClosingPrayerMode(mode);
    const p = normalizeMissaPage(page);
    return `<div class="sc-picker" id="closingPrayerPicker">
    <div class="sc-picker-label">마침기도</div>
    <div class="chips" id="closingPrayerChips" role="group" aria-label="마침기도 종류">
      <button type="button" class="chip${m === "wyd" ? " is-on" : ""}" data-closing="wyd">WYD 공식</button>
      <button type="button" class="chip${m === "daily" ? " is-on" : ""}" data-closing="daily">매일미사</button>
    </div>
    <div class="sc-custom${m === "daily" ? "" : " is-hidden"}" id="missaPageWrap">
      <input type="text" id="missaPageInput" inputmode="numeric" maxlength="4"
        placeholder="매일미사 쪽수 (예: 128)"
        value="${esc(p)}"
        autocomplete="off" enterkeyhint="done">
      <button type="button" class="sc-custom-apply" id="missaPageApply">적용</button>
    </div>
    <p class="sc-hint${m === "daily" ? "" : " is-hidden"}" id="missaPageHint">인쇄본 쪽수는 웹에 없어서, 갖고 계신 『매일미사』를 보고 입력해 주세요.</p>
  </div>`;
}
export function renderOrder(opts) {
    const { mass, fixed, today, sunday, daily, dailyError, loadError } = opts;
    const viewMode = opts.viewMode === "all" ? "all" : "tabs";
    const secondCollection = normalizeSecondCollection(opts.secondCollection) ?? null;
    const closingMode = normalizeClosingPrayerMode(opts.closingMode);
    const missaPage = normalizeMissaPage(opts.missaPage);
    const dateLine = sundayChipText(today, sunday);
    const songLine = massSongChipText(mass, today, !!loadError);
    const massForLiturgy = mass
        ? { ...mass, secondCollection }
        : secondCollection
            ? {
                id: "",
                date: sunday,
                entrance: [],
                offertory: [],
                communion: [],
                recessional: [],
                secondCollection,
            }
            : null;
    const order = applyClosingPrayer(applySecondCollection(applyDailyMissa(MASS_SECTIONS, daily), massForLiturgy), { mode: closingMode, page: missaPage, daily });
    const tabButtons = order
        .flatMap((sec, idx) => {
        const selected = idx === 0 ? ' aria-selected="true"' : ' aria-selected="false"';
        const btn = `<button type="button" role="tab" id="tab-${esc(sec.id)}" data-tab="${esc(sec.id)}"${selected}>${esc(sec.title)}</button>`;
        if (sec.id !== "word")
            return [btn];
        const links = MASS_READING_LINKS.map((l) => `<a class="mass-tab-link" href="${esc(l.href)}">${esc(l.label)}</a>`);
        return [btn, ...links];
    })
        .join("");
    const tabPanels = order.map((sec, idx) => {
        const body = sec.steps.map((st) => stepHTML(st, mass, fixed)).join("");
        const hidden = viewMode === "all" || idx === 0 ? "" : ' hidden';
        const next = order[idx + 1];
        const nav = viewMode === "all"
            ? ""
            : next
                ? `<div class="sec-nav">
          <button type="button" class="mass-next" data-goto="${esc(next.id)}">다음 · ${esc(next.title)}</button>
        </div>`
                : `<div class="sec-nav">
          <button type="button" class="mass-next mass-next-end" data-goto="${esc(order[0].id)}">처음으로</button>
        </div>`;
        const secTitle = viewMode === "all" ? `<h2 class="sec-title">${esc(sec.title)}</h2>` : "";
        return `<div class="tab-panel" id="panel-${esc(sec.id)}" role="tabpanel" data-panel="${esc(sec.id)}"${hidden}>
      ${secTitle}
      <div class="sec-body">${body}</div>
      ${nav}
    </div>`;
    }).join("");
    const weekOrTitle = daily?.weekLabel || liturgyAnnounceTitle(daily);
    const litChip = daily && weekOrTitle
        ? `<div class="liturgy-chip">${esc(daily.color ? `[${daily.color}] ${weekOrTitle}` : weekOrTitle)}</div>`
        : dailyError
            ? `<div class="liturgy-chip muted">매일미사를 불러오지 못했어요</div>`
            : "";
    const sourceDaily = daily?.sourceUrl
        ? `<a href="${esc(daily.sourceUrl)}" target="_blank" rel="noopener">missa.cbck.or.kr</a>`
        : `<a href="https://missa.cbck.or.kr/" target="_blank" rel="noopener">missa.cbck.or.kr</a>`;
    const viewToggle = `<div class="view-toggle" role="group" aria-label="보기 방식">
    <button type="button" class="view-btn${viewMode === "tabs" ? " is-on" : ""}" data-view="tabs">구간 보기</button>
    <button type="button" class="view-btn${viewMode === "all" ? " is-on" : ""}" data-view="all">한번에 보기</button>
  </div>`;
    return `<header>
    <div class="cross">✝</div>
    <h1>주일 청년미사 순서</h1>
    <p>해설자·전례부·성가대를 위한 주일 미사 안내</p>
    <div class="date-chip">${esc(dateLine)}</div>
    ${litChip}
    <div class="song-chip${mass ? "" : " muted"}">${esc(songLine)}</div>
    <a class="readings-chip" href="/readings/">📖 오늘 독서 보기</a>
  </header>
  ${secondCollectionChipsHTML(secondCollection)}
  ${closingPrayerPickerHTML(closingMode, missaPage)}
  ${viewToggle}
  <div class="mass-tabs${viewMode === "all" ? " is-all" : ""}" role="tablist" aria-label="미사 순서">${tabButtons}</div>
  <div class="order${viewMode === "all" ? " view-all" : ""}">${tabPanels}</div>
  <p class="source">순서와 기도문은 한국천주교주교회의 『미사 통상문』(<a href="https://missale.cbck.or.kr/OrdoMissae" target="_blank" rel="noopener">missale.cbck.or.kr</a>)을 따랐습니다.<br>그날의 독서·기도는 ${sourceDaily} 매일미사에서 불러왔습니다.</p>`;
}
async function loadData() {
    try {
        const r = await fetch("/api/data");
        if (!r.ok)
            throw new Error(String(r.status));
        const data = (await r.json());
        return { data };
    }
    catch {
        return { error: true };
    }
}
async function loadDailyMissa(date) {
    try {
        const r = await fetch(`/api/daily-missa?date=${encodeURIComponent(date)}`);
        if (!r.ok)
            throw new Error(String(r.status));
        const daily = (await r.json());
        if (!daily?.title && !daily?.sections)
            throw new Error("empty");
        return { daily };
    }
    catch {
        return { error: true };
    }
}
function scStorageKey(date) {
    return `ym_secondCollection_${date}`;
}
function readLocalSecondCollection(date) {
    try {
        return normalizeSecondCollection(localStorage.getItem(scStorageKey(date)));
    }
    catch {
        return null;
    }
}
function writeLocalSecondCollection(date, purpose) {
    try {
        const key = scStorageKey(date);
        if (purpose)
            localStorage.setItem(key, purpose);
        else
            localStorage.removeItem(key);
    }
    catch {
        /* ignore */
    }
}
const CLOSING_MODE_KEY = "ym_closing_prayer";
function missaPageStorageKey(date) {
    return `ym_missa_page_${date}`;
}
function readClosingPrayerMode() {
    try {
        return normalizeClosingPrayerMode(localStorage.getItem(CLOSING_MODE_KEY));
    }
    catch {
        return "wyd";
    }
}
function writeClosingPrayerMode(mode) {
    try {
        localStorage.setItem(CLOSING_MODE_KEY, mode);
    }
    catch {
        /* ignore */
    }
}
function readMissaPage(date) {
    try {
        return normalizeMissaPage(localStorage.getItem(missaPageStorageKey(date)));
    }
    catch {
        return "";
    }
}
function writeMissaPage(date, page) {
    try {
        const key = missaPageStorageKey(date);
        const next = normalizeMissaPage(page);
        if (next)
            localStorage.setItem(key, next);
        else
            localStorage.removeItem(key);
    }
    catch {
        /* ignore */
    }
}
function initMassTabs(root = document, viewMode = "tabs") {
    const tablist = root.querySelector(".mass-tabs");
    if (!tablist)
        return;
    const tabs = tablist.querySelectorAll('[role="tab"]');
    const panels = root.querySelectorAll(".tab-panel");
    function selectTab(tabId) {
        if (viewMode === "all") {
            const panel = root.querySelector(`#panel-${CSS.escape(tabId)}`);
            panel?.scrollIntoView({ behavior: "smooth", block: "start" });
            tabs.forEach((t) => {
                const on = t.dataset.tab === tabId;
                t.setAttribute("aria-selected", String(on));
                if (on)
                    t.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            });
            return;
        }
        tabs.forEach((t) => {
            const isSelected = t.dataset.tab === tabId;
            t.setAttribute("aria-selected", String(isSelected));
            if (isSelected)
                t.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        });
        panels.forEach((p) => {
            p.hidden = p.dataset.panel !== tabId;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const tabId = tab.dataset.tab;
            if (tabId)
                selectTab(tabId);
        });
    });
    root.querySelectorAll(".mass-next[data-goto]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const tabId = btn.dataset.goto;
            if (tabId)
                selectTab(tabId);
        });
    });
}
async function saveSecondCollectionToMass(mass, purpose) {
    if (!mass?.id)
        return mass ? { ...mass, secondCollection: purpose } : null;
    const body = {
        date: mass.date,
        memo: mass.memo || "",
        entrance: mass.entrance || [],
        offertory: mass.offertory || [],
        communion: mass.communion || [],
        recessional: mass.recessional || [],
        secondCollection: purpose,
    };
    try {
        const r = await fetch(`/api/masses/${encodeURIComponent(mass.id)}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!r.ok)
            throw new Error(String(r.status));
        const data = (await r.json());
        return data.mass || { ...mass, secondCollection: purpose };
    }
    catch {
        return { ...mass, secondCollection: purpose };
    }
}
export async function mount(root) {
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
    if (!main)
        return;
    const { data, error } = await loadData();
    let mass = currentMass(data?.masses ?? [], today);
    const fixed = data?.fixed ?? [];
    // 주일 청년미사 전례명·독서는 다가오는(또는 오늘) 주일 기준
    const { daily = null, error: dailyError } = await loadDailyMissa(sunday);
    const scDate = mass?.date || sunday;
    let secondCollection = normalizeSecondCollection(mass?.secondCollection) ?? readLocalSecondCollection(scDate);
    let viewMode = localStorage.getItem("ym_mass_view") === "all" ? "all" : "tabs";
    let closingMode = readClosingPrayerMode();
    let missaPage = readMissaPage(sunday);
    function paint(activeTab) {
        main.innerHTML = renderOrder({
            mass,
            fixed,
            today,
            sunday,
            daily,
            dailyError,
            loadError: !!error,
            secondCollection,
            viewMode,
            closingMode,
            missaPage,
        });
        initMassTabs(main, viewMode);
        if (activeTab && viewMode === "tabs") {
            main.querySelectorAll('[role="tab"]').forEach((t) => {
                t.setAttribute("aria-selected", String(t.dataset.tab === activeTab));
            });
            main.querySelectorAll(".tab-panel").forEach((p) => {
                p.hidden = p.dataset.panel !== activeTab;
            });
        }
        const currentTab = () => main.querySelector('[role="tab"][aria-selected="true"]')?.dataset.tab || null;
        async function applySecondCollection(next) {
            const tab = currentTab();
            secondCollection = next;
            writeLocalSecondCollection(scDate, next);
            mass = await saveSecondCollectionToMass(mass, next);
            paint(tab);
        }
        main.querySelectorAll(".view-btn[data-view]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const next = btn.dataset.view === "all" ? "all" : "tabs";
                if (next === viewMode)
                    return;
                viewMode = next;
                try {
                    localStorage.setItem("ym_mass_view", viewMode);
                }
                catch {
                    /* ignore */
                }
                paint(currentTab());
            });
        });
        const chips = main.querySelector("#secondCollectionChips");
        const customWrap = main.querySelector("#scCustomWrap");
        const customInput = main.querySelector("#scCustomInput");
        const customApply = main.querySelector("#scCustomApply");
        chips?.addEventListener("click", (e) => {
            const chip = e.target?.closest?.(".chip");
            if (!chip || !chips.contains(chip))
                return;
            const purpose = chip.dataset.purpose || "";
            if (purpose === "__custom__") {
                customWrap?.classList.remove("is-hidden");
                chips.querySelectorAll(".chip").forEach((c) => {
                    c.classList.toggle("is-on", c.dataset.purpose === "__custom__");
                });
                customInput?.focus();
                return;
            }
            void applySecondCollection(normalizeSecondCollection(purpose));
        });
        const commitCustom = () => {
            const next = normalizeSecondCollection(customInput?.value || "");
            void applySecondCollection(next);
        };
        customApply?.addEventListener("click", commitCustom);
        customInput?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                commitCustom();
            }
        });
        const closingChips = main.querySelector("#closingPrayerChips");
        closingChips?.addEventListener("click", (e) => {
            const chip = e.target?.closest?.(".chip");
            if (!chip || !closingChips.contains(chip))
                return;
            const next = normalizeClosingPrayerMode(chip.dataset.closing);
            if (next === closingMode)
                return;
            closingMode = next;
            writeClosingPrayerMode(next);
            paint(currentTab());
        });
        const pageInput = main.querySelector("#missaPageInput");
        const pageApply = main.querySelector("#missaPageApply");
        const commitPage = () => {
            missaPage = normalizeMissaPage(pageInput?.value || "");
            writeMissaPage(sunday, missaPage);
            paint(currentTab());
        };
        pageApply?.addEventListener("click", commitPage);
        pageInput?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                commitPage();
            }
        });
    }
    paint();
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
