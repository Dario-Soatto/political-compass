'use client';

import { useState } from 'react';
import { Tweet, ScrapeResponse, PoliticalAnalysis, AnalysisResponse } from '@/types/twitter';
import { mockTweetData, mockConservativeData, mockLiberalData } from '@/mockData';

export default function TwitterScraper() {
  const [username, setUsername] = useState('');
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [analysis, setAnalysis] = useState<PoliticalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(true); // Toggle for mock data
  const [mockDataType, setMockDataType] = useState<'mixed' | 'conservative' | 'liberal'>('mixed');

  const getMockData = (): ScrapeResponse => {
    switch (mockDataType) {
      case 'conservative':
        return mockConservativeData;
      case 'liberal':
        return mockLiberalData;
      default:
        return mockTweetData;
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
        const scrapeResponse = await fetch('/api/scrape', {
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
      const analysisResponse = await fetch('/api/analyze', {
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

  return (
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
              onChange={(e) => setUseMockData(e.target.checked)}
              className="mr-2"
            />
            Use mock data (for testing without API limits)
          </label>
          
          {useMockData && (
            <div className="ml-6">
              <label className="block text-sm font-medium mb-2">Mock Data Type:</label>
              <select
                value={mockDataType}
                onChange={(e) => setMockDataType(e.target.value as 'mixed' | 'conservative' | 'liberal')}
                className="px-3 py-1 border border-gray-300 rounded-md"
              >
                <option value="mixed">Mixed Political Views</option>
                <option value="conservative">Conservative Views</option>
                <option value="liberal">Liberal Views</option>
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
          />
        </div>
        
        <div>
          <label htmlFor="limit" className="block text-sm font-medium mb-2">
            Number of Tweets (max 100)
          </label>
          <input
            type="number"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || analyzing}
          className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? 'Scraping Tweets...' : analyzing ? 'Analyzing Politics...' : 'Analyze Political Leaning'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {/* Political Compass Image */}
      {analysis && (
        <div className="mb-6 flex justify-center">
          <div className="relative inline-block">
            <img 
              src="https://miro.medium.com/v2/resize:fit:1400/1*IQ5JRVrwKfplrBHOYvEKdg.png"
              alt="Political Compass Chart"
              className="max-w-full h-auto rounded-lg shadow-lg"
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
      )}

      {/* Political Analysis Results */}
      {analysis && (
        <div className="bg-black border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 font-mono">Political Analysis Results</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
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
      )}

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
  );
}