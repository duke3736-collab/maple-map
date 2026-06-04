import MapleMapWrapper from "@/components/MapleMapWrapper";
import { getPlaces } from "@/lib/places";
import Script from "next/script";

export default async function Page() {
  const places = await getPlaces();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "단풍 맵 (Maple Map)",
    "url": "https://maple.weknews.com",
    "description": "2026년 전국 단풍 명소, 핑크뮬리, 억새 축제, 케이블카 지도 및 가을 드라이브 코스 추천",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://maple.weknews.com/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <MapleMapWrapper />

      <noscript>
        <div className="sr-only">
          <h2>전국 단풍 명소 및 가을 여행지 목록</h2>
          <ul>
            {places.map((place: any) => (
              <li key={place.id}>
                <h3>{place.title}</h3>
                <p>{place.description}</p>
                <p>테마: {place.theme}</p>
                <p>키워드: {place.tags}</p>
                <p>단풍 시기: {place.firstFoliage} ~ {place.peakFoliage}</p>
                <p>경로: {place.waypoints}</p>
                <p>주차 여부: {place.parking}</p>
                <p>접근성: {place.accessibility}</p>
                <p>난이도: {place.difficulty}</p>
              </li>
            ))}
          </ul>
        </div>
      </noscript>
    </>
  );
}
