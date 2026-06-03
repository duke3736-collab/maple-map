'use client';

import { useState, useEffect } from 'react';

interface WeatherInfoProps {
  lat: number;
  lng: number;
}

interface WeatherData {
  temp: number;
  apparentTemp: number;
  humidity: number;
  precipitation: number;
  weather: {
    code: number;
    label: string;
    icon: string;
  };
  airQuality: {
    pm10: number;
    pm25: number;
    pm10Grade: string;
    pm25Grade: string;
    grade: string;
    color: string;
  };
}

export default function WeatherInfo({ lat, lng }: WeatherInfoProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
        if (!response.ok) throw new Error('Weather fetch failed');
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error('Error loading weather data:', err);
        setError('날씨 정보를 가져올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="w-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 animate-pulse space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-slate-700 rounded-md"></div>
          <div className="h-6 w-12 bg-slate-700 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-10 bg-slate-700 rounded-xl"></div>
          <div className="h-10 bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 text-center">
        <p className="text-slate-400 text-xs font-semibold">🌤️ 실시간 날씨 호출 실패</p>
      </div>
    );
  }

  const { temp, apparentTemp, humidity, weather, airQuality } = data;

  // 미세먼지 등급별 이모티콘 및 설명 매핑
  const airGradeEmoji = (grade: string) => {
    switch (grade) {
      case '좋음': return '🟢 좋음';
      case '보통': return '🟡 보통';
      case '나쁨': return '🟠 나쁨';
      case '매우나쁨': return '🔴 매우 나쁨';
      default: return '⚪ 보통';
    }
  };

  return (
    <div className="w-full bg-slate-800/30 backdrop-blur-md border border-slate-700/40 rounded-2xl p-4 shadow-lg space-y-3 hover:border-slate-600/50 transition-all">
      {/* 날씨 헤더 */}
      <div className="flex justify-between items-center border-b border-slate-700/30 pb-2">
        <span className="text-xs font-black text-slate-400 flex items-center gap-1">
          🌤️ 실시간 날씨 정보
        </span>
        <span className="text-[10px] text-slate-500 font-semibold">Open-Meteo 연동</span>
      </div>

      {/* 날씨 메인 바 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl drop-shadow-md select-none">{weather.icon}</span>
          <div>
            <div className="text-2xl font-black text-white leading-tight">
              {temp}°C
            </div>
            <div className="text-xs font-bold text-slate-300">
              {weather.label} <span className="text-slate-400 font-normal">(체감 {apparentTemp}°C)</span>
            </div>
          </div>
        </div>

        {/* 미세먼지 카드 */}
        <div className="bg-slate-900/60 border border-slate-700/40 px-3 py-1.5 rounded-xl text-right">
          <div className="text-[9px] font-bold text-slate-400 tracking-wider">AIR QUALITY</div>
          <div className={`text-xs font-black mt-0.5 ${airQuality.color}`}>
            {airGradeEmoji(airQuality.grade)}
          </div>
        </div>
      </div>

      {/* 세부 기상 스탯 */}
      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        <div className="bg-slate-900/35 rounded-xl py-2 px-1 border border-slate-800/60">
          <span className="block text-[9px] text-slate-400 font-semibold mb-0.5">습도</span>
          <span className="text-xs font-bold text-slate-200">{humidity}%</span>
        </div>
        <div className="bg-slate-900/35 rounded-xl py-2 px-1 border border-slate-800/60">
          <span className="block text-[9px] text-slate-400 font-semibold mb-0.5">미세먼지</span>
          <span className="text-xs font-bold text-slate-200">{airQuality.pm10}㎍/㎥</span>
        </div>
        <div className="bg-slate-900/35 rounded-xl py-2 px-1 border border-slate-800/60">
          <span className="block text-[9px] text-slate-400 font-semibold mb-0.5">초미세먼지</span>
          <span className="text-xs font-bold text-slate-200">{airQuality.pm25}㎍/㎥</span>
        </div>
      </div>
    </div>
  );
}
