import { google } from 'googleapis';

/**
 * Google OAuth2 클라이언트를 생성하고 반환합니다.
 * 환경 변수에 설정된 CLIENT_ID, CLIENT_SECRET, REDIRECT_URI를 사용합니다.
 */
export const getGoogleOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth2 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
};

/**
 * 로그인 URL을 생성합니다.
 * @param scopes 요청할 권한 범위 배열 (예: ['https://www.googleapis.com/auth/calendar.readonly'])
 */
export const generateAuthUrl = (scopes: string[]) => {
  const oauth2Client = getGoogleOAuthClient();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // refresh token을 받기 위해 offline으로 설정
    scope: scopes,
    prompt: 'consent' // 항상 동의 화면을 표시하여 refresh token 갱신 유도
  });
};
