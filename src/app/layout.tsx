import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "단풍 맵 | 2026 전국 단풍 시기 및 가을 여행지 명소 추천",
  description: "2026년 단풍 시기와 전국 단풍 명소, 핑크뮬리, 억새 축제 등 가을 여행지 추천 지도를 한눈에 확인하세요. 주말 당일치기 단풍 드라이브 코스도 제공합니다.",
  keywords: "2026 단풍 시기, 전국 단풍 명소, 가을 여행지 추천, 단풍 드라이브, 핑크뮬리 명소, 도심 속 단풍 산책, 주말 당일치기 단풍, 가을 데이트",
  manifest: "/manifest.json",
  openGraph: {
    title: "단풍 맵 | 2026 가을 단풍 명소 지도",
    description: "2026년 단풍 시기, 전국 단풍 명소와 핑크뮬리 스팟을 지도에서 한눈에 찾아보세요!",
    url: "https://maple-map.vercel.app", // 배포될 Vercel URL
    siteName: "단풍 맵(Maple Map)",
    images: [
      {
        url: "https://maple-map.vercel.app/images/hero.png",
        width: 1200,
        height: 630,
        alt: "단풍 맵 메인 이미지",
      }
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: "단풍 맵 | 2026 가을 단풍 명소 지도",
    description: "2026년 단풍 시기, 전국 단풍 명소와 핑크뮬리 스팟을 지도에서 한눈에 찾아보세요!",
    images: ['https://maple-map.vercel.app/images/hero.png'],
  },
  verification: {
    other: {
      "naver-site-verification": ["3faa2ef84f296409fbaf72f26f3836e630fc369a"],
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" style={{ position: 'fixed', inset: 0, overflow: 'hidden', backgroundColor: '#291c0e', width: '100vw', height: '100vh', touchAction: 'none' }}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6635245275061755"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-HXGF6RRRQT`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HXGF6RRRQT', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "단풍 맵 (Maple Map)",
              "url": "https://maple-map.vercel.app",
              "description": "2026년 전국 단풍 명소, 핑크뮬리, 억새 축제 지도",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://maple-map.vercel.app/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body 
        suppressHydrationWarning 
        className="bg-[#291c0e] text-amber-50 font-sans antialiased selection:bg-orange-500 selection:text-white overscroll-none"
        style={{ position: 'fixed', inset: 0, overflow: 'hidden', backgroundColor: '#291c0e', width: '100vw', height: '100vh', touchAction: 'none' }}
      >
        <main 
          className="fixed inset-0 w-full h-full bg-[#291c0e] overflow-hidden"
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
