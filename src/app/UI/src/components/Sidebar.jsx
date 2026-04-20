import React from 'react';
import { Calendar, Layout } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <Layout className="w-5 h-5" />, label: 'Today', active: true },
    { icon: <Calendar className="w-5 h-5" />, label: 'Calendar' },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar p-6 flex flex-col border-r border-gray-200">
      <div className="mb-10">
        <h2 className="text-xl font-bold italic text-brand-deep">Good Morning</h2>
        <p className="text-gray-500 text-sm">Stay intentional today.</p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-4">
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer ${
                item.active ? 'bg-white shadow-sm text-brand-deep' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
