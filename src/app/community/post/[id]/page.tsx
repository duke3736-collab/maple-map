import type { Metadata } from 'next';
import { DEMO_POSTS_STORE } from '@/lib/postsStore';
import PostDetailClient from './PostDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const postId = resolvedParams.id;
  const post = DEMO_POSTS_STORE.find(p => p.id === postId);

  if (!post) {
    return {
      title: '단풍여행 커뮤니티 | Maple Map',
      description: '단풍여행 정보 및 익명 자유게시판 커뮤니티',
    };
  }

  const title = `${post.title} | Maple Map 커뮤니티`;
  const description = post.content.slice(0, 160).replace(/\n/g, ' ');
  const url = `https://maple.weknews.com/community/post/${post.id}`;

  return {
    title: title,
    description: description,
    keywords: `${post.category}, ${post.regionName || '단풍여행'}, 커뮤니티, 자유톡, 익명게시판`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: 'Maple Map 커뮤니티',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: post.createdAt,
      images: [
        {
          url: '/images/og_image.png',
          width: 1024,
          height: 1024,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ['/images/og_image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const postId = resolvedParams.id;
  const post = DEMO_POSTS_STORE.find(p => p.id === postId);

  // 구글 & 네이버 검색엔진 최적화를 위한 JSON-LD 구조화 데이터
  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    'headline': post.title,
    'articleBody': post.content,
    'author': {
      '@type': 'Person',
      'name': post.nickname || '익명',
    },
    'datePublished': post.createdAt,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://maple.weknews.com/community/post/${post.id}`,
    },
    'interactionStatistic': [
      {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/WatchAction',
        'userInteractionCount': post.views || 1,
      },
      {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/LikeAction',
        'userInteractionCount': post.likes || 0,
      },
    ],
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PostDetailClient postId={postId} initialPost={post} />
    </>
  );
}
