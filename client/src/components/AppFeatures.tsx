import React from "react";
import { MessageSquareIcon, BotIcon, SearchIcon } from "lucide-react";

const AppFeatures: React.FC = () => {
  return (
    <section className="py-12 bg-gray-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">How Local Recos Works</h2>
          <p className="text-gray-medium max-w-2xl mx-auto">
            We analyze thousands of restaurant recommendations from Reddit to help you discover local favorites based on real experiences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-primary bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary text-2xl">
              <MessageSquareIcon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Reddit Data</h3>
            <p className="text-gray-medium">
              We source recommendations from city subreddits like r/Ottawa, finding restaurants locals actually love.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-primary bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary text-2xl">
              <BotIcon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-medium">
              Our AI analyzes sentiment in Reddit discussions to determine which places are consistently recommended.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-primary bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary text-2xl">
              <SearchIcon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Natural Language</h3>
            <p className="text-gray-medium">
              Search naturally like "cheap brunch in Toronto" or "best tacos in Austin" to find exactly what you want.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppFeatures;
