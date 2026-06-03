"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat: string;
  dataFullWidthResponsive: boolean;
}

export default function AdBanner({
  dataAdSlot,
  dataAdFormat,
  dataFullWidthResponsive,
}: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPushed = useRef(false);

  // 개발자 에러 오버레이 억제 리스너 (adsbygoogle 비동기 전역 예외가 Next.js 에러창을 띄우는 현상 방지)
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      if (
        event.message &&
        (event.message.includes("adsbygoogle") ||
          event.message.includes("No slot size") ||
          event.message.includes("availableWidth"))
      ) {
        event.preventDefault();
        console.warn("[AdSense Dev Filter] Suppressed layout error:", event.message);
      }
    };

    window.addEventListener("error", handleGlobalError);
    return () => {
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);

  useEffect(() => {
    // 이미 푸시되었거나, 브라우저 환경이 아니면 실행하지 않음
    if (isPushed.current || typeof window === 'undefined') return;

    const adContainer = containerRef.current;
    if (!adContainer) return;

    let resizeObserver: ResizeObserver | null = null;
    let intervalId: any = null;
    let animationFrameId: number | null = null;

    const pushAd = () => {
      if (isPushed.current) return;
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      } catch (error) {
        console.error("AdSense error:", error);
      }
      cleanup();
    };

    const cleanup = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    const checkSizeAndPush = () => {
      // 모바일 등에서 너비가 250px 이상 확보되었을 때만 광고 푸시
      if (adContainer.offsetWidth >= 250) {
        // 브라우저 렌더링 주기 지연으로 레이아웃 안정성 확보
        animationFrameId = requestAnimationFrame(() => {
          if (adContainer && adContainer.offsetWidth >= 250) {
            pushAd();
          }
        });
      }
    };

    // 1. 즉시 확인
    checkSizeAndPush();

    // 2. 만약 너비가 아직 250px 미만이라면 ResizeObserver를 통해 너비 확보 감지
    if (!isPushed.current) {
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver((entries) => {
          for (let entry of entries) {
            if (entry.contentRect.width >= 250) {
              pushAd();
              break;
            }
          }
        });
        resizeObserver.observe(adContainer);
      }

      // 3. 백업 타이머로 주기적 확인
      intervalId = setInterval(checkSizeAndPush, 200);
    }

    return () => {
      cleanup();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[100px] overflow-hidden flex items-center justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client="ca-pub-6635245275061755"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}


