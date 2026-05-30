import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import placesData from '@/data/places.json';

// 재검색 주기를 24시간으로 설정 (Next.js App Router Cache)
export const revalidate = 86400;

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
      if (matchedData) {
        return {
          ...place,
          firstFoliage: matchedData.firstFoliage,
          peakFoliage: matchedData.peakFoliage,
          _isLive: true // 라이브 데이터 표시 마커
        };
      }
      return place;
    });

    return NextResponse.json(updatedPlaces);
  } catch (error) {
    console.error("Error fetching places:", error);
    // 에러 시 기존 안전한 DB 반환
    return NextResponse.json(placesData);
  }
}
