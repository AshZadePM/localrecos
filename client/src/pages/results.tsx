import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ResultsSection from "@/components/ResultsSection";
import FoodCategories from "@/components/FoodCategories";
import NLPQueryForm from "@/components/NLPQueryForm";

interface Recommendation {
  name: string;
  summary: string;
}

// This page is now deprecated since search/results are handled in-place on the homepage.
// Optionally, you can remove this file.

const Results: React.FC = () => {
  const [location] = useLocation();
  const [results, setResults] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[] | undefined>(undefined);
  const [extraction, setExtraction] = useState<{ city?: string } | undefined>(undefined);

  useEffect(() => {
    // Extract input param from URL if any
    const params = new URLSearchParams(location.split("?")[1]);
    const inputParam = params.get("input");
    if (inputParam) {
      // Auto-trigger NLP search if input is present in URL
      (async () => {
        const res = await fetch("/api/nlp-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: inputParam }),
        });
        if (res.ok) {
          const data = await res.json();
          setResults([]);
          setRecommendations(data.recommendations);
          setExtraction(data.extraction); // <-- Save extraction (city)
        } else {
          // If the NLP search fails, clear results and show an error state
          setResults([]);
          setRecommendations([]);
          setExtraction(undefined);
        }
      })();
    } else {
      // If no input param, clear results (prevents empty state bug)
      setResults([]);
      setRecommendations([]);
      setExtraction(undefined);
    }
  }, [location]);

  // Accept both results and recommendations from NLPQueryForm
  const handleSetResults = (results: any[], recommendations?: Recommendation[], extractionArg?: { city?: string }) => {
    setResults(results);
    setRecommendations(recommendations);
    if (extractionArg) setExtraction(extractionArg);
  };

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Search has moved!</h2>
      <p className="mb-6">Restaurant search and results now appear directly on the homepage. Please use the search bar there.</p>
    </div>
  );
};

export default Results;
