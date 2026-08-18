'use client';

import { useState, useEffect } from 'react';

interface WordPressPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  link: string;
}

const TAG_COLORS = ['bg-rose-500', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500'];

export default function WordPressBanners() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWpPosts() {
      try {
        const res = await fetch('/api/wordpress');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPosts(data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load WordPress posts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWpPosts();
  }, []);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-amber-100">🍯 오늘의 핫한 단풍여행 꿀팁 &amp; 혜택 정보 🍯</h3>
        <a
          href="https://weknews.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-200/60 hover:text-amber-100 transition"
        >
          블로그 이동하기 ›
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-[#121418] border border-[#272a31] rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[16/10] bg-[#1f2228]" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-[#1f2228] rounded w-1/3" />
                <div className="h-5 bg-[#1f2228] rounded w-full" />
                <div className="h-8 bg-[#1f2228] rounded w-full" />
              </div>
            </div>
          ))
        ) : (
          posts.map((post, idx) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-[#121418] border border-[#272a31] rounded-2xl overflow-hidden hover:border-orange-500 transition shadow-2xl flex flex-col">
                {/* 이미지 */}
                <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className={`absolute top-3 left-3 ${TAG_COLORS[idx % TAG_COLORS.length]} text-white text-[10px] font-black px-2 py-0.5 rounded-sm`}>
                    {post.category}
                  </span>
                </div>
                {/* 텍스트 */}
                <div className="p-4 flex flex-col gap-1 flex-1">
                  <span className="text-[10px] text-slate-500 font-mono">{post.date}</span>
                  <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-orange-400 transition">
                    {post.title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 font-normal mt-1">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-3 border-t border-[#272a31] flex items-center justify-between text-xs font-bold text-orange-400 group-hover:text-orange-300 transition">
                    <span>자세히 읽기</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
