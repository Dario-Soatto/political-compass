export interface Tweet {
    id: string;
    text: string;
    created_at: string | null;
    retweet_count: number;
    like_count: number;
    reply_count: number;
    user: {
      username: string;
      display_name: string;
      followers_count: number;
      profile_image_url?: string;
    };
  }
  
  export interface ScrapeResponse {
    success: boolean;
    tweets: Tweet[];
    count: number;
    error?: string;
  }

  export interface PoliticalAnalysis {
    authoritarian_libertarian_score: number; // -10 to +10 (negative = libertarian, positive = authoritarian)
    left_right_score: number; // -10 to +10 (negative = left, positive = right)
    political_label: string; // e.g., "Liberal", "Conservative", "Libertarian", "Authoritarian Left"
    confidence_score: number; // 0 to 1
  }
  
  export interface AnalysisResponse {
    success: boolean;
    analysis?: PoliticalAnalysis;
    error?: string;
  }

  