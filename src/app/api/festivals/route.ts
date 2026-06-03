import { NextRequest, NextResponse } from 'next/server';

export interface VisitKoreaFestival {
  id: string;
  name: string;
  location: string;
  area: string;
  startDate: string;   // "2026.10.01"
  endDate: string;
  description: string;
  imageUrl: string;
  phone: string;
  detailUrl: string;
  isActive: boolean;
  isSoon: boolean;      // 30일 이내 시작
  isUpcoming: boolean;  // 아직 시작 안 함
}

/**
 * GET /api/festivals?keyword=강원도
 * visitkorea 구석구석 실시간 API에서 지역 축제를 연중 조회
 * - 계절 필터 없음 (1년 내내 해당 지역 축제 표시)
 * - 종료된 축제 제외
 * - 시작일 기준 오름차순 정렬
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || '축제';

  try {
    const apiUrl = `https://korean.visitkorea.or.kr/kfes/list/selectWntyFstvlList.do?searchKeyword=${encodeURIComponent(keyword)}`;

    const res = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Referer': 'https://korean.visitkorea.or.kr/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
      next: { revalidate: 1800 }, // 30분 캐시
    });

    if (!res.ok) throw new Error(`visitkorea API ${res.status}`);

    const data = await res.json();
    const resultList: Record<string, unknown>[] = data.resultList || [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const parseDate = (s: string): Date | null => {
      if (!s) return null;
      const parts = s.split('.');
      if (parts.length < 3) return null;
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    const festivals: VisitKoreaFestival[] = resultList
      .map((f) => {
        const startDate = parseDate((f.fstvlBgngDe as string) || '');
        const endDate = parseDate((f.fstvlEndDe as string) || '');

        if (!startDate || !endDate) return null;

        // 이미 종료된 축제는 제외
        if (endDate < now) return null;

        endDate.setHours(23, 59, 59);
        const isActive = now >= startDate && now <= endDate;
        const diffDays = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        const isSoon = diffDays > 0 && diffDays <= 30;
        const isUpcoming = diffDays > 30;

        const rawDesc = ((f.fstvlOutlCn as string) || '')
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        const description = rawDesc.length > 130 ? rawDesc.slice(0, 130) + '…' : rawDesc;

        const fstvlCntntsId = f.fstvlCntntsId as string;

        return {
          id: fstvlCntntsId || String(f.cmsCntntsId),
          name: (f.cntntsNm as string) || '',
          location: (f.dtadr as string) || (f.adres as string) || '',
          area: (f.areaNm as string) || '',
          startDate: (f.fstvlBgngDe as string) || '',
          endDate: (f.fstvlEndDe as string) || '',
          description,
          imageUrl: (f.dispFstvlCntntsImgRout as string) || '',
          phone: ((f.fstvlAspcsTelno as string) || '').trim(),
          detailUrl: fstvlCntntsId
            ? `https://korean.visitkorea.or.kr/kfes/detail/korFstvlDetail.do?fstvlCntntsId=${fstvlCntntsId}`
            : 'https://korean.visitkorea.or.kr',
          isActive,
          isSoon,
          isUpcoming,
        } as VisitKoreaFestival;
      })
      .filter((f): f is VisitKoreaFestival => f !== null)
      // 진행 중 → 곧 시작 → 예정 순으로 정렬, 같은 그룹이면 시작일 오름차순
      .sort((a, b) => {
        const priority = (f: VisitKoreaFestival) =>
          f.isActive ? 0 : f.isSoon ? 1 : 2;
        const pd = priority(a) - priority(b);
        if (pd !== 0) return pd;
        return a.startDate.localeCompare(b.startDate);
      })
      .slice(0, 8);

    return NextResponse.json({
      festivals,
      keyword,
      total: festivals.length,
    });
  } catch (error) {
    console.error('[/api/festivals]', error);
    return NextResponse.json(
      { festivals: [], keyword, total: 0, error: '축제 정보를 불러오지 못했습니다.' },
      { status: 200 }
    );
  }
}
