const fs = require('fs');
const path = require('path');

const placesPath = path.join(__dirname, 'src', 'data', 'places.json');
let places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));

const images = {
  palace: [
    'photo-1578891040855-4670b86a87c5', // Gyeongbokgung
    'photo-1518386377727-2c974c0c4a4a', // Traditional Korean pavilion
    'photo-1590390192305-18151ed1c37d', // Palace gate
    'photo-1502082260212-07a72d3e1b78', // Korean temple
    'photo-1601362840469-51e4d8d58785', // Korean traditional roof
    'photo-1596706012753-f726715fba45'  // Gyeongbokgung autumn
  ],
  cablecar: [
    'photo-1558288599-23c89b88307d', // Cable car over mountains
    'photo-1563816158-9ff7054238e8', // Cable car passing through trees
    'photo-1473445765915-d41c88880cb3', // Cable car view
    'photo-1533470659635-430932da1e7c', // Gondola
    'photo-1522770544837-b50fbaf2f483'  // Mountain cable car
  ],
  mountain: [
    'photo-1476994269785-f5b24467d025', // Autumn mountain landscape
    'photo-1507726420169-08dc80118357', // Mountain peak autumn
    'photo-1447752875215-b2761acb3c5d', // Forest river autumn
    'photo-1501786223405-6d024d7c3b8d', // Autumn mountain stream
    'photo-1511219803152-4a00cb06eb8b', // Korean mountain trail
    'photo-1473496169904-6a848b5ffb02'  // Autumn forest canopy
  ],
  park: [
    'photo-1425342605259-25d80e320465', // Autumn park path
    'photo-1508605330366-07612f067d08', // Park bench autumn
    'photo-1481182285810-741ce804bf13', // Ginkgo tree street
    'photo-1509618182255-7f92025ccafb', // Autumn park trees
    'photo-1513233878734-d95c9a41bd9f'  // Yellow ginkgo
  ],
  lake: [
    'photo-1528616573887-b088e5d63f73', // Autumn lake reflection
    'photo-1476611317561-60117649dd94', // Lake with yellow leaves
    'photo-1505322747495-6afdd3b70760'  // River in autumn
  ],
  road: [
    'photo-1507608616759-54f48f0af0ee', // Autumn road
    'photo-1471874223293-1959fb26db4f', // Autumn drive
    'photo-1509802872365-d42f5bf7762f'  // City street with trees
  ],
  general: [
    'photo-1473496169904-6a848b5ffb02', // Generic beautiful autumn
    'photo-1507726420169-08dc80118357'
  ]
};

// Seeded random for consistent mapping
function getRandomImage(category, id) {
  const list = images[category];
  return `https://images.unsplash.com/${list[id % list.length]}?auto=format&fit=crop&q=80&w=800`;
}

places = places.map((place) => {
  let category = 'general';
  const textToSearch = `${place.title} ${place.theme} ${place.tags} ${place.description}`.toLowerCase();
  
  if (textToSearch.includes('궁') || textToSearch.includes('돌담길') || textToSearch.includes('한옥') || textToSearch.includes('절') || textToSearch.includes('사찰') || textToSearch.includes('향교') || textToSearch.includes('서원')) {
    category = 'palace';
  } else if (textToSearch.includes('케이블카') || textToSearch.includes('모노레일') || textToSearch.includes('스카이워크') || textToSearch.includes('곤돌라') || textToSearch.includes('로프웨이')) {
    category = 'cablecar';
  } else if (textToSearch.includes('산') || textToSearch.includes('봉') || textToSearch.includes('국립공원') || textToSearch.includes('계곡') || textToSearch.includes('폭포')) {
    category = 'mountain';
  } else if (textToSearch.includes('호수') || textToSearch.includes('저수지') || textToSearch.includes('물길')) {
    category = 'lake';
  } else if (textToSearch.includes('드라이브') || textToSearch.includes('도로') || textToSearch.includes('길')) {
    category = 'road';
  } else if (textToSearch.includes('공원') || textToSearch.includes('수목원') || textToSearch.includes('숲') || textToSearch.includes('유원지')) {
    category = 'park';
  }

  place.imageUrl = getRandomImage(category, place.id);
  return place;
});

fs.writeFileSync(placesPath, JSON.stringify(places, null, 2), 'utf8');
console.log('Successfully updated image URLs in places.json');
