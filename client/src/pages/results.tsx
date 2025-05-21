import React, { useEffect } from "react";
import { useLocation } from "wouter";
import ResultsSection from "@/components/ResultsSection";
import { useSearch } from "@/hooks/useSearch";
import FoodCategories from "@/components/FoodCategories";

const Results: React.FC = () => {
  const [location] = useLocation();
  const { searchQuery, city, handleSearch, setCity } = useSearch();
  
  useEffect(() => {
    // Extract query params from URL if any
    const params = new URLSearchParams(location.split("?")[1]);
    const queryParam = params.get("query");
    const cityParam = params.get("city");
    
    // Set search state from URL params if available
    if (queryParam && !searchQuery) {
      handleSearch(queryParam);
    }
    
    if (cityParam && !city) {
      setCity(cityParam);
    }
  }, [location, searchQuery, city, handleSearch, setCity]);

  return (
    <>
      <ResultsSection />
      <FoodCategories />
    </>
  );
};

export default Results;
