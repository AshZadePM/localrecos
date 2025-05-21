import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ResultsSection from "@/components/ResultsSection";
import { useSearch } from "@/hooks/useSearch";
import FoodCategories from "@/components/FoodCategories";
import { useQuery } from "@tanstack/react-query";

const Results: React.FC = () => {
  const [location] = useLocation();
  const { city, setCity } = useSearch();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Auto-fetch restaurants based on user's detected city
  const { data: cityRestaurants, isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ["/api/city-restaurants", city],
    queryFn: async ({ queryKey }) => {
      const [_, detectedCity] = queryKey;
      if (!detectedCity) return [];
      
      const response = await fetch(`/api/cities/${detectedCity}/restaurants`);
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants for city");
      }
      return response.json();
    },
    enabled: !!city,
  });
  
  useEffect(() => {
    // Extract city param from URL if any
    const params = new URLSearchParams(location.split("?")[1]);
    const cityParam = params.get("city");
    
    // Set city from URL param if available
    if (cityParam && !city) {
      setCity(cityParam);
    }
  }, [location, city, setCity]);

  return (
    <>
      <ResultsSection loading={isLoadingLocation || isLoadingRestaurants} />
      <FoodCategories />
    </>
  );
};

export default Results;
