import React, { useState } from "react";
import Hero from "@/components/Hero";
import PopularCities from "@/components/PopularCities";
import FoodCategories from "@/components/FoodCategories";
import AppFeatures from "@/components/AppFeatures";
import NLPQueryForm from "@/components/NLPQueryForm";
import ResultsSection from "@/components/ResultsSection";

const Home: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[] | undefined>(undefined);
  const [extraction, setExtraction] = useState<{ city?: string } | undefined>(undefined);

  // Handler for NLPQueryForm
  const handleSearch = (recs: any[], extractionArg?: { city?: string }) => {
    setRecommendations(recs);
    setExtraction(extractionArg);
  };

  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <NLPQueryForm onSearch={handleSearch} />
        <ResultsSection recommendations={recommendations} extraction={extraction} />
      </div>
      <PopularCities />
      <FoodCategories />
      <AppFeatures />
    </>
  );
};

export default Home;
