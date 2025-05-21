export interface Restaurant {
  id: number;
  name: string;
  website?: string;
  address: string;
  city: string;
  googleRating?: number | null;
  priceRange?: string | null;
  categories?: string[];
  googleMapLink?: string;
  mentionCount?: number;
  lastMentionDate?: string | Date | null;
  sentimentScore?: number | null;
  sentimentSummary?: string | null;
  recommendations?: RedditRecommendation[];
}

export interface RedditRecommendation {
  id: number;
  restaurantId: number;
  postId: string;
  commentId?: string;
  subreddit: string;
  content: string;
  sentimentScore?: number | null;
  sentimentSummary?: string | null;
  postDate?: string | Date | null;
  createdAt?: string | Date;
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  city?: string;
  createdAt: string | Date;
}

export interface City {
  id: string;
  name: string;
}

export interface FoodCategory {
  id: string;
  name: string;
}

export interface SearchState {
  searchQuery: string;
  city: string | null;
  handleSearch: (query: string) => void;
  setCity: (city: string | null) => void;
}
