import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "단풍 커뮤니티 톡 | Maple Map 자유게시판",
  description: "전국 단풍 명소, 가을 여행지 추천 및 후기를 여행자들과 자유롭게 공유하는 커뮤니티입니다.",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
