'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredPosts, savePosts, PostItem } from '@/lib/postsStore';
import AdBanner from '@/components/AdBanner';

const REGION_CATEGORIES = [
  {
    category: '수도권',
    emoji: '🍁',
    regions: [
      { id: 'seoul', name: '서울/경기/인천' },
    ],
  },
  {
    category: '강원권',
    emoji: '⛰️',
    regions: [
      { id: 'gangwon', name: '강원도' },
    ],
  },
  {
    category: '충청/전라',
    emoji: '🍂',
    regions: [
      { id: 'chungcheong', name: '충청도' },
      { id: 'jeolla', name: '전라도' },
    ],
  },
  {
    category: '경상/제주',
    emoji: '🍊',
    regions: [
      { id: 'gyeongsang', name: '경상도' },
      { id: 'jeju', name: '제주/도서' },
    ],
  },
];

const REGION_NAME_MAP: Record<string, string> = {};
REGION_CATEGORIES.forEach(c => c.regions.forEach((a: any) => { REGION_NAME_MAP[a.id] = a.name; }));

function getTimeAgo(dateStr: string): string {
  if (!dateStr) return '방금 전';
  const now = new Date();
  const then = new Date(dateStr.replace(/\./g, '-'));
  if (isNaN(then.getTime())) return dateStr;
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}시간 전`;
  return dateStr.split(' ')[0] || dateStr;
}

const CATEGORY_BADGE: Record<string, string> = {
  '자유톡': 'text-orange-300 bg-orange-400/10 border border-orange-500/30',
  '익명톡': 'text-purple-400 bg-purple-400/10 border border-purple-500/30',
  '질문/정보': 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/30',
  '여행후기': 'text-rose-400 bg-rose-400/10 border border-rose-500/30',
  '육아톡': 'text-amber-400 bg-amber-400/10 border border-amber-500/30',
  '러브톡': 'text-pink-400 bg-pink-400/10 border border-pink-500/30',
};

export default function CommunityPage() {
  const [allPosts, setAllPosts] = useState<PostItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'전체' | '자유톡' | '질문/정보' | '여행후기' | '인기글'>('전체');
  const [activeRegion, setActiveRegion] = useState<string>('전체');

  useEffect(() => {
    setAllPosts(getStoredPosts());
  }, []);

  const handleLike = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAllPosts(prev => {
      const updated = prev.map(p =>
        p.id === postId ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p
      );
      savePosts(updated);
      return updated;
    });
  };

  // 필터 적용
  let filtered = allPosts;
  if (activeFilter === '인기글') filtered = allPosts.filter(p => p.likes >= 3 || p.views >= 50).sort((a, b) => b.likes - a.likes);
  else if (activeFilter !== '전체') filtered = allPosts.filter(p => p.category === activeFilter);
  if (activeRegion !== '전체') filtered = filtered.filter(p => p.regionId === activeRegion);

  // 컬럼별 최신 글 (이지데이 멀티컬럼 스타일)
  const freePosts = allPosts.filter(p => p.category === '자유톡' || p.category === '익명톡').slice(0, 6);
  const qaPosts = allPosts.filter(p => p.category === '질문/정보').slice(0, 6);
  const errorPosts = allPosts.filter(p => p.category === '여행후기').slice(0, 6);
  const hotPosts = [...allPosts].sort((a, b) => (b.likes + b.views) - (a.likes + a.views)).slice(0, 6);

  return (
    <div className="flex gap-6 min-h-screen">

      {/* ── 좌측 사이드바 (이지데이 카테고리 네비) ── */}
      <aside className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-24 space-y-6">
          <div>
            <p className="text-sm font-bold text-amber-200/80 uppercase tracking-widest mb-2 px-1">전체 보기</p>
            <nav className="space-y-0.5">
              {(['전체', '자유톡', '질문/정보', '여행후기', '인기글'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveFilter(tab); setActiveRegion('전체'); }}
                  className={`w-full text-left text-base px-3 py-2 rounded-lg transition ${
                    activeFilter === tab && activeRegion === '전체'
                      ? 'bg-orange-600/20 text-orange-400 font-bold'
                      : 'text-amber-100 hover:text-white hover:bg-[#3e2a14]/60'
                  }`}
                >
                  {tab === '전체' && '🏠 '}
                  {tab === '자유톡' && '☕ '}
                  {tab === '질문/정보' && '❓ '}
                  {tab === '여행후기' && '⚠️ '}
                  {tab === '인기글' && '🔥 '}
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {REGION_CATEGORIES.map((cat: any) => (
            <div key={cat.category}>
              <p className="text-sm font-bold text-amber-200/80 uppercase tracking-widest mb-2 px-1">
                {cat.emoji} {cat.category}
              </p>
              <nav className="space-y-0.5">
                {cat.regions.map((region: any) => (
                  <button
                    key={region.id}
                    onClick={() => { setActiveRegion(region.id); setActiveFilter('전체'); }}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                      activeRegion === region.id
                        ? 'bg-orange-600/20 text-orange-400 font-bold'
                        : 'text-amber-100 hover:text-white hover:bg-[#3e2a14]/60'
                    }`}
                  >
                    {region.name}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      {/* ── 메인 영역 ── */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* 메인 타이틀 & 글쓰기 버튼 */}
        <div className="flex items-center justify-between bg-[#3e2a14] p-5 rounded-2xl border border-[#5e432a]/50 shadow-md">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              <span>💬</span> 단풍 여행 커뮤니티
            </h1>
            <p className="text-base text-amber-100 mt-2">로그인 없이 자유롭게 질문하고 링크와 정보를 나누세요.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-[#3e2a14] hover:bg-[#4d3620] border border-[#5e432a] text-amber-200 text-sm font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <span>🗺️</span> 지도로
            </Link>
            <Link
              href="/community/write"
              className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition transform hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <span>✏️</span> 새 글 쓰기
            </Link>
          </div>
        </div>

        {/* ── 구글 애드센스 광고 영역 ── */}
        <AdBanner dataAdSlot="3763277922" dataAdFormat="auto" dataFullWidthResponsive={true} />

        {/* 필터가 '전체'이고 앱도 '전체'일 때 이지데이식 멀티컬럼 허브 */}
        {activeFilter === '전체' && activeRegion === '전체' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: '☕ 자유톡 / 익명톡', posts: freePosts, color: 'text-orange-300' },
              { title: '❓ 질문 / 해결', posts: qaPosts, color: 'text-emerald-400' },
              { title: '⚠️ 여행후기', posts: errorPosts, color: 'text-rose-400' },
              { title: '🔥 인기글', posts: hotPosts, color: 'text-orange-400' },
            ].map(col => (
              <div key={col.title} className="bg-[#3e2a14]/30 rounded-2xl border border-[#5e432a]/50 overflow-hidden shadow-md">
                {/* 컬럼 헤더 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#5e432a]/40 bg-[#291c0e]/30">
                  <span className={`text-base font-bold ${col.color}`}>{col.title}</span>
                  <span className="text-sm text-amber-200/70">최신순</span>
                </div>
                {/* 글 목록 */}
                <ul className="divide-y divide-slate-700/20">
                  {col.posts.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-amber-200/60">아직 글이 없습니다.</li>
                  ) : col.posts.map(post => (
                    <li key={post.id}>
                      <Link
                        href={`/community/post/${post.id}`}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#3e2a14]/40 transition group"
                      >
                        <div className={`w-8 h-8 ${post.avatarColor || 'bg-orange-600'} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 shadow-sm`}>
                          {post.nickname ? post.nickname.charAt(0) : '익'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base font-bold text-white group-hover:text-orange-400 transition line-clamp-1 mb-1">
                            {post.title || post.content}
                          </p>
                          <p className="text-sm text-amber-100/90 line-clamp-1 mb-1.5 font-normal">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-amber-200/70">
                            <span>{post.nickname}</span>
                            <span>·</span>
                            <span>{getTimeAgo(post.createdAt)}</span>
                            <span className="ml-auto font-mono font-medium">조회 {post.views || 1}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* 컬럼 하단 */}
                <div className="px-4 py-2.5 border-t border-[#5e432a]/30 bg-[#291c0e]/20 text-right">
                  <button
                    onClick={() => setActiveFilter(col.title.includes('자유') ? '자유톡' : col.title.includes('질문') ? '질문/정보' : col.title.includes('오류') ? '여행후기' : '인기글')}
                    className="text-sm font-medium text-amber-100 hover:text-white transition"
                  >
                    더보기 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 필터/앱 선택 시 단일 피드 뷰 */
          <div className="bg-[#3e2a14]/30 rounded-2xl border border-[#5e432a]/50 overflow-hidden shadow-lg">
            {/* 피드 헤더 */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#5e432a]/40 bg-[#3e2a14]/40">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">
                  {activeRegion !== '전체' ? `📱 ${REGION_NAME_MAP[activeRegion] || activeRegion} 톡` : `${activeFilter}`}
                </span>
                <span className="text-sm text-amber-200/70">({filtered.length}개)</span>
              </div>
              <button
                onClick={() => { setActiveFilter('전체'); setActiveRegion('전체'); }}
                className="text-sm font-medium text-amber-100 hover:text-white transition"
              >
                ← 전체 허브로
              </button>
            </div>

            {/* 단일 피드 */}
            <div className="divide-y divide-[#5e432a]/60 max-h-[800px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-amber-200/60">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-base">아직 작성된 글이 없습니다.</p>
                  <Link href="/community/write" className="text-sm text-orange-400 hover:underline mt-2 inline-block font-bold">
                    → 첫 글 쓰러가기
                  </Link>
                </div>
              ) : (
                filtered.map((post, i) => (
                  <article key={post.id} className="hover:bg-[#3e2a14]/50 transition group">
                    <Link href={`/community/post/${post.id}`} className="flex gap-4 px-5 py-5">
                      <span className="text-sm text-amber-200/60 font-mono shrink-0 mt-1 w-5 text-right font-medium">
                        {String(filtered.length - i).padStart(2, '0')}
                      </span>
                      <div className={`w-12 h-12 ${post.avatarColor || 'bg-orange-600'} rounded-full flex items-center justify-center text-white text-base font-bold shrink-0 shadow-sm`}>
                        {post.nickname ? post.nickname.charAt(0) : '익'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-base md:text-lg font-bold text-white group-hover:text-orange-400 transition">
                            {post.title || post.content}
                          </span>
                          <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${CATEGORY_BADGE[post.category] || 'bg-[#4d3620] text-amber-100'}`}>
                            {post.category}
                          </span>
                        </div>
                        <p className="text-sm text-amber-100/90 leading-relaxed line-clamp-2 mb-3">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-amber-200/70">
                          <span className="font-medium text-amber-100">{post.nickname}</span>
                          <span>·</span>
                          <span>{getTimeAgo(post.createdAt)}</span>
                          <span>·</span>
                          <span className="font-medium">조회 {post.views || 1}</span>
                          {post.comments && post.comments.length > 0 && (
                            <span className="text-orange-400 font-bold">댓글 {post.comments.length}</span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleLike(post.id, e)}
                            className={`ml-auto flex items-center gap-1 transition ${post.liked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'}`}
                          >
                            ❤️ {post.likes || 0}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
