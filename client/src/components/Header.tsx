import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSearch } from "@/hooks/useSearch";

const Header: React.FC = () => {
  const { setCity } = useSearch();
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Get user's location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      setIsLocating(true);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Use reverse geocoding to get city name from coordinates
              const { latitude, longitude } = position.coords;
              
              // For this example, we'll use nominatim OpenStreetMap API (free, no API key needed)
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
              );
              
              if (response.ok) {
                const data = await response.json();
                // Extract city from response (address.city or address.town or address.village)
                const city = data.address.city || data.address.town || data.address.village || "Unknown";
                
                console.log("Detected user city:", city);
                setLocationName(city);
                
                // Set the detected city in our app's search context
                setCity(city);
              } else {
                console.error("Failed to get location name:", response.statusText);
              }
            } catch (error) {
              console.error("Error getting location name:", error);
            } finally {
              setIsLocating(false);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setIsLocating(false);
          }
        );
      } else {
        console.log("Geolocation is not supported by this browser");
        setIsLocating(false);
      }
    };
    
    getUserLocation();
  }, [setCity]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-primary font-bold text-2xl cursor-pointer">
            Local Recos
          </Link>
          <span className="ml-2 bg-accent text-white text-xs px-2 py-1 rounded-full">BETA</span>
        </div>
        
        <div className="flex items-center">
          {isLocating ? (
            <div className="text-gray-medium">
              <span className="animate-pulse">Detecting location...</span>
            </div>
          ) : locationName ? (
            <div className="flex items-center">
              <span className="text-primary-600 mr-1">📍</span>
              <span>{locationName}</span>
            </div>
          ) : (
            <div className="text-gray-medium">
              <span>Location: Unknown</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
