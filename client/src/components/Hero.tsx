import React from "react";
import Header from "@/components/Header";

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-primary to-accent text-white py-16">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Discover local gems recommended by real people</h1>
          <p className="text-lg md:text-xl mb-8">Local Recos finds the best restaurants from Reddit discussions and provides AI-powered sentiment analysis to help you choose.</p>
          {/* Only the search bar and button, no white container */}
          <div className="mt-8">
            <Header hideLogo hideBetaTag noContainer />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
