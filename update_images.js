const fs = require('fs');
const path = require('path');

const placesPath = path.join(__dirname, 'src', 'data', 'places.json');
let places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));

// 카테고리별 사용 가능한 이미지 인덱스 풀
const maxImagesPerCategory = {
  mountain: 3,
  palace: 3,
  park: 3,
  cablecar: 3,
  pinkmuhly: 3
};

// 장소 순서대로 이미지를 골고루 배분하기 위한 카운터
const counters = {
  mountain: 1,
  palace: 1,
  park: 1,
  cablecar: 1,
  pinkmuhly: 1
};

places = places.map((place) => {
  let category = 'mountain'; // default
  const textToSearch = `${place.title} ${place.theme} ${place.tags} ${place.description}`.toLowerCase();
  
  if (textToSearch.includes('궁') || textToSearch.includes('돌담길') || textToSearch.includes('한옥') || textToSearch.includes('절') || textToSearch.includes('사찰') || textToSearch.includes('향교') || textToSearch.includes('서원')) {
    category = 'palace';
  } else if (textToSearch.includes('핑크뮬리') || textToSearch.includes('억새') || textToSearch.includes('갈대')) {
    category = 'pinkmuhly';
  } else if (textToSearch.includes('케이블카') || textToSearch.includes('모노레일') || textToSearch.includes('스카이워크') || textToSearch.includes('곤돌라') || textToSearch.includes('로프웨이') || textToSearch.includes('짚와이어')) {
    category = 'cablecar';
  } else if (textToSearch.includes('산') || textToSearch.includes('봉') || textToSearch.includes('국립공원') || textToSearch.includes('계곡') || textToSearch.includes('폭포')) {
    category = 'mountain';
  } else if (textToSearch.includes('공원') || textToSearch.includes('수목원') || textToSearch.includes('숲') || textToSearch.includes('유원지') || textToSearch.includes('호수') || textToSearch.includes('길')) {
    category = 'park';
  }

  // 순차적으로 이미지 할당
  let imgIndex = counters[category];
  counters[category]++;
  if (counters[category] > maxImagesPerCategory[category]) {
    counters[category] = 1;
  }

  const suffix = imgIndex === 1 ? '' : `_${imgIndex}`;
  place.imageUrl = `/images/categories/${category}${suffix}.png`;
  
  return place;
});

fs.writeFileSync(placesPath, JSON.stringify(places, null, 2), 'utf8');
console.log('Successfully updated image URLs to distribute 3 local images per category sequentially in places.json');
