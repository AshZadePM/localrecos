import React from "react";
import { useLocation } from "wouter";
import { useSearch } from "@/hooks/useSearch";
import { PizzaIcon, BurgerIcon, SushiIcon, TacoIcon, CoffeeIcon, IceCreamIcon } from "@/lib/icons";

interface FoodCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const FoodCategories: React.FC = () => {
  const [_, navigate] = useLocation();
  const { handleSearch } = useSearch();

  const categories: FoodCategory[] = [
    { id: "pizza", name: "Pizza", icon: <PizzaIcon /> },
    { id: "burgers", name: "Burgers", icon: <BurgerIcon /> },
    { id: "sushi", name: "Sushi", icon: <SushiIcon /> },
    { id: "mexican", name: "Mexican", icon: <TacoIcon /> },
    { id: "cafes", name: "Cafés", icon: <CoffeeIcon /> },
    { id: "dessert", name: "Dessert", icon: <IceCreamIcon /> },
  ];

  const handleCategoryClick = (category: string) => {
    handleSearch(category);
    navigate("/results");
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Popular Food Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(category => (
            <div 
              key={category.id}
              className="bg-gray-light rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 text-primary text-2xl">
                {category.icon}
              </div>
              <h3 className="font-medium">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FoodCategories;
