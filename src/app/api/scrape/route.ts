import { NextRequest, NextResponse } from 'next/server';
import { scrapeUserTweets } from '@/services/twitter';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, number>();
// Twitter API v2 allows 300 requests per 15-minute window for user timeline
// Let's be more conservative and allow 1 request per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers (for Vercel deployment)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfIP) {
    return cfIP;
  }
  
  // Fallback for unknown IPs
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip);
  
  if (!lastRequest) {
    rateLimitMap.set(ip, now);
    return false;
  }
  
  if (now - lastRequest < RATE_LIMIT_WINDOW) {
    return true; // Still within rate limit window
  }
  
  // Update the timestamp for this IP
  rateLimitMap.set(ip, now);
  return false;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

export async function POST(request: NextRequest) {
  try {
    const { username, limit = 50, useMockData = false } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Only apply rate limiting when NOT using mock data
    if (!useMockData) {
      const clientIP = getClientIP(request);
      console.log(`Request from IP: ${clientIP}`);
      
      if (isRateLimited(clientIP)) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded. You can only make one Twitter API request per minute. Use mock data for testing.',
            rateLimited: true
          },
          { status: 429 }
        );
      }
    }

    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');

    console.log(`Scraping tweets for: ${cleanUsername} ${useMockData ? '(mock data would be used)' : '(using Twitter API)'}`);
    
    // Use Twitter API service
    const result = await scrapeUserTweets(cleanUsername, limit);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in scrape API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}