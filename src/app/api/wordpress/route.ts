import { NextResponse } from "next/server";

function stripHtmlTags(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .trim();
}

export async function GET() {
  try {
    const wordpressUrl = "https://weknews.com/wp-json/wp/v2/posts?_embed&per_page=3";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(wordpressUrl, {
      signal: controller.signal,
      next: { revalidate: 300 }, // 5분 캐싱
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const posts = await response.json();

    const formatted = posts.map((post: any) => {
      const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
      const imageUrl =
        featuredMedia?.source_url ||
        featuredMedia?.media_details?.sizes?.medium?.source_url ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60";

      const categoryName = post._embedded?.["wp:term"]?.[0]?.[0]?.name || "여행 정보";

      return {
        id: post.id,
        title: stripHtmlTags(post.title?.rendered || "새로운 소식"),
        excerpt: stripHtmlTags(post.excerpt?.rendered || "자세한 내용을 확인해 보세요."),
        category: categoryName,
        date: post.date ? post.date.split("T")[0] : new Date().toISOString().split("T")[0],
        imageUrl: imageUrl,
        link: post.link || `https://weknews.com/?p=${post.id}`,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("WordPress API fetch error:", error);
    // 오류 발생 시 기본 단풍 여행 콘텐츠 3개 제공
    return NextResponse.json([
      {
        id: 101,
        title: "설악산 단풍 절정 시기 & 추천 등산코스 총정리",
        excerpt: "올가을 설악산 단풍이 절정입니다. 주요 코스별 소요시간과 주차 팁까지 한번에 정리했습니다.",
        category: "단풍 명소",
        date: new Date().toISOString().split("T")[0],
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
        link: "https://weknews.com",
      },
      {
        id: 102,
        title: "가을 단풍 여행 준비물 체크리스트 | 필수 아이템 총정리",
        excerpt: "단풍 여행 전 꼭 챙겨야 할 필수 아이템과 준비물을 빠짐없이 정리했습니다.",
        category: "여행 정보",
        date: new Date().toISOString().split("T")[0],
        imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&auto=format&fit=crop&q=60",
        link: "https://weknews.com",
      },
      {
        id: 103,
        title: "렌트카 최저가 비교 | 가을 여행 필수 팁",
        excerpt: "가을 단풍 드라이브를 위한 렌트카 예약 방법과 최저가 비교 사이트를 소개합니다.",
        category: "여행 꿀팁",
        date: new Date().toISOString().split("T")[0],
        imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&auto=format&fit=crop&q=60",
        link: "https://weknews.com",
      },
    ]);
  }
}
