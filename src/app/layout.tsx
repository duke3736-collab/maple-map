import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "단풍 맵 | 2026 전국 단풍 시기 및 가을 여행지 명소 추천",
  description: "2026년 단풍 시기와 전국 단풍 명소, 핑크뮬리, 억새 축제 등 가을 여행지 추천 지도를 한눈에 확인하세요. 주말 당일치기 단풍 드라이브 코스도 제공합니다.",
  keywords: "2026 단풍 시기, 전국 단풍 명소, 가을 여행지 추천, 단풍 드라이브, 핑크뮬리 명소, 도심 속 단풍 산책, 주말 당일치기 단풍, 가을 데이트",
  manifest: "/manifest.json",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "단풍 맵 | 2026 가을 단풍 명소 지도",
    description: "2026년 단풍 시기, 전국 단풍 명소와 핑크뮬리 스팟을 지도에서 한눈에 찾아보세요!",
    url: "https://maple.weknews.com", // 배포될 도메인 URL
    siteName: "단풍 맵(Maple Map)",
    images: [
      {
        url: "https://maple.weknews.com/images/hero.png",
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
    images: ['https://maple.weknews.com/images/hero.png'],
  },
  verification: {
    google: "구글_서치콘솔_인증키를_여기에_넣어주세요", // 구글 서치콘솔 HTML 태그 인증키 입력
    other: {
      "naver-site-verification": ["f8f9d0a1e0a685829d500e448a281005e600b6f1"], // 네이버 서치어드바이저 인증키 반영
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
              "url": "https://maple.weknews.com",
              "description": "2026년 전국 단풍 명소, 핑크뮬리, 억새 축제 지도",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://maple.weknews.com/?q={search_term_string}",
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
