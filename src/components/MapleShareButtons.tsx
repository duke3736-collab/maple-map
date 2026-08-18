'use client';

import { useState, useEffect } from 'react';

interface MapleShareButtonsProps {
  url?: string;
  title?: string;
}

export default function MapleShareButtons({ url: propUrl, title: propTitle }: MapleShareButtonsProps) {
  const [url, setUrl] = useState(propUrl ?? '');
  const [title, setTitle] = useState(propTitle ?? '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!propUrl) setUrl(window.location.href);
    if (!propTitle) setTitle(document.title);
  }, [propUrl, propTitle]);

  const openPopup = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
    naver: `https://share.naver.com/web/shareView?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    kakao: `https://story.kakao.com/share?url=${encodeURIComponent(url)}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex justify-center items-center gap-3 py-8 flex-wrap">
      <button onClick={() => openPopup(shareLinks.facebook)} title="페이스북 공유" className="w-11 h-11 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition shadow-lg">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </button>
      <button onClick={() => openPopup(shareLinks.twitter)} title="X(트위터) 공유" className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition shadow-lg border border-slate-700">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </button>
      <button onClick={() => openPopup(shareLinks.line)} title="라인 공유" className="w-11 h-11 rounded-full bg-[#00C300] flex items-center justify-center text-white font-black text-xs hover:scale-110 transition shadow-lg">LINE</button>
      <button onClick={() => openPopup(shareLinks.naver)} title="네이버 공유" className="w-11 h-11 rounded-full bg-[#03C75A] flex items-center justify-center text-white font-black text-xl hover:scale-110 transition shadow-lg">N</button>
      <button onClick={() => openPopup(shareLinks.kakao)} title="카카오스토리 공유" className="w-11 h-11 rounded-full bg-[#FEE500] flex items-center justify-center hover:scale-110 transition shadow-lg">
        <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24"><path d="M12 3c-5.523 0-10 3.477-10 7.767 0 2.766 1.777 5.185 4.425 6.471-.144.502-.455 1.579-.492 1.722-.047.18.061.176.13.131.055-.035 1.74-1.127 2.457-1.602C9.642 17.848 10.796 18 12 18c5.523 0 10-3.477 10-7.767C22 6.477 17.523 3 12 3z"/></svg>
      </button>
      <button onClick={handleCopy} title="링크 복사" className={`w-11 h-11 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-white'}`}>
        {copied ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
        )}
      </button>
    </div>
  );
}
