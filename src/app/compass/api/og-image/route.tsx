import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';
import { Tweet, PoliticalAnalysis, ScrapeResponse, AnalysisResponse } from '@/types/twitter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
    }

    console.log(`[OG Image API] Generating for username: ${username}`);

    // Call the existing scrape API
    const scrapeResponse = await fetch(`${request.nextUrl.origin}/compass/api/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, limit: 20, useMockData: false }),
    });

    if (!scrapeResponse.ok) {
      throw new Error('Failed to scrape tweets');
    }

    const scrapeResult: ScrapeResponse = await scrapeResponse.json();
    
    if (!scrapeResult.success || scrapeResult.tweets.length === 0) {
      return NextResponse.json({ error: scrapeResult.error || 'No tweets found' }, { status: 404 });
    }

    // Call the existing analyze API
    const analyzeResponse = await fetch(`${request.nextUrl.origin}/compass/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tweets: scrapeResult.tweets }),
    });

    if (!analyzeResponse.ok) {
      throw new Error('Failed to analyze tweets');
    }

    const analysisResult: AnalysisResponse = await analyzeResponse.json();
    
    if (!analysisResult.success || !analysisResult.analysis) {
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }

    const analysis = analysisResult.analysis;
    const tweet = scrapeResult.tweets[0];

    // Absolute simplest structure - single div with all text
    return new ImageResponse(
      (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a', 
          color: '#ffffff',
          fontSize: '24px',
          fontFamily: 'system-ui',
          textAlign: 'center',
          padding: '40px'
        }}>
          @{tweet.user.username} • {analysis.political_label} • Auth/Lib: {analysis.authoritarian_libertarian_score} • L/R: {analysis.left_right_score} • Confidence: {Math.round(analysis.confidence_score * 100)}%
        </div>
      ),
      { width: 1200, height: 630 }
    );

  } catch (error) {
    console.error('[OG Image API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}