// scripts/fetch-my-tweets.ts
import { config } from 'dotenv';
import { scrapeUserTweets } from '../src/services/twitter';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function fetchMyTweets() {
  try {
    console.log('Environment check:', {
      hasToken: !!process.env.TWITTER_BEARER_TOKEN,
      tokenStart: process.env.TWITTER_BEARER_TOKEN?.substring(0, 10) + '...'
    });
    
    console.log('Fetching tweets for aoc...');
    const result = await scrapeUserTweets('aoc', 20);
    
    if (result.success) {
      console.log('Successfully fetched tweets!');
      console.log('='.repeat(50));
      console.log('Copy this data to your mockData.ts file:');
      console.log('='.repeat(50));
      console.log(JSON.stringify(result, null, 2));
      console.log('='.repeat(50));
    } else {
      console.error('Failed to fetch tweets:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchMyTweets();