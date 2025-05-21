import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@/hooks/useSearch";
import { apiRequest } from "@/lib/queryClient";
import RestaurantCard from "@/components/RestaurantCard";
import { FilterChip } from "@/components/ui/filter-chip";
import EmptyState from "@/components/EmptyState";
import { Restaurant } from "@/lib/types";

interface ResultsSectionProps {
  loading?: boolean;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ loading }) => {
  const { city } = useSearch();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Get restaurants for the detected city
  const { data: restaurants, isLoading: isLoadingRestaurants, error } = useQuery({
    queryKey: ["/api/cities", city, "restaurants"],
    queryFn: async ({ queryKey }) => {
      const [_, detectedCity] = queryKey;
      if (!detectedCity) return [];
      
      // Fetch restaurants for this city
      const response = await fetch(`/api/cities/${detectedCity}/restaurants`);
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants for city");
      }
      return response.json();
    },
    enabled: !!city,
  });

  const filteredRestaurants = React.useMemo(() => {
    if (!restaurants) return [];
    
    let results = [...restaurants];
    
    // Apply active filter if set
    if (activeFilter) {
      switch (activeFilter) {
        case "under15":
          results = results.filter(r => r.priceRange === "$");
          break;
        case "open":
          // In a real app, we would filter by open/closed status
          results = results;
          break;
        case "highlyRated":
          results = results.filter(r => r.googleRating && r.googleRating >= 4.5);
          break;
      }
    }
    
    return results;
  }, [restaurants, activeFilter]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  const isLoading = loading || isLoadingRestaurants;

  if (isLoading) {
    return (
      <section className="py-12" id="results-section">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Finding local recommendations...
              </h2>
              <p className="text-gray-medium">Discovering restaurants from Reddit discussions in your area</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="skeleton h-48 w-full bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="skeleton h-6 w-3/4 mb-4 rounded bg-gray-200 animate-pulse"></div>
                  <div className="skeleton h-4 w-full mb-2 rounded bg-gray-200 animate-pulse"></div>
                  <div className="skeleton h-4 w-5/6 mb-4 rounded bg-gray-200 animate-pulse"></div>
                  <div className="skeleton h-10 w-full mt-4 rounded bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12" id="results-section">
        <div className="container mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-6xl mb-4 text-red-600">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Error Loading Results</h3>
            <p className="text-gray-medium mb-6">
              Something went wrong while fetching restaurant recommendations.
              Please try again later or check your location settings.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!filteredRestaurants || filteredRestaurants.length === 0) {
    return <EmptyState city={city} />;
  }

  return (
    <section className="py-12" id="results-section">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {city ? (
                <>Local Recommendations in <span className="text-accent">{city}</span></>
              ) : (
                <>Recommended Restaurants</>
              )}
            </h2>
            <p className="text-gray-medium">
              Found from {city ? `r/${city.toLowerCase()}` : 'Reddit'} subreddit discussions
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <FilterChip
              active={activeFilter === null}
              onClick={() => setActiveFilter(null)}
            >
              All
            </FilterChip>
            <FilterChip
              variant="outline"
              active={activeFilter === "under15"}
              onClick={() => handleFilterClick("under15")}
            >
              Under $15
            </FilterChip>
            <FilterChip
              variant="outline"
              active={activeFilter === "open"}
              onClick={() => handleFilterClick("open")}
            >
              Open Now
            </FilterChip>
            <FilterChip
              variant="outline"
              active={activeFilter === "highlyRated"}
              onClick={() => handleFilterClick("highlyRated")}
            >
              Highly Rated
            </FilterChip>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant: Restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
