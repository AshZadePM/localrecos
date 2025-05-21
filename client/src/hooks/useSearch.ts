import { useState, useCallback } from "react";
import { useLocation } from "wouter";

export const useSearch = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Update URL with search parameters
    let urlParams = new URLSearchParams();
    
    if (query) {
      urlParams.set("query", query);
    }
    
    if (city) {
      urlParams.set("city", city);
    }
    
    const queryString = urlParams.toString();
    setLocation(queryString ? `/results?${queryString}` : "/results");
  }, [city, setLocation]);

  const updateCity = useCallback((newCity: string | null) => {
    setCity(newCity);
    
    // Update URL with city parameter
    if (newCity) {
      let urlParams = new URLSearchParams();
      urlParams.set("city", newCity);
      
      if (searchQuery) {
        urlParams.set("query", searchQuery);
      }
      
      setLocation(`/results?${urlParams.toString()}`);
    }
  }, [searchQuery, setLocation]);

  return {
    searchQuery,
    city,
    handleSearch,
    setCity: updateCity
  };
};
