import React from "react";
import Hero from "@/components/Hero";
import PopularCities from "@/components/PopularCities";
import FoodCategories from "@/components/FoodCategories";
import AppFeatures from "@/components/AppFeatures";

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <PopularCities />
      <FoodCategories />
      <AppFeatures />
    </>
  );
};

export default Home;
