import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useSearch } from "@/hooks/useSearch";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/lib/icons";

const Header: React.FC = () => {
  const [location, navigate] = useLocation();
  const [isFocused, setIsFocused] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const { searchQuery, handleSearch } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch recent searches
  const { data: searchHistory } = useQuery({
    queryKey: ["/api/search-history"],
    enabled: isFocused,
  });

  // Handle outside click to close the recent searches dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchInput.trim()) {
      console.log("Submitting search for:", searchInput);
      handleSearch(searchInput);
      setIsFocused(false);
      navigate("/results");
    }
  };

  const handleSelectRecentSearch = (query: string) => {
    setSearchInput(query);
    handleSearch(query);
    setIsFocused(false);
    navigate("/results");
  };

  const clearRecentSearches = async () => {
    try {
      await apiRequest("DELETE", "/api/search-history", {});
      setIsFocused(false);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Link href="/" className="text-primary font-bold text-2xl cursor-pointer">
            Local Recos
          </Link>
          <span className="ml-2 bg-accent text-white text-xs px-2 py-1 rounded-full">BETA</span>
        </div>
        
        <div className="w-full md:w-2/3 lg:w-1/2 relative" ref={searchRef}>
          <form onSubmit={handleSubmitSearch}>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Try 'cheap samosas in Ottawa' or 'best pizza in Chicago'" 
                className="w-full p-3 pl-12 pr-20 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-medium">
                <SearchIcon className="h-5 w-5" />
              </div>
              <Button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary text-white px-3 py-1 rounded-md hover:bg-opacity-90 transition-all"
              >
                Search
              </Button>
            </div>
          </form>
          
          {isFocused && searchHistory && Array.isArray(searchHistory) && searchHistory.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-2 text-sm text-gray-500">Recent searches</div>
              {searchHistory.map((search, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-light cursor-pointer"
                  onClick={() => handleSelectRecentSearch(search.query)}
                >
                  {search.query} {search.city ? `in ${search.city}` : ''}
                </div>
              ))}
              <div 
                className="p-2 text-primary text-sm cursor-pointer"
                onClick={clearRecentSearches}
              >
                Clear recent searches
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
