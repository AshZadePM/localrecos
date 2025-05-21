import React from "react";
import { useLocation } from "wouter";
import { useSearch } from "@/hooks/useSearch";

interface CityProps {
  id: string;
  name: string;
  image: string;
}

const PopularCities: React.FC = () => {
  const [_, navigate] = useLocation();
  const { setCity } = useSearch();

  const cities: CityProps[] = [
    {
      id: "toronto",
      name: "Toronto",
      image: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      id: "nyc",
      name: "New York",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      id: "chicago",
      name: "Chicago",
      image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      id: "sf",
      name: "San Francisco",
      image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    }
  ];

  const handleCityClick = (city: string) => {
    setCity(city);
    navigate("/results");
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Popular Cities</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cities.map(city => (
            <div 
              key={city.id}
              className="rounded-lg overflow-hidden shadow-md relative group cursor-pointer" 
              onClick={() => handleCityClick(city.name)}
            >
              <img 
                src={city.image} 
                alt={`${city.name} skyline`} 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <h3 className="absolute bottom-3 left-3 text-white font-bold text-xl">{city.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCities;
