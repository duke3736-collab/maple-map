const fs = require('fs');

const images = [
  "https://images.unsplash.com/photo-1541336318489-083c7a0ac166?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1507371341162-763b5e419408?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1523730205978-59fd1b2965e3?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1510672288079-05244ddf38a5?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1540842211603-c288922262bb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1572085313466-6710de8d7ba3?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1469521669194-babbdf9aa9b4?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1544376483-207d57a2c070?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1520262454473-a1a82276a574?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1506535562777-cfc5d6e2467b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1496309732348-3627f3f040ee?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1542314831-c6a4d27ce006?auto=format&fit=crop&q=80&w=800"
];

// 대한민국 산 70개 리스트
const mountains = [
  { name: "설악산", lat: 38.1196, lng: 128.4655 }, { name: "오대산", lat: 37.7963, lng: 128.5638 },
  { name: "지리산", lat: 35.3369, lng: 127.7306 }, { name: "한라산", lat: 33.3616, lng: 126.5291 },
  { name: "무등산", lat: 35.1328, lng: 127.0080 }, { name: "북한산", lat: 37.6593, lng: 126.9779 },
  { name: "도봉산", lat: 37.7001, lng: 127.0150 }, { name: "계룡산", lat: 36.3551, lng: 127.2144 },
  { name: "속리산", lat: 36.5401, lng: 127.8938 }, { name: "월악산", lat: 36.8524, lng: 128.0934 },
  { name: "소백산", lat: 36.9587, lng: 128.4842 }, { name: "태백산", lat: 37.0988, lng: 128.9168 },
  { name: "치악산", lat: 37.3719, lng: 128.0514 }, { name: "내장산", lat: 35.4851, lng: 126.8872 },
  { name: "덕유산", lat: 35.8596, lng: 127.7456 }, { name: "가야산", lat: 35.8239, lng: 128.1190 },
  { name: "팔공산", lat: 36.0150, lng: 128.6983 }, { name: "주왕산", lat: 36.4024, lng: 129.1558 },
  { name: "청량산", lat: 36.3888, lng: 128.9248 }, { name: "마이산", lat: 35.7594, lng: 127.4244 },
  { name: "대둔산", lat: 36.1205, lng: 127.3197 }, { name: "관악산", lat: 37.4446, lng: 126.9639 },
  { name: "수락산", lat: 37.6778, lng: 127.0805 }, { name: "불암산", lat: 37.6657, lng: 127.0818 },
  { name: "명성산", lat: 37.7661, lng: 127.3463 }, { name: "운악산", lat: 37.8183, lng: 127.3325 },
  { name: "화악산", lat: 37.9511, lng: 127.5316 }, { name: "유명산", lat: 37.5880, lng: 127.4950 },
  { name: "용문산", lat: 37.5627, lng: 127.5255 }, { name: "광교산", lat: 37.4439, lng: 127.0133 },
  { name: "수리산", lat: 37.3622, lng: 126.9205 }, { name: "모악산", lat: 35.7263, lng: 127.4263 },
  { name: "강천산", lat: 35.7316, lng: 127.0505 }, { name: "월출산", lat: 34.7613, lng: 126.6841 },
  { name: "두륜산", lat: 34.4827, lng: 126.6194 }, { name: "천관산", lat: 34.5447, lng: 126.9069 },
  { name: "선운산", lat: 35.5005, lng: 126.5786 }, { name: "변산", lat: 35.6322, lng: 126.5750 },
  { name: "신불산", lat: 35.5458, lng: 129.0536 }, { name: "가지산", lat: 35.5991, lng: 129.0069 },
  { name: "천성산", lat: 35.6263, lng: 129.0763 }, { name: "운문산", lat: 35.6266, lng: 128.9669 },
  { name: "금정산", lat: 35.2819, lng: 129.0569 }, { name: "비슬산", lat: 35.7177, lng: 128.5305 },
  { name: "황매산", lat: 35.4855, lng: 127.9744 }, { name: "백운산", lat: 35.5422, lng: 127.6416 },
  { name: "방태산", lat: 37.5872, lng: 128.3752 }, { name: "태기산", lat: 37.5583, lng: 128.2325 },
  { name: "두타산", lat: 37.4561, lng: 128.9863 }, { name: "청옥산", lat: 37.4241, lng: 128.9950 },
  { name: "오봉산", lat: 37.9150, lng: 127.8105 }, { name: "가리왕산", lat: 37.7777, lng: 128.5630 },
  { name: "노추산", lat: 37.5333, lng: 128.7580 }, { name: "선자령", lat: 37.4988, lng: 128.7758 },
  { name: "대야산", lat: 35.0483, lng: 127.6533 }, { name: "장안산", lat: 35.6338, lng: 127.5363 },
  { name: "칠갑산", lat: 36.3813, lng: 126.8319 }, { name: "민주지산", lat: 35.5891, lng: 127.8344 },
  { name: "적상산", lat: 35.6127, lng: 127.7558 }, { name: "황석산", lat: 35.5186, lng: 127.7408 },
  { name: "기백산", lat: 35.5683, lng: 127.7583 }, { name: "금원산", lat: 35.6427, lng: 127.7686 },
  { name: "거망산", lat: 35.6402, lng: 127.7850 }, { name: "황악산", lat: 35.7533, lng: 127.9711 },
  { name: "금오산", lat: 34.6150, lng: 127.7955 }, { name: "대둔산", lat: 36.1205, lng: 127.3197 },
  { name: "민주지산", lat: 35.5891, lng: 127.8344 }, { name: "백암산", lat: 35.0294, lng: 127.6258 },
  { name: "조계산", lat: 35.0069, lng: 127.3308 }, { name: "무학산", lat: 35.1950, lng: 128.5344 }
];

// 도심 숲 20개 리스트
const parks = [
  { name: "서울숲 은행나무길", lat: 37.5443, lng: 127.0374 }, { name: "올림픽공원 몽촌해자", lat: 37.5204, lng: 127.1215 },
  { name: "선유도공원 억새밭", lat: 37.5432, lng: 126.8996 }, { name: "하늘공원 억새축제", lat: 37.5678, lng: 126.8855 },
  { name: "양재 시민의숲", lat: 37.4722, lng: 127.0361 }, { name: "인천대공원 단풍길", lat: 37.4485, lng: 126.7570 },
  { name: "광교 호수공원", lat: 37.2882, lng: 127.0655 }, { name: "일산 호수공원", lat: 37.6533, lng: 126.7644 },
  { name: "송도 센트럴파크", lat: 37.3916, lng: 126.6348 }, { name: "남산 둘레길", lat: 37.5511, lng: 126.9882 },
  { name: "안산 호수공원", lat: 37.3061, lng: 126.8319 }, { name: "분당 중앙공원", lat: 37.3755, lng: 127.1230 },
  { name: "동탄 호수공원", lat: 37.1683, lng: 127.1083 }, { name: "부산 시민공원", lat: 35.1666, lng: 129.0538 },
  { name: "대구 수성못", lat: 35.8288, lng: 128.6186 }, { name: "광주 상무시민공원", lat: 35.1558, lng: 126.8402 },
  { name: "대전 한밭수목원", lat: 36.3688, lng: 127.3872 }, { name: "울산 태화강 국가정원", lat: 35.5491, lng: 129.3138 },
  { name: "세종 호수공원", lat: 36.4869, lng: 127.2625 }, { name: "창원 주남저수지", lat: 35.3122, lng: 128.6738 }
];

// 테마명소 20개 리스트
const themes = [
  { name: "경주 첨성대 핑크뮬리", lat: 35.8347, lng: 129.2190 }, { name: "안동 도산서원 단풍", lat: 36.7269, lng: 128.8477 },
  { name: "남이섬 메타세쿼이아길", lat: 37.7915, lng: 127.5255 }, { name: "담양 선비산 메타세쿼이아", lat: 35.3283, lng: 126.9944 },
  { name: "아침고요수목원 단풍길", lat: 37.7372, lng: 127.3516 }, { name: "화담수목원 가을단풍", lat: 37.3325, lng: 127.2913 },
  { name: "순천만 국가정원 갈대밭", lat: 34.9288, lng: 127.5050 }, { name: "보성만 갈대밭", lat: 34.7869, lng: 127.1091 },
  { name: "제주 새별오름 억새", lat: 33.3644, lng: 126.3572 }, { name: "제주 산굼부리 억새", lat: 33.4358, lng: 126.6872 },
  { name: "설악산 케이블카", lat: 38.1741, lng: 128.4891 }, { name: "발왕산 케이블카", lat: 37.6441, lng: 128.6698 },
  { name: "통영 미륵산 케이블카", lat: 34.8277, lng: 128.4060 }, { name: "사천 바다케이블카", lat: 34.9280, lng: 128.0560 },
  { name: "여수 해상케이블카", lat: 34.7358, lng: 127.7411 }, { name: "목포 해상케이블카", lat: 34.7863, lng: 126.3758 },
  { name: "해남 두륜산 케이블카", lat: 34.4827, lng: 126.6194 }, { name: "정읍 내장산 케이블카", lat: 35.4851, lng: 126.8872 },
  { name: "강진 공룡화석지 핑크뮬리", lat: 34.6150, lng: 126.8080 }, { name: "합천 핑크뮬리 공원", lat: 35.5683, lng: 128.1633 }
];

let generatedData = [];
let idCounter = 1;

// 헬퍼: 랜덤 날짜 생성
function getRandomDate(startM, startD, endM, endD) {
  let m = Math.random() > 0.5 ? startM : endM;
  let d = Math.floor(Math.random() * 28) + 1;
  return `${m.toString().padStart(2, '0')}.${d.toString().padStart(2, '0')}`;
}

// 헬퍼: 데이터 생성
function generate(item, themeType, tagsType) {
  const imgUrl = images[Math.floor(Math.random() * images.length)];
  const first = getRandomDate(9, 20, 10, 15);
  const peak = getRandomDate(10, 20, 11, 10);
  
  generatedData.push({
    id: idCounter++,
    title: item.name,
    description: `대한민국의 아름다운 가을 정취를 느낄 수 있는 ${item.name}입니다. 환상적인 단풍과 자연의 조화를 즐겨보세요.`,
    theme: themeType,
    tags: tagsType,
    imageUrl: imgUrl,
    firstFoliage: first,
    peakFoliage: peak,
    waypoints: `${item.name},${item.lat},${item.lng}`
  });
}

mountains.forEach(m => generate(m, "단풍명소", `#${m.name}, #단풍명산, #가을등산`));
parks.forEach(p => generate(p, "도심산책", `#${p.name.split(' ')[0]}, #가을산책, #도심공원`));
themes.forEach(t => {
  let category = "인생샷";
  if (t.name.includes('케이블카')) category = "케이블카";
  generate(t, category, `#${t.name.split(' ')[0]}, #가을여행, #${category}`);
});

fs.writeFileSync('src/data/places.json', JSON.stringify(generatedData, null, 2), 'utf-8');
console.log(`Generated ${generatedData.length} places successfully in src/data/places.json`);
