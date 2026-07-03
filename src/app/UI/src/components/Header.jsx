import React from 'react';
import { Settings, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onProfileClick }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex h-18 items-center justify-between border-b border-white/40 bg-[#faf9f6]/90 px-4 backdrop-blur-xl lg:px-10">
      <div className="flex items-center space-x-4 lg:space-x-12">
        <div className="lg:hidden">
          <Menu className="h-6 w-6 text-[#797b78]" />
        </div>

        <nav className="hidden md:block">
          <ul className="flex space-x-6 text-sm font-bold text-[#797b78] lg:space-x-8">
            <li className="-mb-5 cursor-pointer border-b-2 border-[#7e5073] pb-5 text-[#7e5073]">Tasks</li>
          </ul>
        </nav>
      </div>

      <div className="flex items-center space-x-4 text-[#797b78] lg:space-x-6">
        <Settings className="hidden h-5 w-5 cursor-pointer transition-colors hover:text-[#7e5073] sm:block" />
        <div
          onClick={onProfileClick}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#e5aed6] to-[#7e5073] shadow-[0_18px_35px_-20px_rgba(48,51,48,0.5)] transition-all hover:scale-[1.02]"
          title={user?.name || 'Profile'}
        >
          <User className="h-5 w-5 text-white" />
        </div>
      </div>
    </header>
  );
};

export default Header;
