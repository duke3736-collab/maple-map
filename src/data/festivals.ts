/**
 * 단풍 맵 코스 → visitkorea 지역 검색 키워드 매핑
 * 실제 축제 데이터는 /api/festivals 에서 visitkorea 구석구석 API로 실시간 조회
 * 계절 제한 없이 연중 해당 지역 축제를 표시
 */

export interface Festival {
  id: string;
  name: string;
  location: string;
  area: string;
  startDate: string;
  endDate: string;
  description: string;
  imageUrl: string;
  phone: string;
  detailUrl: string;
  isActive: boolean;
  isSoon: boolean;
  isUpcoming: boolean;
}

/**
 * 코스 텍스트에서 지역 키워드 추출 → visitkorea API 검색어로 사용
 * 우선순위: 산/명소 이름 > 시군구 > 도/광역시
 */
const REGION_PATTERNS: { pattern: RegExp; keyword: string }[] = [
  // ── 강원도 ──
  { pattern: /설악|속초|인제/, keyword: '속초 축제' },
  { pattern: /강릉|경포/, keyword: '강릉 축제' },
  { pattern: /춘천|소양강|남이섬/, keyword: '춘천 축제' },
  { pattern: /평창|오대산|월정사/, keyword: '평창 축제' },
  { pattern: /원주|소금산/, keyword: '원주 축제' },
  { pattern: /동해|삼척/, keyword: '동해 삼척 축제' },
  { pattern: /양양|낙산/, keyword: '양양 축제' },
  { pattern: /강원/, keyword: '강원도 축제' },

  // ── 서울·경기 ──
  { pattern: /서울|한강|경복궁|창덕궁|남산|북한산|인왕산/, keyword: '서울 축제' },
  { pattern: /가평|자라섬|청평/, keyword: '가평 축제' },
  { pattern: /수원|화성/, keyword: '수원 축제' },
  { pattern: /경기/, keyword: '경기도 축제' },

  // ── 경상도 ──
  { pattern: /경주|불국사|석굴암|안압지/, keyword: '경주 축제' },
  { pattern: /부산|해운대|광안리|용두산|태종대/, keyword: '부산 축제' },
  { pattern: /안동|하회/, keyword: '안동 축제' },
  { pattern: /팔공산|동화사|대구/, keyword: '대구 축제' },
  { pattern: /통영|거제|남해/, keyword: '경남 축제' },
  { pattern: /가야산|해인사|합천/, keyword: '합천 축제' },
  { pattern: /경북/, keyword: '경상북도 축제' },
  { pattern: /경남/, keyword: '경상남도 축제' },

  // ── 전라도 ──
  { pattern: /내장산|정읍/, keyword: '정읍 축제' },
  { pattern: /전주|한옥마을/, keyword: '전주 축제' },
  { pattern: /지리산|하동|구례|화엄사|피아골/, keyword: '하동 구례 축제' },
  { pattern: /여수|순천|보성/, keyword: '전남 축제' },
  { pattern: /광주|무등산/, keyword: '광주 축제' },
  { pattern: /장흥|천관산/, keyword: '장흥 축제' },
  { pattern: /전북/, keyword: '전북 축제' },
  { pattern: /전남|전라/, keyword: '전라남도 축제' },

  // ── 충청도 ──
  { pattern: /공주|마곡사|무령왕릉/, keyword: '공주 축제' },
  { pattern: /부여|낙화암/, keyword: '부여 축제' },
  { pattern: /속리산|법주사|보은/, keyword: '보은 축제' },
  { pattern: /덕유산|무주/, keyword: '무주 축제' },
  { pattern: /충북|충청북도/, keyword: '충청북도 축제' },
  { pattern: /충남|충청남도/, keyword: '충청남도 축제' },

  // ── 제주 ──
  { pattern: /제주|한라산|성판악|어리목|우도|성산/, keyword: '제주 축제' },

  // ── 인천 ──
  { pattern: /인천|강화|백령/, keyword: '인천 축제' },
];

/**
 * 코스 정보에서 가장 적합한 visitkorea 검색 키워드를 추출
 */
export function extractSearchKeyword(course: {
  title: string;
  tags: string;
  description: string;
  waypoints?: string;
  theme?: string;
}): string {
  const text = [
    course.title,
    course.tags,
    course.description,
    course.waypoints || '',
    course.theme || '',
  ].join(' ');

  for (const { pattern, keyword } of REGION_PATTERNS) {
    if (pattern.test(text)) return keyword;
  }

  // 매칭 없으면 일반 한국 축제 검색
  return '한국 축제';
}

/**
 * 날짜 포맷 "2026.10.01" → "10월 1일"
 */
export function formatVisitkoreaDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('.');
  if (parts.length < 3) return dateStr;
  return `${parseInt(parts[1])}월 ${parseInt(parts[2])}일`;
}

/**
 * 축제까지 남은 일수 문자열
 */
export function getDaysLabel(festival: Festival): string {
  if (festival.isActive) return '🔴 진행 중';
  if (festival.isSoon) {
    const now = new Date();
    const parts = festival.startDate.split('.');
    if (parts.length === 3) {
      const start = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const days = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `🟠 ${days}일 후 시작`;
    }
  }
  return '🗓️ 예정';
}
