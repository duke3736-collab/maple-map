const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/places.json', 'utf8'));

const moreCableCars = [
  { name: "무주 덕유산 곤돌라", lat: 35.8943, lng: 127.7554, type: "케이블카", tag: "케이블카" },
  { name: "평창 용평리조트 발왕산 케이블카", lat: 37.6441, lng: 128.6698, type: "케이블카", tag: "케이블카" },
  { name: "정선 가리왕산 케이블카", lat: 37.4567, lng: 128.5678, type: "케이블카", tag: "케이블카" },
  { name: "화성 제부도 해상케이블카", lat: 37.1659, lng: 126.6341, type: "케이블카", tag: "케이블카" },
  { name: "울릉도 도동 약수터 케이블카", lat: 37.4831, lng: 130.9067, type: "케이블카", tag: "케이블카" },
  { name: "진도 명량해상케이블카", lat: 34.5684, lng: 126.3051, type: "케이블카", tag: "케이블카" },
  { name: "영천 보현산 댐 짚와이어/모노레일", lat: 36.1423, lng: 128.9412, type: "케이블카", tag: "모노레일" },
  { name: "밀양 얼음골 케이블카", lat: 35.5861, lng: 128.9863, type: "케이블카", tag: "케이블카" },
  { name: "강진 가우도 짚트랙/모노레일", lat: 34.5671, lng: 126.7456, type: "케이블카", tag: "모노레일" },
  { name: "완주 대둔산 케이블카", lat: 36.1213, lng: 127.3175, type: "케이블카", tag: "케이블카" },
  { name: "단양 만천하 스카이워크 모노레일", lat: 36.9856, lng: 128.3456, type: "케이블카", tag: "모노레일" },
  { name: "동해 도째비골 스카이밸리", lat: 37.5312, lng: 129.1123, type: "케이블카", tag: "모노레일" },
  { name: "합천 영상테마파크 모노레일", lat: 35.5689, lng: 128.1456, type: "케이블카", tag: "모노레일" },
  { name: "거창 항노화힐링랜드 모노레일", lat: 35.7812, lng: 127.9456, type: "케이블카", tag: "모노레일" },
  { name: "울산 영남알프스 얼음골 케이블카", lat: 35.5861, lng: 128.9863, type: "케이블카", tag: "케이블카" }
];

let idCounter = Math.max(...data.map(d => d.id)) + 1;

function getRandomDate(startM, startD, endM, endD) {
  let m = Math.random() > 0.5 ? startM : endM;
  let d = Math.floor(Math.random() * 28) + 1;
  return `${m.toString().padStart(2, '0')}.${d.toString().padStart(2, '0')}`;
}

const images = [
  "https://images.unsplash.com/photo-1541336318489-083c7a0ac166?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1507371341162-763b5e419408?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800"
];

const newItems = moreCableCars.filter(c => !data.some(d => d.title === c.name)).map(item => {
  const imgUrl = images[Math.floor(Math.random() * images.length)];
  const first = getRandomDate(9, 20, 10, 15);
  const peak = getRandomDate(10, 20, 11, 10);
  
  return {
    id: idCounter++,
    title: item.name,
    description: `아름다운 가을 정취를 듬뿍 느낄 수 있는 ${item.name}입니다.`,
    theme: item.type,
    tags: `#${item.name.split(' ')[0]}, #${item.tag}`,
    imageUrl: imgUrl,
    firstFoliage: first,
    peakFoliage: peak,
    waypoints: `${item.name},${item.lat},${item.lng}`
  };
});

data.push(...newItems);

fs.writeFileSync('src/data/places.json', JSON.stringify(data, null, 2), 'utf-8');
fs.writeFileSync('public/data/places.json', JSON.stringify(data, null, 2), 'utf-8');
console.log(`Added ${newItems.length} more cable cars. Total places: ${data.length}`);
