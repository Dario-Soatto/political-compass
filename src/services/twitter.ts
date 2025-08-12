import { Tweet, ScrapeResponse } from '@/types/twitter';

// RapidAPI Twitter241 base URL
const RAPIDAPI_BASE = 'https://twitter241.p.rapidapi.com';

// Define RapidAPI response types based on your curl output
interface RapidApiUser {
  __typename: string;
  id: string;
  rest_id: string;
  legacy: {
    screen_name: string;
    name: string;
    followers_count: number;
    friends_count: number;
    statuses_count: number;
    profile_image_url_https?: string;
    description?: string;
  };
}

interface RapidApiUserResponse {
  result: {
    data: {
      user: {
        result: RapidApiUser;
      };
    };
  };
}

interface RapidApiTweet {
  entryId: string;
  content: {
    itemContent?: {
      tweet_results: {
        result: {
          __typename: string;
          rest_id: string;
          legacy: {
            full_text: string;
            created_at: string;
            favorite_count: number;
            retweet_count: number;
            reply_count: number;
            user_id_str: string;
            id_str: string;
          };
          core?: {
            user_results: {
              result: RapidApiUser;
            };
          };
        };
      };
    };
  };
}

interface RapidApiTweetsResponse {
  result: {
    timeline: {
      instructions: Array<{
        entries: RapidApiTweet[];
      }>;
    };
  };
}

interface RapidApiCursor {
  entryId: string;
  content: {
    entryType: string;
    value?: string;
    cursorType?: string;
  };
}

interface RapidApiTweetsResponse {
  result: {
    timeline: {
      instructions: Array<{
        entries: (RapidApiTweet | RapidApiCursor)[];
      }>;
    };
  };
}

interface RapidApiError extends Error {
  code?: number;
}

// Helper function to make RapidAPI requests
async function rapidApiRequest(endpoint: string, apiKey: string): Promise<any> {
  const response = await fetch(`${RAPIDAPI_BASE}${endpoint}`, {
    headers: {
      'x-rapidapi-host': 'twitter241.p.rapidapi.com',
      'x-rapidapi-key': apiKey,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    const error: RapidApiError = new Error(errorData.error || `RapidAPI error: ${response.status}`);
    error.code = response.status;
    throw error;
  }

  return response.json();
}

export async function scrapeUserTweets(username: string, limit: number = 50): Promise<ScrapeResponse> {
  try {
    // Check if required environment variables are present
    const apiKey = process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'RapidAPI key not configured. Please check your .env.local file.',
        tweets: [],
        count: 0
      };
    }
    
    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');
    
    // First, get the user by username to get their user ID
    const userResponse: RapidApiUserResponse = await rapidApiRequest(
      `/user?username=${cleanUsername}`,
      apiKey
    );

    if (!userResponse?.result?.data?.user?.result) {
      return {
        success: false,
        error: `User @${cleanUsername} not found`,
        tweets: [],
        count: 0
      };
    }

    const user = userResponse.result.data.user.result;
    const userId = user.rest_id;

    const allTweets: Tweet[] = [];
    let cursor: string | null = null;
    const maxPerRequest = 20; // RapidAPI's max per request
    let remainingTweets = limit;

    // Keep making requests until we have enough tweets or no more data
    while (remainingTweets > 0) {
      // Build the request URL
      const requestCount = Math.min(remainingTweets, maxPerRequest);
      let endpoint = `/user-tweets?user=${userId}&count=${requestCount}`;
      
      // Add cursor for pagination if we have one
      if (cursor) {
        endpoint += `&cursor=${encodeURIComponent(cursor)}`;
      }

      const tweetsResponse: RapidApiTweetsResponse = await rapidApiRequest(endpoint, apiKey);

      let foundTweets = 0;
      let nextCursor: string | null = null;

      // Parse the complex nested structure from RapidAPI
      if (tweetsResponse?.result?.timeline?.instructions) {
        for (const instruction of tweetsResponse.result.timeline.instructions) {
          if (instruction.entries) {
            for (const entry of instruction.entries) {
              // Check for cursor entries for pagination
              if (entry.entryId.startsWith('cursor-bottom-') || entry.entryId.startsWith('cursor-')) {
                const cursorEntry = entry as RapidApiCursor;
                if (cursorEntry.content.cursorType === 'Bottom' && cursorEntry.content.value) {
                  nextCursor = cursorEntry.content.value;
                }
                continue;
              }

              // Skip non-tweet entries (like who-to-follow, cursors, etc.)
              if (!entry.entryId.startsWith('tweet-') && !entry.entryId.startsWith('profile-conversation-')) {
                continue;
              }

              const tweetEntry = entry as RapidApiTweet;
              const tweetResult = tweetEntry.content?.itemContent?.tweet_results?.result;
              if (!tweetResult || tweetResult.__typename !== 'Tweet') {
                continue;
              }

              const tweet = tweetResult.legacy;
              const author = tweetResult.core?.user_results?.result || user;

              const tweetObj: Tweet = {
                id: tweet.id_str,
                text: tweet.full_text,
                created_at: tweet.created_at,
                retweet_count: tweet.retweet_count || 0,
                like_count: tweet.favorite_count || 0,
                reply_count: tweet.reply_count || 0,
                user: {
                  username: author.legacy.screen_name || cleanUsername,
                  display_name: author.legacy.name || cleanUsername,
                  followers_count: author.legacy.followers_count || 0,
                  profile_image_url: author.legacy.profile_image_url_https
                }
              };

              allTweets.push(tweetObj);
              foundTweets++;
              
              // Stop if we've reached our limit
              if (allTweets.length >= limit) {
                break;
              }
            }
          }
        }
      }

      // Update remaining tweets count
      remainingTweets -= foundTweets;

      // Break if we didn't find any tweets or don't have a next cursor
      if (foundTweets === 0 || !nextCursor || allTweets.length >= limit) {
        break;
      }

      // Set cursor for next request
      cursor = nextCursor;

      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Trim to exact limit requested
    const finalTweets = allTweets.slice(0, limit);

    return {
      success: true,
      tweets: finalTweets,
      count: finalTweets.length
    };

  } catch (error) {
    console.error('RapidAPI error:', error);
    
    const rapidApiError = error as RapidApiError;
    
    // Handle specific RapidAPI errors
    if (rapidApiError.code === 429) {
      return {
        success: false,
        error: 'RapidAPI rate limit exceeded. Please try again later.',
        tweets: [],
        count: 0
      };
    }

    if (rapidApiError.code === 401) {
      return {
        success: false,
        error: 'RapidAPI authentication failed. Please check your API key.',
        tweets: [],
        count: 0
      };
    }

    if (rapidApiError.code === 403) {
      return {
        success: false,
        error: 'Access forbidden. Please check your RapidAPI subscription.',
        tweets: [],
        count: 0
      };
    }

    return {
      success: false,
      error: `RapidAPI error: ${rapidApiError.message || 'Unknown error'}`,
      tweets: [],
      count: 0
    };
  }
}