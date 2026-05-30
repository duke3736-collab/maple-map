const fs = require('fs');

const places = [
  // 주요 단풍 명산 (Weatheri 기준)
  {
    id: 1,
    title: "설악산 주전골 단풍계곡",
    description: "오색약수터에서 시작하는 평탄한 계곡길. 기암괴석과 붉은 단풍이 어우러진 최고의 단풍 명소입니다.",
    theme: "단풍명소",
    tags: "#설악산, #단풍절정, #명산",
    imageUrl: "https://images.unsplash.com/photo-1541336318489-083c7a0ac166?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "09.30",
    peakFoliage: "10.23",
    waypoints: "오색약수,38.0874,128.4552"
  },
  {
    id: 2,
    title: "오대산 월정사 전나무숲",
    description: "아름드리 전나무 숲길을 걸으며 즐기는 오대산의 단풍. 고즈넉한 사찰과 어우러져 마음의 평온을 줍니다.",
    theme: "단풍명소",
    tags: "#오대산, #월정사, #전나무숲",
    imageUrl: "https://images.unsplash.com/photo-1507371341162-763b5e419408?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.06",
    peakFoliage: "10.17",
    waypoints: "월정사,37.7302,128.5925"
  },
  {
    id: 3,
    title: "북한산 단풍 트레킹",
    description: "서울 도심에서 가장 가까운 단풍 명산. 웅장한 바위봉우리 사이로 붉게 물든 단풍이 일품입니다.",
    theme: "단풍명소",
    tags: "#북한산, #도심명산, #가을등산",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.17",
    peakFoliage: "11.04",
    waypoints: "백운대,37.6596,126.9749"
  },
  {
    id: 4,
    title: "치악산 구룡사 계곡",
    description: "아홉 마리 용의 전설이 깃든 구룡사 계곡. 단풍 숲을 지나는 맑은 계곡물이 마음을 씻어줍니다.",
    theme: "단풍명소",
    tags: "#치악산, #구룡사, #원주",
    imageUrl: "https://images.unsplash.com/photo-1523730205978-59fd1b2965e3?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.10",
    peakFoliage: "10.25",
    waypoints: "구룡사,37.3824,128.0531"
  },
  {
    id: 5,
    title: "월악산 영봉",
    description: "충주호와 어우러진 월악산의 기암괴석, 그리고 붉은 단풍. 산과 호수의 완벽한 조화를 감상하세요.",
    theme: "단풍명소",
    tags: "#월악산, #영봉, #충주호",
    imageUrl: "https://images.unsplash.com/photo-1510672288079-05244ddf38a5?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.18",
    peakFoliage: "10.28",
    waypoints: "영봉,36.8524,128.0934"
  },
  {
    id: 6,
    title: "속리산 문장대 단풍",
    description: "아름다운 바위와 단풍이 절묘하게 조화된 속리산. 법주사를 거쳐 문장대에 오르면 벅찬 감동을 느낍니다.",
    theme: "단풍명소",
    tags: "#속리산, #문장대, #법주사",
    imageUrl: "https://images.unsplash.com/photo-1540842211603-c288922262bb?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.22",
    peakFoliage: "11.03",
    waypoints: "법주사,36.5330,127.8306"
  },
  {
    id: 7,
    title: "계룡산 동학사 단풍",
    description: "가을빛으로 붉게 타오르는 계룡산. 특히 동학사 계곡을 따라 오르는 단풍길이 유명합니다.",
    theme: "단풍명소",
    tags: "#계룡산, #동학사, #충남단풍",
    imageUrl: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.16",
    peakFoliage: "11.01",
    waypoints: "동학사,36.3533,127.2141"
  },
  {
    id: 8,
    title: "팔공산 갓바위 단풍길",
    description: "대구 팔공산의 수려한 산세와 울긋불긋한 단풍. 갓바위를 오르며 소원도 빌고 가을도 만끽하세요.",
    theme: "단풍명소",
    tags: "#팔공산, #대구단풍, #갓바위",
    imageUrl: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.18",
    peakFoliage: "11.03",
    waypoints: "동화사,35.9922,128.7061"
  },
  {
    id: 9,
    title: "가야산 해인사 홍류동 계곡",
    description: "물이 붉게 물든다 하여 홍류동. 해인사로 가는 길목 전체가 단풍으로 덮여 장관을 이룹니다.",
    theme: "단풍명소",
    tags: "#가야산, #해인사, #홍류동계곡",
    imageUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.17",
    peakFoliage: "11.01",
    waypoints: "해인사,35.8016,128.0975"
  },
  {
    id: 10,
    title: "내장산 단풍터널",
    description: "명실상부 대한민국 최고의 단풍 명소. 일주문부터 내장사까지 이어지는 108그루 단풍 터널이 환상적입니다.",
    theme: "단풍명소",
    tags: "#내장산, #애기단풍, #단풍터널",
    imageUrl: "https://images.unsplash.com/photo-1572085313466-6710de8d7ba3?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.23",
    peakFoliage: "11.11",
    waypoints: "단풍터널,35.4820,126.8850"
  },
  {
    id: 11,
    title: "지리산 뱀사골 단풍",
    description: "웅장한 지리산 자락이 온통 붉고 노랗게 물듭니다. 계곡물에 비친 붉은 잎이 가을의 운치를 더합니다.",
    theme: "단풍명소",
    tags: "#지리산, #뱀사골, #계곡단풍",
    imageUrl: "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.18",
    peakFoliage: "10.23",
    waypoints: "뱀사골,35.3400,127.5683"
  },
  {
    id: 12,
    title: "무등산 원효사 단풍",
    description: "광주의 자랑 무등산. 가을이 되면 너덜겅과 억새, 붉은 단풍이 어우러져 그림 같은 풍경을 선사합니다.",
    theme: "단풍명소",
    tags: "#무등산, #광주단풍, #원효사",
    imageUrl: "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.21",
    peakFoliage: "11.04",
    waypoints: "원효사,35.1500,126.9855"
  },
  {
    id: 13,
    title: "한라산 영실기암 가을",
    description: "제주도 한라산의 가을. 기암괴석 사이로 핀 단풍과 구상나무 군락지가 이국적인 가을을 연출합니다.",
    theme: "단풍명소",
    tags: "#한라산, #영실기암, #제주가을",
    imageUrl: "https://images.unsplash.com/photo-1469521669194-babbdf9aa9b4?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.16",
    peakFoliage: "10.30",
    waypoints: "영실탐방로,33.3427,126.5058"
  },
  {
    id: 14,
    title: "금강산 단풍",
    description: "천하절경 금강산의 가을. 접근이 어렵지만 통계를 위한 대표적인 북녘 단풍의 기준점입니다.",
    theme: "단풍명소",
    tags: "#금강산, #천하절경",
    imageUrl: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "09.28",
    peakFoliage: "10.21",
    waypoints: "금강산,38.6583,128.0583"
  },
  
  // 인생샷 명소
  {
    id: 15,
    title: "경주 첨성대 핑크뮬리",
    description: "가을 바람에 흩날리는 솜사탕 같은 핑크뮬리 군락지. 고즈넉한 신라의 숨결과 함께 인생샷을 남겨보세요.",
    theme: "인생샷",
    tags: "#경주, #핑크뮬리, #인생샷",
    imageUrl: "https://images.unsplash.com/photo-1544376483-207d57a2c070?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "09.15",
    peakFoliage: "10.15",
    waypoints: "첨성대,35.8347,129.2190"
  },
  {
    id: 16,
    title: "합천 황매산 억새평원",
    description: "해발 1,000m 고지에 펼쳐진 끝없는 억새의 물결. 일출이나 일몰 시 방문하면 금빛으로 빛나는 기적을 만납니다.",
    theme: "인생샷",
    tags: "#황매산, #억새평원, #일몰명소",
    imageUrl: "https://images.unsplash.com/photo-1520262454473-a1a82276a574?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "09.20",
    peakFoliage: "10.20",
    waypoints: "황매산,35.4800,127.9755"
  },
  {
    id: 17,
    title: "서울 하늘공원 억새축제",
    description: "은빛 물결이 출렁이는 서울 최고의 억새 명소. 노을 지는 한강을 배경으로 낭만적인 사진을 찰칵!",
    theme: "인생샷",
    tags: "#하늘공원, #억새, #서울노을",
    imageUrl: "https://images.unsplash.com/photo-1506535562777-cfc5d6e2467b?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.01",
    peakFoliage: "10.25",
    waypoints: "하늘공원,37.5678,126.8855"
  },

  // 도심 속 가을 산책
  {
    id: 18,
    title: "서울숲 은행나무길",
    description: "사슴농장과 거대한 은행나무 숲이 어우러진 도심 속 힐링 스팟. 따뜻한 커피 한 잔과 가을 피크닉.",
    theme: "도심산책",
    tags: "#서울숲, #도심공원, #은행나무",
    imageUrl: "https://images.unsplash.com/photo-1496309732348-3627f3f040ee?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.15",
    peakFoliage: "11.05",
    waypoints: "서울숲,37.5441,127.0385"
  },
  {
    id: 19,
    title: "덕수궁 돌담길",
    description: "정동길을 따라 걷는 서울 최고의 도심 산책로. 샛노란 은행잎이 바스락거리는 로맨틱한 데이트길.",
    theme: "도심산책",
    tags: "#덕수궁, #돌담길, #데이트",
    imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d27ce006?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.20",
    peakFoliage: "11.05",
    waypoints: "대한문,37.5658,126.9751"
  },
  {
    id: 20,
    title: "남이섬 메타세쿼이아길",
    description: "가을이 되면 황금빛으로 물드는 숲길. 자전거를 타고 북한강의 정취와 가을의 낭만을 온몸으로!",
    theme: "도심산책",
    tags: "#남이섬, #메타세쿼이아, #가을데이트",
    imageUrl: "https://images.unsplash.com/photo-1541336318489-083c7a0ac166?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.10",
    peakFoliage: "10.25",
    waypoints: "남이섬,37.7915,127.5255"
  },

  // 케이블카 명소
  {
    id: 21,
    title: "사천 바다케이블카",
    description: "산과 바다를 잇는 특별한 케이블카. 가을 하늘 아래 푸른 남해안과 단풍 든 각산의 비경을 내려다보세요.",
    theme: "케이블카",
    tags: "#사천, #해상케이블카, #남해바다",
    imageUrl: "https://images.unsplash.com/photo-1507371341162-763b5e419408?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.20",
    peakFoliage: "11.10",
    waypoints: "대방정류장,34.9280,128.0560"
  },
  {
    id: 22,
    title: "발왕산 관광케이블카",
    description: "케이블카를 타고 해발 1458m 발왕산 정상 스카이워크에 오르면 펼쳐지는 장엄한 단풍 파노라마 뷰.",
    theme: "케이블카",
    tags: "#발왕산, #스카이워크, #평창",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "09.30",
    peakFoliage: "10.15",
    waypoints: "모나파크,37.6441,128.6698"
  },
  {
    id: 23,
    title: "통영 미륵산 케이블카",
    description: "쪽빛 바다 한가운데서 즐기는 가을 정취. 국내 최장 길이 케이블카를 타고 미륵산 단풍을 한눈에!",
    theme: "케이블카",
    tags: "#통영, #미륵산, #한려수도",
    imageUrl: "https://images.unsplash.com/photo-1523730205978-59fd1b2965e3?auto=format&fit=crop&q=80&w=800",
    firstFoliage: "10.25",
    peakFoliage: "11.15",
    waypoints: "케이블카탑승장,34.8277,128.4060"
  }
];

fs.writeFileSync('src/data/places.json', JSON.stringify(places, null, 2));
console.log('Successfully generated places.json');
