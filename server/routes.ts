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

  // Natural language search API that connects to Gemini
  app.post("/api/nlp-search", async (req: Request, res: Response) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== 'string') {
        return res.status(400).json({ message: "Invalid input" });
      }
      const geminiApiKey = process.env.GOOGLE_AISTUDIO_API_KEY;
      if (!geminiApiKey) {
        return res.status(500).json({ message: "Google AI Studio API key is not configured" });
      }
      const systemPrompt = `You're a restaurant recommendation engine that sources recommendations from training data from sites like reddit. You should make recommendations based on how many times a restaurant is mentioned + upvotes + recency.\n\nReturn a list of restaurant names and a summary of user feedback for each. It should be returned in a format that's easy for the app to parse to display in the front end.\n\nUse the list to create a restaurant card per restaurant.`;
      // Extraction prompt remains the same
      const extractionPrompt = `Extract the city and food type from this search query. If a city is not explicitly mentioned, return null for city.\n\nQuery: "${input}"\n\nRespond in this JSON format:\n{\n  "city": "city name or null if not specified",\n  "foodType": "type of food or dish they're looking for"\n}`;
      const extractionResponse = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey,
        {
          contents: [{ parts: [{ text: extractionPrompt }] }]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      let extractedData;
      try {
        const extractionContent = extractionResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log('Gemini extraction raw response:', extractionContent);
        const cleanContent = extractionContent.replace(/```json\s*|\s*```/g, '');
        extractedData = JSON.parse(cleanContent);
        // Ensure both fields are strings or null
        if (typeof extractedData.city !== 'string' && extractedData.city !== null) extractedData.city = null;
        if (typeof extractedData.foodType !== 'string') extractedData.foodType = String(input);
      } catch (parseError) {
        console.error('Failed to parse Gemini extraction as JSON:', parseError);
        extractedData = { city: null, foodType: String(input) };
      }
      // Compose a prompt for Gemini to recommend restaurants
      // Include the full original input (including adjectives) in the prompt for context
      const prompt = `You're a restaurant recommendation engine that sources recommendations from training data from sites like reddit. You should make recommendations based on how many times a restaurant is mentioned, upvotes, and recency.\nThe user search query is: "${input}"\nWhat are the best ${extractedData.foodType} ${extractedData.city ? `restaurants in ${extractedData.city}` : 'restaurants'} that match the user's query?\nPlease provide a list with names and a short reason for each recommendation. Return 10 results and the results in json format with "title" and "recommendationText"`;
      const geminiResponse = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      console.log('Full Gemini response:', JSON.stringify(geminiResponse.data, null, 2));
      let recommendations = [];
      let content = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof content !== 'string') content = '';
      // Remove ```json and ``` wrappers from the Gemini output
      content = content.replace(/```json\s*/g, '').replace(/```/g, '');
      console.log('Gemini raw response:', content); // Log raw response
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          recommendations = parsed.map((item) => ({
            name: item.title || 'Untitled',
            summary: item.recommendationText || ''
          }));
        } else if (parsed && typeof parsed === 'object') {
          recommendations = [{
            name: parsed.title || 'Untitled',
            summary: parsed.recommendationText || ''
          }];
        } else {
          recommendations = [{ name: 'Gemini Output', summary: content }];
        }
      } catch (err) {
        // Fallback: show raw content as a single card
        recommendations = [{ name: 'Gemini Output', summary: content }];
      }
      return res.json({ extraction: extractedData, recommendations });
    } catch (error) {
      console.error("Error in NLP search via Gemini:", error);
      if (error && typeof error === 'object' && 'response' in error) {
        // @ts-ignore
        console.error("Gemini error details:", error.response?.data || error.message || error);
      } else {
        console.error("Gemini error details:", error);
      }
      return res.status(500).json({ message: "Failed to process natural language search" });
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

  // API endpoint to analyze sentiment for text using Gemini
  app.post("/api/analyze-sentiment", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Invalid text input" });
      }
      const geminiApiKey = process.env.GOOGLE_AISTUDIO_API_KEY;
      if (!geminiApiKey) {
        return res.status(500).json({ message: "Google AI Studio API key is not configured" });
      }
      const sentimentPrompt = `\n        Analyze the sentiment of this text about a restaurant. Consider factors like food quality, service, atmosphere, and value.\n        \n        Text: "${text}"\n        \n        Respond in this JSON format:\n        {\n          "score": a number between 0 and 1 where 0 is very negative and 1 is very positive,\n          "summary": "a concise 1-2 sentence summary of the sentiment"\n        }\n      `;
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey,
        {
          contents: [{ parts: [{ text: sentimentPrompt }] }]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      try {
        try {
          const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleanContent = content.replace(/```json\s*|\s*```/g, '');
          const sentimentAnalysis = JSON.parse(cleanContent);
          res.json(sentimentAnalysis);
        } catch (parseError) {
          res.json({ score: 0.5, summary: "Sentiment analysis could not be determined." });
        }
      } catch (parseError) {
        res.status(500).json({ message: "Failed to analyze sentiment" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  // Proxy endpoint for Google Places API
  app.get("/api/google-places", async (req, res) => {
    let { query, city } = req.query;
    // If city is an array (from querystring), use the first value
    if (Array.isArray(city)) city = city[0];
    // Use the provided API key directly (for dev/testing only)
    const apiKey = "AIzaSyBIyipLfGhkt-IaGdHc4PwugL3QbMVe0vI";
    if (!apiKey) {
      return res.status(500).json({ message: "Google Places API key not configured" });
    }
    if (!query) {
      return res.status(400).json({ message: "Missing query parameter" });
    }
    // If city is missing or empty, return an error (city should always be extracted and sent from frontend)
    if (!city || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({ message: "Missing or invalid city parameter for Google Places search" });
    }
    try {
      // Geocode the city to get its lat/lng for location bias
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`;
      const geocodeResp = await axios.get(geocodeUrl);
      const geoResult = geocodeResp.data.results && geocodeResp.data.results[0];
      let locationBias = undefined;
      if (geoResult && geoResult.geometry && geoResult.geometry.location) {
        const { lat, lng } = geoResult.geometry.location;
        // Use a 30km radius circle around the city center
        locationBias = `circle:30000@${lat},${lng}`;
      }
      console.log(`[Google Places] Searching for city:`, city);
      // Use the new Places API endpoint
      const url = `https://places.googleapis.com/v1/places:searchText?key=${apiKey}`;
      // Add locationBias to the request body with correct typing
      const requestBody: any = {
        // Always search for the restaurant name + city for best match
        textQuery: `${query}, ${city}`,
        languageCode: "en"
      };
      if (locationBias) requestBody.locationBias = locationBias;
      const response = await axios.post(
        url,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            // Request all relevant fields for frontend display
            "X-Goog-FieldMask": [
              "places.displayName",
              "places.formattedAddress",
              "places.id",
              "places.rating",
              "places.userRatingCount",
              "places.currentOpeningHours",
              "places.websiteUri",
              "places.googleMapsUri",
              "places.photos"
            ].join(",")
          }
        }
      );
      // Log the city of each returned place
      if (response.data && Array.isArray(response.data.places)) {
        response.data.places.forEach((place: any, idx: number) => {
          const address = place.formattedAddress || place.formatted_address || '';
          // Try to extract city from address (split by comma, take second-to-last or use regex)
          let cityInAddress = '';
          const parts = address.split(',').map((s: string) => s.trim());
          if (parts.length >= 2) cityInAddress = parts[parts.length - 2];
          // Fallback: regex for city
          const match = address.match(/,\s*([^,]+),\s*[A-Z]{2}\s*\d{5}/);
          if (match && match[1]) cityInAddress = match[1];
          console.log(`[Google Places] Result #${idx + 1}:`, address, '| Extracted city:', cityInAddress);
        });
      }
      res.json(response.data);
    } catch (error) {
      // Fix error logging for Google Places API
      const err = error as any;
      console.error("Google Places API error:", err?.response?.data || err);
      res.status(500).json({ message: "Failed to fetch from Google Places API" });
    }
  });

  // Proxy endpoint for Google Places Photo to avoid CORS/403
  app.get("/api/google-places-photo", async (req, res) => {
    // Accept both photoName and photoRef for compatibility
    const photoName = req.query.photoName || req.query.photoRef;
    if (!photoName || typeof photoName !== 'string') {
      return res.status(400).json({ message: "Missing or invalid photoName parameter" });
    }
    // Always use the provided API key for Google Places photos
    const apiKey = "AIzaSyBIyipLfGhkt-IaGdHc4PwugL3QbMVe0vI";
    // Remove any leading slash for safety
    let cleanPhotoName = photoName;
    if (cleanPhotoName.startsWith('/')) cleanPhotoName = cleanPhotoName.slice(1);
    // Defensive: decode if double-encoded
    cleanPhotoName = decodeURIComponent(cleanPhotoName);
    console.log('[Google Places Photo API] cleanPhotoName:', cleanPhotoName);
    const url = `https://places.googleapis.com/v1/${cleanPhotoName}/media?maxWidthPx=650&key=${apiKey}`;
    console.log('[Google Places Photo API] Fetching photo:', url);
    try {
      const response = await axios.get(url, { responseType: 'stream' });
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      response.data.pipe(res);
    } catch (error) {
      const err = error as any;
      console.error("Google Places Photo proxy error:", err?.response?.data || err);
      res.status(500).json({ message: "Failed to fetch Google Places photo" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
