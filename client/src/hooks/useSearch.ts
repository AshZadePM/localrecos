import { useLocation } from "wouter";

export const useSearch = () => {
  const [, setLocation] = useLocation();

  // For natural language search, just set the query as input and go to /results
  const handleSearch = (input: string) => {
    // Store the input in the URL for /results page
    const urlParams = new URLSearchParams();
    if (input) urlParams.set("input", input);
    setLocation(`/results?${urlParams.toString()}`);
  };

  // No city selection for NLP search
  return {
    handleSearch
  };
};
