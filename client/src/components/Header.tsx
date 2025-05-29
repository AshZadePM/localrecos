import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { SearchIcon } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";

const Header: React.FC<{ hideLogo?: boolean; hideBetaTag?: boolean; noContainer?: boolean }> = ({ hideLogo = false, hideBetaTag = false, noContainer = false }) => {
  const [location, navigate] = useLocation();
  const [isFocused, setIsFocused] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const { handleSearch } = useSearch();

  // Handle outside click to close the recent searches dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If on the homepage, also navigate to /results with the input param
  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    handleSearch(searchInput.trim());
    // Optionally clear the input after search
    // setSearchInput("");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Removed search bar and container for a cleaner header */}
    </header>
  );
};

export default Header;
