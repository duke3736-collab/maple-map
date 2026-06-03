'use client';

import { useState, useEffect, useCallback } from 'react';
import { Festival, extractSearchKeyword, formatVisitkoreaDate, getDaysLabel } from '@/data/festivals';

interface FestivalPanelProps {
  courseName: string;
  course: {
    title: string;
    tags: string;
    description: string;
    waypoints?: string;
    theme?: string;
  };
}

interface ApiResponse {
  festivals: Festival[];
  keyword: string;
  total: number;
  error?: string;
}

export default function FestivalPanel({ courseName, course }: FestivalPanelProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const keyword = extractSearchKeyword(course);

  const fetchFestivals = useCallback(async () => {
    if (loading || data) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/festivals?keyword=${encodeURIComponent(keyword)}`);
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      setData({ festivals: [], keyword, total: 0, error: '네트워크 오류' });
    } finally {
      setLoading(false);
    }
  }, [keyword, loading, data]);

  useEffect(() => {
    if (isOpen && !data && !loading) fetchFestivals();
  }, [isOpen, data, loading, fetchFestivals]);

  const activeCount = data?.festivals.filter((f) => f.isActive).length ?? 0;
  const soonCount   = data?.festivals.filter((f) => f.isSoon).length ?? 0;

  // 헤더 배지 텍스트
  const badgeText = () => {
    if (loading) return null;
    if (!data) return null;
    if (activeCount > 0) return `🔴 진행 중 ${activeCount}건`;
    if (soonCount > 0)   return `🟠 ${soonCount}건 곧 시작`;
    if (data.total > 0)  return `${data.total}건 예정`;
    return '정보 없음';
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/40">
      {/* ── 헤더 토글 ── */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎪</span>
          <span className="text-sm font-bold text-slate-200">이 지역 축제 정보</span>
          {badgeText() && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">
              {badgeText()}
            </span>
          )}
          {loading && (
            <span className="text-[10px] text-slate-500 animate-pulse">불러오는 중…</span>
          )}
        </div>
        <span
          className="text-slate-400 text-xs transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
        >▼</span>
      </button>

      {/* ── 펼쳐지는 본문 ── */}
      {isOpen && (
        <div className="border-t border-slate-700/50 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">

          {/* 로딩 */}
          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">대한민국 구석구석에서 축제 정보 조회 중…</p>
            </div>
          )}

          {/* 에러 */}
          {!loading && data?.error && (
            <div className="text-center py-5 space-y-2">
              <p className="text-2xl">⚠️</p>
              <p className="text-xs text-slate-400">{data.error}</p>
              <button
                onClick={() => { setData(null); fetchFestivals(); }}
                className="text-[11px] text-orange-400 hover:underline"
              >다시 시도</button>
            </div>
          )}

          {/* 결과 없음 */}
          {!loading && data && !data.error && data.festivals.length === 0 && (
            <div className="text-center py-6 space-y-3">
              <p className="text-3xl">🔍</p>
              <p className="text-sm font-semibold text-slate-200">
                현재 예정된 축제가 없습니다
              </p>
              <p className="text-[11px] text-slate-400">
                검색 지역: <span className="text-orange-300">{data.keyword}</span>
              </p>
              <CalendarLink label="축제달력에서 전체 축제 확인하기 →" />
            </div>
          )}

          {/* 축제 목록 */}
          {!loading && data && data.festivals.length > 0 && (
            <>
              {/* 출처 표시 */}
              <p className="text-[10px] text-slate-500">
                출처:{' '}
                <a
                  href="https://korean.visitkorea.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 underline"
                >
                  한국관광공사 대한민국 구석구석
                </a>
                &nbsp;·&nbsp;검색어:{' '}
                <span className="text-orange-300">{data.keyword}</span>
              </p>

              {/* 카드 목록 */}
              <div className="space-y-2">
                {data.festivals.map((festival) => (
                  <FestivalCard
                    key={festival.id}
                    festival={festival}
                    isSelected={selectedId === festival.id}
                    onSelect={() =>
                      setSelectedId((prev) => (prev === festival.id ? null : festival.id))
                    }
                  />
                ))}
              </div>

              {/* 하단 축제달력 CTA */}
              <div className="pt-2 border-t border-slate-800">
                <CalendarLink label="📅 축제달력에서 이 지역 전체 축제 보기 →" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── 축제달력 링크 컴포넌트 ── */
function CalendarLink({ label }: { label: string }) {
  return (
    <a
      href="https://korean.visitkorea.or.kr/kfes/list/festivalCalendar.do"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors py-1.5"
    >
      {label}
    </a>
  );
}

/* ── 개별 축제 카드 ── */
function FestivalCard({
  festival,
  isSelected,
  onSelect,
}: {
  festival: Festival;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const label = getDaysLabel(festival);
  const badgeCls = festival.isActive
    ? 'bg-red-900/60 text-red-300 border-red-700/60'
    : festival.isSoon
    ? 'bg-orange-900/60 text-orange-300 border-orange-700/60'
    : 'bg-slate-700/60 text-slate-400 border-slate-600/60';

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'border-orange-500/60 bg-orange-950/30'
          : 'border-slate-700/50 bg-slate-900/40 hover:border-slate-600'
      }`}
    >
      {/* 기본 정보 행 */}
      <div className="flex gap-3 p-3">
        {festival.imageUrl && (
          <img
            src={festival.imageUrl}
            alt={festival.name}
            className="w-14 h-14 rounded-md object-cover flex-shrink-0"
            loading="lazy"
          />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start gap-1.5 flex-wrap">
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold flex-shrink-0 ${badgeCls}`}>
              {label}
            </span>
            <span className="text-[12px] font-bold text-slate-100 leading-tight">{festival.name}</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">📍 {festival.area || festival.location}</p>
          <p className="text-[10px] text-orange-300">
            📅 {formatVisitkoreaDate(festival.startDate)} ~ {formatVisitkoreaDate(festival.endDate)}
          </p>
        </div>
      </div>

      {/* 펼쳐지는 상세 */}
      {isSelected && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-700/50 pt-2">
          {festival.description && (
            <p className="text-[11px] text-slate-300 leading-relaxed">{festival.description}</p>
          )}
          {festival.phone && (
            <p className="text-[10px] text-slate-400">📞 {festival.phone}</p>
          )}
          <a
            href={festival.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold transition-all hover:scale-[1.02]"
          >
            <span>🏛️</span>
            <span>대한민국 구석구석에서 자세히 보기</span>
            <span className="text-emerald-600 text-[9px]">(새 탭)</span>
          </a>
        </div>
      )}
    </div>
  );
}
