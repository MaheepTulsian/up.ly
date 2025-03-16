import React from "react";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <nav className="bg-blue-900 text-white px-8 py-4 shadow-md flex justify-between items-center">
      <h2 className="text-2xl font-bold">UP.ly</h2>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center cursor-pointer hover:bg-opacity-30 transition-all">
          <img src={logo} alt="logo" className="w-full h-full border-2 border-white rounded-full" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
