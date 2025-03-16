import React, { useState } from 'react';
import { Bell, Menu, Moon, Sun, ChevronDown } from 'lucide-react';

function Navbar({ toggleSidebar }) {
  // const [searchFocused, setSearchFocused] = useState(false);
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shadow-sm">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        {/* <button 
          onClick={toggleSidebar} 
          className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none"
        >
          <Menu size={20} />
        </button> */}
        
        <div className="flex items-center">
          <span className="text-xl font-bold text-gray-800">
            <span className="text-blue-500">UP</span>.ly
          </span>
        </div>
      </div>
      
      {/* Center section - Search */}
      {/* <div className={`hidden md:flex items-center relative ${searchFocused ? 'w-80' : 'w-64'} transition-all duration-300`}>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div> */}
      
      {/* Right section */}
      <div className="flex items-center space-x-3">
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100 relative">
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
        
        {/* User profile dropdown */}
        <div className="relative">
          <div className="flex items-center cursor-pointer group">
            {/* <div className="w-10 h-10 overflow-hidden rounded-full">
              <img
                alt="User avatar"
                src="/api/placeholder/40/40"
                className="object-cover w-full h-full"
              />
            </div> */}
            <div className="hidden md:flex items-center ml-2">
              <div className="text-sm">
                <p className="font-medium text-gray-800">John Doe</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <ChevronDown size={14} className="ml-1 text-gray-600" />
            </div>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 z-10 invisible w-56 mt-2 bg-white rounded-lg shadow-lg top-full opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300">
              <div className="p-3 border-b border-gray-200">
                <p className="font-medium text-gray-800">John Doe</p>
                <p className="text-xs text-gray-500">john.doe@example.com</p>
              </div>
              <div className="p-2">
                <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                  Profile
                  <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">New</span>
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                  Settings
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                  Help Center
                </a>
              </div>
              <div className="p-2 border-t border-gray-200">
                <a href="#" className="flex items-center px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50">
                  Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
