import React from 'react';
import { Settings, User, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-10 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center space-x-4 lg:space-x-12">
        {/* Mobile Menu Icon */}
        <div className="lg:hidden">
          <Menu className="w-6 h-6 text-gray-500" />
        </div>
        
        <h1 className="text-xl lg:text-2xl font-black text-brand-deep italic tracking-tight whitespace-nowrap">
          Ethereal Daily
        </h1>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-6 lg:space-x-8 text-sm font-bold text-gray-400">
            <li className="text-brand-deep border-b-2 border-brand-deep pb-5 -mb-5 cursor-pointer">Rituals</li>
            <li className="hover:text-gray-600 cursor-pointer transition-colors">Archive</li>
            <li className="hover:text-gray-600 cursor-pointer transition-colors">Insights</li>
          </ul>
        </nav>
      </div>

      <div className="flex items-center space-x-4 lg:space-x-6 text-gray-400">
        <Settings className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors hidden sm:block" />
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer border border-gray-200">
          <User className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
};

export default Header;
