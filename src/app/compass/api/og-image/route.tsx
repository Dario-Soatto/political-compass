import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';
import { Tweet, PoliticalAnalysis, ScrapeResponse, AnalysisResponse } from '@/types/twitter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // If no username, generate a default preview image
    if (!username) {
      return new ImageResponse(
        (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex',
            backgroundColor: '#0a0a0a', 
            color: '#ffffff',
            fontFamily: 'system-ui',
            padding: '40px'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#000000'
            }}>
              {/* Left side - Political Compass */}
              <div style={{ 
                width: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '40px'
              }}>
                <img 
                  src="https://miro.medium.com/v2/resize:fit:1400/1*IQ5JRVrwKfplrBHOYvEKdg.png"
                  width="450"
                  height="450"
                  style={{
                    borderRadius: '8px',
                    imageRendering: 'crisp-edges'
                  }}
                />
              </div>

              {/* Right side - Default Text */}
              <div style={{ 
                width: '50%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '40px'
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  marginBottom: '30px',
                  color: '#ededed'
                }}>
                  X Political Compass
                </div>
                
                <div style={{
                  fontSize: '24px',
                  marginBottom: '25px',
                  color: '#22c55e',
                  lineHeight: '1.3'
                }}>
                  Find your politics based on your X activity
                </div>
                
                <div style={{
                  fontSize: '20px',
                  color: '#d1d5db'
                }}>
                  Enter any X handle to get started
                </div>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          debug: false
        }
      );
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
          fontFamily: 'system-ui',
          padding: '40px'
        }}>
          {/* Container with border (like TwitterScraper) */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#000000'
          }}>
            {/* Left side - Political Compass with Profile Picture */}
            <div style={{ 
              width: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: '40px'
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
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '40px'
            }}>
              {/* Large title */}
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '30px',
                color: '#ededed'
              }}>
                Political Analysis Results
              </div>
              
              {/* Username */}
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '25px',
                color: '#ffffff'
              }}>
                @{tweet.user.username}
              </div>
              
              {/* Political Label */}
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '25px',
                color: '#22c55e'
              }}>
                {analysis.political_label}
              </div>
              
              {/* Confidence */}
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#d1d5db'
              }}>
                Confidence: {Math.round(analysis.confidence_score * 100)}%
              </div>
            </div>
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