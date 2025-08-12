import TwitterScraper from '@/components/features/TwitterScraper';
import type { Metadata } from 'next';

type Props = {
  searchParams: Promise<{ username?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const username = params?.username;
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  if (username) {
    // Existing logic for specific user
    const ogImageUrl = `${baseUrl}/compass/api/og-image?username=${encodeURIComponent(username)}`;
    const pageUrl = `${baseUrl}/compass?username=${encodeURIComponent(username)}`;
    
    return {
      title: `${username}'s Political Compass - Soatto.com`,
      description: `See where @${username} stands on the political compass based on their Twitter activity`,
      openGraph: {
        title: `${username}'s Political Compass`,
        description: `See where @${username} stands on the political compass based on their Twitter activity`,
        url: pageUrl,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `Political compass analysis for @${username}`,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${username}'s Political Compass`,
        description: `See where @${username} stands on the political compass based on their Twitter activity`,
        images: [ogImageUrl],
      },
    };
  }

  // Default metadata for base URL (no username)
  const defaultOgImageUrl = `${baseUrl}/compass/api/og-image`; // No username parameter
  const defaultPageUrl = `${baseUrl}/compass`;
  
  return {
    title: 'Political Compass - Soatto.com',
    description: 'Analyze Twitter users political leanings based on their tweets using AI',
    openGraph: {
      title: 'Twitter Political Compass',
      description: 'Analyze Twitter users political leanings based on their tweets using AI',
      url: defaultPageUrl,
      images: [
        {
          url: defaultOgImageUrl,
          width: 1200,
          height: 630,
          alt: 'Twitter Political Compass - Analyze political leanings from tweets',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Twitter Political Compass',
      description: 'Analyze Twitter users political leanings based on their tweets using AI',
      images: [defaultOgImageUrl],
    },
  };
}

export default async function CompassPage({ searchParams }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <TwitterScraper />
      </div>
    </div>
  );
}