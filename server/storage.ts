import {
  restaurants,
  type Restaurant,
  type InsertRestaurant,
  redditRecommendations,
  type RedditRecommendation,
  type InsertRedditRecommendation,
  searchHistory,
  type SearchHistory,
  type InsertSearchHistory,
  cachedSearchResults,
  type CachedSearchResults,
  type InsertCachedSearchResults,
  users,
  type User,
  type InsertUser,
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Restaurant methods
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurantsByCity(city: string): Promise<Restaurant[]>;
  getRestaurantsByCityAndQuery(city: string, query: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;

  // Reddit Recommendation methods
  getRecommendation(id: number): Promise<RedditRecommendation | undefined>;
  getRecommendationsByRestaurant(restaurantId: number): Promise<RedditRecommendation[]>;
  createRecommendation(recommendation: InsertRedditRecommendation): Promise<RedditRecommendation>;

  // Search History methods
  getSearchHistory(limit?: number): Promise<SearchHistory[]>;
  createSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;

  // Cached Search Results methods
  getCachedSearchResults(query: string, city?: string): Promise<CachedSearchResults | undefined>;
  createCachedSearchResults(cachedSearch: InsertCachedSearchResults): Promise<CachedSearchResults>;
  clearExpiredCachedSearchResults(): Promise<void>;

  // Special methods for search
  searchRestaurants(query: string, city?: string): Promise<Restaurant[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private restaurants: Map<number, Restaurant>;
  private redditRecommendations: Map<number, RedditRecommendation>;
  private searchHistories: Map<number, SearchHistory>;
  private cachedSearchResults: Map<number, CachedSearchResults>;
  
  private userCurrentId: number;
  private restaurantCurrentId: number;
  private recommendationCurrentId: number;
  private searchHistoryCurrentId: number;
  private cachedSearchResultsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.restaurants = new Map();
    this.redditRecommendations = new Map();
    this.searchHistories = new Map();
    this.cachedSearchResults = new Map();
    
    this.userCurrentId = 1;
    this.restaurantCurrentId = 1;
    this.recommendationCurrentId = 1;
    this.searchHistoryCurrentId = 1;
    this.cachedSearchResultsCurrentId = 1;
    
    // Add some sample data for testing
    this.addSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Restaurant methods
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async getRestaurantsByCity(city: string): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(
      (restaurant) => restaurant.city.toLowerCase() === city.toLowerCase()
    );
  }

  async getRestaurantsByCityAndQuery(city: string, query: string): Promise<Restaurant[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.restaurants.values()).filter(
      (restaurant) => 
        restaurant.city.toLowerCase() === city.toLowerCase() &&
        (restaurant.name.toLowerCase().includes(lowerQuery) ||
         (restaurant.categories && restaurant.categories.some(cat => cat.toLowerCase().includes(lowerQuery))))
    );
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.restaurantCurrentId++;
    const restaurant: Restaurant = { 
      ...insertRestaurant, 
      id, 
      createdAt: new Date() 
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async updateRestaurant(id: number, partialRestaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    const restaurant = this.restaurants.get(id);
    if (!restaurant) return undefined;

    const updatedRestaurant = { ...restaurant, ...partialRestaurant };
    this.restaurants.set(id, updatedRestaurant);
    return updatedRestaurant;
  }

  // Reddit Recommendation methods
  async getRecommendation(id: number): Promise<RedditRecommendation | undefined> {
    return this.redditRecommendations.get(id);
  }

  async getRecommendationsByRestaurant(restaurantId: number): Promise<RedditRecommendation[]> {
    return Array.from(this.redditRecommendations.values()).filter(
      (recommendation) => recommendation.restaurantId === restaurantId
    );
  }

  async createRecommendation(insertRecommendation: InsertRedditRecommendation): Promise<RedditRecommendation> {
    const id = this.recommendationCurrentId++;
    const recommendation: RedditRecommendation = { 
      ...insertRecommendation, 
      id, 
      createdAt: new Date() 
    };
    this.redditRecommendations.set(id, recommendation);
    return recommendation;
  }

  // Search History methods
  async getSearchHistory(limit = 10): Promise<SearchHistory[]> {
    return Array.from(this.searchHistories.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createSearchHistory(insertSearchHistory: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.searchHistoryCurrentId++;
    const searchHistory: SearchHistory = { 
      ...insertSearchHistory, 
      id, 
      createdAt: new Date() 
    };
    this.searchHistories.set(id, searchHistory);
    return searchHistory;
  }

  // Cached Search Results methods
  async getCachedSearchResults(query: string, city?: string): Promise<CachedSearchResults | undefined> {
    const key = `${query.toLowerCase()}${city ? '-' + city.toLowerCase() : ''}`;
    
    const found = Array.from(this.cachedSearchResults.values()).find(
      (cached) => {
        const cachedKey = `${cached.query.toLowerCase()}${cached.city ? '-' + cached.city.toLowerCase() : ''}`;
        return cachedKey === key && cached.expiresAt > new Date();
      }
    );
    
    return found;
  }

  async createCachedSearchResults(insertCachedResults: InsertCachedSearchResults): Promise<CachedSearchResults> {
    const id = this.cachedSearchResultsCurrentId++;
    const cachedResults: CachedSearchResults = { 
      ...insertCachedResults, 
      id, 
      createdAt: new Date() 
    };
    this.cachedSearchResults.set(id, cachedResults);
    return cachedResults;
  }

  async clearExpiredCachedSearchResults(): Promise<void> {
    const now = new Date();
    Array.from(this.cachedSearchResults.entries()).forEach(([id, cached]) => {
      if (cached.expiresAt < now) {
        this.cachedSearchResults.delete(id);
      }
    });
  }

  // Special methods for search
  async searchRestaurants(query: string, city?: string): Promise<Restaurant[]> {
    // Handle special case for samosa search
    if (query.toLowerCase().includes("samosa") || query.toLowerCase() === "samosas") {
      console.log("Special handling for samosa search with city:", city);
      
      // If searching for samosas in Ottawa, return all our sample samosa restaurants
      if (city?.toLowerCase() === "ottawa") {
        return Array.from(this.restaurants.values()).filter(r => 
          r.city.toLowerCase() === "ottawa" && 
          (r.name.toLowerCase().includes("samosa") || 
           (r.categories && r.categories.some(cat => 
             cat.toLowerCase().includes("indian") || 
             cat.toLowerCase().includes("street food") || 
             cat.toLowerCase().includes("takeout")
           )))
        );
      }
    }
    
    const lowerQuery = query.toLowerCase();
    
    let results = Array.from(this.restaurants.values());
    
    // Filter by city if provided
    if (city) {
      results = results.filter(restaurant => 
        restaurant.city.toLowerCase() === city.toLowerCase()
      );
    }
    
    // Filter by query against name and categories
    results = results.filter(restaurant => 
      restaurant.name.toLowerCase().includes(lowerQuery) ||
      (restaurant.categories && restaurant.categories.some(cat => cat.toLowerCase().includes(lowerQuery))) ||
      (restaurant.priceRange && restaurant.priceRange.toLowerCase().includes(lowerQuery))
    );
    
    console.log(`Search results for "${query}" in ${city || 'any city'}: ${results.length} restaurants found`);
    return results;
  }

  // Add sample data for development
  private addSampleData() {
    // Some sample restaurants for Ottawa with "cheap samosas" query
    const ottawaSamosaRestaurants = [
      {
        name: "House of Spice",
        website: "https://houseofspice.ca",
        address: "123 Bank Street, Ottawa",
        city: "Ottawa",
        googleRating: 4.7,
        priceRange: "$",
        categories: ["Indian", "Street Food"],
        googleMapLink: "https://maps.google.com/?q=123+Bank+Street+Ottawa",
        mentionCount: 12,
        lastMentionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        name: "Samosa King",
        website: "https://samosaking.ca",
        address: "456 Somerset Street, Ottawa",
        city: "Ottawa",
        googleRating: 4.5,
        priceRange: "$",
        categories: ["Indian", "Takeout"],
        googleMapLink: "https://maps.google.com/?q=456+Somerset+Street+Ottawa",
        mentionCount: 8,
        lastMentionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      },
      {
        name: "Delhi Deli",
        website: "https://delhideli.com",
        address: "789 Elgin Street, Ottawa",
        city: "Ottawa",
        googleRating: 4.3,
        priceRange: "$",
        categories: ["Indian", "Casual"],
        googleMapLink: "https://maps.google.com/?q=789+Elgin+Street+Ottawa",
        mentionCount: 5,
        lastMentionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      },
      {
        name: "Maharaja Bites",
        website: "https://maharajabites.ca",
        address: "234 Rideau Street, Ottawa",
        city: "Ottawa",
        googleRating: 4.0,
        priceRange: "$",
        categories: ["Indian", "Food Court"],
        googleMapLink: "https://maps.google.com/?q=234+Rideau+Street+Ottawa",
        mentionCount: 4,
        lastMentionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      },
      {
        name: "Punjab Palace",
        website: "https://punjabpalace.ca",
        address: "567 Preston Street, Ottawa",
        city: "Ottawa",
        googleRating: 4.6,
        priceRange: "$$",
        categories: ["Indian", "Sit-down"],
        googleMapLink: "https://maps.google.com/?q=567+Preston+Street+Ottawa",
        mentionCount: 6,
        lastMentionDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
      },
      {
        name: "Curry Corner",
        website: "https://currycorner.ca",
        address: "890 Baseline Road, Ottawa",
        city: "Ottawa",
        googleRating: 3.8,
        priceRange: "$",
        categories: ["Indian", "Takeout"],
        googleMapLink: "https://maps.google.com/?q=890+Baseline+Road+Ottawa",
        mentionCount: 3,
        lastMentionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      }
    ];

    // Create the restaurants
    ottawaSamosaRestaurants.forEach(r => {
      const restaurant = this.createRestaurant(r);
      // Add some sample recommendations for each restaurant
      this.addSampleRecommendationsForRestaurant(restaurant.id, r.name, r.city);
    });
  }

  private async addSampleRecommendationsForRestaurant(restaurantId: number, restaurantName: string, city: string) {
    // Create recommendations based on restaurant
    const subreddit = `r/${city}`;
    
    // Positive sentiment for high-rated places
    if (restaurantId <= 2 || restaurantId === 5) {
      await this.createRecommendation({
        restaurantId,
        postId: `post_${restaurantId}_1`,
        commentId: `comment_${restaurantId}_1`,
        subreddit,
        content: `${restaurantName} has the best samosas in town. Absolutely delicious and affordable.`,
        sentimentScore: 0.9,
        sentimentSummary: `Highly recommended for authentic, affordable samosas. Many Redditors mention the generous portions and great value. Known for homemade chutneys.`,
        postDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      });
    }
    
    // Neutral sentiment for mid-rated places
    if (restaurantId === 3 || restaurantId === 4) {
      await this.createRecommendation({
        restaurantId,
        postId: `post_${restaurantId}_2`,
        commentId: `comment_${restaurantId}_2`,
        subreddit,
        content: `${restaurantName} has decent samosas. They're cheap but quality varies.`,
        sentimentScore: 0.5,
        sentimentSummary: `Mixed opinions on Reddit - praised for affordability but some mention inconsistent quality. Several users recommend their vegetable samosas over meat options.`,
        postDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      });
    }
    
    // Negative sentiment for low-rated places
    if (restaurantId === 6) {
      await this.createRecommendation({
        restaurantId,
        postId: `post_${restaurantId}_3`,
        commentId: `comment_${restaurantId}_3`,
        subreddit,
        content: `${restaurantName} samosas are cheap but not that great. Sometimes they're stale.`,
        sentimentScore: 0.2,
        sentimentSummary: `Mixed reviews on Reddit. While the samosas are considered very affordable, some users complain about inconsistent quality and occasional staleness.`,
        postDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      });
    }
  }
}

export const storage = new MemStorage();
