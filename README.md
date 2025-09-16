# Political Compass

A modern web application that analyzes Twitter users' political leanings based on their tweets using AI. Built with Next.js and powered by Google's Gemini AI.

## 🌟 Features

- **Twitter Analysis**: Scrape and analyze any Twitter user's recent tweets
- **AI-Powered Insights**: Uses Google Gemini AI to determine political positioning
- **Political Compass Visualization**: Interactive compass showing economic and social positions
- **Social Sharing**: Auto-generated OG images for sharing results
- **Mock Data**: Built-in test data for development and demonstrations
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🚀 Live Demo

Visit [compass.soatto.com](https://www.compass.soatto.com) to try it out!

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **AI**: [Google Gemini AI](https://ai.google.dev/)
- **Twitter API**: [twitter-api-v2](https://github.com/PLhery/node-twitter-api-v2)
- **OG Images**: [@vercel/og](https://vercel.com/docs/functions/edge-functions/og-image-generation)
- **Deployment**: [Vercel](https://vercel.com/)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/political-compass.git
   cd political-compass
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Required: Google Gemini AI API Key
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Required: Twitter API v2 Bearer Token
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
   
   # Optional: Base URL for production (used for OG images)
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Keys Setup

### Google Gemini AI
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env.local` as `GEMINI_API_KEY`

### Twitter API
1. Apply for Twitter API access at [developer.twitter.com](https://developer.twitter.com/)
2. Create a new app and get your Bearer Token
3. Add it to your `.env.local` as `TWITTER_BEARER_TOKEN`

## 🏗️ Project Structure
