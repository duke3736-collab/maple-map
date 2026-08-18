export interface CommentItem {
  id: string;
  nickname: string;
  avatarColor: string;
  content: string;
  passwordHash: string;
  createdAt: string;
}

export interface PostItem {
  id: string;
  title: string;
  regionId: string;
  regionName?: string;
  nickname: string;
  avatarColor: string;
  category: '자유톡' | '익명톡' | '질문/정보' | '여행후기' | '맛집추천' | '동행구함';
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  views: number;
  likes: number;
  liked?: boolean;
  passwordHash: string;
  createdAt: string;
  comments: CommentItem[];
}

export const DEMO_POSTS_STORE: PostItem[] = [
  {
    id: 'post_demo_001',
    title: '내장산 단풍 10월 말이 진짜 절정이더라구요 🍁',
    regionId: 'jeolla',
    regionName: '전라도',
    nickname: '신비로운 단풍나무 472',
    avatarColor: 'bg-rose-500',
    category: '여행후기',
    content: `작년에 내장산 다녀온 후기 남겨요.\n\n10월 25일에 방문했는데 딱 절정이었어요. 주차는 오전 7시 전에 도착해야 해요. 그 이후에는 진짜 지옥... 서울에서 새벽 4시에 출발했습니다ㅠ\n\n단풍 터널 구간이 제일 예쁜데, 오후 2~3시 햇살 받을 때 황금빛으로 빛나는 게 장관이에요. 케이블카는 줄이 2시간 기본이니까 체력 좋으신 분들은 그냥 걸어 올라가는 게 나을 수도요.\n\n전체적으로 강추합니다! 올해도 꼭 다시 가고 싶어요 🍂`,
    views: 342,
    likes: 28,
    liked: false,
    passwordHash: '1234',
    createdAt: '2026.08.16. 14:22:00',
    comments: [
      {
        id: 'c_demo_001a',
        nickname: '귀여운 억새 201',
        avatarColor: 'bg-violet-500',
        content: '저도 내장산 10월 말이 최고더라고요! 혹시 숙소는 어디서 잡으셨어요?',
        passwordHash: '1234',
        createdAt: '2026.08.16. 15:10:00',
      },
      {
        id: 'c_demo_001b',
        nickname: '신비로운 단풍나무 472',
        avatarColor: 'bg-rose-500',
        content: '정읍 시내 모텔에서 잡았어요! 비수기라 저렴하게 잡을 수 있었습니다 ㅎㅎ',
        passwordHash: '1234',
        createdAt: '2026.08.16. 16:05:00',
      },
    ],
  },
  {
    id: 'post_demo_002',
    title: '설악산 단풍 시기 언제가 제일 예쁜가요? 🙋',
    regionId: 'gangwon',
    regionName: '강원도',
    nickname: '열정적인 여행자 835',
    avatarColor: 'bg-blue-500',
    category: '질문/정보',
    content: `올해 처음으로 설악산 단풍 보러 가려고 합니다!\n\n인터넷 보면 10월 초~중순이라고도 하고 중순~말이라고도 하고 정확히 언제가 피크인지 모르겠네요.\n\n단풍 명소로 어디가 제일 예쁜지도 알려주시면 감사하겠습니다 🙏 케이블카는 꼭 타야 하나요?`,
    views: 189,
    likes: 14,
    liked: false,
    passwordHash: '1234',
    createdAt: '2026.08.18. 09:35:00',
    comments: [
      {
        id: 'c_demo_002a',
        nickname: '빛나는 캠퍼 563',
        avatarColor: 'bg-emerald-500',
        content: '대청봉 기준으로는 10월 1~10일, 권금성 케이블카 주변은 10월 10~20일이 보통 절정이에요! 천불동계곡 단풍도 엄청 예쁩니다 ㅎㅎ',
        passwordHash: '1234',
        createdAt: '2026.08.18. 10:15:00',
      },
      {
        id: 'c_demo_002b',
        nickname: '행복한 사진작가 129',
        avatarColor: 'bg-amber-500',
        content: '케이블카는 줄이 엄청 길어요. 저는 비선대 ~ 금강굴 코스 걷는 걸 추천드려요. 단풍 사진 찍기엔 여기가 최고예요!',
        passwordHash: '1234',
        createdAt: '2026.08.18. 11:03:00',
      },
    ],
  },
  {
    id: 'post_demo_003',
    title: '도심에서 가을 느끼기 — 서울 남산 단풍 후기 🌆🍂',
    regionId: 'seoul',
    regionName: '서울/경기',
    nickname: '즐거운 등산객 714',
    avatarColor: 'bg-cyan-500',
    category: '여행후기',
    content: `주말에 남산 다녀왔어요. 멀리 안 가도 서울에서 충분히 가을을 느낄 수 있더라고요!\n\n남산 팔각정 가는 길 양옆으로 은행나무랑 단풍나무가 노랗고 빨갛게 물들어 있어서 너무 예뻤어요 🍁\n\n케이블카 타고 올라가면 서울 전경이랑 단풍이 같이 펼쳐져서 사진 찍기 최고입니다. 주말엔 오전 10시 전에 가는 걸 추천해요. 이후로는 사람이 엄청 많아져요.`,
    views: 512,
    likes: 47,
    liked: false,
    passwordHash: '1234',
    createdAt: '2026.08.14. 18:14:00',
    comments: [],
  },
  {
    id: 'post_demo_004',
    title: '핑크뮬리 & 억새 같이 볼 수 있는 곳 있나요? 💕',
    regionId: 'general',
    regionName: 'Maple Map',
    nickname: '친절한 핑크뮬리 923',
    avatarColor: 'bg-fuchsia-500',
    category: '질문/정보',
    content: `안녕하세요! 이번 주말에 가을 나들이 계획 중인데요.\n\n핑크뮬리랑 억새를 같이 볼 수 있는 명소가 있나요? 아니면 두 군데 다 들릴 수 있는 코스 추천해 주시면 감사하겠습니다!\n\n경기도나 충청도 쪽으로 당일치기로 다녀오고 싶어요 🚗`,
    views: 97,
    likes: 8,
    liked: false,
    passwordHash: '1234',
    createdAt: '2026.08.19. 08:22:00',
    comments: [
      {
        id: 'c_demo_004a',
        nickname: '신비로운 여행자 388',
        avatarColor: 'bg-indigo-500',
        content: '경기도 양주 나리공원이 핑크뮬리랑 코스모스 다 있어요! 억새는 차로 30분 거리 포천 국립수목원이나 하남 미사경정공원 추천합니다 😊',
        passwordHash: '1234',
        createdAt: '2026.08.19. 09:11:00',
      },
    ],
  },
  {
    id: 'post_demo_005',
    title: '단풍 드라이브 코스 — 국도 46호 (춘천~양구) 강추! 🚗',
    regionId: 'gangwon',
    regionName: '강원도',
    nickname: '날렵한 드라이버 621',
    avatarColor: 'bg-orange-500',
    category: '자유톡',
    content: `단풍 드라이브 코스로 국도 46호 춘천~양구 구간이 진짜 끝내줘요.\n\n소양강댐 지나서 파로호까지 이어지는 구간이 특히 예쁜데, 양쪽으로 산이 물들어 있는데 호수 반영까지 더해지면 그냥 그림이에요 🎨\n\n거리도 약 70km 정도라 왕복 해도 반나절이면 충분해서 부담 없이 다녀올 수 있어요. 10월 중순쯤 타이밍 잡아보세요!`,
    ctaText: '👉 이번 주 단풍 절정 명소 지도에서 보기',
    ctaUrl: 'https://maple.weknews.com',
    views: 267,
    likes: 33,
    liked: false,
    passwordHash: '1234',
    createdAt: '2026.08.17. 20:45:00',
    comments: [
      {
        id: 'c_demo_005a',
        nickname: '행복한 억새 442',
        avatarColor: 'bg-rose-500',
        content: '46호 국도 진짜 저도 강추! 파로호 뷰포인트에서 사진 찍으면 인스타 터져요 😂',
        passwordHash: '1234',
        createdAt: '2026.08.17. 21:30:00',
      },
    ],
  },
  {
    id: 'post_demo_006',
    title: '제주 한라산 단풍은 언제 피나요? 혹시 아시는 분? 🌋',
    regionId: 'jeju',
    regionName: '제주/도서',
    nickname: '피곤한 사진작가 338',
    avatarColor: 'bg-emerald-500',
    category: '질문/정보',
    content: `제주 한라산 단풍은 10월 중순이라고 들었는데, 올해 온난화 영향으로 늦춰질 수도 있다고 하더라고요.\n\n한라산 등반 코스 중에서 단풍이 제일 예쁜 루트가 어디인지도 알고 싶어요!\n\n성판악 vs 영실 중에 어디가 더 단풍 구경하기 좋은지도 의견 부탁드려요 🙏`,
    views: 143,
    likes: 11,
    liked: false,
    passwordHash: '1234',
    createdAt: '2026.08.18. 13:50:00',
    comments: [],
  },
  {
    id: 'post_demo_007',
    title: '가을 단풍 명소 주차 꿀팁 총정리 🅿️',
    regionId: 'general',
    regionName: 'Maple Map',
    nickname: '똑똑한 여행자 156',
    avatarColor: 'bg-blue-500',
    category: '자유톡',
    content: `단풍 시즌에 주차 때문에 고생하시는 분들 많죠? 제가 몇 년 다녀보면서 익힌 꿀팁 공유합니다!\n\n🅿️ 설악산: 소공원 주차장 대신 오색주차장 이용 후 셔틀 이용\n🅿️ 내장산: 새벽 6시 이전 도착 필수. 내장사 주차장이 아닌 수문천 무료 주차장 이용\n🅿️ 화담숲: 예약제 운영이라 주차 걱정 없음. 대신 입장 예약을 미리!\n🅿️ 남이섬: 선착장 근처 무료 주차 후 배 이용\n\n아는 것 있으시면 댓글로 공유해 주세요 😊`,
    views: 891,
    likes: 74,
    liked: false,
    passwordHash: '1234',
    createdAt: '2026.08.13. 11:30:00',
    comments: [
      {
        id: 'c_demo_007a',
        nickname: '배고픈 억새 290',
        avatarColor: 'bg-amber-500',
        content: '내장산 수문천 주차장 정말 꿀팁이에요! 거기서 걸어서 20분이면 내장사인데 오히려 산책 분위기라 좋더라고요 ㅎㅎ',
        passwordHash: '1234',
        createdAt: '2026.08.13. 12:44:00',
      },
      {
        id: 'c_demo_007b',
        nickname: '즐거운 사진작가 571',
        avatarColor: 'bg-rose-500',
        content: '화담숲 예약은 최소 3주 전에 하세요... 저는 2주 전에 하려다 이미 마감이었어요 😭',
        passwordHash: '1234',
        createdAt: '2026.08.14. 08:22:00',
      },
    ],
  },
];

const STORAGE_KEY = 'maple_posts_master_db';

export function getStoredPosts(): PostItem[] {
  if (typeof window === 'undefined') return DEMO_POSTS_STORE;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_POSTS_STORE));
    return DEMO_POSTS_STORE;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return DEMO_POSTS_STORE;
  }
}

export function savePosts(posts: PostItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function getPostById(id: string): PostItem | undefined {
  const posts = getStoredPosts();
  return posts.find(p => p.id === id);
}

export function addPost(newPost: Omit<PostItem, 'id' | 'views' | 'likes' | 'liked' | 'createdAt' | 'comments'>): PostItem {
  const posts = getStoredPosts();
  const created: PostItem = {
    ...newPost,
    id: 'post_' + Date.now(),
    views: 1,
    likes: 0,
    liked: false,
    createdAt: new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\. /g, '.').replace(':', ':'),
    comments: [],
  };
  const updated = [created, ...posts];
  savePosts(updated);
  return created;
}

export function addComment(postId: string, comment: Omit<CommentItem, 'id' | 'createdAt'>): PostItem | undefined {
  const posts = getStoredPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return undefined;

  const newComment: CommentItem = {
    ...comment,
    id: 'c_' + Date.now(),
    createdAt: new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\. /g, '.'),
  };

  post.comments.push(newComment);
  savePosts(posts);
  return post;
}

export function incrementViews(postId: string): void {
  const posts = getStoredPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.views += 1;
    savePosts(posts);
  }
}
