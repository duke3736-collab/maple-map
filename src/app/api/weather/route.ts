import { NextRequest, NextResponse } from 'next/server';

// 날씨 코드(WMO Weather Code)를 한글명 및 아이콘으로 매핑
const getWeatherDescription = (code: number): { label: string; icon: string } => {
  if (code === 0) return { label: '맑음', icon: '☀️' };
  if (code === 1) return { label: '대체로 맑음', icon: '🌤️' };
  if (code === 2) return { label: '구름조금', icon: '⛅' };
  if (code === 3) return { label: '흐림', icon: '☁️' };
  if (code === 45 || code === 48) return { label: '안개', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { label: '이슬비', icon: '🌦️' };
  if (code >= 56 && code <= 57) return { label: '얼어붙는 이슬비', icon: '🌨️' };
  if (code === 61 || code === 63 || code === 65) return { label: '비', icon: '🌧️' };
  if (code >= 66 && code <= 67) return { label: '진눈깨비', icon: '🌨️' };
  if (code === 71 || code === 73 || code === 75) return { label: '눈', icon: '❄️' };
  if (code === 77) return { label: '싸락눈', icon: '🌨️' };
  if (code === 80 || code === 81 || code === 82) return { label: '소나기', icon: '🌦️' };
  if (code === 85 || code === 86) return { label: '소나기눈', icon: '❄️' };
  if (code >= 95 && code <= 99) return { label: '뇌우', icon: '⚡' };
  return { label: '정보 없음', icon: '🌡️' };
};

// PM10 미세먼지 등급 판정
const getPM10Grade = (val: number): { label: string; color: string; level: number } => {
  if (val <= 30) return { label: '좋음', color: 'text-emerald-400', level: 1 };
  if (val <= 80) return { label: '보통', color: 'text-sky-400', level: 2 };
  if (val <= 150) return { label: '나쁨', color: 'text-orange-400', level: 3 };
  return { label: '매우나쁨', color: 'text-rose-500', level: 4 };
};

// PM2.5 초미세먼지 등급 판정
const getPM25Grade = (val: number): { label: string; color: string; level: number } => {
  if (val <= 15) return { label: '좋음', color: 'text-emerald-400', level: 1 };
  if (val <= 35) return { label: '보통', color: 'text-sky-400', level: 2 };
  if (val <= 75) return { label: '나쁨', color: 'text-orange-400', level: 3 };
  return { label: '매우나쁨', color: 'text-rose-500', level: 4 };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: 'Missing coordinates (lat, lng)' }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  try {
    // 1. Open-Meteo Forecast & Air Quality API 호출
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&timezone=Asia/Seoul`;
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5&timezone=Asia/Seoul`;

    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherUrl, { next: { revalidate: 1800 } }), // 30분 캐시
      fetch(airQualityUrl, { next: { revalidate: 1800 } }),
    ]);

    if (!weatherRes.ok || !airRes.ok) {
      throw new Error('Failed to fetch weather or air quality data from open-meteo');
    }

    const weatherData = await weatherRes.json();
    const airData = await airRes.json();

    const temp = weatherData.current?.temperature_2m;
    const apparentTemp = weatherData.current?.apparent_temperature;
    const humidity = weatherData.current?.relative_humidity_2m;
    const precipitation = weatherData.current?.precipitation;
    const weatherCode = weatherData.current?.weather_code ?? 0;

    const pm10 = airData.current?.pm10 ?? 0;
    const pm25 = airData.current?.pm2_5 ?? 0;

    const weatherDesc = getWeatherDescription(weatherCode);
    const pm10Grade = getPM10Grade(pm10);
    const pm25Grade = getPM25Grade(pm25);

    // 둘 중 더 나쁜 등급을 종합 미세먼지 등급으로 설정
    const overallAirGrade = pm10Grade.level >= pm25Grade.level ? pm10Grade : pm25Grade;

    return NextResponse.json({
      temp,
      apparentTemp,
      humidity,
      precipitation,
      weather: {
        code: weatherCode,
        label: weatherDesc.label,
        icon: weatherDesc.icon,
      },
      airQuality: {
        pm10: Math.round(pm10),
        pm25: Math.round(pm25),
        pm10Grade: pm10Grade.label,
        pm25Grade: pm25Grade.label,
        grade: overallAirGrade.label,
        color: overallAirGrade.color,
      },
    });
  } catch (error) {
    console.error('[/api/weather] error:', error);
    return NextResponse.json(
      { error: '날씨 정보를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
