import React from 'react'
import { Outlet , useParams} from 'react-router-dom'
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // const { id } = useParams();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <div className="flex h-screen bg-white">
      {sidebarOpen && (
        <Sidebar /*id={id}*//>
      )}
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        <Outlet/>
      </div>
    </div>
  )
}

export default Layout
