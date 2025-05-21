import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";

const Hero: React.FC = () => {
  const [_, navigate] = useLocation();
  const [foodTypeInput, setFoodTypeInput] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const { handleSearch, setCity } = useSearch();

  const { data: cities } = useQuery({
    queryKey: ["/api/cities"],
  });

  const handleFindPlaces = () => {
    if (foodTypeInput || selectedCity) {
      const searchQuery = foodTypeInput + (selectedCity ? ` in ${selectedCity}` : "");
      setCity(selectedCity);
      handleSearch(searchQuery);
      navigate("/results");
    }
  };

  return (
    <section className="bg-gradient-to-r from-primary to-accent text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Discover local gems recommended by real people</h1>
          <p className="text-lg md:text-xl mb-8">Local Recos finds the best restaurants from Reddit discussions and provides AI-powered sentiment analysis to help you choose.</p>
          <div className="bg-white p-1 md:p-2 rounded-lg shadow-lg flex flex-col md:flex-row">
            <Input 
              type="text" 
              placeholder="What are you craving? Try 'cheap breakfast' or 'best tacos'" 
              className="flex-grow p-3 text-dark border-0 focus:outline-none focus:ring-0 rounded-lg"
              value={foodTypeInput}
              onChange={(e) => setFoodTypeInput(e.target.value)}
            />
            <div className="relative mt-2 md:mt-0 md:ml-2">
              <Select
                value={selectedCity}
                onValueChange={setSelectedCity}
              >
                <SelectTrigger className="w-full md:w-40 bg-gray-light">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map((city: { id: string, name: string }) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="mt-2 md:mt-0 md:ml-2 bg-accent hover:bg-opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-all"
              onClick={handleFindPlaces}
            >
              Find Places
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
