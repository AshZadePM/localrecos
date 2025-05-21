import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/useSearch";
import { DINING_IMAGES } from "@/lib/constants";

const Hero: React.FC = () => {
  const [_, navigate] = useLocation();
  const { city } = useSearch();
  
  // Randomly select a background image
  const bgImage = React.useMemo(() => {
    return DINING_IMAGES[Math.floor(Math.random() * DINING_IMAGES.length)];
  }, []);

  const handleExploreClick = () => {
    navigate("/results");
  };

  return (
    <section 
      className="relative flex items-center justify-center bg-cover bg-center h-[calc(100vh-70px)] min-h-[500px]"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 w-full max-w-4xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
          Discover Local Favorites Near You
        </h1>
        <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
          Restaurant recommendations from locals in {city || 'your area'}, powered by Reddit conversations and sentiment analysis
        </p>
        
        <div className="w-full max-w-2xl mx-auto">
          <Button 
            onClick={handleExploreClick}
            className="bg-primary text-white px-8 py-4 rounded-md hover:bg-opacity-90 transition-all text-lg font-semibold"
          >
            Explore Local Recommendations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
