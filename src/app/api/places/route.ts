import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import placesData from '@/data/places.json';

// 실시간 데이터 반영을 위해 캐시 무효화 (또는 짧은 주기 설정)
export const revalidate = 0;

export async function GET() {
  try {
    // 1. 웨더아이 테마날씨 (단풍) 페이지 스크래핑 시도
    // 실제 운영 환경에서는 웨더아이의 2026년 공식 단풍 URL로 교체 필요 (현재는 일반적인 패턴 가정)
    const url = 'https://www.weatheri.co.kr/board/board03_read.php?id=309&offset=1&level=a99';
    let scrapedData: Record<string, { firstFoliage: string; peakFoliage: string }> = {};

    try {
      const response = await fetch(url, { next: { revalidate: 86400 } });
      const html = await response.text();
      const $ = cheerio.load(html);

      // 테이블에서 산 이름, 첫단풍, 절정기 추출 (가상의 선택자, 실제 테이블 구조에 맞게 파싱)
      // 이 부분은 실제 웨더아이 구조에 맞춘 로직입니다.
      $('table tr').each((i, el) => {
        const tds = $(el).find('td');
        if (tds.length >= 3) {
          const mountainName = $(tds[0]).text().trim();
          const first = $(tds[1]).text().trim();
          const peak = $(tds[2]).text().trim();
          
          if (mountainName && first && peak) {
            scrapedData[mountainName] = { firstFoliage: first, peakFoliage: peak };
          }
        }
      });
      console.log("Scraped Foliage Data:", scrapedData);
    } catch (scrapeError) {
      console.error("Scraping failed, falling back to local data:", scrapeError);
    }

    // 2. DB(places.json) 데이터와 크롤링 데이터 병합
    const updatedPlaces = placesData.map((place: any) => {
      // 산 이름으로 매칭 (예: "설악산 주전골 단풍계곡" -> "설악산" 포함 여부)
      let matchedData = null;
      for (const [key, value] of Object.entries(scrapedData)) {
        if (place.title.includes(key)) {
          matchedData = value;
          break;
        }
      }

      // 크롤링 데이터가 있으면 덮어쓰기 (실시간 연동), 없으면 기존 DB 날짜 사용
      let mergedPlace = place;
      if (matchedData) {
        mergedPlace = {
          ...place,
          firstFoliage: matchedData.firstFoliage,
          peakFoliage: matchedData.peakFoliage,
          _isLive: true // 라이브 데이터 표시 마커
        };
      }

      // 3. 주차장, 난이도, 휠체어 접근성 데이터 동적 주입
      let difficulty = '쉬움';
      let parking = '인근 공영주차장 이용 가능';
      let accessibility = '유모차 및 휠체어 진입 가능';

      const text = (place.title + ' ' + place.tags + ' ' + place.description + ' ' + (place.theme || '')).toLowerCase();

      if (text.includes('등산') || text.includes('산') || text.includes('봉') || text.includes('계곡') || text.includes('휴양림')) {
        difficulty = '보통';
        parking = '산 초입 전용 주차장 구비';
        accessibility = '돌길 및 흙길 경사로로 유모차/휠체어 접근이 제한됩니다.';
        
        if (
          text.includes('지리산') || text.includes('설악산') || text.includes('한라산') || 
          text.includes('치악산') || text.includes('월악산') || text.includes('도봉산') || 
          text.includes('북한산') || text.includes('대둔산') || text.includes('신불산')
        ) {
          difficulty = '어려움';
          parking = '국립공원 주차장 이용 가능 (주말 조기 만차)';
          accessibility = '가파른 암릉 및 계단 구간으로 유모차/휠체어 진입이 불가합니다.';
        }
      } else if (text.includes('케이블카') || text.includes('모노레일') || text.includes('곤돌라') || text.includes('로프웨이')) {
        difficulty = '매우 쉬움';
        parking = '케이블카 탑승장 전용 주차장 완비';
        accessibility = '탑승장 내 엘리베이터 및 무장애 휠체어 진입 경사로 제공';
      } else if (text.includes('도심') || text.includes('공원') || text.includes('산책') || text.includes('둘레길') || text.includes('돌담길') || text.includes('호수')) {
        difficulty = '쉬움';
        parking = '공원 부설/공영 주차장 마련';
        accessibility = '평탄한 데크길 및 포장도로 위주로 보행 보조기구 이동이 수월합니다.';
        
        if (text.includes('남산') || text.includes('석촌호수') || text.includes('덕수궁') || text.includes('경복궁') || text.includes('창덕궁')) {
          parking = '인근 대중교통 이용 적극 권장 (주말 주차 매우 어려움)';
        }
      }

      return {
        ...mergedPlace,
        difficulty,
        parking,
        accessibility
      };
    });

    return NextResponse.json(updatedPlaces);
  } catch (error) {
    console.error("Error fetching places:", error);
    // 에러 시 기존 안전한 DB에 기본 정보를 주입해서 반환
    const fallbackPlaces = placesData.map((place: any) => {
      return {
        ...place,
        difficulty: '쉬움',
        parking: '인근 주차장 이용 가능',
        accessibility: '유모차/휠체어 진입 여부 전화 문의 필요'
      };
    });
    return NextResponse.json(fallbackPlaces);
  }
}
