import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Local Recos</h3>
            <p className="text-gray-400 mb-4">
              Discover restaurants recommended by real people in Reddit communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-reddit-alien"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Popular Cities</h4>
            <ul className="space-y-2">
              <li><Link href="/results?city=Toronto" className="text-gray-400 hover:text-white transition-colors">Toronto</Link></li>
              <li><Link href="/results?city=New York" className="text-gray-400 hover:text-white transition-colors">New York</Link></li>
              <li><Link href="/results?city=Chicago" className="text-gray-400 hover:text-white transition-colors">Chicago</Link></li>
              <li><Link href="/results?city=San Francisco" className="text-gray-400 hover:text-white transition-colors">San Francisco</Link></li>
              <li><Link href="/results?city=Austin" className="text-gray-400 hover:text-white transition-colors">Austin</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Popular Categories</h4>
            <ul className="space-y-2">
              <li><Link href="/results?query=Pizza" className="text-gray-400 hover:text-white transition-colors">Pizza</Link></li>
              <li><Link href="/results?query=Burgers" className="text-gray-400 hover:text-white transition-colors">Burgers</Link></li>
              <li><Link href="/results?query=Sushi" className="text-gray-400 hover:text-white transition-colors">Sushi</Link></li>
              <li><Link href="/results?query=Mexican" className="text-gray-400 hover:text-white transition-colors">Mexican</Link></li>
              <li><Link href="/results?query=Cafés" className="text-gray-400 hover:text-white transition-colors">Cafés</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">About</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Local Recos. All rights reserved.</p>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm mr-2">Powered by</span>
            <i className="fab fa-reddit text-gray-400 mr-2"></i>
            <span className="text-gray-400 mr-4">Reddit</span>
            <i className="fas fa-robot text-gray-400 mr-2"></i>
            <span className="text-gray-400">OpenRouter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
