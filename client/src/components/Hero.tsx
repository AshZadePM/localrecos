import React from "react";
import Header from "@/components/Header";
import NLPQueryForm from "@/components/NLPQueryForm";

const Hero: React.FC<{ onSearch: (recs: any[], extractionArg?: { city?: string; foodType?: string }) => void }> = ({ onSearch }) => {
  return (
    <section className="bg-gradient-to-r from-primary to-accent text-white py-9">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Discover local gems recommended by real people</h1>
          <p className="text-lg md:text-xl mb-8">Local Recos finds the best restaurants from Reddit discussions and provides AI-powered sentiment analysis to help you choose.</p>
          {/* Only the search bar and button, no white container */}
          <div className="search-bar-container">
            <Header hideLogo hideBetaTag noContainer />
            {/* Add search bar and submit button below */}
            <div className="mt-4">
              <NLPQueryForm onSearch={onSearch} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
