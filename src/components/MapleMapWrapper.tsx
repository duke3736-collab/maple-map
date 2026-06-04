"use client";

import dynamic from "next/dynamic";

const MapleMapClient = dynamic(() => import("@/components/MapleMapClient"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#291c0e] text-amber-500 font-bold z-50">
      <span className="text-4xl animate-spin mb-4">🍁</span>
      <p>단풍 맵 로딩 중...</p>
    </div>
  )
});

export default function MapleMapWrapper() {
  return <MapleMapClient />;
}
