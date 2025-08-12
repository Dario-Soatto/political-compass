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

    // Updated text with Political Analysis Results header
    const displayText = `Political Analysis Results

@${tweet.user.username}

${analysis.political_label}

Confidence: ${Math.round(analysis.confidence_score * 100)}%`;

    // Calculate position for profile picture (same logic as TwitterScraper.tsx)
    const compassSize = 450;
    const userSize = 40;
    const userX = 50 + (analysis.left_right_score * 4); // percentage from left
    const userY = 50 - (analysis.authoritarian_libertarian_score * 4); // percentage from top

    return new ImageResponse(
      (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex',
          backgroundColor: '#0a0a0a', 
          color: '#ffffff',
          fontFamily: 'system-ui'
        }}>
          {/* Left side - Political Compass with Profile Picture */}
          <div style={{ 
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Compass Background */}
            <img 
              src="https://miro.medium.com/v2/resize:fit:1400/1*IQ5JRVrwKfplrBHOYvEKdg.png"
              width={compassSize}
              height={compassSize}
              style={{
                borderRadius: '8px',
                imageRendering: 'crisp-edges'
              }}
            />
            
            {/* Profile Picture positioned on compass */}
            {tweet.user.profile_image_url && (
              <img
                src={tweet.user.profile_image_url}
                width={userSize}
                height={userSize}
                style={{
                  position: 'absolute',
                  left: `${userX}%`,
                  top: `${userY}%`,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  border: '3px solid #ffffff'
                }}
              />
            )}
          </div>

          {/* Right side - Text */}
          <div style={{ 
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            fontSize: '32px',
            textAlign: 'left',
            padding: '40px',
            whiteSpace: 'pre-line',
            lineHeight: '1.4',
            fontWeight: 'bold'
          }}>
            {displayText}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        debug: false
      }
    );

  } catch (error) {
    console.error('[OG Image API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}