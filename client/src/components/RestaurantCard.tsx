import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SentimentBox } from "@/components/ui/sentiment-box";
import { Restaurant } from "@/lib/types";
import { StarIcon, MapPinIcon, CalendarIcon, MessageSquareIcon } from "lucide-react";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const getImageByIndex = (index: number) => {
  // A collection of restaurant food images
  const images = [
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
  ];
  
  return images[index % images.length];
};

const formatTimeAgo = (date: string | Date | null) => {
  if (!date) return "recently";
  
  const now = new Date();
  const pastDate = new Date(date);
  const diffInDays = Math.floor((now.getTime() - pastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const { 
    id, 
    name, 
    address, 
    website, 
    googleRating, 
    googleMapLink, 
    categories, 
    priceRange, 
    mentionCount, 
    lastMentionDate, 
    sentimentScore, 
    sentimentSummary 
  } = restaurant;
  
  const imageIndex = typeof id === 'number' ? id : Math.floor(Math.random() * 6);
  const imageUrl = getImageByIndex(imageIndex);
  
  const getRatingColorClass = (rating: number | null) => {
    if (!rating) return "bg-accent";
    if (rating >= 4.5) return "bg-success";
    if (rating >= 4.0) return "bg-success";
    return "bg-error";
  };

  const getPriceLabel = (priceRange: string | null) => {
    switch (priceRange) {
      case "$": return "$ Inexpensive";
      case "$$": return "$$ Moderate";
      case "$$$": return "$$$ Expensive";
      case "$$$$": return "$$$$ Very Expensive";
      default: return "$ Inexpensive";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img 
        src={imageUrl} 
        alt={`Food at ${name}`} 
        className="w-full h-48 object-cover"
      />
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">
            <a 
              href={website || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              {name}
            </a>
          </h3>
          <div className={`flex items-center ${getRatingColorClass(googleRating)} text-white px-2 py-1 rounded text-sm`}>
            <StarIcon className="h-3 w-3 mr-1" />
            {googleRating || "N/A"}
          </div>
        </div>
        
        <p className="text-gray-medium mb-3">
          <MapPinIcon className="inline h-4 w-4 mr-1" />
          <a 
            href={googleMapLink || `https://maps.google.com/?q=${address}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {address}
          </a>
        </p>
        
        <SentimentBox 
          score={sentimentScore}
          summary={sentimentSummary || "No sentiment analysis available yet."}
        />
        
        <div className="flex flex-wrap gap-2 mt-3">
          {priceRange && (
            <span className="px-2 py-1 rounded-full bg-gray-light text-xs text-dark">
              {getPriceLabel(priceRange)}
            </span>
          )}
          
          {categories?.map((category, index) => (
            <span key={index} className="px-2 py-1 rounded-full bg-gray-light text-xs text-dark">
              {category}
            </span>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-medium">
          <span className="mr-4">
            <MessageSquareIcon className="inline h-3 w-3 mr-1" /> 
            {mentionCount || 0} mentions
          </span>
          <span>
            <CalendarIcon className="inline h-3 w-3 mr-1" /> 
            Most recent: {formatTimeAgo(lastMentionDate)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
