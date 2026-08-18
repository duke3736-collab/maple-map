'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { addPost } from '@/lib/postsStore';
import WordPressBanners from '@/components/WordPressBanners';
import AdBanner from '@/components/AdBanner';

const ADJECTIVES = ['행복한', '친절한', '날렵한', '똑똑한', '귀여운', '심각한', '신비로운', '빛나는', '피곤한', '배고픈', '열정적인', '즐거운'];
const NOUNS = ['단풍나무', '은행나무', '억새', '핑크뮬리', '여행자', '캠퍼', '사진작가', '등산객', '대학생', '사자', '호랑이', '너구리'];
const AVATAR_COLORS = ['bg-rose-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-indigo-500'];

const REGIONS_LIST = [
  { id: 'seoul', name: '서울/경기' },
  { id: 'gangwon', name: '강원도' },
  { id: 'chungcheong', name: '충청도' },
  { id: 'jeolla', name: '전라도' },
  { id: 'gyeongsang', name: '경상도' },
  { id: 'jeju', name: '제주/도서' },
  { id: 'general', name: '선택 안함' },
];

const ADMIN_SECRET_KEY = 'admin';

function WriteFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'자유톡' | '익명톡' | '질문/정보' | '여행후기' | '맛집추천' | '동행구함'>('자유톡');
  const [regionId, setRegionId] = useState('general');
  const [content, setContent] = useState('');

  // 🔒 운영자(본인) 전용 상태 - 기본적으로 일반 유저에게는 100% 숨김 처리
  const [showAdminSection, setShowAdminSection] = useState(false);
  const [hasCtaLink, setHasCtaLink] = useState(true);
  const [ctaText, setCtaText] = useState('👉 이번 주말 온 단풍명소 Best 5 보기');
  const [ctaUrl, setCtaUrl] = useState('https://maple.weknews.com');

  const [nickname, setNickname] = useState('익명');
  const [avatarColor, setAvatarColor] = useState('bg-orange-600');
  const [password, setPassword] = useState('1234');
  const [isAnonymous, setIsAnonymous] = useState(true);

  useEffect(() => {
    generateNickname();

    // URL에 ?admin=true 또는 ?admin=1이 있거나, 이전에 관리자 인증을 완료한 내 브라우저인 경우에만 관리자 메뉴 표시
    const isAdminUrl = searchParams.get('admin') === 'true' || searchParams.get('admin') === '1';
    const isSavedAdmin = typeof window !== 'undefined' && localStorage.getItem('maple_is_admin_owner') === 'true';

    if (isAdminUrl || isSavedAdmin) {
      setShowAdminSection(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('maple_is_admin_owner', 'true');
      }
    }
  }, [searchParams]);

  const generateNickname = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    setNickname(`${adj} ${noun} ${num}`);
    setAvatarColor(color);
  };

  // 상단 헤더 더블 클릭 시 관리자 모드 비밀 해제 (비밀키 입력)
  const handleSecretTrigger = () => {
    const inputKey = prompt('운영자 비밀키를 입력하세요:');
    if (inputKey && inputKey.toLowerCase() === ADMIN_SECRET_KEY) {
      setShowAdminSection(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('maple_is_admin_owner', 'true');
      }
      alert('✅ 운영자 모드가 활성화되었습니다. 내 브라우저에 강조 링크 첨부 기능이 표시됩니다.');
    } else if (inputKey) {
      alert('비밀키가 일치하지 않습니다.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !password.trim()) return;

    const selectedRegion = REGIONS_LIST.find(a => a.id === regionId);

    const finalCtaText = hasCtaLink && ctaText.trim() ? ctaText.trim() : undefined;
    const finalCtaUrl = hasCtaLink && ctaUrl.trim() ? ctaUrl.trim() : undefined;

    const created = addPost({
      title: title.trim(),
      regionId: regionId,
      regionName: selectedRegion ? selectedRegion.name : 'Maple Map',
      nickname: isAnonymous ? '익명' : nickname,
      avatarColor: avatarColor,
      category: category,
      content: content.trim(),
      ctaText: finalCtaText,
      ctaUrl: finalCtaUrl,
      passwordHash: password.trim(),
    });

    router.push(`/community/post/${created.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* 서브 상단 네비게이션 (더블 클릭 시 운영자 비밀 해제) */}
      <div className="flex items-center justify-between border-b border-[#5e432a]/60 pb-4 mb-6 select-none">
        <div className="flex items-center gap-2">
          <Link href="/community" className="text-xs text-amber-200/70 hover:text-amber-50 transition">
            ← 커뮤니티 목록으로
          </Link>
          <span className="text-amber-200/30">|</span>
          <span
            onDoubleClick={handleSecretTrigger}
            title="운영자 모드 활성화 (더블클릭)"
            className="text-sm font-bold text-white cursor-pointer hover:text-blue-300 transition"
          >
            ✏️ 새 글 쓰기
          </span>
        </div>
        {showAdminSection && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            👑 운영자 전용 링킹 켜짐
          </span>
        )}
      </div>

      {/* ── 📢 글쓰기 상단 애드센스 광고 ── */}
      <div className="w-full mb-4 rounded-xl overflow-hidden border border-[#5e432a]/30 bg-[#3e2a14]/40 flex items-center justify-center min-h-[90px]">
        <AdBanner dataAdSlot="1273604121" dataAdFormat="horizontal" dataFullWidthResponsive={true} />
      </div>

      <form onSubmit={handleSubmit} className="bg-[#3e2a14] border border-[#5e432a]/50 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">

        {/* 1. 카테고리 & 관련 앱 선택 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-orange-200 uppercase tracking-wider mb-2">
              게시판 카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-[#4d3620] border border-[#5e432a] text-amber-50 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="자유톡">☕ 자유톡</option>
              <option value="익명톡">👤 익명톡</option>
              <option value="질문/정보">💡 질문/정보</option>
              <option value="여행후기">📸 여행후기</option>
              <option value="맛집추천">👶 맛집추천</option>
              <option value="동행구함">💬 동행구함</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-orange-200 uppercase tracking-wider mb-2">
              관련 지역 (선택)
            </label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="w-full bg-[#4d3620] border border-[#5e432a] text-amber-50 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {REGIONS_LIST.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. 글 제목 */}
        <div>
          <label className="block text-xs font-bold text-orange-200 uppercase tracking-wider mb-2">
            게시글 제목 *
          </label>
          <input
            type="text"
            placeholder="예: 설악산 단풍 절정 시기와 추천 등산 코스 총정리"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#4d3620] border border-[#5e432a] text-amber-50 text-sm md:text-base font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            required
          />
        </div>

        {/* 3. 본문 내용 */}
        <div>
          <label className="block text-xs font-bold text-orange-200 uppercase tracking-wider mb-2">
            본문 내용 *
          </label>
          <textarea
            placeholder={`내용을 입력해주세요. (최소 3줄 이상 권장)\n\n예:\n이번 주말 설악산 단풍이 절정입니다.\n주차장은 일찍 도착하면 쉽게 이용할 수 있습니다.`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-[#4d3620] border border-[#5e432a] text-amber-50 text-sm rounded-xl p-4 min-h-[220px] focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-y leading-relaxed"
            required
          />
        </div>

        {/* 4. 👑 운영자(본인) 전용 바로가기 배너 링크 첨부 섹션 - 일반 유저에게는 100% 숨김 */}
        {showAdminSection && (
          <div className="bg-[#0d1117] border border-blue-500/40 rounded-2xl p-5 space-y-4 shadow-lg shadow-blue-500/5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-blue-300 flex items-center gap-2">
                <span>👉</span> 강조 바로가기 배너 링크 첨부 (운영자 전용)
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCtaLink}
                  onChange={(e) => setHasCtaLink(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {hasCtaLink && (
              <div className="space-y-3 pt-2">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">배너 버튼 문구 (손가락 이모지와 함께 큼직하게 표시됩니다)</span>
                  <input
                    type="text"
                    placeholder="👉 이번주 추천 정보 및 바로가기 확인"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-[#161b22] border border-blue-500/30 text-slate-100 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400 placeholder-slate-500"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">이동할 URL 주소</span>
                  <input
                    type="url"
                    placeholder="https://maple.weknews.com/..."
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full bg-[#161b22] border border-blue-500/30 text-slate-100 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400 font-mono text-xs placeholder-slate-500"
                  />
                </div>

                {/* 실시간 미리보기 */}
                <div className="mt-3 p-3 bg-[#0a0e14] rounded-xl border border-blue-500/20">
                  <span className="text-[11px] text-slate-500 block mb-2 font-medium">[이지데이 미리보기]</span>
                  <div className="bg-gradient-to-r from-[#1a2340] via-[#1e2d50] to-[#1a2340] text-white border-2 border-blue-500/60 rounded-2xl py-3 px-6 text-center font-bold text-sm shadow-xl transition-all">
                    👉 {ctaText || '이번주 추천 정보 및 바로가기 확인'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. 작성자 및 비밀번호 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#5e432a]/40 pt-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-orange-200 uppercase tracking-wider">
                작성자 닉네임
              </label>
              <label className="text-xs text-amber-200/70 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                '익명'으로 표시
              </label>
            </div>
            {!isAnonymous ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="flex-1 bg-[#4d3620] border border-[#5e432a] text-amber-50 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={generateNickname}
                  className="text-xs bg-[#3e2a14] hover:bg-[#4d3620] text-amber-100 px-3 py-2.5 rounded-xl border border-[#5e432a] transition"
                >
                  🔄 랜덤
                </button>
              </div>
            ) : (
              <div className="bg-[#4d3620] text-amber-200/70 text-sm rounded-xl px-4 py-2.5 border border-[#5e432a]/50">
                익명 (단풍톡 기본 설정)
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-orange-200 uppercase tracking-wider mb-2">
              삭제용 비밀번호 (필수)
            </label>
            <input
              type="password"
              placeholder="숫자 4자리"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={12}
              className="w-full bg-[#4d3620] border border-[#5e432a] text-amber-50 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#5e432a]/40">
          <Link
            href="/community"
            className="px-6 py-3 text-sm font-semibold text-amber-200/70 hover:text-amber-50 bg-[#3e2a14]/60 hover:bg-[#3e2a14] rounded-xl border border-[#5e432a] transition"
          >
            취소
          </Link>
          <button
            type="submit"
            className="px-8 py-3 text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-lg hover:shadow-blue-500/25 transition transform hover:-translate-y-0.5"
          >
            등록 완료
          </button>
        </div>

      </form>

      {/* ── 📱 소셜 미디어 공유 (원형 아이콘) ── */}
      <div className="flex justify-center items-center gap-3 py-8">
        <button onClick={() => {}} className="w-11 h-11 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold text-xl hover:scale-110 transition shadow-lg">f</button>
        <button onClick={() => {}} className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white font-black text-xl hover:scale-110 transition shadow-lg border border-slate-700">𝕏</button>
        <button onClick={() => {}} className="w-11 h-11 rounded-full bg-[#00C300] flex items-center justify-center text-white font-black text-xl hover:scale-110 transition shadow-lg">L</button>
        <button onClick={() => {}} className="w-11 h-11 rounded-full bg-[#03C75A] flex items-center justify-center text-white font-black text-xl hover:scale-110 transition shadow-lg">N</button>
        <button onClick={() => {}} className="w-11 h-11 rounded-full bg-[#FEE500] flex items-center justify-center text-black font-black text-xl hover:scale-110 transition shadow-lg">K</button>
      </div>

      {/* ── 🔗 자세히 알아보기 (Text AD Links) ── */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-slate-200">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-500">자세히 알아보기</span>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { title: '가을 단풍 명소 추천', link: '#' },
            { title: '렌트카 최저가 비교', link: '#' },
            { title: '국내 여행 필수품 체크리스트', link: '#' }
          ].map(ad => (
            <a key={ad.title} href={ad.link} className="flex justify-between items-center px-4 py-3.5 hover:bg-slate-50 transition group">
              <span className="text-sm text-slate-700 group-hover:text-orange-600 font-medium transition">{ad.title}</span>
              <span className="text-slate-400 group-hover:translate-x-1 transition text-lg leading-none">›</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── 🍯 오늘의 핫한 여행 꿀팁 & 혜택 정보 (WordPress 최신글 자동) ── */}
      <WordPressBanners />

      {/* ── 🔗 자세히 알아보기 2 (하단) ── */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-slate-200">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-500">자세히 알아보기</span>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { title: '컴퓨터 보안', link: '#' },
            { title: '캠핑 & 아웃도어', link: '#' },
            { title: '등산 코스 정보', link: '#' }
          ].map(ad => (
            <a key={ad.title} href={ad.link} className="flex justify-between items-center px-4 py-3.5 hover:bg-slate-50 transition group">
              <span className="text-sm text-slate-700 group-hover:text-orange-600 font-medium transition">{ad.title}</span>
              <span className="text-slate-400 group-hover:translate-x-1 transition text-lg leading-none">›</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function CommunityWritePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-amber-200/70">로딩 중...</div>}>
      <WriteFormContent />
    </Suspense>
  );
}
