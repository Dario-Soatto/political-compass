import { Tweet, ScrapeResponse } from '@/types/twitter';

// Twitter API v2 base URL
const TWITTER_API_BASE = 'https://api.twitter.com/2';

// Define Twitter API response types
interface TwitterUser {
  id: string;
  username: string;
  name: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  profile_image_url?: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at?: string;
  author_id: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

interface TwitterApiResponse {
  data?: TwitterTweet[] | TwitterUser;
  includes?: {
    users?: TwitterUser[];
  };
  errors?: Array<{
    detail: string;
    type: string;
  }>;
}

interface TwitterError extends Error {
  code?: number;
}

// Helper function to make Twitter API requests
async function twitterApiRequest(endpoint: string, bearerToken: string): Promise<TwitterApiResponse> {
  const response = await fetch(`${TWITTER_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    const error: TwitterError = new Error(errorData.detail || `Twitter API error: ${response.status}`);
    error.code = response.status;
    throw error;
  }

  return response.json();
}

export async function scrapeUserTweets(username: string, limit: number = 50): Promise<ScrapeResponse> {
  try {
    // Check if required environment variables are present
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (!bearerToken) {
      return {
        success: false,
        error: 'Twitter API credentials not configured. Please check your .env.local file.',
        tweets: [],
        count: 0
      };
    }
    
    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');
    
    // First, get the user by username
    const userResponse = await twitterApiRequest(
      `/users/by/username/${cleanUsername}?user.fields=public_metrics,profile_image_url`,
      bearerToken
    );

    if (!userResponse.data || Array.isArray(userResponse.data)) {
      return {
        success: false,
        error: `User @${cleanUsername} not found`,
        tweets: [],
        count: 0
      };
    }

    const user = userResponse.data as TwitterUser;
    const userId = user.id;

    // Get user's tweets
    const maxResults = Math.min(limit, 100); // Twitter API v2 max is 100 per request
    const tweetsResponse = await twitterApiRequest(
      `/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,author_id&user.fields=public_metrics,profile_image_url&expansions=author_id`,
      bearerToken
    );

    const tweetData: Tweet[] = [];

    if (tweetsResponse.data && Array.isArray(tweetsResponse.data)) {
      for (const tweet of tweetsResponse.data as TwitterTweet[]) {
        // Find the author data from includes
        const author = tweetsResponse.includes?.users?.find((u: TwitterUser) => u.id === tweet.author_id);
        
        const tweetObj: Tweet = {
          id: tweet.id,
          text: tweet.text,
          created_at: tweet.created_at || null,
          retweet_count: tweet.public_metrics?.retweet_count || 0,
          like_count: tweet.public_metrics?.like_count || 0,
          reply_count: tweet.public_metrics?.reply_count || 0,
          user: {
            username: author?.username || cleanUsername,
            display_name: author?.name || cleanUsername,
            followers_count: author?.public_metrics?.followers_count || 0,
            profile_image_url: author?.profile_image_url
          }
        };

        tweetData.push(tweetObj);
      }
    }

    return {
      success: true,
      tweets: tweetData,
      count: tweetData.length
    };

  } catch (error) {
    console.error('Twitter API error:', error);
    
    const twitterError = error as TwitterError;
    
    // Handle specific Twitter API errors
    if (twitterError.code === 429) {
      return {
        success: false,
        error: 'Twitter API rate limit exceeded. Please try again later.',
        tweets: [],
        count: 0
      };
    }

    if (twitterError.code === 401) {
      return {
        success: false,
        error: 'Twitter API authentication failed. Please check your credentials.',
        tweets: [],
        count: 0
      };
    }

    if (twitterError.code === 403) {
      return {
        success: false,
        error: 'User account is private or suspended.',
        tweets: [],
        count: 0
      };
    }

    return {
      success: false,
      error: `Twitter API error: ${twitterError.message || 'Unknown error'}`,
      tweets: [],
      count: 0
    };
  }
}