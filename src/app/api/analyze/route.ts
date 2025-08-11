import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Tweet, PoliticalAnalysis } from '@/types/twitter';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { tweets }: { tweets: Tweet[] } = await request.json();

    if (!tweets || tweets.length === 0) {
      return NextResponse.json(
        { error: 'No tweets provided for analysis' },
        { status: 400 }
      );
    }

    // Combine all tweet texts
    const tweetTexts = tweets.map(tweet => tweet.text).join('\n\n');

    console.log('Analyzing tweets for political leanings...');
    const analysis = await analyzePoliticalLeanings(tweetTexts);
    
    return NextResponse.json({
      success: true,
      analysis
    });
    
  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze political leanings' },
      { status: 500 }
    );
  }
}

async function analyzePoliticalLeanings(tweetTexts: string): Promise<PoliticalAnalysis> {
  const prompt = `
Analyze the following tweets and determine the author's political leanings on two dimensions:

1. Authoritarian/Libertarian axis (-10 to +10):
   - Negative scores = Libertarian (favors individual freedom, minimal government)
   - Positive scores = Authoritarian (favors strong government control, order)

2. Left/Right economic axis (-10 to +10):
   - Negative scores = Left (progressive, pro-regulation, pro-welfare)
   - Positive scores = Right (conservative, free-market, traditional values)

Also provide:
- A political label that best fits. For the political label, be highly specific and nuanced. Instead of generic terms like "Liberal" or "Conservative", use detailed ideological descriptors that capture the person's specific blend of beliefs. Consider these examples:

- "Techno-Optimist Libertarian" (pro-tech, anti-regulation)
- "Post-Keynesian Social Democrat" (economic left, moderate authority)
- "Paleo-Conservative Nationalist" (traditional right, authoritarian)
- "Bleeding Heart Libertarian" (socially liberal, economically right)
- "Democratic Socialist with Authoritarian Tendencies"
- "Neo-Reactionary Accelerationist" (far-right futurist)
- "Anarcho-Syndicalist" (far-left, anti-authority)
- "Third Way Neoliberal" (centrist with market emphasis)
- "Christian Democratic Corporatist" (center-right, community-focused)
- "Green Social Liberal" (environmentalist, moderate left)
- "Populist Nationalist" (anti-elite, pro-sovereignty)
- "Effective Altruist Utilitarian" (evidence-based, outcome-focused)
- "Post-Liberal Communitarian" (beyond left-right, community-focused)
- "Georgist Single-Taxer" (land value tax advocate)
- "Austrian School Minarchist" (minimal state, free market)
- "Distributist" (third way between capitalism and socialism)
- "Market Socialist" (worker ownership, market mechanisms)
- "Eco-Fascist" (environmental authoritarianism)
- "Mutualist" (market anarchism)
- "Neo-Feudalist" (hierarchical capitalism)

Create a label that captures the specific intellectual tradition, policy preferences, and ideological nuances evident in the tweets. Be creative and precise rather than generic.
- A confidence score (0-1) for how certain you are about this analysis

Tweets to analyze:
${tweetTexts}

Respond with ONLY a JSON object in this exact format:
{
  "authoritarian_libertarian_score": -3,
  "left_right_score": 2,
  "political_label": "Conservative Libertarian",
  "confidence_score": 0.75
}`;

  try {
    console.log('Sending request to Gemini...');
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite",
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 200,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini response:', text);
    
    // Clean the response text (remove any markdown formatting)
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```$/, '').trim();
    }
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```$/, '').trim();
    }
    
    const parsedResult = JSON.parse(cleanText);
    console.log('Parsed analysis result:', parsedResult);
    
    return parsedResult;
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', parseError);
    throw new Error('Invalid JSON response from Gemini');
  }
}