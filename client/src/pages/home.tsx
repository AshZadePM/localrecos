import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
// import PopularCities from "@/components/PopularCities";
// import FoodCategories from "@/components/FoodCategories";
import AppFeatures from "@/components/AppFeatures";
import ResultsSection from "@/components/ResultsSection";

const Home: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[] | undefined>(undefined);
  const [extraction, setExtraction] = useState<{ city?: string; foodType?: string } | undefined>(undefined);
  const [locationChecked, setLocationChecked] = useState(false);

  // Handler for NLPQueryForm
  const handleSearch = (recs: any[], extractionArg?: { city?: string; foodType?: string }) => {
    setRecommendations(recs);
    setExtraction(extractionArg);
  };

  // On mount, try to get user location and search for hidden gems in their city using Google Geolocation API
  useEffect(() => {
    if (locationChecked || recommendations) return;
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!GOOGLE_API_KEY) {
      setLocationChecked(true);
      return;
    }
    const GEOLOCATION_URL = `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`;
    async function getLocationAndSearch() {
      try {
        const geoRes = await fetch(GEOLOCATION_URL, { method: "POST" });
        if (!geoRes.ok) throw new Error("Google Geolocation API failed");
        const geoData = await geoRes.json();
        const { lat, lng } = geoData.location || {};
        if (lat == null || lng == null) throw new Error("No lat/lng from Google Geolocation API");
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await resp.json();
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state;
        if (city) {
          const searchPhrase = `hidden gems in ${city}`;
          const res = await fetch("/api/nlp-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: searchPhrase })
          });
          if (res.ok) {
            const result = await res.json();
            setRecommendations(result.recommendations);
            setExtraction({ ...result.extraction, city, foodType: 'hidden gems' });
          }
        }
      } catch (err) {
        // Ignore errors
      } finally {
        setLocationChecked(true);
      }
    }
    getLocationAndSearch();
  }, [recommendations, locationChecked]);

  return (
    <>
      <Hero onSearch={handleSearch} />
      <div className="container mx-auto px-4">
        {/* Remove NLPQueryForm here, since it's now in Hero and wired up */}
        <ResultsSection recommendations={recommendations} extraction={extraction} />
      </div>
      {/* <PopularCities /> */}
      {/* <FoodCategories /> */}
      <AppFeatures />
    </>
  );
};

export default Home;
