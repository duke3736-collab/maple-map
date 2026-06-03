"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import AdBanner from "@/components/AdBanner";
import PWAInstallButton from "@/components/PWAInstallButton";
import FestivalPanel from "@/components/FestivalPanel";
import WeatherInfo from "@/components/WeatherInfo";

declare global {
  interface Window {
    kakao: any;
    Kakao: any;
  }
}

interface Course {
  id: number;
  title: string;
  description: string;
  theme: string;
  tags: string;
  distance?: string;
  duration?: string;
  firstFoliage?: string;
  peakFoliage?: string;
  waypoints: string;
  imageUrl?: string;
  _distanceToUser?: number;
  difficulty?: string;
  parking?: string;
  accessibility?: string;
}

interface ParsedWaypoint {
  name: string;
  lat: number;
  lng: number;
}

const parseWaypoints = (str: string): ParsedWaypoint[] => {
  if (!str) return [];
  return str.split('|').map(pt => {
    const parts = pt.split(',');
    return {
      name: parts[0] || "",
      lat: parseFloat(parts[1] || "0"),
      lng: parseFloat(parts[2] || "0")
    };
  });
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // 단위: km
};


declare global {
  interface Window {
    kakao: any;
    __pathsLoaded?: boolean;
  }
}

const KAKAO_APP_KEY = "11032eefd7d0111cb94d93c0ab41eb01";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyQ-vhk6Kj6uIFyxugwoHC19OU8XIPRzNc8AbMWbJ3AVoCcGjNZBuc_QVMcAsy9qFOwkA/exec";

const REGION_KEYWORDS: Record<string, string[]> = {
  'seoul': ['서울', '인천', '경기', '파주', '남양주', '가평', '양평', '일산', '강화', '포천', '수원', '용인'],
  'gangwon': ['강원', '강릉', '속초', '동해시', '삼척', '평창', '양양', '고성군', '춘천', '원주'],
  'chungcheong': ['충청', '대전', '세종', '천안', '보령', '당진', '태안', '제천', '단양', '공주'],
  'jeolla': ['전라', '광주', '전주', '군산', '목포', '여수', '순천', '담양', '고창', '부안'],
  'gyeongsang': ['경상', '대구', '부산', '울산', '경주', '포항', '통영', '거제', '남해군', '창원'],
  'jeju': ['제주', '서귀포', '애월', '중문']
};

const REGION_MAP_VIEWS: Record<string, { lat: number, lng: number, level: number }> = {
  'seoul': { lat: 37.5665, lng: 126.9780, level: 11 },
  'gangwon': { lat: 37.7518, lng: 128.8760, level: 11 },
  'chungcheong': { lat: 36.5184, lng: 127.2000, level: 11 },
  'jeolla': { lat: 35.1595, lng: 126.8526, level: 11 },
  'gyeongsang': { lat: 35.5383, lng: 129.3113, level: 11 },
  'jeju': { lat: 33.3833, lng: 126.5500, level: 10 }
};

// 명예의 전당(에디터 추천) ID 목록 (110개 중 20개 선정)
const EDITOR_PICKS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 75, 80, 85, 95, 105];

const CURATION_CATEGORIES = [
  { id: 'peak', icon: '🍁', name: '단풍 절정 명소', keywords: ['절정', '단풍', '명산'] },
  { id: 'pink', icon: '📸', name: '인생샷 핑크뮬리', keywords: ['핑크뮬리', '억새', '인생샷'] },
  { id: 'city', icon: '🚶‍♂️', name: '도심 속 가을 산책', keywords: ['도심', '공원', '산책'] },
  { id: 'cable', icon: '🚠', name: '편한 케이블카', keywords: ['케이블카', '편한', '가족'] }
];

const REGIONS = [
  { id: 'all', name: '전국' },
  { id: 'seoul', name: '서울/경기' },
  { id: 'gangwon', name: '강원' },
  { id: 'chungcheong', name: '충청/대전' },
  { id: 'jeolla', name: '전라/광주' },
  { id: 'gyeongsang', name: '경상/부산' },
  { id: 'jeju', name: '제주' }
];

export default function Home() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polylinesRef = useRef<any[]>([]);
  const markersRef = useRef<any[]>([]);
  const prevSelectedMobileRef = useRef<Course | null>(null);
  const prevSelectedCommonRef = useRef<Course | null>(null);
  const myLocationMarkerRef = useRef<any>(null);
  const cachedPathsRef = useRef<Record<number, { path: any[], distance?: number, duration?: number }>>({});
  const foliageCirclesRef = useRef<any[]>([]);
  const driveMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const foliagePlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);
  const [mapZoomLevel, setMapZoomLevel] = useState(13);
  const [isMobile, setIsMobile] = useState(false);
  const [foliageTestDate, setFoliageTestDate] = useState<string>('');
  const [isPlayingFoliage, setIsPlayingFoliage] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSheetMinimized, setIsSheetMinimized] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string>("all");
  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [activeCuration, setActiveCuration] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSplash, setShowSplash] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState('코스 제안/오류 수정');
  const [inquiryContent, setInquiryContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSortedByDistance, setIsSortedByDistance] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLocatingMap, setIsLocatingMap] = useState(false);
  const [isDriveMode, setIsDriveMode] = useState(false);
  const [showDriveCompleteModal, setShowDriveCompleteModal] = useState(false);
  const [driveLocation, setDriveLocation] = useState<{lat: number, lng: number} | null>(null);

  // Derived state for filtering
  let filteredCourses = courses.filter(c => {
    // 1. 에디터 추천 명예의 전당
    if (activeCuration === 'ranking') {
      if (!EDITOR_PICKS.includes(c.id)) return false;
    }
    
    // 2. 상황별 맞춤 큐레이션 (기획전)
    if (activeCuration && activeCuration !== 'ranking') {
      const category = CURATION_CATEGORIES.find(cat => cat.id === activeCuration);
      if (category) {
        const matches = category.keywords.some(kw => 
          c.title.includes(kw) || c.tags.includes(kw) || c.description.includes(kw) || (c.waypoints && c.waypoints.includes(kw))
        );
        if (!matches) return false;
      }
    }

    if (activeTheme === 'favorites') {
      if (!favorites.includes(c.id)) return false;
    } else if (activeTheme !== 'all' && c.theme !== activeTheme) {
      return false;
    }

    if (activeRegion !== 'all') {
      const keywords = REGION_KEYWORDS[activeRegion] || [];
      const matchesRegion = keywords.some(kw => 
        c.title.includes(kw) || c.tags.includes(kw) || (c.waypoints && c.waypoints.includes(kw)) || c.description.includes(kw)
      );
      if (!matchesRegion) return false;
    }

    if (searchQuery.trim() !== '') {
      let q = searchQuery.toLowerCase().trim();
      
      // 지역명 검색어 유연화 (예: '제주도' -> '제주', '강원도' -> '강원')
      const aliases: Record<string, string> = {
        '제주도': '제주', '강원도': '강원', '경기도': '경기', '충청도': '충청',
        '전라도': '전라', '경상도': '경상', '서울특별시': '서울', '서울시': '서울',
        '부산광역시': '부산', '부산시': '부산', '대구광역시': '대구', '대구시': '대구',
        '인천광역시': '인천', '인천시': '인천', '광주광역시': '광주', '광주시': '광주',
        '대전광역시': '대전', '대전시': '대전', '울산광역시': '울산', '울산시': '울산'
      };
      
      if (aliases[q]) q = aliases[q];

      if (
        !c.title.toLowerCase().includes(q) && 
        !c.description.toLowerCase().includes(q) && 
        !c.tags.toLowerCase().includes(q) &&
        !(c.waypoints && c.waypoints.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });

  // 거리순 및 랭킹 정렬 로직 적용
  if (activeCuration === 'ranking') {
    filteredCourses.sort((a, b) => EDITOR_PICKS.indexOf(a.id) - EDITOR_PICKS.indexOf(b.id));
  } else if (isSortedByDistance && userLocation) {
    filteredCourses = filteredCourses.map(course => {
      const wp = parseWaypoints(course.waypoints);
      const dist = wp.length > 0 ? calculateDistance(userLocation.lat, userLocation.lng, wp[0].lat, wp[0].lng) : 999999;
      return { ...course, _distanceToUser: dist };
    }).sort((a, b) => (a._distanceToUser || 0) - (b._distanceToUser || 0));
  }

  // 동적 이미지 순환 배정 (리스트 순서대로 1, 2, 3 이미지가 예쁘게 교차되도록 보장)
  filteredCourses = filteredCourses.map((course, index) => {
    let cat = 'mountain';
    const text = (course.title + ' ' + course.theme + ' ' + course.tags + ' ' + course.description).toLowerCase();
    
    if (text.includes('궁') || text.includes('돌담') || text.includes('한옥') || text.includes('사찰') || text.includes('향교')) cat = 'palace';
    else if (text.includes('핑크뮬리') || text.includes('억새') || text.includes('갈대')) cat = 'pinkmuhly';
    else if (text.includes('케이블카') || text.includes('모노레일') || text.includes('스카이워크') || text.includes('곤돌라') || text.includes('로프웨이') || text.includes('짚와이어')) cat = 'cablecar';
    else if (text.includes('공원') || text.includes('수목원') || text.includes('유원지') || text.includes('산책') || text.includes('캠핑') || text.includes('피크닉')) cat = 'park';
    else if (text.includes('길') || text.includes('드라이브') || text.includes('임도') || text.includes('거리')) cat = 'road';
    else if (text.includes('산') || text.includes('봉') || text.includes('계곡') || text.includes('폭포') || text.includes('국립공원') || text.includes('자연휴양림')) cat = 'mountain';
    else cat = 'park'; // default fallback

    const maxIndex = (cat === 'mountain' || cat === 'palace') ? 1 : 3;
    const imgIndex = (index % maxIndex) + 1;
    const suffix = imgIndex === 1 ? '' : `_${imgIndex}`;
    return { ...course, imageUrl: `/images/categories/${cat}${suffix}.png` };
  });

  const themes = [
    { id: "favorites", icon: "❤️", label: "내 찜목록" },
    { id: "단풍명소", icon: "🍁", label: "단풍명소" },
    { id: "인생샷", icon: "📸", label: "인생샷" },
    { id: "도심산책", icon: "🚶‍♂️", label: "도심산책" },
    { id: "케이블카", icon: "🚠", label: "케이블카" },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('driveMapFavorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // 모바일에서 지도 탭 활성화 시 카카오맵 relayout 호출 및 중심 재조정
  useEffect(() => {
    const prevSelected = prevSelectedMobileRef.current;
    prevSelectedMobileRef.current = selectedCourse;

    if (isMobile && activeTab === 'map' && mapRef.current && window.kakao && window.kakao.maps) {
      setTimeout(() => {
        if (mapRef.current && window.kakao && window.kakao.maps) {
          mapRef.current.relayout();
          if (selectedCourse) {
            const wps = parseWaypoints(selectedCourse.waypoints);
            if (wps.length > 0) {
              const bounds = new window.kakao.maps.LatLngBounds();
              wps.forEach(wp => bounds.extend(new window.kakao.maps.LatLng(wp.lat, wp.lng)));
              // 모바일 상세 카드(높이 약 40%) 및 헤더 영역을 피해 코스를 화면에 꽉 차고 세밀하게(확대해서) 보여주도록 스마트 패딩 지정
              mapRef.current.setBounds(bounds, 80, 20, 260, 20);
            }
          } else {
            // 코스 상세 팝업이 열려있다가 닫히는(selectedCourse가 null이 되는) 시점에는 지도 위치를 리셋하지 않고 현재 중심을 유지
            if (prevSelected !== null) {
              return;
            }

            // selectedCourse가 없을 경우, 현재 선택된 지역 필터나 전체 코스에 맞게 지도 중심 설정 (서울 고정 이동 버그 해결)
            if (activeRegion !== 'all' && !searchQuery) {
              const view = REGION_MAP_VIEWS[activeRegion];
              if (view) {
                mapRef.current.setCenter(new window.kakao.maps.LatLng(view.lat, view.lng));
                mapRef.current.setLevel(view.level);
              }
            } else if (filteredCourses.length > 0) {
              const bounds = new window.kakao.maps.LatLngBounds();
              let hasValidCoords = false;
              filteredCourses.forEach(course => {
                const wps = parseWaypoints(course.waypoints);
                if (wps.length > 0) {
                  bounds.extend(new window.kakao.maps.LatLng(wps[0].lat, wps[0].lng));
                  hasValidCoords = true;
                }
              });
              if (hasValidCoords) {
                // 모바일에서 다수의 코스를 오차를 최소화하여 최대한 가깝게 확대 렌더링하도록 좁은 여백 지정
                mapRef.current.setBounds(bounds, 40, 20, 40, 20);
              } else {
                mapRef.current.setCenter(new window.kakao.maps.LatLng(37.5665, 126.9780));
                mapRef.current.setLevel(10);
              }
            } else {
              mapRef.current.setCenter(new window.kakao.maps.LatLng(37.5665, 126.9780));
              mapRef.current.setLevel(10);
            }
          }
        }
      }, 100);
    }
  }, [activeTab, isMobile, selectedCourse, activeRegion, searchQuery, filteredCourses.length]);

  // 지도 탭 진입 시 지도가 아직 로드되지 않은 상태라면 초기화 시도
  useEffect(() => {
    if (activeTab === 'map' && !mapLoaded) {
      if (window.kakao && window.kakao.maps) {
        initMap();
      }
    }
  }, [activeTab, mapLoaded]);

  const toggleFavorite = (courseId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setFavorites(prev => {
      const isFav = prev.includes(courseId);
      const newFavs = isFav ? prev.filter(id => id !== courseId) : [...prev, courseId];
      localStorage.setItem('driveMapFavorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  // 거리 포맷 헬퍼 함수
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return (meters / 1000).toFixed(1) + 'km';
    }
    return meters + 'm';
  };

  // 날짜 포맷 헬퍼 함수
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "미정") return "미정";
    if (dateStr.includes(".")) {
      const [m, d] = dateStr.split(".");
      return `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
    }
    return dateStr;
  };

  const handleSortByDistance = () => {
    if (isSortedByDistance) {
      setIsSortedByDistance(false);
      return;
    }

    setIsHeaderVisible(false); // 모바일에서 메뉴 접기

    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsSortedByDistance(true);
          setSelectedCourse(null);
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
          setIsLocating(false);
        }
      );
    } else {
      alert("이 브라우저에서는 위치 기능을 지원하지 않습니다.");
    }
  };

  const startDriveMode = async () => {
    if (!selectedCourse) return;

    let path = cachedPathsRef.current[selectedCourse.id]?.path;
    if (!path || path.length === 0) {
      const wps = parseWaypoints(selectedCourse.waypoints);
      path = wps.map((wp: any) => new window.kakao.maps.LatLng(wp.lat, wp.lng));
    }
    
    if (!path || path.length < 2) {
      alert("경로 데이터가 부족하여 가상 주행을 시작할 수 없습니다.");
      return;
    }

    setIsDriveMode(true);
    
    // 약 10초(10000ms) 동안 코스 완주 애니메이션 (50ms마다 업데이트 = 총 200 프레임)
    const stepTime = 50;
    const totalSteps = 200;
    let currentStep = 0;
    
    if (watchIdRef.current !== null) {
      clearInterval(watchIdRef.current as any);
    }

    watchIdRef.current = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        stopDriveMode();
        return;
      }
      
      // 전체 경로 중 현재 진행도 계산 (0.0 ~ 1.0)
      const progress = currentStep / totalSteps;
      const exactIndex = progress * (path.length - 1);
      const index1 = Math.floor(exactIndex);
      const index2 = Math.ceil(exactIndex);
      const fraction = exactIndex - index1;
      
      const p1 = path[index1];
      const p2 = path[index2] || p1;
      
      const lat = p1.getLat() + (p2.getLat() - p1.getLat()) * fraction;
      const lng = p1.getLng() + (p2.getLng() - p1.getLng()) * fraction;
      
      setDriveLocation({ lat, lng });
      
      // 애니메이션 중 자연스러운 패닝
      if (mapRef.current) {
        const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
        mapRef.current.panTo(moveLatLon);
      }
    }, stepTime) as any;
  };

  const stopDriveMode = () => {
    if (watchIdRef.current !== null) {
      clearInterval(watchIdRef.current as any);
      watchIdRef.current = null;
    }
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
    
    if (driveMarkerRef.current) {
      driveMarkerRef.current.setMap(null);
      driveMarkerRef.current = null;
    }
    
    setIsDriveMode(false);
    setDriveLocation(null);
    setShowDriveCompleteModal(true);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryContent.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // 대표님이 직접 생성하신 실제 구글 앱스 스크립트 웹앱 URL 연동 완료!
      const scriptUrl = process.env.NEXT_PUBLIC_INQUIRY_API_URL || "https://script.google.com/macros/s/AKfycbx6rYLlow4_IARR7ry9q863mVm3d4Fl-Eswhkx41geL1CwYoJiU6gvA737ZYmvg-jUw/exec";
      
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          type: inquiryType,
          content: inquiryContent,
          timestamp: new Date().toISOString()
        })
      });
      
      alert("성공적으로 전송되었습니다! 소중한 의견 감사합니다.");
      setIsInquiryModalOpen(false);
      setInquiryContent('');
    } catch (error) {
      alert("전송에 실패했습니다. 관리자에게 이메일로 직접 문의해주세요.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 뒤로가기 및 닫기 공통 함수 (returnToList가 true일 경우에만 목록 탭으로 이동)
  const closeCourse = (returnToList = false) => {
    setSelectedCourse(null);
    if (returnToList && window.innerWidth < 768) {
      setActiveTab('list');
    }
    if (window.location.hash === '#course') {
      window.history.back(); // 해시 제거
    }
  };

  // 브라우저 뒤로가기 감지 (해시 변경 감지)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash !== '#course') {
        setSelectedCourse(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 코스 선택 시 URL 해시 추가 (히스토리 스택에 쌓기)
  useEffect(() => {
    if (selectedCourse && window.location.hash !== '#course') {
      window.location.hash = 'course';
    }
  }, [selectedCourse]);

  useEffect(() => {
    // 실제 백엔드 API(/api/places)에서 단풍 명소 데이터를 가져옵니다.
    const fetchPlaces = async () => {
      try {
        const response = await fetch(`/api/places?t=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        console.log("Fetched courses:", data);
        setCourses(data);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, []);



  // 지도 초기화
  const initMap = () => {
    if (!window.kakao || !window.kakao.maps || mapLoaded) return;

    window.kakao.maps.load(() => {
      if (!mapContainerRef.current) return;
      const options = {
        center: new window.kakao.maps.LatLng(36.3, 127.8),
        level: 10,
      };
      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      mapRef.current = map;
      
      // 지도 드래그(이동) 시작 시 상단 메뉴 자동으로 숨기기
      window.kakao.maps.event.addListener(map, 'dragstart', () => {
        setIsHeaderVisible(false);
      });
      
      const updateMarkerScale = () => {
        const level = map.getLevel();
        let scale = 1;
        if (level <= 4) scale = 1.8;
        else if (level <= 6) scale = 1.5;
        else if (level <= 8) scale = 1.2;
        else if (level <= 10) scale = 1.0;
        else scale = 0.8;
        
        document.documentElement.style.setProperty('--marker-scale', scale.toString());
        
        // CSS 변수로 줌 아웃 상태를 직접 제어 (새로고침 없이 즉각 반응)
        // 모바일/PC 공통: 레벨 9 이상(축소)이면 이모티콘, 미만(확대)이면 장소명
        if (level >= 9) {
          document.documentElement.style.setProperty('--marker-label-display', 'none');
          document.documentElement.style.setProperty('--marker-dot-display', 'none');
          document.documentElement.style.setProperty('--marker-icon-display', 'flex');
        } else {
          document.documentElement.style.setProperty('--marker-label-display', 'block');
          document.documentElement.style.setProperty('--marker-dot-display', 'block');
          document.documentElement.style.setProperty('--marker-icon-display', 'none');
        }
      };
      updateMarkerScale();
      window.kakao.maps.event.addListener(map, 'zoom_changed', updateMarkerScale);

      // 브라우저 리사이즈 시 지도 크기 재계산 (PC/모바일 전환 시 깨짐 방지)
      window.addEventListener('resize', () => {
        if (mapRef.current) mapRef.current.relayout();
      });

      setMapLoaded(true);
    });
  };

  useEffect(() => {
    if (mapLoaded) return;
    
    // 5초 이상 로딩이 안되면 에러 상태로 간주
    const timeout = setTimeout(() => {
      if (!mapLoaded) {
        setMapLoadError(true);
      }
    }, 5000);

    const interval = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        clearInterval(interval);
        clearTimeout(timeout);
        initMap();
      }
    }, 500);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [mapLoaded]);



  useEffect(() => {
    if (!mapLoaded || !mapRef.current || courses.length === 0) return;

    // 기존 리셋
    polylinesRef.current.forEach(p => p.setMap(null));
    markersRef.current.forEach(m => m.setMap(null));
    polylinesRef.current = [];
    markersRef.current = [];

    const getMarkerIcon = (course: Course) => {
      const text = (course.title + ' ' + course.tags + ' ' + course.theme).toLowerCase();
      if (text.includes('케이블카') || text.includes('모노레일') || text.includes('로프웨이') || text.includes('스카이워크')) return '🚠';
      if (text.includes('산') || text.includes('봉') || text.includes('국립공원') || text.includes('계곡')) return '⛰️';
      if (text.includes('캠핑') || text.includes('피크닉')) return '⛺';
      if (text.includes('핑크뮬리') || text.includes('사진') || text.includes('인생샷')) return '📸';
      if (text.includes('공원') || text.includes('수목원') || text.includes('숲')) return '🌳';
      if (text.includes('궁') || text.includes('돌담길') || text.includes('향교') || text.includes('서원')) return '🏯';
      if (text.includes('바다') || text.includes('해상') || text.includes('해변') || text.includes('호수')) return '🌊';
      return '🍁';
    };

    const fetchRoutesSequentially = async () => {
      // 0. 프리페칭된 정적 캐시(precalculated_paths.json) 로드
      if (!window.__pathsLoaded) {
        try {
          const res = await fetch('/precalculated_paths.json');
          if (res.ok) {
            const data = await res.json();
            Object.keys(data).forEach(id => {
              const { path, distance, duration } = data[id];
              const latLngPath = path.map((p: any) => new window.kakao.maps.LatLng(p.lat, p.lng));
              cachedPathsRef.current[Number(id)] = { path: latLngPath, distance, duration };
            });
            window.__pathsLoaded = true;
            console.log("Precalculated paths loaded successfully, API calls will be skipped!");
          }
        } catch (e) {
          console.warn("Could not load precalculated paths", e);
        }
      }

      if (userLocation && isSortedByDistance) {
        const userContent = document.createElement('div');
        userContent.innerHTML = `
          <div class="relative flex flex-col items-center pointer-events-none animate-bounce" style="z-index: 100;">
            <div class="bg-red-600 border-2 border-white text-white text-xs font-black px-3 py-1 rounded-full shadow-lg mb-1 whitespace-nowrap">
              내 위치 📍
            </div>
            <div class="w-6 h-6 rounded-full bg-red-600 border-[3px] border-white shadow-[0_0_15px_rgba(220,38,38,0.8)] flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        `;
        const userMarker = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
          content: userContent,
          yAnchor: 1
        });
        userMarker.setMap(mapRef.current);
        markersRef.current.push(userMarker);
      }

      for (const course of filteredCourses) {
        const waypoints = parseWaypoints(course.waypoints);
        if (waypoints.length === 0) continue;
        
        const isSelected = selectedCourse?.id === course.id;

        // 1. 마커 그리기
        const icon = getMarkerIcon(course);
        waypoints.forEach((wp, idx) => {
          const isStart = idx === 0;
          const contentNode = document.createElement('div');
          contentNode.innerHTML = `
            <div class="marker-group relative flex flex-col items-center cursor-pointer transition-transform z-10 ${isSelected ? 'scale-125 z-20' : 'hover:scale-110'}" style="transform: scale(var(--marker-scale, 1)); transform-origin: bottom center;">
              
              <!-- 텍스트 레이블 (줌 아웃 시 숨김) -->
              <div class="marker-label bg-slate-900/95 backdrop-blur-sm border-2 ${isStart ? 'border-orange-400' : 'border-rose-400'} text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-full shadow-lg mb-1 whitespace-nowrap transition-all" style="display: var(--marker-label-display, block);">
                <span class="mr-1">${icon}</span>${wp.name}
              </div>
              
              <!-- 줌 인 상태용 단순 점 마커 -->
              <div class="marker-dot w-4 h-4 rounded-full ${isStart ? 'bg-orange-500' : 'bg-rose-500'} border-[2.5px] border-white shadow-md" style="display: var(--marker-dot-display, block);"></div>
              
              <!-- 줌 아웃 시 보이는 전용 아이콘 -->
              <div class="marker-icon-only items-center justify-center w-8 h-8 rounded-full bg-slate-800 border-2 ${isStart ? 'border-orange-400' : 'border-rose-400'} shadow-xl text-lg hover:bg-slate-700 transition-colors absolute bottom-0" style="display: var(--marker-icon-display, none);">
                ${icon}
              </div>
            </div>
          `;
          
          // Hover 이벤트로 텍스트 레이블 강제 표시 (CSS로 하던 것을 JS로 확실히 처리)
          contentNode.addEventListener('mouseenter', () => {
            const label = contentNode.querySelector('.marker-label') as HTMLElement;
            const iconOnly = contentNode.querySelector('.marker-icon-only') as HTMLElement;
            if (label) {
              label.style.display = 'block';
              label.style.position = 'absolute';
              label.style.bottom = '100%';
              label.style.marginBottom = '4px';
              label.style.zIndex = '50';
            }
            if (iconOnly) {
              iconOnly.style.transform = 'scale(1.2)';
              iconOnly.style.zIndex = '50';
            }
          });
          
          contentNode.addEventListener('mouseleave', () => {
            const label = contentNode.querySelector('.marker-label') as HTMLElement;
            const iconOnly = contentNode.querySelector('.marker-icon-only') as HTMLElement;
            if (label) {
              label.style.display = 'var(--marker-label-display, block)';
              label.style.position = 'relative';
              label.style.bottom = 'auto';
              label.style.marginBottom = '4px';
              label.style.zIndex = 'auto';
            }
            if (iconOnly) {
              iconOnly.style.transform = 'none';
              iconOnly.style.zIndex = 'auto';
            }
          });
          contentNode.onclick = () => handleCourseClick(course, waypoints);

          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(wp.lat, wp.lng),
            content: contentNode,
            yAnchor: 1
          });
          customOverlay.setMap(mapRef.current);
          markersRef.current.push(customOverlay);
        });

        // 2. 도로에 밀착된 선(Polyline) 그리기 (2곳 이상일 때만)
        if (waypoints.length > 1) {
          let pathCoordinates: any[] = [];
          let realDistance: number | undefined;
          let realDuration: number | undefined;
          
          if (cachedPathsRef.current[course.id]) {
            pathCoordinates = cachedPathsRef.current[course.id].path;
            drawPolyline(course, pathCoordinates, waypoints, isSelected);
            await new Promise(resolve => setTimeout(resolve, 15));
          } else {
            await new Promise(resolve => setTimeout(resolve, 200));

            try {
              const res = await fetch('/api/directions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ waypoints })
              });
              const naviData = await res.json();
              
              if (naviData.routes && naviData.routes.length > 0) {
                const route = naviData.routes[0];
                realDistance = route.summary.distance;
                realDuration = route.summary.duration;

                const testPolyline = new window.kakao.maps.Polyline({ 
                  path: waypoints.map((wp: any) => new window.kakao.maps.LatLng(wp.lat, wp.lng)) 
                });
                const straightDist = testPolyline.getLength();
                if (realDistance && realDistance > straightDist * 5) {
                  throw new Error("Unreasonable route distance");
                }

                const sections = route.sections;
                sections.forEach((section: any) => {
                  section.roads.forEach((road: any) => {
                    for (let i = 0; i < road.vertexes.length; i += 2) {
                      const lng = road.vertexes[i];
                      const lat = road.vertexes[i+1];
                      pathCoordinates.push(new window.kakao.maps.LatLng(lat, lng));
                    }
                  });
                });
              } else {
                pathCoordinates = waypoints.map((wp: any) => new window.kakao.maps.LatLng(wp.lat, wp.lng));
                const polyline = new window.kakao.maps.Polyline({ path: pathCoordinates });
                const straightDist = polyline.getLength();
                realDistance = straightDist * 1.3;
                realDuration = (realDistance / 40000) * 3600;
              }

              cachedPathsRef.current[course.id] = { path: pathCoordinates, distance: realDistance, duration: realDuration };
              drawPolyline(course, pathCoordinates, waypoints, isSelected);

            } catch (e) {
              console.error("Directions API failed, using fallback", e);
              pathCoordinates = waypoints.map((wp: any) => new window.kakao.maps.LatLng(wp.lat, wp.lng));
              const polyline = new window.kakao.maps.Polyline({ path: pathCoordinates });
              const straightDist = polyline.getLength();
              const fallbackDistance = straightDist * 1.3;
              const fallbackDuration = (fallbackDistance / 40000) * 3600;
              
              cachedPathsRef.current[course.id] = { path: pathCoordinates, distance: fallbackDistance, duration: fallbackDuration };
              drawPolyline(course, pathCoordinates, waypoints, isSelected);
            }
          }
        }
      }
    };

    fetchRoutesSequentially();

  }, [courses, mapLoaded, activeTheme, activeRegion, selectedCourse, searchQuery, isSortedByDistance, favorites, userLocation, activeCuration]);

  // 단풍 전선 CG: 현재 날짜 기준으로 firstFoliage가 지난 장소에 단풍색 원 자동 각인
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || courses.length === 0) return;

    // 기존 단풍 원 지우기
    foliageCirclesRef.current.forEach(c => c.setMap(null));
    foliageCirclesRef.current = [];

    const now = foliageTestDate ? new Date(foliageTestDate) : new Date();
    const year = now.getFullYear();

    // 날짜 문자열 파싱 헬퍼 (MM.DD 형식)
    const parseFoliageDate = (dateStr: string, y: number): Date | null => {
      if (!dateStr || dateStr === '미정') return null;
      const parts = dateStr.split('.');
      if (parts.length !== 2) return null;
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      if (isNaN(month) || isNaN(day)) return null;
      return new Date(y, month - 1, day);
    };

    courses.forEach(course => {
      const wps = parseWaypoints(course.waypoints);
      if (wps.length === 0) return;

      const firstDate = parseFoliageDate(course.firstFoliage || '', year);
      const peakDate = parseFoliageDate(course.peakFoliage || '', year);
      if (!firstDate) return;

      if (now < firstDate) return; // 아직 단풍 시작 안함

      // 단풍 진행단계 판단
      const isPeak = peakDate && now >= peakDate;
      const daysSinceStart = Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      const intensity = Math.min(daysSinceStart / 14, 1); // 14일에 걸쳐 증강

      // 단풍 적색/주황색 채우기 원 (Kakao Circle)
      const circle = new window.kakao.maps.Circle({
        center: new window.kakao.maps.LatLng(wps[0].lat, wps[0].lng),
        radius: isPeak ? 22000 : 15000 + intensity * 5000,
        strokeWeight: 0,
        strokeColor: 'transparent',
        strokeOpacity: 0,
        fillColor: isPeak ? '#dc2626' : '#f97316',
        fillOpacity: isPeak ? 0.45 : 0.2 + intensity * 0.2,
      });
      circle.setMap(mapRef.current);
      foliageCirclesRef.current.push(circle);
    });
  }, [mapLoaded, courses, foliageTestDate]);

  // 코스 목록이 변경될 때(초기 로드, 검색, 테마 필터 등) 검색된 코스들이 모두 화면에 들어오도록 지도 이동 (자동 줌/패닝)
  useEffect(() => {
    const prevSelected = prevSelectedCommonRef.current;
    prevSelectedCommonRef.current = selectedCourse;

    if (mapLoaded && mapRef.current && filteredCourses.length > 0 && !selectedCourse && !isSortedByDistance) {
      // 코스 상세 팝업이 열려있다가 닫히는(selectedCourse가 null이 되는) 시점에는 지도 위치를 리셋하지 않고 현재 중심을 유지
      if (prevSelected !== null) {
        return;
      }

      if (activeRegion !== 'all' && !searchQuery) {
        // 지역 필터일 경우 지정된 고정 뷰로 이동
        const view = REGION_MAP_VIEWS[activeRegion];
        if (view) {
          mapRef.current.setCenter(new window.kakao.maps.LatLng(view.lat, view.lng));
          mapRef.current.setLevel(view.level);
        }
      } else {
        // 전체보기, 검색, 테마 필터 등은 기존처럼 바운딩 처리
        const bounds = new window.kakao.maps.LatLngBounds();
        let hasValidCoords = false;
        filteredCourses.forEach(course => {
          const wps = parseWaypoints(course.waypoints);
          if (wps.length > 0) {
            bounds.extend(new window.kakao.maps.LatLng(wps[0].lat, wps[0].lng));
            hasValidCoords = true;
          }
        });
        
        if (hasValidCoords) {
          if (filteredCourses.length === 1) {
             const wps = parseWaypoints(filteredCourses[0].waypoints);
             mapRef.current.setCenter(new window.kakao.maps.LatLng(wps[0].lat, wps[0].lng));
             mapRef.current.setLevel(7);
          } else {
             const paddingLeft = window.innerWidth > 768 ? 100 : 50; // 패딩을 줄여서 지도가 중앙에 더 가깝게 보이도록 수정
             mapRef.current.setBounds(bounds, 50, 50, 50, paddingLeft);
          }
        }
      }
    }
  }, [searchQuery, activeTheme, activeRegion, mapLoaded, selectedCourse, isSortedByDistance, courses.length, activeCuration]); // courses.length를 추가하여 초기 로딩 완료 시점에 자동 패닝되도록 수정

  // 거리순 정렬 시 내 위치로 자동 패닝
  useEffect(() => {
    if (mapLoaded && mapRef.current && isSortedByDistance && userLocation) {
      const bounds = new window.kakao.maps.LatLngBounds();
      bounds.extend(new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng));
      bounds.extend(new window.kakao.maps.LatLng(userLocation.lat + 0.005, userLocation.lng + 0.005));
      bounds.extend(new window.kakao.maps.LatLng(userLocation.lat - 0.005, userLocation.lng - 0.005));
      
      const paddingLeft = window.innerWidth > 768 ? 450 : 50;
      mapRef.current.setBounds(bounds, 50, 50, 50, paddingLeft);
    }
  }, [isSortedByDistance, userLocation, mapLoaded]);

  // 주행 모드 내 위치 마커 렌더링
  useEffect(() => {
    if (mapLoaded && mapRef.current && isDriveMode && driveLocation) {
      const moveLatLon = new window.kakao.maps.LatLng(driveLocation.lat, driveLocation.lng);
      
      if (!driveMarkerRef.current) {
        const carContent = document.createElement('div');
        carContent.innerHTML = `
          <div class="relative flex flex-col items-center pointer-events-none" style="z-index: 100;">
            <div class="w-12 h-12 bg-white rounded-full border-4 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.6)] flex items-center justify-center animate-pulse">
              <span class="text-2xl">🚙</span>
            </div>
          </div>
        `;
        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: moveLatLon,
          content: carContent,
          yAnchor: 0.5
        });
        customOverlay.setMap(mapRef.current);
        driveMarkerRef.current = customOverlay;
      } else {
        driveMarkerRef.current.setPosition(moveLatLon);
      }
    }
  }, [driveLocation, isDriveMode, mapLoaded]);

  const drawPolyline = (course: Course, path: any[], waypoints: ParsedWaypoint[], isSelected: boolean) => {
    if (!mapRef.current) return;
    
    const polyline = new window.kakao.maps.Polyline({
      path: path,
      strokeWeight: isSelected ? 10 : 6,
      strokeColor: isSelected ? '#EF4444' : '#3B82F6', // 선택 시 진한 빨강, 미선택 시 파랑
      strokeOpacity: isSelected ? 1 : 0.8,
      strokeStyle: 'solid',
      zIndex: isSelected ? 10 : 1
    });
    polyline.setMap(mapRef.current);
    polylinesRef.current.push(polyline);

    window.kakao.maps.event.addListener(polyline, 'click', () => {
      handleCourseClick(course, waypoints);
    });
  };

  const scrollToCourseList = () => {
    const el = document.getElementById('course-list-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCourseClick = (course: Course, waypoints: ParsedWaypoint[]) => {
    setSelectedCourse(course);
    setIsSheetMinimized(false); // 코스 선택 시 처음에 바텀시트를 활성화
    if (window.innerWidth < 768) {
      setActiveTab('map');
    }
    
    if (mapRef.current && waypoints.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      waypoints.forEach(wp => bounds.extend(new window.kakao.maps.LatLng(wp.lat, wp.lng)));
      
      const paddingLeft = window.innerWidth > 768 ? 450 : 50;
      mapRef.current.setBounds(bounds, 100, 100, 50, paddingLeft);
    }
  };

  const findMyLocation = () => {
    if (!navigator.geolocation) {
      alert("현재 브라우저에서는 위치 정보를 지원하지 않습니다.");
      return;
    }
    setIsLocatingMap(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      if (mapRef.current) {
        const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
        const bounds = new window.kakao.maps.LatLngBounds();
        bounds.extend(moveLatLon);
        bounds.extend(new window.kakao.maps.LatLng(lat + 0.005, lng + 0.005));
        bounds.extend(new window.kakao.maps.LatLng(lat - 0.005, lng - 0.005));
        
        const paddingLeft = window.innerWidth > 768 ? 450 : 50;
        mapRef.current.setBounds(bounds, 50, 50, 50, paddingLeft);
        
        if (myLocationMarkerRef.current) {
          myLocationMarkerRef.current.setMap(null);
        }
        
        const userContent = document.createElement('div');
        userContent.innerHTML = `
          <div class="relative flex flex-col items-center pointer-events-none animate-bounce" style="z-index: 100;">
            <div class="bg-red-600 border-2 border-white text-white text-xs font-black px-3 py-1 rounded-full shadow-lg mb-1 whitespace-nowrap">
              내 위치 📍
            </div>
            <div class="w-6 h-6 rounded-full bg-red-600 border-[3px] border-white shadow-[0_0_15px_rgba(220,38,38,0.8)] flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        `;
        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: moveLatLon,
          content: userContent,
          yAnchor: 1
        });
        customOverlay.setMap(mapRef.current);
        myLocationMarkerRef.current = customOverlay;
      }
      setIsLocatingMap(false);
    }, () => {
      alert("위치 정보를 가져올 수 없습니다. 브라우저 설정에서 위치 권한을 허용해주세요!");
      setIsLocatingMap(false);
    });
  };

  const renderCourseDetails = (isDesktop: boolean) => {
    if (!selectedCourse) return null;
    return (
      <div className="space-y-4">
        {/* 뒤로가기 버튼 */}
        <button 
          onClick={() => closeCourse(false)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2 font-bold w-fit bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50"
        >
          <span>←</span> <span>목록으로 돌아가기</span>
        </button>

        {/* 코스 풍경 사진 (이미지 URL이 있을 경우에만 렌더링) */}
        {selectedCourse.imageUrl && (
          <div className="w-full h-32 md:h-48 rounded-2xl overflow-hidden mb-4 border border-slate-700 bg-slate-800 relative shadow-inner">
            <img 
              src={selectedCourse.imageUrl} 
              alt={selectedCourse.title}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                // 외부 이미지(Unsplash 등)가 404 에러 시 로컬 디폴트 이미지로 대체
                e.currentTarget.src = "/images/hero.png";
              }}
            />
          </div>
        )}
        
        <div className="flex gap-2 flex-wrap">
          {selectedCourse.tags.split(' ').map((tag, idx) => (
            <span key={idx} className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded-md text-xs font-bold">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-start gap-2">
          <h2 className="text-2xl font-black text-white leading-tight flex-1">
            {selectedCourse.title}
          </h2>
          <button 
            onClick={(e) => toggleFavorite(selectedCourse.id, e)}
            className="text-2xl hover:scale-110 active:scale-95 transition-transform p-1"
            title={favorites.includes(selectedCourse.id) ? "찜 해제" : "찜하기"}
          >
            {favorites.includes(selectedCourse.id) ? '❤️' : '🤍'}
          </button>
        </div>
        
        <p className="text-slate-300 text-sm leading-relaxed">
          {selectedCourse.description}
        </p>
        
        <div className="flex gap-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">🍁 첫단풍</span>
            <span className="font-bold text-orange-400">
              {formatDate(selectedCourse.firstFoliage || "미정")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">👑 절정기</span>
            <span className="font-bold text-rose-500">
              {formatDate(selectedCourse.peakFoliage || "미정")}
            </span>
          </div>
        </div>

        {/* 🌤️ 실시간 날씨 및 미세먼지 연동 */}
        {(() => {
          const wps = parseWaypoints(selectedCourse.waypoints);
          if (wps.length > 0) {
            return <WeatherInfo lat={wps[0].lat} lng={wps[0].lng} />;
          }
          return null;
        })()}

        {/* 🏔️ 단풍 명소 상세 안내 및 편의 정보 (주차장, 난이도, 접근성) */}
        <div className="bg-slate-800/20 backdrop-blur-md border border-slate-700/40 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex justify-between items-center border-b border-slate-700/30 pb-2">
            <span className="text-xs font-black text-slate-400 flex items-center gap-1">
              ℹ️ 코스 및 편의 정보
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-slate-200">
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded font-black shrink-0">
                난이도
              </span>
              <span className="font-semibold">{selectedCourse.difficulty || '쉬움'}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-200">
              <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-black shrink-0">
                주차장
              </span>
              <span className="font-semibold">{selectedCourse.parking || '인근 주차장 이용 가능'}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-200">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black shrink-0">
                접근성
              </span>
              <span className="font-semibold">{selectedCourse.accessibility || '유모차 및 휠체어 진입 가능'}</span>
            </div>
          </div>
        </div>

        {/* 💸 애드센스 광고 영역 - 첫단풍/절정기 및 편의 정보 하단으로 이동 */}
        <div className="w-full h-[250px] bg-slate-800/30 backdrop-blur-md border border-slate-700/40 rounded-2xl overflow-hidden shadow-lg mt-2 shrink-0">
          <AdBanner 
            dataAdSlot="1273604121" 
            dataAdFormat="auto" 
            dataFullWidthResponsive={true} 
          />
        </div>

        {/* 근처 단풍 축제 패널 - visitkorea 실데이터 */}
        <FestivalPanel course={selectedCourse} courseName={selectedCourse.title} />

        {/* 내비게이션 버튼 - 모바일에서만 노출 */}
        <div className="grid grid-cols-2 gap-3 pt-4 md:hidden">
          <button 
            onClick={() => {
              const wps = parseWaypoints(selectedCourse.waypoints);
              if (wps.length > 0) {
                const dest = wps[wps.length - 1];
                window.open(`tmap://search?name=${encodeURIComponent(dest.name)}`, '_blank');
              }
            }}
            className="w-full bg-[#111111] border border-slate-600 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <span className="text-lg">🧭</span> 티맵 안내
          </button>
          <button 
            onClick={() => {
              const wps = parseWaypoints(selectedCourse.waypoints);
              if (wps.length > 0) {
                const dest = wps[wps.length - 1];
                if (window.Kakao) {
                  if (!window.Kakao.isInitialized()) {
                    window.Kakao.init(KAKAO_APP_KEY);
                  }
                  window.Kakao.Navi.start({
                    name: dest.name,
                    x: dest.lng,
                    y: dest.lat,
                    coordType: 'wgs84'
                  });
                } else {
                  window.open(`https://map.kakao.com/link/to/${encodeURIComponent(dest.name)},${dest.lat},${dest.lng}`, '_blank');
                }
              }
            }}
            className="w-full bg-[#FEE500] hover:bg-[#F4DC00] text-[#191919] font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <span className="text-lg">🚕</span> 카카오내비
          </button>
        </div>
        
        {/* 쿠팡 파트너스 배너 (수익화 - 등산/피크닉 용품) */}
        <div className="mt-6 mb-2 hidden md:block">
          <a 
            href="https://link.coupang.com/a/eaOsmrTrTU" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-transform relative group border border-slate-700"
          >
            {/* 고품질 등산용품 배경 이미지 */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center"></div>
            
            {/* 오버레이 그라데이션 (텍스트가 잘 보이도록 어둡게 처리) */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
            
            <div className="flex items-center justify-between relative z-10 p-5">
              <div>
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-sm tracking-wider mb-2 inline-block shadow-md">HOT 특가</span>
                <p className="text-white font-black text-base mb-1 drop-shadow-md">가을 산행 필수템 총집합! 🥾</p>
                <p className="text-slate-300 text-xs font-medium">등산화 / 피크닉 돗자리 / 보온병 로켓배송</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-md group-hover:bg-rose-500 transition-colors border border-white/30">
                ➔
              </div>
            </div>
            <p className="text-[8px] text-white/50 absolute bottom-1 right-2 z-10 bg-black/40 px-1 rounded">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
          </a>
        </div>

        {/* 카카오톡 공유 버튼 */}
        <button 
          onClick={() => {
            if (!window.Kakao) {
              alert("카카오 SDK가 아직 로드되지 않았습니다.");
              return;
            }
            if (!window.Kakao.isInitialized()) {
              window.Kakao.init(KAKAO_APP_KEY);
            }
            
            const url = "https://drive.weknews.com";
            
            window.Kakao.Share.sendDefault({
              objectType: 'feed',
              content: {
                title: `[Maple Map] ${selectedCourse.title}`,
                description: selectedCourse.description,
                imageUrl: selectedCourse.imageUrl || '/images/hero.png',
                link: {
                  mobileWebUrl: url,
                  webUrl: url,
                },
              },
              buttons: [
                {
                  title: '코스 자세히 보기',
                  link: {
                    mobileWebUrl: url,
                    webUrl: url,
                  },
                },
              ],
            });
          }}
          className="w-full mt-3 bg-[#FEE500] hover:bg-[#F4DC00] text-[#191919] font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <span className="text-xl">💬</span> 카카오톡 공유하기
        </button>
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 font-bold z-[99999]">
        <span className="text-4xl animate-spin mb-4">🌀</span>
        <p>단풍 맵 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full flex flex-col md:flex-row bg-slate-950 overflow-hidden" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 이니셜 D 감성의 메인 스플래시 화면 */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40, transition: { duration: 0.6, ease: "easeInOut" } }}
            className="absolute inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-70 scale-105 pointer-events-none"
              style={{ backgroundImage: "url('/images/hero.png')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none"></div>
            
            <div className="relative z-[999] text-center px-6 mt-32 pointer-events-auto">
              <span className="inline-block bg-indigo-600 text-white font-black px-5 py-2 rounded-full text-sm mb-6 shadow-lg shadow-indigo-500/50">
                전국 감성 단풍 명소
              </span>
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] italic">
                MAPLE MAP
              </h1>
              <p className="text-slate-200 font-bold mb-12 drop-shadow-md text-lg">
                가을의 정취를 느끼며<br/>아름다운 단풍길을 걸어보세요
              </p>
              <button 
                onClick={() => setShowSplash(false)}
                className="relative z-[1000] cursor-pointer bg-white text-slate-900 font-black text-xl px-12 py-5 rounded-full shadow-2xl hover:scale-105 hover:bg-slate-100 transition-all border-4 border-slate-200"
              >
                단풍 명소 둘러보기 🍁
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Script 
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={initMap}
      />
      <Script 
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" 
        strategy="lazyOnload"
      />

      {/* 스플래시 화면이 끝난 후에만 구글 애드센스 로드 (첫 화면 하단 앵커 광고 방지) */}
      {!showSplash && (
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6635245275061755"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {/* 1. 모바일 전용 세로형 스크롤 랜딩 레이아웃 (선택된 코스가 없고 리스트 탭일 때 노출) */}
      {isMobile && activeTab === 'list' && (
        <div className="w-full h-full overflow-y-auto bg-slate-950 flex flex-col scroll-smooth z-[40]">
          {/* 모바일 상단 고정 헤더 */}
          <header className="sticky top-0 w-full z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-900/50 flex justify-between items-center h-16 px-4 shrink-0">
            <span className="font-black italic text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-400 drop-shadow-[0_2px_8px_rgba(249,115,22,0.3)]">MAPLE MAP</span>
            <button 
              onClick={() => setIsInquiryModalOpen(true)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
            >
              제안 및 문의 💡
            </button>
          </header>

          {/* 히어로 섹션 */}
          <div className="relative w-full h-[50vh] min-h-[340px] flex items-center justify-center overflow-hidden shrink-0">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-85 scale-105 pointer-events-none"
              style={{ backgroundImage: "url('/images/hero.png')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/85"></div>
            
            <div className="relative z-10 text-center px-6 max-w-md flex flex-col items-center">
              <div className="inline-block bg-orange-500/15 border border-orange-500/30 rounded-full px-4 py-1 mb-4 backdrop-blur-md">
                <span className="text-[10px] font-bold text-orange-400 tracking-widest uppercase">전국 감성 단풍 명소</span>
              </div>
              <h1 className="text-5xl font-black italic text-white mb-3 tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                MAPLE MAP
              </h1>
              <p className="text-slate-300 text-sm font-semibold mb-8 max-w-[240px] drop-shadow-md leading-relaxed">
                가을의 정취를 느끼며<br/>아름다운 단풍길을 걸어보세요
              </p>
              <button 
                onClick={scrollToCourseList}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-sm px-9 py-3.5 rounded-full flex items-center gap-2 shadow-[0_4px_20px_rgba(249,115,22,0.3)] transition-all group active:scale-95"
              >
                단풍 명소 둘러보기 <span className="group-hover:translate-x-1 transition-transform">🍁</span>
              </button>
            </div>
          </div>

          {/* PWA 앱 설치 */}
          <div className="px-4 mt-2">
            <PWAInstallButton />
          </div>

          {/* 벤토 테마 카드 */}
          <div className="px-4 py-4 shrink-0">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-1.5">
              <span className="text-orange-500">✨</span> 상황별 맞춤 단풍 코스
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {/* 명예의 전당 (에디터 추천) */}
              <button 
                onClick={() => {
                  setActiveCuration('ranking');
                  setActiveTheme('all');
                  setActiveRegion('all');
                  setSearchQuery('');
                  setIsSortedByDistance(false);
                  scrollToCourseList();
                }}
                className={`relative overflow-hidden rounded-2xl aspect-[4/3] border p-4 text-left flex flex-col justify-end transition-all active:scale-[0.98] group ${
                  activeCuration === 'ranking' 
                    ? 'border-orange-500 shadow-lg shadow-orange-500/20' 
                    : 'border-slate-800/80 hover:border-orange-500/30'
                }`}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-700 z-0"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-[1]"></div>
                <div className="relative z-10">
                  <span className="text-2xl mb-1 block group-hover:animate-bounce transition-all">👑</span>
                  <h3 className="text-xs font-bold text-white">명예의 전당</h3>
                  <p className="text-[9px] text-slate-300 mt-0.5">에디터 추천 가을 명소</p>
                </div>
              </button>
              
              {/* 나머지 CURATION_CATEGORIES */}
              {CURATION_CATEGORIES.map(cat => {
                const iconMapImg: Record<string, string> = {
                  'peak': 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=600&auto=format&fit=crop',
                  'pink': 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop',
                  'city': 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600&auto=format&fit=crop',
                  'cable': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop'
                };
                return (
                  <button 
                    key={cat.id}
                    onClick={() => {
                      setActiveCuration(cat.id);
                      setActiveTheme('all');
                      setActiveRegion('all');
                      setSearchQuery('');
                      setIsSortedByDistance(false);
                      scrollToCourseList();
                    }}
                    className={`relative overflow-hidden rounded-2xl aspect-[4/3] border p-4 text-left flex flex-col justify-end transition-all active:scale-[0.98] group ${
                      activeCuration === cat.id 
                        ? 'border-orange-500 shadow-lg shadow-orange-500/20' 
                        : 'border-slate-800/80 hover:border-orange-500/30'
                    }`}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-700 z-0"
                      style={{ backgroundImage: `url("${iconMapImg[cat.id] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop'}")` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-[1]"></div>
                    <div className="relative z-10">
                      <span className="text-2xl mb-1 block group-hover:animate-bounce transition-all">{cat.icon}</span>
                      <h3 className="text-xs font-bold text-white">{cat.name}</h3>
                      <p className="text-[9px] text-slate-300 mt-0.5">테마 맞춤 추천</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 코스 탐색 섹션 */}
          <div id="course-list-section" className="px-4 py-4 bg-slate-950 scroll-mt-16">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-1.5">
              <span>📍</span> 명소 코스 탐색
            </h2>

            {/* 검색창 */}
            <form 
              onSubmit={(e) => { e.preventDefault(); }}
              className="relative mb-3 w-full"
            >
              <input 
                type="text" 
                placeholder="지역, 코스명 검색 (예: 설악산)" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  closeCourse();
                  if (isMobile) {
                    setActiveTab('list');
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600 text-sm"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); closeCourse(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black"
                >
                  ✕
                </button>
              ) : (
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              )}
            </form>

            {/* 지역 필터 칩 */}
            <div className="flex overflow-x-auto gap-1.5 pb-2 scrollbar-hide">
              {REGIONS.map((region) => (
                <button 
                  key={region.id}
                  onClick={() => {
                    setActiveRegion(region.id);
                    setActiveCuration(null);
                  }}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    activeRegion === region.id 
                      ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-500/20' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>

            {/* 정렬 및 메타 정보 */}
            <div className="flex justify-between items-center mb-4 mt-2">
              <span className="text-xs font-bold text-slate-400">
                총 {filteredCourses.length}개 명소 발견
              </span>
              <button 
                onClick={handleSortByDistance}
                disabled={isLocating}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all border flex items-center gap-1 ${
                  isSortedByDistance 
                    ? 'bg-red-600 text-white border-red-500' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                }`}
              >
                {isLocating ? '위치 파악중...' : `📍 ${isSortedByDistance ? '정렬 해제' : '내 주변순'}`}
              </button>
            </div>

            {/* 코스 카드 목록 */}
            <div className="space-y-4">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <div 
                    key={course.id}
                    onClick={() => {
                      const wps = parseWaypoints(course.waypoints);
                      handleCourseClick(course, wps);
                    }}
                    className="bg-slate-900/60 border border-slate-900 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all flex flex-col active:scale-[0.99] cursor-pointer"
                  >
                    {course.imageUrl ? (
                      <div 
                        className="w-full h-36 bg-cover bg-center relative"
                        style={{ backgroundImage: `url("${course.imageUrl}")` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                        {activeCuration === 'ranking' && (
                          <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded shadow-md">
                            {index + 1}위
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-24 bg-slate-850 flex items-center justify-center text-3xl">
                        🍁
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="text-white font-bold text-base leading-tight">
                            {course.title}
                          </h3>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(course.id, e); }}
                            className="text-lg p-1 -mt-1"
                          >
                            {favorites.includes(course.id) ? '❤️' : '🤍'}
                          </button>
                        </div>
                        <p className="text-slate-400 text-xs line-clamp-2 mb-3">
                          {course.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 pt-2.5 border-t border-slate-900">
                        <span className="bg-slate-950 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <span>🍁 첫단풍</span> {formatDate(course.firstFoliage || "미정")}
                        </span>
                        <span className="bg-slate-950 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <span>👑 절정기</span> {formatDate(course.peakFoliage || "미정")}
                        </span>
                        {typeof course._distanceToUser === 'number' && (
                          <span className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/20">
                            약 {course._distanceToUser.toFixed(1)}km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-600 text-sm font-bold">
                  조건에 맞는 코스가 없습니다 🥲
                </div>
              )}
            </div>
          </div>

          {/* 하단 푸터 */}
          <footer className="bg-slate-950 border-t border-slate-900 py-8 px-4 text-center mt-auto shrink-0">
            <span className="font-extrabold italic text-sm text-slate-700 block mb-1">MAPLE MAP</span>
            <p className="text-slate-600 text-[9px]">© 2026 MAPLE MAP. Autumn Breeze.</p>
          </footer>
        </div>
      )}

      {/* 2. 모바일 코스 상세 맵 레이아웃 (코스 선택 시 노출할 뒤로가기 버튼) */}
      {isMobile && selectedCourse && (
        <div className="absolute top-4 left-4 z-20">
          <button 
            onClick={() => closeCourse(true)}
            className="flex items-center gap-1.5 text-white font-bold text-xs bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
          >
            <span>←</span> <span>목록으로 돌아가기</span>
          </button>
        </div>
      )}

      {/* 지도 컨트롤 (확대/축소/내위치) */}
      <div className={`absolute z-20 top-1/2 -translate-y-1/2 right-4 md:transform-none md:top-auto md:bottom-20 md:right-auto md:left-[424px] flex flex-col gap-2 shadow-[0_5px_15px_rgba(0,0,0,0.3)] ${(!isMobile || activeTab === 'map') ? 'flex' : 'hidden'}`}>
        <button 
          onClick={findMyLocation}
          disabled={isLocatingMap}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:text-sky-600 transition-colors shadow-sm"
          title="내 위치"
        >
          {isLocatingMap ? <span className="animate-spin text-sm">🌀</span> : "🎯"}
        </button>
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
          <button 
            onClick={() => mapRef.current?.setLevel(mapRef.current.getLevel() - 1)}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-white hover:text-sky-600 font-black text-xl border-b border-slate-200 transition-colors"
          >
            +
          </button>
          <button 
            onClick={() => mapRef.current?.setLevel(mapRef.current.getLevel() + 1)}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-white hover:text-sky-600 font-black text-2xl transition-colors"
          >
            −
          </button>
        </div>
      </div>

      {/* 가상 주행 모드 HUD */}
      {isDriveMode && (
        <div className="absolute top-0 left-0 w-full p-4 z-50 pointer-events-none flex flex-col justify-between h-full pb-8">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-2xl pointer-events-auto">
            <h2 className="text-white font-black text-xl mb-1">{selectedCourse?.title || '코스 미리보기'}</h2>
            <p className="text-sky-400 font-bold text-sm">코스를 따라 가상 주행을 진행 중입니다...</p>
          </div>
          <div className="pointer-events-auto flex gap-4 md:w-[400px] md:mx-auto">
            <button 
              onClick={() => {
                if(mapRef.current && driveLocation) {
                  mapRef.current.panTo(new window.kakao.maps.LatLng(driveLocation.lat, driveLocation.lng));
                  mapRef.current.setLevel(3);
                }
              }}
              className="w-16 h-16 bg-white text-sky-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)] text-2xl font-black border-4 border-slate-200 active:scale-95 transition-transform shrink-0"
            >
              📍
            </button>
            <button 
              onClick={stopDriveMode}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] active:scale-95 transition-all text-xl border-2 border-red-400"
            >
              미리보기 종료 ⏹️
            </button>
          </div>
        </div>
      )}

      {/* 완주 축하 팝업 */}
      <AnimatePresence>
        {showDriveCompleteModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[9999] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/4 left-1/4 animate-bounce text-6xl drop-shadow-2xl">🎉</div>
               <div className="absolute top-1/3 right-1/4 animate-ping text-5xl drop-shadow-2xl">✨</div>
               <div className="absolute bottom-1/3 left-1/3 animate-pulse text-4xl drop-shadow-2xl">🎊</div>
            </div>
            
            <motion.div 
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
              className="bg-slate-800 border border-slate-600 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative z-10"
            >
              <div className="text-6xl mb-4 drop-shadow-lg">🔮</div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">수고하셨습니다!</h2>
              <p className="text-sky-400 font-bold text-lg mb-6">코스 미리보기를 완료했습니다</p>
              
              <div className="bg-gradient-to-b from-indigo-900/50 to-purple-900/50 rounded-2xl p-5 mb-6 border border-purple-500/30">
                <p className="text-purple-300 text-sm mb-2 font-bold tracking-widest">MYSTIC SAJU</p>
                <p className="text-xl font-black text-white drop-shadow-md leading-tight">
                  단풍놀이 가기 전,<br/>오늘 당신의 운명은?
                </p>
              </div>
              
              <button 
                onClick={() => {
                  window.open('https://mystic.weknews.com', '_blank');
                  setShowDriveCompleteModal(false);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-500/30 text-lg flex items-center justify-center gap-2"
              >
                <span>오늘 당신의 운명을 시험해 보세요!</span>
              </button>
              <button 
                onClick={() => setShowDriveCompleteModal(false)}
                className="mt-4 text-slate-400 hover:text-white text-sm font-semibold transition-colors underline underline-offset-4"
              >
                다음에 할게요
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PC 사이드바 */}
      {!isMobile && (
        <div className={`
          md:relative md:w-[400px] md:h-full md:bg-slate-900 md:border-r md:border-slate-800 md:flex md:flex-col md:p-6 md:z-20
          hidden md:flex
          ${isDriveMode ? 'hidden md:hidden' : ''}
        `}>
        <div className="flex justify-between items-center mb-3 md:mb-6 shrink-0 w-full">
          <h1 className="text-xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🍁</span> Maple Map
          </h1>
          <button 
            onClick={() => setIsInquiryModalOpen(true)}
            className="bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shrink-0"
          >
            <span>제안 및 문의</span><span>💡</span>
          </button>
        </div>

        <div className="relative mb-4 w-full shrink-0">
          <input 
            type="text" 
            placeholder="지역, 코스명, 태그 검색 (예: 북한강)" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              closeCourse();
              if (e.target.value.trim() !== '') {
                setIsHeaderVisible(false); // 모바일에서 메뉴 접기
              }
            }}
            className="w-full bg-slate-800/80 border border-slate-700 text-white pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-inner"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                closeCourse();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-slate-700/80 hover:bg-slate-600 rounded-full w-6 h-6 flex items-center justify-center transition-colors text-[10px] font-black"
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          ) : (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🔍</span>
          )}

          <div className="flex justify-end mt-2 px-1">
            <button 
              onClick={handleSortByDistance}
              disabled={isLocating}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all border shadow-sm flex items-center gap-1 ${
                isLocating
                  ? 'bg-slate-700 text-slate-400 border-slate-600 cursor-wait'
                  : isSortedByDistance 
                    ? 'bg-red-500 text-white border-red-400 shadow-red-500/30' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isLocating ? (
                <>
                  <span className="animate-spin mr-1">🌀</span> 위치 파악 중...
                </>
              ) : (
                <>📍 {isSortedByDistance ? '내 주변순 정렬 해제' : '내 주변순 정렬'}</>
              )}
            </button>
          </div>

          {/* 검색결과 자동완성 드롭다운 (모바일 전용) - fixed로 항상 노출 */}
          <AnimatePresence>
            {(searchQuery || isSortedByDistance || activeTheme === 'favorites' || activeCuration !== null) && !selectedCourse && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed left-0 right-0 top-[120px] mx-3 bg-slate-800/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-[200] max-h-[55vh] overflow-y-auto custom-scrollbar md:hidden"
              >
                {filteredCourses.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <p className="text-xs text-indigo-400 font-bold px-2 pt-2 pb-1">총 {filteredCourses.length}개의 코스 발견!</p>
                    {filteredCourses.map((course, index) => (
                      <div
                        key={course.id}
                        onClick={() => {
                           const wps = parseWaypoints(course.waypoints);
                           handleCourseClick(course, wps);
                        }}
                        className="w-full text-left p-2 hover:bg-slate-700 rounded-xl transition-colors flex gap-3 items-center active:scale-[0.98] cursor-pointer"
                      >
                        {course.imageUrl ? (
                          <div className="w-12 h-12 rounded-lg bg-slate-700 bg-cover bg-center shrink-0 border border-slate-600" style={{ backgroundImage: `url("${course.imageUrl}")` }}></div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-700 shrink-0 flex items-center justify-center text-xl border border-slate-600">🚗</div>
                        )}
                        <div className="flex-1 overflow-hidden pr-2">
                          <div className="text-sm font-bold text-white truncate flex items-center gap-1">
                            {activeCuration === 'ranking' && (
                              <span className="text-lg mr-1 drop-shadow-md">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-sm">{index + 1}위</span>}
                              </span>
                            )}
                            {favorites.includes(course.id) && <span className="text-[10px]">❤️</span>}
                            {course.title}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{course.description}</div>
                          {course._distanceToUser !== undefined && (
                            <div className="text-[10px] text-red-400 font-bold mt-0.5">
                              현재 위치에서 약 {course._distanceToUser.toFixed(1)}km
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(course.id, e);
                          }}
                          className="p-2 text-lg hover:scale-110 active:scale-95 transition-transform"
                        >
                          {favorites.includes(course.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-sm font-bold">
                    검색 결과가 없습니다 🥲
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 사이드 메뉴 플로팅 버튼 (헤더가 숨겨졌을 때만 우측에 나타남) */}
        <AnimatePresence>
          {!selectedCourse && !isHeaderVisible && (
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => setIsHeaderVisible(true)}
              className="fixed top-6 right-4 md:absolute md:top-auto md:bottom-8 md:right-4 z-50 md:z-20 bg-indigo-600/95 backdrop-blur-md text-white px-5 py-3.5 rounded-full shadow-[0_4px_20px_rgba(79,70,229,0.4)] border border-indigo-500 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span className="text-lg font-black leading-none">☰</span>
              <span className="text-sm font-bold tracking-tight">테마 코스</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* === SCROLLABLE WRAPPER START === */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative pr-2 -mr-2">
        
        {/* 선택된 코스가 없을 때만 헤더 요소들(배너, 테마필터)을 보여줍니다 */}
        <AnimatePresence initial={false}>
          {!selectedCourse && isHeaderVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 0 }}
              exit={{ height: 0, opacity: 0, marginTop: -16 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden w-full flex flex-col shrink-0 relative"
            >

              {/* 자사 서비스(씨맵) 크로스 프로모션 배너 및 PWA 설치 */}
              <div className="mb-6">
                <a 
                  href="https://drive.weknews.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-4 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-1 transition-all group relative overflow-hidden mb-4"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-colors"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-black text-lg mb-1 flex items-center gap-2 tracking-tight">
                        <span className="text-2xl group-hover:animate-bounce">🚗</span> 드라이브 코스 찾기
                      </h3>
                      <p className="text-sky-100 text-xs font-semibold">야경 명소부터 환상의 해안도로까지!</p>
                    </div>
                    <div className="bg-white text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-black shadow-md group-hover:scale-110 transition-transform shrink-0">
                      ➔
                    </div>
                  </div>
                </a>
                <div className="md:hidden">
                  <PWAInstallButton />
                </div>
                
                {/* 미스틱 사주 크로스 프로모션 배너 (PC 전용) */}
                <a 
                  href="https://mystic.weknews.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hidden md:block w-full bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-4 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all group relative overflow-hidden mt-4"
                >
                  <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-black text-lg mb-1 flex items-center gap-2 tracking-tight">
                        <span className="text-2xl group-hover:animate-pulse">🔮</span> 미스틱 사주
                      </h3>
                      <p className="text-purple-100 text-xs font-semibold">당신의 오늘 운세는 어떨까요? 무료 사주 보기</p>
                    </div>
                    <div className="bg-white text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-black shadow-md group-hover:scale-110 transition-transform shrink-0">
                      ➔
                    </div>
                  </div>
                </a>
              </div>

              {/* 테마 필터 */}
              <div className="flex md:flex-wrap overflow-x-auto gap-2 pb-2 scrollbar-hide shrink-0 border-b border-slate-700/50 mb-2">
                <button 
                  onClick={() => { setActiveTheme("all"); setActiveCuration(null); }}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                    activeTheme === "all" 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30' 
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 backdrop-blur-md'
                  }`}
                >
                  🚙 전체보기
                </button>
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTheme(t.id);
                      setActiveCuration(null);
                      setSelectedCourse(null);
                    }}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                      activeTheme === t.id 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30' 
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 backdrop-blur-md'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* 헤더 하단 닫기(접기) 버튼 */}
              <div className="w-full flex justify-center pb-2 mb-2">
                <button 
                  onClick={() => setIsHeaderVisible(false)}
                  className="bg-slate-800/90 backdrop-blur-md text-sm text-slate-300 font-bold px-6 py-2.5 rounded-full border border-slate-700 shadow-md flex items-center gap-2 active:scale-95 transition-all hover:bg-slate-700 hover:text-white"
                >
                  메뉴 접어두기 🔼
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PC 전용: 사이드바 코스 디테일 및 광고 영역 */}
        <div className="hidden md:flex flex-col flex-1 mt-2 relative">
          <div className="flex-1 pb-4">
            {selectedCourse ? (
              renderCourseDetails(true)
            ) : filteredCourses.length > 0 && (searchQuery || activeTheme !== 'all' || isSortedByDistance || activeCuration !== null) ? (
              <div className="space-y-3">
                <p className="text-slate-300 text-sm font-bold px-2">총 {filteredCourses.length}개의 코스 (전체: {courses.length}개)</p>
                {filteredCourses.map((course, index) => (
                  <div 
                    key={course.id} 
                    onClick={() => {
                      const wps = parseWaypoints(course.waypoints);
                      handleCourseClick(course, wps);
                    }}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-600/80 hover:bg-slate-700/80 hover:border-slate-500 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-white font-bold group-hover:text-indigo-400 transition-colors flex-1 pr-2 flex items-center gap-1">
                        {activeCuration === 'ranking' && (
                          <span className="text-2xl mr-1 drop-shadow-md -mt-1">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md align-middle">{index + 1}위</span>}
                          </span>
                        )}
                        {favorites.includes(course.id) && <span className="text-xs mr-1">❤️</span>}
                        {course.title}
                      </h3>
                      <button 
                        onClick={(e) => toggleFavorite(course.id, e)}
                        className="text-lg hover:scale-110 active:scale-95 transition-transform p-1 -mt-1 -mr-1"
                      >
                        {favorites.includes(course.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <p className="text-slate-300 text-xs line-clamp-2 mb-2">{course.description}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-orange-400 font-bold">🍁 첫단풍: {formatDate(course.firstFoliage || "미정")}</span>
                      <span className="text-xs text-rose-500 font-bold">👑 절정기: {formatDate(course.peakFoliage || "미정")}</span>
                      {course._distanceToUser !== undefined && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-sm font-bold border border-red-500/30">
                          약 {course._distanceToUser.toFixed(1)}km
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
                        ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 pb-10">
                <span className="text-5xl mb-6 opacity-40">🍁</span>
                <p className="text-sm text-slate-600 text-center px-4">
                  테마나 지역을 선택하거나<br/>검색으로 코스를 찾아보세요
                </p>
              </div>
            )}
          </div>
          
          {/* 수익화 배너 영역 (구글 애드센스) - 코스 미선택 시에만 하단 고정 노출 */}
          {!selectedCourse && (
            <div className="mt-auto pt-6 w-full shrink-0">
              <div className="w-full h-[250px] bg-slate-800/50 rounded-xl overflow-hidden shadow-sm">
                <AdBanner 
                  dataAdSlot="1273604121" 
                  dataAdFormat="auto" 
                  dataFullWidthResponsive={true} 
                />
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      )}

      <div className="flex-1 w-full relative bg-slate-900">
        {(!mapLoaded || isLoading) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20">
            {mapLoadError ? (
              <div className="flex flex-col items-center p-6 bg-slate-800/80 rounded-2xl border border-rose-500/30 text-center max-w-sm mx-4">
                <span className="text-4xl mb-3">⚠️</span>
                <h3 className="text-rose-400 font-bold text-lg mb-2">지도 로딩 실패</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  카카오 지도 API 인증 에러입니다.<br/>
                  현재 구동 중인 로컬 포트(<strong className="text-white">localhost:3001</strong>)가 카카오 디벨로퍼스에 
                  허용된 도메인으로 등록되어 있지 않아서 발생하는 문제입니다.
                </p>
                <p className="text-slate-400 text-xs mt-3 bg-slate-900/50 p-2 rounded w-full">
                  💡 <strong>해결 방법:</strong> 현재 실행 중인 다른 서버(3000번 포트)를 끄고 <strong>이 앱을 3000번으로 재실행</strong>하시거나, 카카오 디벨로퍼스에 3001번 포트를 추가해 주세요!
                </p>
              </div>
            ) : (
              <>
                <span className="text-4xl animate-spin mb-4">🌀</span>
                <p className="text-slate-300 font-bold">
                  {isLoading ? "코스 데이터를 불러오는 중..." : "지도를 불러오는 중..."}
                </p>
              </>
            )}
          </div>
        )}

        {/* 단풍 CG 테스트용 날짜 슬라이더 - URL에 ?testDate=2026-10-15 추가 시 노출 */}
        {foliageTestDate && (() => {
          const minDate = '2026-09-01';
          const maxDate = '2026-11-30';
          const minTs = new Date(minDate).getTime();
          const maxTs = new Date(maxDate).getTime();
          const curTs = new Date(foliageTestDate).getTime();
          const pct = Math.max(0, Math.min(100, ((curTs - minTs) / (maxTs - minTs)) * 100));

          const stepDay = (dir: number) => {
            const d = new Date(foliageTestDate);
            d.setDate(d.getDate() + dir);
            const s = d.toISOString().split('T')[0];
            if (s >= minDate && s <= maxDate) setFoliageTestDate(s);
          };

          const togglePlay = () => {
            if (isPlayingFoliage) {
              if (foliagePlayRef.current) clearInterval(foliagePlayRef.current);
              setIsPlayingFoliage(false);
            } else {
              setFoliageTestDate(minDate);
              setIsPlayingFoliage(true);
              foliagePlayRef.current = setInterval(() => {
                setFoliageTestDate(prev => {
                  const d = new Date(prev || minDate);
                  d.setDate(d.getDate() + 3);
                  const next = d.toISOString().split('T')[0];
                  if (next > maxDate) {
                    if (foliagePlayRef.current) clearInterval(foliagePlayRef.current);
                    setIsPlayingFoliage(false);
                    return maxDate;
                  }
                  return next;
                });
              }, 300);
            }
          };

          const monthLabel = (s: string) => {
            const d = new Date(s);
            return `${d.getMonth() + 1}월 ${d.getDate()}일`;
          };

          return (
            <div className="absolute bottom-6 right-4 z-[50] bg-slate-900/95 backdrop-blur-md border border-orange-500/40 px-5 py-4 rounded-2xl shadow-2xl flex flex-col gap-3" style={{minWidth: '280px'}}>
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <span className="text-orange-400 text-sm font-black flex items-center gap-1.5">🍁 단풍 전선 시뮬레이션</span>
                <button
                  onClick={() => {
                    if (foliagePlayRef.current) clearInterval(foliagePlayRef.current);
                    setIsPlayingFoliage(false);
                    setFoliageTestDate('');
                  }}
                  className="text-slate-500 hover:text-white text-xs transition-colors"
                >✕</button>
              </div>

              {/* 현재 날짜 표시 */}
              <div className="text-center">
                <span className="text-white text-xl font-black tracking-wide">{monthLabel(foliageTestDate)}</span>
                <span className="text-slate-400 text-xs ml-2">2026년</span>
              </div>

              {/* 타임라인 바 */}
              <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  const ts = minTs + ratio * (maxTs - minTs);
                  const d = new Date(ts);
                  setFoliageTestDate(d.toISOString().split('T')[0]);
                }}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #22c55e, #f97316, #dc2626)'
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border-2 border-orange-400 transition-all"
                  style={{ left: `calc(${pct}% - 7px)` }}
                />
              </div>

              {/* 월 라벨 */}
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>9월</span><span>10월</span><span>11월</span>
              </div>

              {/* 컨트롤 버튼 */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => stepDay(-7)}
                  className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm flex items-center justify-center transition-all"
                >⏮</button>
                <button
                  onClick={() => stepDay(-1)}
                  className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm flex items-center justify-center transition-all"
                >◀</button>
                <button
                  onClick={togglePlay}
                  className={`w-12 h-12 rounded-full text-white text-xl flex items-center justify-center transition-all shadow-lg ${
                    isPlayingFoliage
                      ? 'bg-orange-500 hover:bg-orange-600 scale-110'
                      : 'bg-gradient-to-br from-orange-500 to-red-500 hover:scale-105'
                  }`}
                >{isPlayingFoliage ? '⏸' : '▶'}</button>
                <button
                  onClick={() => stepDay(1)}
                  className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm flex items-center justify-center transition-all"
                >▶</button>
                <button
                  onClick={() => stepDay(7)}
                  className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm flex items-center justify-center transition-all"
                >⏭</button>
              </div>

              {/* 날짜 직접 입력 */}
              <input
                type="date"
                value={foliageTestDate}
                min={minDate}
                max={maxDate}
                onChange={e => setFoliageTestDate(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-white text-xs px-2 py-1 rounded-lg focus:outline-none focus:border-orange-500 w-full"
              />
            </div>
          );
        })()}

        <div id="map" ref={mapContainerRef} className={`w-full h-full bg-slate-900 ${isMobile && activeTab !== 'map' ? 'hidden' : 'block'}`}></div>

        {/* 🗺️ PC 전용: 플로팅 큐레이션 위젯 (지도 위) */}
        <div className="hidden md:flex absolute top-6 left-6 z-20 flex-wrap gap-2 max-w-[calc(100vw-450px)]">
          <button
            onClick={() => {
              setActiveCuration('ranking');
              setActiveTheme('all');
              setActiveRegion('all');
              setSearchQuery('');
              setIsSortedByDistance(false);
              setSelectedCourse(null);
              setIsHeaderVisible(false);
            }}
            className={`px-5 py-2.5 rounded-full font-black text-sm flex items-center gap-2 backdrop-blur-md transition-all border ${
              activeCuration === 'ranking'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-amber-500/40 ring-2 ring-amber-300'
                : 'bg-white/40 text-slate-800 border-white/60 hover:bg-white/60 hover:border-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
            }`}
          >
            <span className={activeCuration === 'ranking' ? 'animate-bounce' : ''}>👑</span> 명예의 전당
          </button>

          {CURATION_CATEGORIES.filter(c => c.id !== 'ranking').map(cat => {
            const isActive = activeCuration === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (isActive) {
                    setActiveCuration(null);
                  } else {
                    setActiveCuration(cat.id);
                    setActiveTheme('all');
                    setActiveRegion('all');
                    setSearchQuery('');
                    setIsSortedByDistance(false);
                    setSelectedCourse(null);
                    setIsHeaderVisible(false);
                  }
                }}
                className={`px-4 py-2.5 rounded-full font-bold text-sm flex items-center gap-1.5 backdrop-blur-md transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/40 ring-2 ring-indigo-300'
                    : 'bg-white/40 text-slate-800 border-white/60 hover:bg-white/60 hover:border-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* PC 우측 플로팅 배너 영역 */}
        <div className="hidden md:flex absolute top-6 right-6 z-20 flex-col gap-4 w-[280px] max-h-[calc(100dvh-48px)] overflow-y-auto custom-scrollbar pb-6">
          {/* 첫 번째 플로팅 배너 (구글 애드센스) */}
          <div className="w-full bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-slate-700/80 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-center items-center shrink-0">
            <span className="text-xs text-slate-500 font-bold mb-2">SPONSORED</span>
            <div className="w-full h-[250px] bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center border border-slate-700">
              <AdBanner 
                dataAdSlot="1273604121" 
                dataAdFormat="auto" 
                dataFullWidthResponsive={true} 
              />
            </div>
          </div>
          
          {/* 두 번째 커스텀 배너 (쿠팡 파트너스 자동차용품 수동 배너) */}
          <a
            href="https://link.coupang.com/a/d9aFVtygcC" 
            target="_blank"
            rel="noopener noreferrer" 
            className="group relative w-full h-[250px] bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-slate-700/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-end shrink-0 transition-all hover:-translate-y-1 hover:shadow-sky-500/20"
          >
            {/* 자동차용품 배경 이미지 (어둡게 처리) */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col gap-1.5">
              <span className="bg-sky-500 text-white text-[10px] font-black px-2 py-1 rounded w-fit tracking-wider shadow-lg">CAR ACCESSORIES</span>
              <h3 className="text-white font-black text-xl leading-tight mt-1 group-hover:text-sky-100 transition-colors drop-shadow-md">
                가을 산행 필수템 총집합!<br/>등산/피크닉 용품 로켓배송
              </h3>
              <p className="text-slate-300 text-xs font-medium mt-1 flex items-center gap-1">
                쿠팡 자동차용품 기획전 <span className="group-hover:translate-x-1 transition-transform">→</span>
              </p>
            </div>
          </a>

          {/* 세 번째 커스텀 배너 (쿠팡 파트너스 호텔/여행 수동 배너) */}
          <a
            href="https://link.coupang.com/a/d9adnYXKtE" 
            target="_blank"
            rel="noopener noreferrer" 
            className="group relative w-full h-[250px] bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-slate-700/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-end shrink-0 transition-all hover:-translate-y-1 hover:shadow-rose-500/20"
          >
            {/* 호캉스 배경 이미지 (어둡게 처리) */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col gap-1.5">
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded w-fit tracking-wider shadow-lg">HOTEL & RESORT</span>
              <h3 className="text-white font-black text-xl leading-tight mt-1 group-hover:text-rose-100 transition-colors drop-shadow-md">
                단풍놀이 후 꿀맛 휴식!<br/>전국 호캉스 특가 예약
              </h3>
              <p className="text-slate-300 text-xs font-medium mt-1 flex items-center gap-1">
                쿠팡 트래블 특가 보러가기 <span className="group-hover:translate-x-1 transition-transform">→</span>
              </p>
            </div>
          </a>
          
          {/* 쿠팡 파트너스 대가성 문구 (법적 의무) */}
          <div className="w-full text-center py-3 px-3 bg-slate-900/60 backdrop-blur-lg rounded-xl border border-slate-700/50 shrink-0 mt-2">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              이 포스팅은 쿠팡 파트너스 활동의 일환으로,<br/>이에 따른 일정액의 수수료를 제공받습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 모바일 하단 코스 디테일 바텀 시트 (Framer Motion 기반의 고성능 네이티브 구현) */}
      <AnimatePresence>
        {isMobile && selectedCourse && (
          <div className="fixed inset-0 z-40 pointer-events-none">
            {!isSheetMinimized ? (
              <>
                {/* 배경 어두운 오버레이 (클릭 시 요약 배너로 축소) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSheetMinimized(true)}
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs pointer-events-auto z-10"
                />
                {/* 바텀 시트 메인 컨테이너 */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.9 }}
                  onDragEnd={(e, info) => {
                    // 아래 방향으로 100px 이상 드래그하면 요약 배너로 축소
                    if (info.offset.y > 100) {
                      setIsSheetMinimized(true);
                    }
                  }}
                  className="absolute bottom-0 left-0 right-0 z-20 bg-slate-900 border-t border-slate-800 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] overflow-hidden pointer-events-auto text-left"
                >
                  {/* 드래그 핸들 바 */}
                  <div className="w-full py-4 flex justify-center cursor-grab active:cursor-grabbing shrink-0 border-b border-slate-800/40">
                    <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
                  </div>
                  
                  {/* 바텀 시트 콘텐츠 (세로 스크롤 가능) */}
                  <div className="overflow-y-auto px-6 pt-3 pb-12">
                    {renderCourseDetails(false)}
                  </div>
                </motion.div>
              </>
            ) : (
              /* 축소(최소화) 상태일 때: 어두운 배경을 걷어내 지도를 보여주고 하단에 슬림형 요약 카드 배너 노출 */
              <div 
                onClick={() => setIsSheetMinimized(false)}
                className="absolute bottom-6 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto z-20 cursor-pointer hover:bg-slate-800 transition-all flex items-center justify-between gap-4 animate-fade-in"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-extrabold text-xs truncate">{selectedCourse.title}</h3>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-[10px] text-indigo-400 font-bold">
                      {(() => {
                        const cached = cachedPathsRef.current[selectedCourse.id];
                        if (cached?.distance) return `${(cached.distance / 1000).toFixed(1)}km`;
                        return selectedCourse.distance || "";
                      })()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {(() => {
                        const cached = cachedPathsRef.current[selectedCourse.id];
                        if (cached?.duration) return `${Math.ceil(cached.duration / 60)}분`;
                        return selectedCourse.duration || "";
                      })()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-indigo-500/30">
                    상세보기 🔼
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeCourse(false); // ✕를 누르면 목록으로 가지 않고 지도만 닫음
                    }}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-black border border-slate-700/50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>



      {/* 문의하기 팝업 모달 */}
      <AnimatePresence>
        {isInquiryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setIsInquiryModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
              
              <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
                <span className="text-indigo-400">💬</span> 제안 및 문의하기
              </h2>
              <p className="text-sm text-slate-400 mb-6">코스 추가, 정보 수정, 광고/제휴 등 무엇이든 편하게 남겨주세요.</p>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">문의 유형</label>
                  <div className="flex gap-2">
                    {['코스 제안/오류 수정', '광고/제휴 제안'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setInquiryType(type)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          inquiryType === type 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700/50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>



                {inquiryType === '광고/제휴 제안' ? (
                  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl text-center flex flex-col items-center justify-center gap-3 mt-4">
                    <span className="text-3xl">🤝</span>
                    <p className="text-slate-300 text-sm">광고 및 비즈니스 제휴 문의는<br/>아래 대표 이메일로 연락 부탁드립니다.</p>
                    <a href="mailto:duke3736@gmail.com" className="text-indigo-400 font-bold text-lg hover:text-indigo-300 transition-colors bg-indigo-500/10 px-4 py-2 rounded-lg mt-1">
                      duke3736@gmail.com
                    </a>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2">문의 내용</label>
                      <textarea
                        required
                        value={inquiryContent}
                        onChange={e => setInquiryContent(e.target.value)}
                        placeholder="어떤 점을 개선하면 좋을까요?"
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl h-32 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500 custom-scrollbar"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !inquiryContent.trim()}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-lg py-4 rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? '전송 중...' : '의견 보내기 🚀'}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 모바일 전용 탭 전환 버튼 - 코스 상세 및 미니 요약 카드를 볼 때는 화면을 가리지 않도록 숨김 처리 */}
      {isMounted && isMobile && !selectedCourse && (
        <button
          onClick={() => {
            const nextTab = activeTab === 'list' ? 'map' : 'list';
            setActiveTab(nextTab);
            if (nextTab === 'list') {
              setSelectedCourse(null);
              if (window.location.hash === '#course') {
                window.history.back();
              }
            }
          }}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-extrabold px-6 py-4 rounded-full shadow-[0_10px_35px_rgba(249,115,22,0.6)] border border-white/20 flex items-center justify-center gap-2.5 active:scale-95 hover:scale-105 transition-all duration-300 ring-2 ring-white/10"
        >
          {activeTab === 'list' ? (
            <>
              <span className="text-lg animate-bounce">🗺️</span> <span className="tracking-tight text-sm">지도 보기</span>
            </>
          ) : (
            <>
              <span className="text-lg">📋</span> <span className="tracking-tight text-sm">목록 보기</span>
            </>
          )}
        </button>
      )}

    </div>
  );
}
