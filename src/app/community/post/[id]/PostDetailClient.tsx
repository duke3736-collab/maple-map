'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredPosts, getPostById, incrementViews, addComment, PostItem } from '@/lib/postsStore';
import AdBanner from '@/components/AdBanner';
import WordPressBanners from '@/components/WordPressBanners';

const COMMUNITY_SIDEBAR_SECTIONS = [
  {
    title: '🍁 인기 단풍 명소',
    items: ['설악산 국립공원', '내장산 국립공원', '화담숲'],
  },
  {
    title: '📸 가을 스팟',
    items: ['핑크뮬리 명소', '억새 군락지', '가을 축제'],
  },
  {
    title: '💬 커뮤니티 톡',
    items: ['자유톡', '익명톡', '질문/정보', '여행후기', '맛집추천', '동행구함'],
  },
];

export default function PostDetailClient({ postId, initialPost }: { postId: string; initialPost?: PostItem }) {
  const [post, setPost] = useState<PostItem | null>(initialPost || null);
  const [allPosts, setAllPosts] = useState<PostItem[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [commentPassword, setCommentPassword] = useState('1234');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. 조회수 1 누적 증가 (세션당 1회씩 실시간 누적)
    const viewKey = `sv_viewed_session_${postId}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(viewKey)) {
      incrementViews(postId);
      sessionStorage.setItem(viewKey, 'true');
    }
    
    // 2. 게시글 로드
    const found = getPostById(postId);
    if (found) {
      setPost({ ...found });
    }
    setAllPosts(getStoredPosts());
  }, [postId]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    if (!commentPassword.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    const updated = addComment(postId, {
      nickname: '익명',
      avatarColor: 'bg-[#3e2a14]',
      content: commentContent.trim(),
      passwordHash: commentPassword.trim(),
    });

    if (updated) {
      setPost({ ...updated });
      setCommentContent('');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!post) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-amber-200/70">
        <p className="text-xl mb-4">게시글을 찾을 수 없습니다.</p>
        <Link href="/community" className="text-orange-400 underline">
          커뮤니티 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 이전글 / 다음글 찾기
  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4 py-4 flex gap-6 text-amber-50">

      {/* ── 1. 단풍 맵 커뮤니티 좌측 카테고리 사이드바 ── */}
      <aside className="hidden lg:block w-48 shrink-0 bg-[#3e2a14] border border-[#5e432a]/40 rounded-xl p-4 self-start text-xs space-y-5 shadow-md">
        {COMMUNITY_SIDEBAR_SECTIONS.map((sec) => (
          <div key={sec.title} className="border-b border-[#5e432a]/30 pb-3 last:border-0">
            <h3 className="font-bold text-orange-200 mb-2 text-xs">{sec.title}</h3>
            <ul className="space-y-1 text-amber-100">
              {sec.items.map((item) => (
                <li key={item}>
                  <Link
                    href="/community"
                    className={`block hover:text-orange-400 transition ${
                      item === post.category ? 'text-orange-400 font-bold' : ''
                    }`}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      {/* ── 2. 메인 게시글 상세 영역 (이지데이 view_board) ── */}
      <div className="flex-1 min-w-0 bg-[#3e2a14] border border-[#5e432a]/50 rounded-2xl p-4 md:p-8 space-y-6 shadow-xl">

        {/* ── 상단 네비게이션 ── */}
        <div className="flex items-center justify-between text-xs text-amber-200/60 border-b border-[#5e432a]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-orange-400">{post.category}</span>
            <span>★ 즐겨찾기</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/community" className="hover:text-amber-50 transition">
              목록
            </Link>
            {nextPost && (
              <Link href={`/community/post/${nextPost.id}`} className="hover:text-amber-50 transition">
                다음 &gt;
              </Link>
            )}
          </div>
        </div>

        {/* ── 게시글 제목 및 메타 ── */}
        <div className="space-y-3">
          <h1 className="text-xl md:text-2xl font-bold text-white leading-snug break-words">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between text-xs text-amber-200/60 pt-1 pb-2 border-b border-[#5e432a]/40">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-amber-100">{post.nickname}</span>
              <span>{post.createdAt}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>조회 <strong className="text-amber-100 font-normal">{post.views}</strong></span>
              <span>댓글 <strong className="text-amber-100 font-normal">{post.comments.length}</strong></span>
              <button onClick={() => alert('신고가 접수되었습니다.')} className="hover:text-red-400 transition">
                신고
              </button>
            </div>
          </div>
        </div>

        {/* ── 구글 애드센스 광고 영역 ── */}
        <AdBanner dataAdSlot="3763277922" dataAdFormat="auto" dataFullWidthResponsive={true} />

        {/* ── 📌 게시글 본문 ── */}
        <div className="py-4 text-sm md:text-base leading-relaxed text-amber-100 space-y-6 font-normal">

          {/* 본문 문단 */}
          <div className="whitespace-pre-wrap break-words leading-relaxed space-y-4">
            {post.content}
          </div>

          {/* ── 🔗 이지데이 스타일 '👉 바로가기 강조 배너 버튼' ── */}
          {post.ctaText && (
            <div className="py-6">
              <a
                href={post.ctaUrl || '#'}
                target={post.ctaUrl?.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="block w-full max-w-2xl mx-auto bg-gradient-to-r from-[#5e432a] via-[#4d3620] to-[#5e432a] hover:from-[#6b4e33] hover:to-[#6b4e33] text-white border-2 border-orange-500/50 hover:border-orange-400 rounded-2xl py-4 px-6 text-center font-bold text-base md:text-lg shadow-xl transition-all transform hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="group-hover:scale-110 transition-transform">👉</span>
                  <span>{post.ctaText}</span>
                </div>
              </a>
            </div>
          )}

        </div>

        {/* ── 하단 반응 / 소셜 공유 링크 ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200/60 pt-4 border-t border-[#5e432a]/40">
          <div className="flex items-center gap-3">
            <button onClick={handleCopyLink} className="hover:text-white transition">
              {copied ? '✅ 주소복사됨' : '주소복사'}
            </button>
            <span>·</span>
            <button onClick={() => alert('관심글에 추가되었습니다.')} className="hover:text-white transition">
              관심글
            </button>
            <span>·</span>
            <button onClick={() => window.print()} className="hover:text-white transition">
              인쇄
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/community/write"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 rounded-md transition"
            >
              쓰기
            </Link>
            <Link
              href="/community"
              className="bg-[#4d3620] hover:bg-[#272a31] text-amber-100 px-3 py-1.5 rounded-md border border-[#5e432a] transition"
            >
              목록
            </Link>
            {prevPost && (
              <Link
                href={`/community/post/${prevPost.id}`}
                className="bg-[#4d3620] hover:bg-[#272a31] text-amber-100 px-3 py-1.5 rounded-md border border-[#5e432a] transition"
              >
                이전
              </Link>
            )}
            {nextPost && (
              <Link
                href={`/community/post/${nextPost.id}`}
                className="bg-[#4d3620] hover:bg-[#272a31] text-amber-100 px-3 py-1.5 rounded-md border border-[#5e432a] transition"
              >
                다음
              </Link>
            )}
          </div>
        </div>

        {/* ── 💬 댓글 등록 영역 (댓글등록) ── */}
        <div className="bg-[#4d3620]/80 rounded-2xl p-5 border border-[#5e432a]/40 space-y-4 mt-8">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>💬 댓글등록</span>
            <span className="text-xs text-amber-200/70 font-normal">({post.comments.length})</span>
          </h3>

          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              placeholder="댓글을 입력해주세요. (익명으로 등록됩니다)"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="w-full bg-[#3e2a14] border border-[#5e432a] text-amber-50 text-sm rounded-xl p-3 min-h-[70px] focus:outline-none focus:border-orange-500 placeholder-slate-500 resize-none"
              required
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-200/70">작성자: <strong className="text-amber-50 font-normal">익명</strong></span>
                <input
                  type="password"
                  placeholder="삭제 비밀번호"
                  value={commentPassword}
                  onChange={(e) => setCommentPassword(e.target.value)}
                  className="bg-[#3e2a14] border border-[#5e432a] text-amber-50 text-xs rounded-lg px-2.5 py-1.5 w-32 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-5 py-2 rounded-lg transition"
              >
                등록
              </button>
            </div>
          </form>

          {/* 댓글 목록 */}
          {post.comments.length > 0 && (
            <div className="divide-y divide-[#424754]/30 pt-2">
              {post.comments.map((c) => (
                <div key={c.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-amber-200/70">
                    <span className="font-bold text-amber-100">{c.nickname}</span>
                    <span>{c.createdAt}</span>
                  </div>
                  <p className="text-xs text-amber-50">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 📋 하단 최근 게시글 리스트 테이블 (이지데이 스타일) ── */}
        <div className="pt-6 border-t border-[#5e432a]/40 space-y-3">
          <h3 className="text-sm font-bold text-amber-100">📋 게시판 최신글 목록</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#5e432a]/60 text-amber-200/70">
                  <th className="py-2.5 px-3 font-semibold">제목</th>
                  <th className="py-2.5 px-3 font-semibold w-24">작성자</th>
                  <th className="py-2.5 px-3 font-semibold w-16 text-center">조회수</th>
                  <th className="py-2.5 px-3 font-semibold w-28 text-right">작성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#424754]/20 text-amber-100">
                {allPosts.slice(0, 8).map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#3e2a14]/30 transition cursor-pointer ${
                      item.id === post.id ? 'bg-orange-500/10 font-bold text-orange-300' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <Link href={`/community/post/${item.id}`} className="hover:text-orange-400 transition line-clamp-1">
                        {item.title}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-amber-200/70">{item.nickname}</td>
                    <td className="py-2.5 px-3 text-center text-amber-200/70">{item.views}</td>
                    <td className="py-2.5 px-3 text-right text-amber-200/50">{item.createdAt.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 📱 소셜 미디어 공유 (원형 아이콘) ── */}
        <div className="flex justify-center items-center gap-3 py-8">
          <button onClick={() => alert('페이스북 공유')} className="w-11 h-11 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold text-xl hover:scale-110 transition shadow-lg">f</button>
          <button onClick={() => alert('X 공유')} className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white font-black text-xl hover:scale-110 transition shadow-lg border border-slate-700">𝕏</button>
          <button onClick={() => alert('라인 공유')} className="w-11 h-11 rounded-full bg-[#00C300] flex items-center justify-center text-white font-black text-xl hover:scale-110 transition shadow-lg">L</button>
          <button onClick={() => alert('네이버 공유')} className="w-11 h-11 rounded-full bg-[#03C75A] flex items-center justify-center text-white font-black text-xl hover:scale-110 transition shadow-lg">N</button>
          <button onClick={() => alert('카카오톡 공유')} className="w-11 h-11 rounded-full bg-[#FEE500] flex items-center justify-center text-black font-black text-xl hover:scale-110 transition shadow-lg">K</button>
        </div>

        {/* ── 🔗 관련 링크 바로가기 (Text ADs) ── */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-slate-200">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-500">더보기 알아보기</span>
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

        {/* ── 🖼️ 하단 추천 배너 영역 (WordPress 최신글 자동) ── */}
        <WordPressBanners />

      </div>
    </div>
  );
}
