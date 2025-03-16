import React from 'react'

const Sidebar = ({ toggleSidebar }) => {
  return (
    <aside className="h-full bg-gray-800 text-white shadow-inner overflow-hidden whitespace-nowrap">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Menu</h3>
          <button 
            onClick={toggleSidebar}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
        {/* Sidebar content will go here */}
        <div className="py-2">
          <div className="py-2 px-4 hover:bg-gray-700 rounded cursor-pointer transition-colors">Dashboard</div>
          <div className="py-2 px-4 hover:bg-gray-700 rounded cursor-pointer transition-colors">Profile</div>
          <div className="py-2 px-4 hover:bg-gray-700 rounded cursor-pointer transition-colors">Settings</div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
