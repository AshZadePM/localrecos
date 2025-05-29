import React from "react";
import { useLocation } from "wouter";
import { useSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  query?: string;
  city?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ query, city }) => {
  const [_, navigate] = useLocation();
  const { handleSearch } = useSearch();

  const suggestedSearches = [
    "Best pizza in Chicago",
    "Cheap sushi in Toronto",
    "Authentic tacos in Austin"
  ];

  const handleSuggestedSearch = (suggestion: string) => {
    handleSearch(suggestion);
    navigate("/results");
  };

  return (
    <section className="py-12" id="results-section">
      <div className="container mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="text-6xl mb-4 text-gray-medium">
            <i className="fas fa-utensils"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Looking up hidden gems in your city</h3>
          <div className="space-y-4">
            <p>In the meantime, think about what sort of recommendation you're looking for:</p>
            <ul className="text-left max-w-md mx-auto">
              <li className="flex items-start mb-2">
                <svg className="w-4 h-4 text-secondary mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Be specific (e.g. "deep dish pizza" instead "pizza")</span>
              </li>
              <li className="flex items-start mb-2">
                <svg className="w-4 h-4 text-secondary mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Include pricing preferences, like "affordable"</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-secondary mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Looking for a specific vibe, like "cozy"? Include that too.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmptyState;
