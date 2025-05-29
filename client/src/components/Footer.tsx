import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white py-12">
      <div className="container mx-auto px-4">
        
        <div className="border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Local Recos. All rights reserved.</p>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm mr-2">Powered by</span>
            <i className="fab fa-reddit text-gray-400 mr-2"></i>
            <span className="text-gray-400 mr-4">Reddit</span>
            <i className="fas fa-robot text-gray-400 mr-2"></i>
            <span className="text-gray-400">Gemini (Google AI)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
