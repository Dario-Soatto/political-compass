'use client';

import { useState, useEffect } from 'react';
import { Tweet, ScrapeResponse, PoliticalAnalysis, AnalysisResponse } from '@/types/twitter';
import { mockDarioData, mockElonData, mockSamaData, mockTrumpData, mockAocData } from '@/mockData';

export default function TwitterScraper() {
  const [username, setUsername] = useState('');
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [analysis, setAnalysis] = useState<PoliticalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false); // Toggle for mock data
  const [mockDataType, setMockDataType] = useState< 'dario' | 'elon' | 'sama' | 'trump' | 'aoc'>('dario');
  const [generatingImage, setGeneratingImage] = useState(false);

  // Read username from URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlUsername = urlParams.get('username');
    if (urlUsername) {
      setUsername(urlUsername);
      // Automatically trigger analysis after setting the username
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }, 100); // Small delay to ensure state is updated
    }
  }, []);

  const getMockData = (): ScrapeResponse => {
    switch (mockDataType) {
      case 'dario':
        return mockDarioData;
      case 'elon':
        return mockElonData;
      case 'sama':
        return mockSamaData;
      case 'trump':
        return mockTrumpData;
      case 'aoc':
        return mockAocData;
      default:
        return mockDarioData;
    }
  };

  // Add this new function to handle mock data type changes
  const handleMockDataTypeChange = (newType: 'dario' | 'elon' | 'sama' | 'trump' | 'aoc') => {
    setMockDataType(newType);
    
    // Auto-fill username based on selected mock data type
    switch (newType) {
      case 'elon':
        setUsername('elonmusk');
        break;
      case 'dario':
        setUsername('dsoatto');
        break;
      case 'sama':
        setUsername('sama');
        break;
      case 'trump':
        setUsername('realdonaldtrump');
        break;
      case 'aoc':
        setUsername('aoc');
        break;
      default:
        // Don't auto-fill for generic mock data types
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnalyzing(false);
    setError(null);
    setTweets([]);
    setAnalysis(null);

    try {
      let scrapeData: ScrapeResponse;

      if (useMockData) {
        // Step 1: Use mock data instead of API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        scrapeData = getMockData();
        
        // Update the username in mock data to match input
        const cleanUsername = username.replace('@', '');
        scrapeData.tweets = scrapeData.tweets.map(tweet => ({
          ...tweet,
          user: {
            ...tweet.user,
            username: cleanUsername || 'testuser'
          }
        }));
      } else {
        // Step 1: Scrape tweets (original API call)
        const scrapeResponse = await fetch('/compass/api/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, limit, useMockData: false }),
        });

        scrapeData = await scrapeResponse.json();

        if (!scrapeResponse.ok) {
          if (scrapeResponse.status === 429) {
            throw new Error(scrapeData.error || 'Rate limit exceeded. Please wait before making another request.');
          }
          throw new Error(scrapeData.error || 'Failed to scrape tweets');
        }

        if (!scrapeData.success) {
          throw new Error(scrapeData.error || 'Failed to scrape tweets');
        }
      }

      setTweets(scrapeData.tweets);
      setLoading(false);

      // Step 2: Analyze political leanings
      setAnalyzing(true);
      const analysisResponse = await fetch('/compass/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweets: scrapeData.tweets }),
      });

      const analysisData: AnalysisResponse = await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(analysisData.error || 'Failed to analyze political leanings');
      }

      if (analysisData.success && analysisData.analysis) {
        setAnalysis(analysisData.analysis);
      } else {
        throw new Error(analysisData.error || 'Failed to analyze political leanings');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const generateImage = async () => {
    if (!analysis || !tweets[0]) return;
    
    setGeneratingImage(true);
    
    try {
      // Create canvas with dimensions matching the side-by-side layout
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const pixelRatio = window.devicePixelRatio || 1;
      const width = 1400; // Wide enough for side-by-side layout
      const height = 600;  // Height to accommodate both sections
      
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Fill with dark background matching the page
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);
      
      // Load and draw the political compass
      const compassImg = new Image();
      compassImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        compassImg.onload = resolve;
        compassImg.onerror = reject;
        compassImg.src = 'https://miro.medium.com/v2/resize:fit:1400/1*IQ5JRVrwKfplrBHOYvEKdg.png';
      });
      
      // Position compass on the left side (matching the page layout)
      const compassSize = 500;
      const compassX = 80;
      const compassY = (height - compassSize) / 2;
      
      // Draw compass with rounded corners to match page styling
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(compassX, compassY, compassSize, compassSize, 8);
      ctx.clip();
      ctx.drawImage(compassImg, compassX, compassY, compassSize, compassSize);
      ctx.restore();
      
      // Draw user position on compass
      if (tweets[0]?.user.profile_image_url) {
        try {
          const userImg = new Image();
          userImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            userImg.onload = resolve;
            userImg.onerror = reject;
            userImg.src = tweets[0].user.profile_image_url!;
          });
          
          const userSize = 48;
          const userX = compassX + (compassSize * (50 + analysis.left_right_score * 4) / 100) - userSize / 2;
          const userY = compassY + (compassSize * (50 - analysis.authoritarian_libertarian_score * 4) / 100) - userSize / 2;
          
          // Draw circular user image
          ctx.save();
          ctx.beginPath();
          ctx.arc(userX + userSize / 2, userY + userSize / 2, userSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(userImg, userX, userY, userSize, userSize);
          ctx.restore();
          
          // Draw white border around user image
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(userX + userSize / 2, userY + userSize / 2, userSize / 2, 0, Math.PI * 2);
          ctx.stroke();
        } catch (error) {
          console.log('Could not load user profile image');
        }
      }
      
      // Calculate the actual content height needed for the analysis box
      const titleHeight = 50;
      const scoresHeight = 100;
      const labelBoxHeight = 70;
      const confidenceBoxHeight = 70;
      const padding = 30;
      const spacing = 20;
      
      const actualBoxHeight = padding + titleHeight + spacing + scoresHeight + spacing + labelBoxHeight + spacing + confidenceBoxHeight + padding;
      
      // Draw the analysis results box on the right side with calculated height
      const boxX = compassX + compassSize + 60;
      const boxY = compassY + (compassSize - actualBoxHeight) / 2; // Center it vertically with compass
      const boxWidth = width - boxX - 60;
      
      // Draw the dark box with border (matching page styling)
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, actualBoxHeight, 8);
      ctx.fill();
      ctx.stroke();
      
      // Set text properties
      ctx.fillStyle = '#ededed';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      let textY = boxY + padding;
      const textX = boxX + 30;
      const contentWidth = boxWidth - 60;
      
      // Title
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
      ctx.fillText('Political Analysis Results', textX, textY);
      textY += titleHeight + spacing;
      
      // Two-column layout for scores
      const colWidth = (contentWidth - 20) / 2;
      
      // Authoritarian ↔ Libertarian box
      const leftBoxX = textX;
      const leftBoxY = textY;
      
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#d1d5db';
      ctx.beginPath();
      ctx.roundRect(leftBoxX, leftBoxY, colWidth, scoresHeight, 4);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#d1d5db';
      ctx.font = '600 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('Authoritarian ↔ Libertarian', leftBoxX + 15, leftBoxY + 15);
      
      ctx.fillStyle = '#ededed';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      const authScore = analysis.authoritarian_libertarian_score > 0 ? '+' : '';
      ctx.fillText(`${authScore}${analysis.authoritarian_libertarian_score}`, leftBoxX + 15, leftBoxY + 40);
      
      ctx.fillStyle = '#d1d5db';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      const authLabel = analysis.authoritarian_libertarian_score > 0 ? 'Authoritarian' : 'Libertarian';
      ctx.fillText(`${authLabel} leaning`, leftBoxX + 15, leftBoxY + 70);
      
      // Left ↔ Right box
      const rightBoxX = textX + colWidth + 20;
      const rightBoxY = textY;
      
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#d1d5db';
      ctx.beginPath();
      ctx.roundRect(rightBoxX, rightBoxY, colWidth, scoresHeight, 4);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#d1d5db';
      ctx.font = '600 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('Left ↔ Right', rightBoxX + 15, rightBoxY + 15);
      
      ctx.fillStyle = '#ededed';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      const leftRightScore = analysis.left_right_score > 0 ? '+' : '';
      ctx.fillText(`${leftRightScore}${analysis.left_right_score}`, rightBoxX + 15, rightBoxY + 40);
      
      ctx.fillStyle = '#d1d5db';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      const lrLabel = analysis.left_right_score > 0 ? 'Right' : 'Left';
      ctx.fillText(`${lrLabel} leaning`, rightBoxX + 15, rightBoxY + 70);
      
      textY += scoresHeight + spacing;
      
      // Political Label box
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#d1d5db';
      ctx.beginPath();
      ctx.roundRect(textX, textY, contentWidth, labelBoxHeight, 4);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#d1d5db';
      ctx.font = '600 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('Political Label', textX + 15, textY + 15);
      
      ctx.fillStyle = '#ededed';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(analysis.political_label, textX + 15, textY + 40);
      
      textY += labelBoxHeight + spacing;
      
      // Confidence box
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#d1d5db';
      ctx.beginPath();
      ctx.roundRect(textX, textY, contentWidth, confidenceBoxHeight, 4);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#d1d5db';
      ctx.font = '600 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('Confidence', textX + 15, textY + 15);
      
      ctx.fillStyle = '#ededed';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${Math.round(analysis.confidence_score * 100)}%`, textX + 15, textY + 35);
      
      // Confidence bar
      const barX = textX + 80;
      const barY = textY + 40;
      const barWidth = contentWidth - 110;
      const barHeight = 8;
      
      // Background bar
      ctx.fillStyle = '#d1d5db';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 4);
      ctx.fill();
      
      // Progress bar
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth * analysis.confidence_score, barHeight, 4);
      ctx.fill();
      
      // Download the image
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `political-compass-${tweets[0].user.username}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div>
      {/* Main content with constrained width */}
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 font-mono">Twitter Political Compass</h1>
        
        {/* Mock Data Toggle */}
        <div className="mb-6 p-4 bg-black border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-3">Testing Mode</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useMockData}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setUseMockData(isChecked);
                  // Auto-fill username when enabling mock data
                  if (isChecked) {
                    setUsername('dsoatto');
                  }
                }}
                className="mr-2"
              />
              Use mock data (for testing without API limits)
            </label>
            
            {useMockData && (
              <div className="ml-6">
                <label className="block text-sm font-medium mb-2">Mock Data Type:</label>
                <select
                  value={mockDataType}
                  onChange={(e) => handleMockDataTypeChange(e.target.value as 'dario' | 'elon')}
                  className="px-3 py-1 border border-gray-300 rounded-md"
                >
                  
                  <option value="dario">Dario Soatto&apos;s Views</option>
                  <option value="elon">Elon Musk&apos;s Views</option>
                  <option value="sama">Sam Altman&apos;s Views</option>
                  <option value="trump">Donald Trump&apos;s Views</option>
                  <option value="aoc">Alexandria Ocasio-Cortez&apos;s Views</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Twitter Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@elonmusk or elonmusk"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly={useMockData}
            />
          </div>
          
          <div>
            <label htmlFor="limit" className="block text-sm font-medium mb-2">
              Number of Tweets to analyze (max 50)
            </label>
            <input
              type="number"
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              min="1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || analyzing}
            className="border border-gray-200 rounded-lg p-4 flex gap-3 bg-black hover:bg-gray-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? 'Scraping Tweets...' : analyzing ? 'Analyzing Politics...' : 'Analyze Political Leaning'}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
      </div>

      {/* Wide section for Political Compass and Analysis Results side by side */}
      {analysis && (
        <div className="w-full px-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Political Compass Image */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative inline-block">
                  <img 
                    src="https://miro.medium.com/v2/resize:fit:1400/1*IQ5JRVrwKfplrBHOYvEKdg.png"
                    alt="Political Compass Chart"
                    className="max-w-lg w-full h-auto rounded-lg shadow-lg"
                  />
                  {tweets[0]?.user.profile_image_url && (
                    <img 
                      src={tweets[0].user.profile_image_url} 
                      alt={`${tweets[0].user.display_name}'s position`}
                      className="absolute w-12 h-12 rounded-full object-cover border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${50 + (analysis.left_right_score * 4)}%`,
                        top: `${50 - (analysis.authoritarian_libertarian_score * 4)}%`
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Political Analysis Results */}
              <div className="bg-black border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 font-mono">Political Analysis Results</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-black border border-gray-200 p-4 rounded">
                    <h3 className="font-semibold text-gray-200">Authoritarian ↔ Libertarian</h3>
                    <div className="text-2xl font-bold">
                      {analysis.authoritarian_libertarian_score > 0 ? '+' : ''}{analysis.authoritarian_libertarian_score}
                    </div>
                    <div className="text-sm text-gray-200">
                      {analysis.authoritarian_libertarian_score > 0 ? 'Authoritarian' : 'Libertarian'} leaning
                    </div>
                  </div>
                  
                  <div className="bg-black border border-gray-200 p-4 rounded">
                    <h3 className="font-semibold text-gray-200">Left ↔ Right</h3>
                    <div className="text-2xl font-bold">
                      {analysis.left_right_score > 0 ? '+' : ''}{analysis.left_right_score}
                    </div>
                    <div className="text-sm text-gray-200">
                      {analysis.left_right_score > 0 ? 'Right' : 'Left'} leaning
                    </div>
                  </div>
                </div>
                
                <div className="bg-black border border-gray-200 p-4 rounded mb-4">
                  <h3 className="font-semibold text-gray-200 mb-2">Political Label</h3>
                  <div className="text-xl font-bold text-gray-200">{analysis.political_label}</div>
                </div>
                
                <div className="bg-black border border-gray-200 p-4 rounded">
                  <h3 className="font-semibold text-gray-200 mb-2">Confidence</h3>
                  <div className="flex items-center">
                    <div className="text-lg font-bold mr-2">
                      {Math.round(analysis.confidence_score * 100)}%
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${analysis.confidence_score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - moved below the compass/analysis */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={generateImage}
                disabled={generatingImage}
                className="border border-gray-200 rounded-lg p-4 flex gap-3 bg-black hover:bg-gray-600 disabled:bg-green-400 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2"
              >
                {generatingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating Image...
                  </>
                ) : (
                  <>
                    Generate Image
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  const tweetText = `Check out my political compass results!`;
                  const url = `${window.location.origin}${window.location.pathname}?username=${encodeURIComponent(tweets[0].user.username)}`;
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
                  window.open(twitterUrl, '_blank');
                }}
                className="border border-gray-200 rounded-lg p-4 flex gap-3 bg-black hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2"
              >
                Share on X
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to constrained width for tweets list */}
      <div className="max-w-4xl mx-auto p-6">
        {tweets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              {tweets[0]?.user.profile_image_url && (
                <img 
                  src={tweets[0].user.profile_image_url} 
                  alt={`${tweets[0].user.display_name}'s profile`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <div>Analyzed {tweets.length} tweets from @{tweets[0]?.user.username}</div>
                <div className="text-lg font-normal text-gray-200">{tweets[0]?.user.display_name}</div>
              </div>
            </h2>
            
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <div key={tweet.id} className="border border-gray-200 rounded-lg p-4 flex gap-3">
                  {tweet.user.profile_image_url && (
                    <img 
                      src={tweet.user.profile_image_url} 
                      alt={`${tweet.user.display_name}'s profile`}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-200">{tweet.user.display_name}</span>
                      <span className="text-gray-500">@{tweet.user.username}</span>
                      {tweet.created_at && (
                        <>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500">{new Date(tweet.created_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-300 mb-3">{tweet.text}</p>
                    <div className="text-sm text-gray-500 flex gap-4">
                      <span>❤️ {tweet.like_count}</span>
                      <span>🔄 {tweet.retweet_count}</span>
                      <span>💬 {tweet.reply_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}