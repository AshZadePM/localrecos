import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import NodeCache from "node-cache";
import axios from "axios";

// Simple cache with TTL
const cache = new NodeCache({ stdTTL: 3600 });

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // API endpoint to get available cities
  app.get("/api/cities", async (_req: Request, res: Response) => {
    try {
      // In a real app, this would dynamically fetch cities from the database
      // For now, return a static list of popular cities
      const popularCities = [
        { id: "toronto", name: "Toronto" },
        { id: "nyc", name: "New York" },
        { id: "chicago", name: "Chicago" },
        { id: "sf", name: "San Francisco" },
        { id: "ottawa", name: "Ottawa" },
        { id: "vancouver", name: "Vancouver" },
        { id: "austin", name: "Austin" },
        { id: "boston", name: "Boston" },
        { id: "seattle", name: "Seattle" },
        { id: "portland", name: "Portland" }
      ];
      
      res.json(popularCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  // API endpoint to search for restaurants
  app.post("/api/search", async (req: Request, res: Response) => {
    try {
      // Validate the search request
      const { query, city } = searchRequestSchema.parse(req.body);
      
      // Save search to history
      await storage.createSearchHistory({
        query,
        city
      });

      // Check if we have cached results
      const cacheKey = `search:${query.toLowerCase()}:${city?.toLowerCase() || 'all'}`;
      const cachedResults = cache.get(cacheKey);
      
      if (cachedResults) {
        console.log(`Returning cached results for ${cacheKey}`);
        return res.json(cachedResults);
      }

      // Perform the search
      const restaurants = await storage.searchRestaurants(query, city);
      
      // For each restaurant, fetch its recommendations
      const results = await Promise.all(
        restaurants.map(async (restaurant) => {
          const recommendations = await storage.getRecommendationsByRestaurant(restaurant.id);
          const mostRecentRecommendation = recommendations.sort(
            (a, b) => (b.postDate?.getTime() || 0) - (a.postDate?.getTime() || 0)
          )[0];
          
          return {
            ...restaurant,
            recommendations,
            sentimentSummary: mostRecentRecommendation?.sentimentSummary || null,
            sentimentScore: mostRecentRecommendation?.sentimentScore || null
          };
        })
      );
      
      // Store in cache for future requests (1 hour TTL)
      cache.set(cacheKey, results);
      
      res.json(results);
    } catch (error) {
      console.error("Error searching restaurants:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to search restaurants" });
    }
  });

  // Natural language search API that connects to OpenRouter
  app.post("/api/nlp-search", async (req: Request, res: Response) => {
    try {
      const { input } = req.body;
      
      if (!input || typeof input !== 'string') {
        return res.status(400).json({ message: "Invalid input" });
      }
      
      // Get OpenRouter API key from environment variables
      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      
      if (!openRouterApiKey) {
        return res.status(500).json({ message: "OpenRouter API key is not configured" });
      }
      
      // Extract city and food type from natural language query
      const extractionPrompt = `
        Extract the city and food type from this search query. If a city is not explicitly mentioned, return null for city.
        
        Query: "${input}"
        
        Respond in this JSON format:
        {
          "city": "city name or null if not specified",
          "foodType": "type of food or dish they're looking for"
        }
      `;
      
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: extractionPrompt }],
          response_format: { type: "json_object" }
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": "https://local-recos.com",
            "X-Title": "Local Recos"
          }
        }
      );
      
      try {
        const extractedData = JSON.parse(response.data.choices[0].message.content);
        
        // Now search restaurants with the extracted data
        const restaurants = await storage.searchRestaurants(
          extractedData.foodType,
          extractedData.city
        );
        
        // Process results
        const results = await Promise.all(
          restaurants.map(async (restaurant) => {
            const recommendations = await storage.getRecommendationsByRestaurant(restaurant.id);
            const mostRecentRecommendation = recommendations.sort(
              (a, b) => (b.postDate?.getTime() || 0) - (a.postDate?.getTime() || 0)
            )[0];
            
            return {
              ...restaurant,
              recommendations,
              sentimentSummary: mostRecentRecommendation?.sentimentSummary || null,
              sentimentScore: mostRecentRecommendation?.sentimentScore || null
            };
          })
        );
        
        // Return both the extraction and results
        res.json({
          extraction: extractedData,
          results
        });
      } catch (parseError) {
        console.error("Error parsing OpenRouter response:", parseError);
        res.status(500).json({ message: "Failed to process natural language query" });
      }
    } catch (error) {
      console.error("Error in NLP search:", error);
      res.status(500).json({ message: "Failed to process natural language search" });
    }
  });

  // API endpoint to get search history
  app.get("/api/search-history", async (_req: Request, res: Response) => {
    try {
      const searchHistory = await storage.getSearchHistory(10);
      res.json(searchHistory);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  // API endpoint to get restaurant details by ID
  app.get("/api/restaurants/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid restaurant ID" });
      }
      
      const restaurant = await storage.getRestaurant(id);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      const recommendations = await storage.getRecommendationsByRestaurant(id);
      
      res.json({
        ...restaurant,
        recommendations
      });
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant details" });
    }
  });

  // API endpoint to get restaurants by city
  app.get("/api/cities/:city/restaurants", async (req: Request, res: Response) => {
    try {
      const { city } = req.params;
      const restaurants = await storage.getRestaurantsByCity(city);
      
      // For each restaurant, fetch its recommendations
      const results = await Promise.all(
        restaurants.map(async (restaurant) => {
          const recommendations = await storage.getRecommendationsByRestaurant(restaurant.id);
          const mostRecentRecommendation = recommendations.sort(
            (a, b) => (b.postDate?.getTime() || 0) - (a.postDate?.getTime() || 0)
          )[0];
          
          return {
            ...restaurant,
            recommendations,
            sentimentSummary: mostRecentRecommendation?.sentimentSummary || null,
            sentimentScore: mostRecentRecommendation?.sentimentScore || null
          };
        })
      );
      
      res.json(results);
    } catch (error) {
      console.error("Error fetching restaurants by city:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  // API endpoint to analyze sentiment for text using OpenRouter
  app.post("/api/analyze-sentiment", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Invalid text input" });
      }
      
      // Get OpenRouter API key from environment variables
      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      
      if (!openRouterApiKey) {
        return res.status(500).json({ message: "OpenRouter API key is not configured" });
      }
      
      const sentimentPrompt = `
        Analyze the sentiment of this text about a restaurant. Consider factors like food quality, service, atmosphere, and value.
        
        Text: "${text}"
        
        Respond in this JSON format:
        {
          "score": a number between 0 and 1 where 0 is very negative and 1 is very positive,
          "summary": "a concise 1-2 sentence summary of the sentiment"
        }
      `;
      
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: sentimentPrompt }],
          response_format: { type: "json_object" }
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": "https://local-recos.com",
            "X-Title": "Local Recos"
          }
        }
      );
      
      try {
        const sentimentAnalysis = JSON.parse(response.data.choices[0].message.content);
        res.json(sentimentAnalysis);
      } catch (parseError) {
        console.error("Error parsing OpenRouter response:", parseError);
        res.status(500).json({ message: "Failed to analyze sentiment" });
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
