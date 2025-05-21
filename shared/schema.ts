import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Restaurant Schema
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  googleRating: real("google_rating"),
  priceRange: text("price_range"),
  categories: text("categories").array(),
  googleMapLink: text("google_map_link"),
  mentionCount: integer("mention_count").default(0),
  lastMentionDate: timestamp("last_mention_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  createdAt: true,
});

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

// Reddit Recommendation Schema
export const redditRecommendations = pgTable("reddit_recommendations", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  postId: text("post_id").notNull(),
  commentId: text("comment_id"),
  subreddit: text("subreddit").notNull(),
  content: text("content").notNull(),
  sentimentScore: real("sentiment_score"),
  sentimentSummary: text("sentiment_summary"),
  postDate: timestamp("post_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRedditRecommendationSchema = createInsertSchema(redditRecommendations).omit({
  id: true,
  createdAt: true,
});

export type InsertRedditRecommendation = z.infer<typeof insertRedditRecommendationSchema>;
export type RedditRecommendation = typeof redditRecommendations.$inferSelect;

// Search History Schema
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// Cached Search Results Schema
export const cachedSearchResults = pgTable("cached_search_results", {
  id: serial("id").primaryKey(),
  query: text("query").notNull().unique(),
  city: text("city"),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertCachedSearchResultsSchema = createInsertSchema(cachedSearchResults).omit({
  id: true,
  createdAt: true,
});

export type InsertCachedSearchResults = z.infer<typeof insertCachedSearchResultsSchema>;
export type CachedSearchResults = typeof cachedSearchResults.$inferSelect;

// Search Request Schema
export const searchRequestSchema = z.object({
  query: z.string().min(1),
  city: z.string().optional(),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;
