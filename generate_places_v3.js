const fs = require('fs');

const images = [
  "https://images.unsplash.com/photo-1541336318489-083c7a0ac166?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1507371341162-763b5e419408?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1523730205978-59fd1b2965e3?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1510672288079-05244ddf38a5?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1540842211603-c288922262bb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800"
];

const placesList = [
  // 단풍명소 (Mountains / National Parks)
  { name: "설악산", lat: 38.1196, lng: 128.4655, type: "단풍명소", tag: "가을등산" },
  { name: "오대산", lat: 37.7963, lng: 128.5638, type: "단풍명소", tag: "가을등산" },
  { name: "지리산", lat: 35.3369, lng: 127.7306, type: "단풍명소", tag: "가을등산" },
  { name: "한라산", lat: 33.3616, lng: 126.5291, type: "단풍명소", tag: "가을등산" },
  { name: "무등산", lat: 35.1328, lng: 127.0080, type: "단풍명소", tag: "가을등산" },
  { name: "북한산", lat: 37.6593, lng: 126.9779, type: "단풍명소", tag: "가을등산" },
  { name: "도봉산", lat: 37.7001, lng: 127.0150, type: "단풍명소", tag: "가을등산" },
  { name: "계룡산", lat: 36.3551, lng: 127.2144, type: "단풍명소", tag: "가을등산" },
  { name: "속리산", lat: 36.5401, lng: 127.8938, type: "단풍명소", tag: "가을등산" },
  { name: "월악산", lat: 36.8524, lng: 128.0934, type: "단풍명소", tag: "가을등산" },
  { name: "소백산", lat: 36.9587, lng: 128.4842, type: "단풍명소", tag: "가을등산" },
  { name: "태백산", lat: 37.0988, lng: 128.9168, type: "단풍명소", tag: "가을등산" },
  { name: "치악산", lat: 37.3719, lng: 128.0514, type: "단풍명소", tag: "가을등산" },
  { name: "내장산", lat: 35.4851, lng: 126.8872, type: "단풍명소", tag: "가을등산" },
  { name: "덕유산", lat: 35.8596, lng: 127.7456, type: "단풍명소", tag: "가을등산" },
  { name: "가야산", lat: 35.8239, lng: 128.1190, type: "단풍명소", tag: "가을등산" },
  { name: "팔공산", lat: 36.0150, lng: 128.6983, type: "단풍명소", tag: "가을등산" },
  { name: "주왕산", lat: 36.4024, lng: 129.1558, type: "단풍명소", tag: "가을등산" },
  { name: "청량산", lat: 36.3888, lng: 128.9248, type: "단풍명소", tag: "가을등산" },
  { name: "마이산", lat: 35.7594, lng: 127.4244, type: "단풍명소", tag: "가을등산" },
  { name: "대둔산", lat: 36.1205, lng: 127.3197, type: "단풍명소", tag: "가을등산" },
  { name: "관악산", lat: 37.4446, lng: 126.9639, type: "단풍명소", tag: "가을등산" },
  { name: "수락산", lat: 37.6778, lng: 127.0805, type: "단풍명소", tag: "가을등산" },
  { name: "불암산", lat: 37.6657, lng: 127.0818, type: "단풍명소", tag: "가을등산" },
  { name: "명성산", lat: 37.7661, lng: 127.3463, type: "단풍명소", tag: "가을등산" },
  { name: "운악산", lat: 37.8183, lng: 127.3325, type: "단풍명소", tag: "가을등산" },
  { name: "화악산", lat: 37.9511, lng: 127.5316, type: "단풍명소", tag: "가을등산" },
  { name: "유명산", lat: 37.5880, lng: 127.4950, type: "단풍명소", tag: "가을등산" },
  { name: "용문산", lat: 37.5627, lng: 127.5255, type: "단풍명소", tag: "가을등산" },
  { name: "광교산", lat: 37.4439, lng: 127.0133, type: "단풍명소", tag: "가을등산" },
  { name: "수리산", lat: 37.3622, lng: 126.9205, type: "단풍명소", tag: "가을등산" },
  { name: "모악산", lat: 35.7263, lng: 127.4263, type: "단풍명소", tag: "가을등산" },
  { name: "강천산", lat: 35.7316, lng: 127.0505, type: "단풍명소", tag: "가을등산" },
  { name: "월출산", lat: 34.7613, lng: 126.6841, type: "단풍명소", tag: "가을등산" },
  { name: "두륜산", lat: 34.4827, lng: 126.6194, type: "단풍명소", tag: "가을등산" },
  { name: "천관산", lat: 34.5447, lng: 126.9069, type: "단풍명소", tag: "가을등산" },
  { name: "선운산", lat: 35.5005, lng: 126.5786, type: "단풍명소", tag: "가을등산" },
  { name: "변산", lat: 35.6322, lng: 126.5750, type: "단풍명소", tag: "가을등산" },
  { name: "신불산", lat: 35.5458, lng: 129.0536, type: "단풍명소", tag: "가을등산" },
  { name: "가지산", lat: 35.5991, lng: 129.0069, type: "단풍명소", tag: "가을등산" },
  { name: "금정산", lat: 35.2819, lng: 129.0569, type: "단풍명소", tag: "가을등산" },
  { name: "비슬산", lat: 35.7177, lng: 128.5305, type: "단풍명소", tag: "가을등산" },
  { name: "황매산", lat: 35.4855, lng: 127.9744, type: "단풍명소", tag: "가을등산" },
  { name: "청옥산", lat: 37.4241, lng: 128.9950, type: "단풍명소", tag: "가을등산" },
  { name: "민주지산", lat: 35.5891, lng: 127.8344, type: "단풍명소", tag: "가을등산" },

  // 도심산책
  { name: "서울숲 은행나무길", lat: 37.5443, lng: 127.0374, type: "도심산책", tag: "도심공원" }, 
  { name: "올림픽공원 몽촌해자", lat: 37.5204, lng: 127.1215, type: "도심산책", tag: "도심공원" },
  { name: "선유도공원 억새밭", lat: 37.5432, lng: 126.8996, type: "도심산책", tag: "도심공원" }, 
  { name: "하늘공원 억새축제", lat: 37.5678, lng: 126.8855, type: "도심산책", tag: "도심공원" },
  { name: "양재 시민의숲", lat: 37.4722, lng: 127.0361, type: "도심산책", tag: "도심공원" }, 
  { name: "덕수궁 돌담길", lat: 37.5658, lng: 126.9751, type: "도심산책", tag: "도심공원" },
  { name: "창덕궁 후원 단풍", lat: 37.5794, lng: 126.9910, type: "도심산책", tag: "도심공원" },
  { name: "경복궁 향원정", lat: 37.5818, lng: 126.9772, type: "도심산책", tag: "도심공원" },
  { name: "남산 둘레길", lat: 37.5511, lng: 126.9882, type: "도심산책", tag: "도심공원" },
  { name: "청계천 산책로", lat: 37.5691, lng: 126.9787, type: "도심산책", tag: "도심공원" },
  { name: "여의도 한강공원", lat: 37.5271, lng: 126.9326, type: "도심산책", tag: "도심공원" },
  { name: "반포 한강공원", lat: 37.5098, lng: 126.9946, type: "도심산책", tag: "도심공원" },
  { name: "보라매공원 단풍길", lat: 37.4939, lng: 126.9189, type: "도심산책", tag: "도심공원" },
  { name: "어린이대공원 단풍", lat: 37.5497, lng: 127.0818, type: "도심산책", tag: "도심공원" },
  { name: "북서울꿈의숲", lat: 37.6225, lng: 127.0427, type: "도심산책", tag: "도심공원" },
  { name: "월드컵공원 단풍길", lat: 37.5647, lng: 126.8837, type: "도심산책", tag: "도심공원" },
  { name: "석촌호수 둘레길", lat: 37.5080, lng: 127.1009, type: "도심산책", tag: "도심공원" },
  { name: "인천대공원 단풍터널", lat: 37.4485, lng: 126.7570, type: "도심산책", tag: "도심공원" },
  { name: "송도 센트럴파크", lat: 37.3916, lng: 126.6348, type: "도심산책", tag: "도심공원" },
  { name: "광교 호수공원", lat: 37.2882, lng: 127.0655, type: "도심산책", tag: "도심공원" }, 
  { name: "일산 호수공원", lat: 37.6533, lng: 126.7644, type: "도심산책", tag: "도심공원" },
  { name: "안산 호수공원", lat: 37.3061, lng: 126.8319, type: "도심산책", tag: "도심공원" }, 
  { name: "분당 중앙공원", lat: 37.3755, lng: 127.1230, type: "도심산책", tag: "도심공원" },
  { name: "동탄 호수공원", lat: 37.1683, lng: 127.1083, type: "도심산책", tag: "도심공원" }, 
  { name: "부산 시민공원", lat: 35.1666, lng: 129.0538, type: "도심산책", tag: "도심공원" },
  { name: "대구 수성못", lat: 35.8288, lng: 128.6186, type: "도심산책", tag: "도심공원" }, 
  { name: "광주 상무시민공원", lat: 35.1558, lng: 126.8402, type: "도심산책", tag: "도심공원" },
  { name: "대전 한밭수목원", lat: 36.3688, lng: 127.3872, type: "도심산책", tag: "도심공원" }, 
  { name: "울산 태화강 국가정원", lat: 35.5491, lng: 129.3138, type: "도심산책", tag: "도심공원" },
  { name: "세종 호수공원", lat: 36.4869, lng: 127.2625, type: "도심산책", tag: "도심공원" }, 
  { name: "창원 주남저수지", lat: 35.3122, lng: 128.6738, type: "도심산책", tag: "도심공원" },
  
  // 인생샷 (핑크뮬리 / 억새)
  { name: "경주 첨성대 핑크뮬리", lat: 35.8347, lng: 129.2190, type: "인생샷", tag: "핑크뮬리" }, 
  { name: "양주 나리공원 핑크뮬리", lat: 37.7950, lng: 127.0770, type: "인생샷", tag: "핑크뮬리" },
  { name: "제주 휴애리 핑크뮬리", lat: 33.3039, lng: 126.6334, type: "인생샷", tag: "핑크뮬리" },
  { name: "안성 팜랜드 핑크뮬리", lat: 37.0371, lng: 127.1856, type: "인생샷", tag: "핑크뮬리" },
  { name: "태안 청산수목원", lat: 36.6575, lng: 126.2862, type: "인생샷", tag: "핑크뮬리" },
  { name: "포천 평강랜드 핑크뮬리", lat: 38.0465, lng: 127.3242, type: "인생샷", tag: "핑크뮬리" },
  { name: "합천 신소양체육공원", lat: 35.5562, lng: 128.1633, type: "인생샷", tag: "핑크뮬리" },
  { name: "칠곡 가산수피아", lat: 36.0335, lng: 128.5204, type: "인생샷", 단풍명소: "핑크뮬리" },
  { name: "부산 대저생태공원", lat: 35.2104, lng: 128.9806, type: "인생샷", tag: "핑크뮬리" },
  { name: "부산 을숙도 생태공원", lat: 35.1091, lng: 128.9439, type: "인생샷", tag: "핑크뮬리" },
  { name: "하동 동정호 핑크뮬리", lat: 35.1856, lng: 127.6967, type: "인생샷", tag: "핑크뮬리" },
  { name: "구미 낙동강체육공원", lat: 36.1432, lng: 128.3756, type: "인생샷", tag: "핑크뮬리" },
  { name: "고창 청농원 핑크뮬리", lat: 35.3940, lng: 126.5658, type: "인생샷", tag: "핑크뮬리" },
  { name: "함평 돌머리해수욕장", lat: 35.1118, lng: 126.4673, type: "인생샷", tag: "핑크뮬리" },
  { name: "제주 새별오름 억새", lat: 33.3644, lng: 126.3572, type: "인생샷", tag: "억새" }, 
  { name: "제주 산굼부리 억새", lat: 33.4358, lng: 126.6872, type: "인생샷", tag: "억새" },
  { name: "명성산 억새군락지", lat: 37.7661, lng: 127.3463, type: "인생샷", tag: "억새" },
  { name: "순천만 국가정원 갈대밭", lat: 34.9288, lng: 127.5050, type: "인생샷", tag: "갈대밭" }, 
  { name: "보성만 갈대밭", lat: 34.7869, lng: 127.1091, type: "인생샷", tag: "갈대밭" },
  { name: "신불산 억새평원", lat: 35.5458, lng: 129.0536, type: "인생샷", tag: "억새" },
  { name: "천관산 억새", lat: 34.5447, lng: 126.9069, type: "인생샷", tag: "억새" },
  { name: "안동 도산서원 단풍", lat: 36.7269, lng: 128.8477, type: "인생샷", tag: "가을여행" },
  { name: "남이섬 메타세쿼이아길", lat: 37.7915, lng: 127.5255, type: "인생샷", tag: "가을여행" }, 
  { name: "담양 메타세쿼이아길", lat: 35.3283, lng: 126.9944, type: "인생샷", tag: "가을여행" },
  { name: "아침고요수목원 단풍", lat: 37.7372, lng: 127.3516, type: "인생샷", tag: "가을여행" }, 
  { name: "화담수목원 단풍", lat: 37.3325, lng: 127.2913, type: "인생샷", tag: "가을여행" },

  // 케이블카
  { name: "설악산 케이블카", lat: 38.1741, lng: 128.4891, type: "케이블카", tag: "케이블카" }, 
  { name: "발왕산 케이블카", lat: 37.6441, lng: 128.6698, type: "케이블카", tag: "케이블카" },
  { name: "통영 미륵산 케이블카", lat: 34.8277, lng: 128.4060, type: "케이블카", tag: "케이블카" }, 
  { name: "사천 바다케이블카", lat: 34.9280, lng: 128.0560, type: "케이블카", tag: "케이블카" },
  { name: "여수 해상케이블카", lat: 34.7358, lng: 127.7411, type: "케이블카", tag: "케이블카" }, 
  { name: "목포 해상케이블카", lat: 34.7863, lng: 126.3758, type: "케이블카", tag: "케이블카" },
  { name: "해남 두륜산 케이블카", lat: 34.4827, lng: 126.6194, type: "케이블카", tag: "케이블카" }, 
  { name: "정읍 내장산 케이블카", lat: 35.4851, lng: 126.8872, type: "케이블카", tag: "케이블카" },
  { name: "남산 케이블카", lat: 37.5559, lng: 126.9830, type: "케이블카", tag: "케이블카" },
  { name: "삼척 해상케이블카", lat: 37.3013, lng: 129.2785, type: "케이블카", tag: "케이블카" },
  { name: "춘천 삼악산 호수케이블카", lat: 37.8488, lng: 127.6974, type: "케이블카", tag: "케이블카" },
  { name: "청풍호반 케이블카", lat: 36.9933, lng: 128.1691, type: "케이블카", tag: "케이블카" },
  { name: "하동 금오산 케이블카", lat: 34.9658, lng: 127.9136, type: "케이블카", tag: "케이블카" },
  { name: "울진 왕피천 케이블카", lat: 36.9749, lng: 129.4098, type: "케이블카", tag: "케이블카" },
  { name: "거제 파노라마 케이블카", lat: 34.7709, lng: 128.6010, type: "케이블카", tag: "케이블카" },
  { name: "송도 해상케이블카", lat: 35.0765, lng: 129.0232, type: "케이블카", tag: "케이블카" },
  { name: "팔공산 케이블카", lat: 36.0028, lng: 128.6475, type: "케이블카", tag: "케이블카" },
  { name: "금오산 케이블카", lat: 36.1045, lng: 128.3241, type: "케이블카", tag: "케이블카" },
  { name: "대둔산 케이블카", lat: 36.1213, lng: 127.3175, type: "케이블카", tag: "케이블카" }
];

let generatedData = [];
let idCounter = 1;

function getRandomDate(startM, startD, endM, endD) {
  let m = Math.random() > 0.5 ? startM : endM;
  let d = Math.floor(Math.random() * 28) + 1;
  return `${m.toString().padStart(2, '0')}.${d.toString().padStart(2, '0')}`;
}

placesList.forEach(item => {
  const imgUrl = images[Math.floor(Math.random() * images.length)];
  const first = getRandomDate(9, 20, 10, 15);
  const peak = getRandomDate(10, 20, 11, 10);
  
  generatedData.push({
    id: idCounter++,
    title: item.name,
    description: `아름다운 가을 정취를 듬뿍 느낄 수 있는 ${item.name}입니다.`,
    theme: item.type,
    tags: `#${item.name.split(' ')[0]}, #${item.tag}`,
    imageUrl: imgUrl,
    firstFoliage: first,
    peakFoliage: peak,
    waypoints: `${item.name},${item.lat},${item.lng}`
  });
});

fs.writeFileSync('src/data/places.json', JSON.stringify(generatedData, null, 2), 'utf-8');
console.log(`Generated ${generatedData.length} Real Places successfully!`);
