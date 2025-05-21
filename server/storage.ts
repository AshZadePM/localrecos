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
    const lowerQuery = query.toLowerCase();
    
    // Get all restaurants
    let results = Array.from(this.restaurants.values());
    
    // Filter by city if provided
    if (city) {
      results = results.filter(restaurant => 
        restaurant.city.toLowerCase() === city.toLowerCase()
      );
    }
    
    // Extract keywords from query
    const searchTerms = lowerQuery.split(/\s+/);
    
    // Check for cuisine types
    const cuisineKeywords = {
      'indian': ['indian', 'curry', 'samosa', 'tandoori', 'naan', 'biryani', 'masala'],
      'japanese': ['japanese', 'sushi', 'ramen', 'tempura', 'sashimi', 'maki', 'udon'],
      'chinese': ['chinese', 'dim sum', 'wonton', 'noodle', 'fried rice', 'dumpling'],
      'mexican': ['mexican', 'taco', 'burrito', 'quesadilla', 'enchilada', 'guacamole'],
      'italian': ['italian', 'pizza', 'pasta', 'risotto', 'gelato', 'tiramisu'],
      'thai': ['thai', 'pad thai', 'curry', 'tom yum', 'satay'],
      'american': ['burger', 'steak', 'bbq', 'grill', 'sandwich', 'hot dog', 'american']
    };
    
    // Check for qualifiers
    const qualifierKeywords = {
      'authentic': ['authentic', 'traditional', 'classic', 'real', 'genuine'],
      'cheap': ['cheap', 'inexpensive', 'affordable', 'budget', 'low price', 'reasonable'],
      'expensive': ['expensive', 'high-end', 'fine dining', 'upscale', 'fancy', 'luxury'],
      'best': ['best', 'top', 'highest rated', 'popular', 'favorite', 'recommended'],
      'buffet': ['buffet', 'all you can eat', 'all-you-can-eat', 'ayce', 'unlimited'],
      'vegetarian': ['vegetarian', 'vegan', 'plant-based', 'meatless'],
      'gluten-free': ['gluten-free', 'gluten free', 'celiac']
    };
    
    // Determine if query contains cuisine and qualifier keywords
    let matchedCuisines = [];
    for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        matchedCuisines.push(cuisine);
      }
    }
    
    let matchedQualifiers = [];
    for (const [qualifier, keywords] of Object.entries(qualifierKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        matchedQualifiers.push(qualifier);
      }
    }
    
    console.log(`Search analysis - cuisines: ${matchedCuisines.join(', ')}, qualifiers: ${matchedQualifiers.join(', ')}`);
    
    // Apply cuisine filters
    if (matchedCuisines.length > 0) {
      results = results.filter(restaurant => {
        if (!restaurant.categories) return false;
        
        return restaurant.categories.some(category => {
          const lowerCategory = category.toLowerCase();
          return matchedCuisines.some(cuisine => {
            // Check if the category matches any of our matched cuisines
            if (lowerCategory.includes(cuisine)) return true;
            
            // Special case handling for different cuisines
            if (cuisine === 'indian' && lowerCategory.includes('indian')) return true;
            if (cuisine === 'japanese' && lowerCategory.includes('sushi')) return true;
            if (cuisine === 'italian' && lowerCategory.includes('pizza')) return true;
            
            return false;
          });
        });
      });
    }
    
    // Apply qualifier filters
    if (matchedQualifiers.includes('cheap')) {
      results = results.filter(r => r.priceRange === '$' || r.priceRange === '$$');
    }
    
    if (matchedQualifiers.includes('expensive')) {
      results = results.filter(r => r.priceRange === '$$$' || r.priceRange === '$$$$');
    }
    
    if (matchedQualifiers.includes('best')) {
      results = results.filter(r => r.googleRating && r.googleRating >= 4.3);
    }
    
    // Fallback to basic search if no restaurants found with advanced filtering
    if (results.length === 0) {
      // Reset to all restaurants for the city
      results = Array.from(this.restaurants.values());
      
      if (city) {
        results = results.filter(restaurant => 
          restaurant.city.toLowerCase() === city.toLowerCase()
        );
      }
      
      // Basic text match
      results = results.filter(restaurant => 
        restaurant.name.toLowerCase().includes(lowerQuery) ||
        (restaurant.categories && restaurant.categories.some(cat => cat.toLowerCase().includes(lowerQuery))) ||
        (restaurant.priceRange && restaurant.priceRange.toLowerCase().includes(lowerQuery))
      );
    }
    
    console.log(`Search results for "${query}" in ${city || 'any city'}: ${results.length} restaurants found`);
    
    // If no results, handle special case by adding some sample data based on the query
    if (results.length === 0 && city) {
      const sampleRestaurants = this.generateSampleRestaurantsByQuery(query, city);
      for (const restaurant of sampleRestaurants) {
        this.restaurants.set(restaurant.id, restaurant);
      }
      return sampleRestaurants;
    }
    
    return results;
  }
  
  // Generate sample restaurants based on search query
  private generateSampleRestaurantsByQuery(query: string, city: string): Restaurant[] {
    const lowerQuery = query.toLowerCase();
    const sampleRestaurants: Restaurant[] = [];
    const now = new Date();
    
    // Extract potential food type from query
    // First try to find known food types
    let foodType = "restaurant";
    
    // Common food cuisine mapping
    const cuisineMap = {
      "japanese": ["sushi", "ramen", "teriyaki", "tempura", "japanese", "sashimi"],
      "indian": ["curry", "samosa", "naan", "tandoori", "indian", "masala", "biryani"],
      "italian": ["pizza", "pasta", "risotto", "italian", "gelato", "tiramisu"],
      "chinese": ["chinese", "dim sum", "wonton", "dumpling", "szechuan", "lo mein", "fried rice"],
      "thai": ["thai", "pad thai", "tom yum", "satay", "curry"],
      "mexican": ["taco", "burrito", "mexican", "quesadilla", "enchilada", "guacamole"],
      "american": ["burger", "steak", "bbq", "grill", "american", "hot dog", "sandwich"],
      "greek": ["gyro", "greek", "souvlaki", "moussaka", "feta"],
      "vietnamese": ["pho", "vietnamese", "banh mi", "spring roll"],
      "korean": ["korean", "bibimbap", "bulgogi", "kimchi", "kbbq"],
      "french": ["french", "croissant", "patisserie", "crepe", "escargot", "baguette"],
      "middle eastern": ["falafel", "hummus", "kebab", "shawarma", "middle eastern", "mediterranean"],
      "spanish": ["tapas", "paella", "spanish"],
      "vegetarian": ["vegetarian", "vegan", "plant-based"],
      "dessert": ["ice cream", "cake", "chocolate", "dessert", "bakery", "pastry", "cookie", "donut"],
      "seafood": ["seafood", "fish", "sushi", "crab", "lobster", "shrimp", "oyster"]
    };
    
    // Extract food type from query
    let extractedFoodType = "";
    for (const [cuisine, keywords] of Object.entries(cuisineMap)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        extractedFoodType = cuisine;
        break;
      }
    }
    
    // If we couldn't identify a cuisine, use any word that might be a food type
    if (!extractedFoodType) {
      // Remove common words to isolate potential food types
      const commonWords = ["food", "restaurant", "best", "cheap", "expensive", "good", "great", "top", "rated", "in", "near", "around", "most", "authentic", "favorite", "popular", "recommended", "tasty", "delicious"];
      
      // Split the query into words and remove common words
      const words = lowerQuery.split(/\s+/).filter(word => !commonWords.includes(word));
      
      // Use the remaining words as potential food types
      if (words.length > 0) {
        // Capitalize the first letter to make it look like a cuisine type
        extractedFoodType = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      }
    }
    
    // Use the extracted food type if found, otherwise fallback to generic "restaurant"
    foodType = extractedFoodType || "restaurant";
    
    // Check if "all you can eat" or "buffet" is in the query
    const isBuffet = lowerQuery.includes("all you can eat") || lowerQuery.includes("ayce") || lowerQuery.includes("buffet");
    
    // Check if "authentic" is in the query
    const isAuthentic = lowerQuery.includes("authentic") || lowerQuery.includes("traditional");
    
    // Generate restaurant names based on food type and other query characteristics
    const restaurantNames: {name: string, categories: string[], price: string, rating: number}[] = [];
    
    // Generic restaurant name templates with [CUISINE] as placeholder
    const restaurantTemplates = [
      {
        nameTemplates: [
          "[CUISINE] House", 
          "[CUISINE] Kitchen", 
          "[CUISINE] Palace", 
          "[CUISINE] Garden", 
          "The [CUISINE] Spot"
        ],
        categories: ["[CUISINE]", "Casual", "Family Friendly"],
        price: "$$",
        ratingRange: [3.9, 4.3]
      },
      {
        nameTemplates: [
          "Authentic [CUISINE]", 
          "Traditional [CUISINE] Kitchen", 
          "Old World [CUISINE]", 
          "[CUISINE] Heritage"
        ],
        categories: ["[CUISINE]", "Traditional", "Authentic"],
        price: "$$",
        ratingRange: [4.2, 4.7]
      },
      {
        nameTemplates: [
          "Gourmet [CUISINE]", 
          "[CUISINE] Fine Dining", 
          "Upscale [CUISINE]"
        ],
        categories: ["[CUISINE]", "Fine Dining", "Upscale"],
        price: "$$$",
        ratingRange: [4.5, 4.9]
      },
      {
        nameTemplates: [
          "Quick [CUISINE]", 
          "[CUISINE] Express", 
          "[CUISINE] To Go", 
          "Fast [CUISINE]"
        ],
        categories: ["[CUISINE]", "Takeout", "Quick Bite"],
        price: "$",
        ratingRange: [3.7, 4.2]
      },
      {
        nameTemplates: [
          "[CUISINE] & More",
          "[CUISINE] Fusion",
          "Modern [CUISINE]",
          "[CUISINE] Remix"
        ],
        categories: ["[CUISINE]", "Fusion", "Modern"],
        price: "$$",
        ratingRange: [4.0, 4.5]
      }
    ];
    
    // Special case for buffet
    if (isBuffet) {
      restaurantTemplates.push({
        nameTemplates: [
          "[CUISINE] Buffet",
          "All-You-Can-Eat [CUISINE]",
          "[CUISINE] Unlimited",
          "Endless [CUISINE]"
        ],
        categories: ["[CUISINE]", "Buffet", "All-You-Can-Eat"],
        price: "$$",
        ratingRange: [3.8, 4.3]
      });
    }
    
    // Special case for authentic traditional
    if (isAuthentic) {
      restaurantTemplates.push({
        nameTemplates: [
          "Authentic [CUISINE] House",
          "Traditional [CUISINE] Kitchen",
          "[CUISINE] Heritage",
          "Old World [CUISINE]"
        ],
        categories: ["[CUISINE]", "Traditional", "Authentic"],
        price: "$$",
        ratingRange: [4.3, 4.8]
      });
    }
    
    // Generate names based on the templates
    // Select random templates to generate a mix of restaurant types
    const selectedTemplates = [];
    const numRestaurantsToGenerate = 3 + Math.floor(Math.random() * 4); // Generate 3-6 restaurants
    
    // Shuffle templates to get random selection
    const shuffledTemplates = [...restaurantTemplates].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numRestaurantsToGenerate, shuffledTemplates.length); i++) {
      selectedTemplates.push(shuffledTemplates[i]);
    }
    
    // Create restaurants from templates
    for (const template of selectedTemplates) {
      // Pick a random name template from the options
      const nameTemplate = template.nameTemplates[Math.floor(Math.random() * template.nameTemplates.length)];
      
      // Replace [CUISINE] with actual food type
      const name = nameTemplate.replace(/\[CUISINE\]/g, foodType);
      
      // Generate categories, replacing [CUISINE] with food type
      const categories = template.categories.map(c => c.replace(/\[CUISINE\]/g, foodType));
      
      // Generate a random rating within the given range
      const [minRating, maxRating] = template.ratingRange;
      const rating = parseFloat((minRating + Math.random() * (maxRating - minRating)).toFixed(1));
      
      restaurantNames.push({
        name,
        categories,
        price: template.price,
        rating
      });
    }
    
    // Create sample restaurants
    let currentId = this.restaurantCurrentId;
    for (const restaurant of restaurantNames) {
      currentId++;
      const streetNames = ["Main Street", "First Avenue", "Oak Road", "Maple Drive", "Pine Street"];
      const streetNumber = Math.floor(Math.random() * 1000) + 100;
      const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
      
      const newRestaurant: Restaurant = {
        id: currentId,
        name: restaurant.name,
        website: `https://${restaurant.name.toLowerCase().replace(/\s+/g, '')}.com`,
        address: `${streetNumber} ${streetName}, ${city}`,
        city: city,
        googleRating: restaurant.rating,
        priceRange: restaurant.price,
        categories: restaurant.categories,
        googleMapLink: `https://maps.google.com/?q=${streetNumber}+${streetName.replace(/\s+/g, '+')}+${city.replace(/\s+/g, '+')}`,
        mentionCount: Math.floor(Math.random() * 10) + 1,
        lastMentionDate: new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        createdAt: now,
        recommendations: []
      };
      
      sampleRestaurants.push(newRestaurant);
      this.restaurantCurrentId = currentId;
    }
    
    return sampleRestaurants;
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
