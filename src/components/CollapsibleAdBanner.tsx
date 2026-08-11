"use client";

import React, { useState } from "react";
import AdBanner from "./AdBanner";

interface CollapsibleAdBannerProps {
  position?: "top" | "bottom";
  dataAdSlot?: string;
  defaultOpen?: boolean;
}

export default function CollapsibleAdBanner({
  position = "top",
  dataAdSlot = "1273604121",
  defaultOpen = false,
}: CollapsibleAdBannerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full bg-[#1e140a]/95 backdrop-blur-md border-y border-amber-900/40 z-40 relative flex flex-col items-center shrink-0">
      {isOpen && (
        <div className="w-full max-w-4xl p-2 flex justify-center items-center overflow-hidden transition-all duration-300">
          <AdBanner dataAdSlot={dataAdSlot} dataAdFormat="auto" dataFullWidthResponsive={true} />
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#2a1c0f] hover:bg-[#382615] text-amber-200 hover:text-white py-1.5 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border-t border-amber-900/30 shadow-sm"
      >
        <span>{isOpen ? "🔼 광고 접어두기 (지도 넓게 보기)" : "📢 스폰서 광고 보기 (클릭하여 펼치기) 🔽"}</span>
      </button>
    </div>
  );
}
