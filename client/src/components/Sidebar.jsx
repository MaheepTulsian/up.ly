import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Ensure Link is imported
import { FaHome, FaFileAlt, FaMicrophone } from 'react-icons/fa';
import { HelpCircle, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';

const Sidebar = ({ initialCollapsed = false, /* id */}) => { // Accept userId as a prop
  const [activeItem, setActiveItem] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome size={18} />, link: `/dashboard` }, // Dynamic link with userId
    { id: 'resume-tailoring', label: 'Resume Tailoring', icon: <FaFileAlt size={18} />, link: '/resume-tailoring' },
    { id: 'mock-interview', label: 'Mock Interview', icon: <FaMicrophone size={18} />, link : '/mock-interview' },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle size={18} /> },
  ];

  return (
    <aside 
      className={`h-full bg-white text-gray-700 shadow-md overflow-hidden flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 border-b h-16 border-gray-200 flex justify-end items-center">
        <button 
          onClick={toggleCollapse}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1 rounded-md transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* User profile section */}
      {collapsed && (
        <div className="flex justify-center py-4 border-b border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
            U
          </div>
        </div>
      )}

      {/* Navigation items */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {!collapsed && (
          <div className="mb-2 px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main Menu
          </div>
        )}

        {menuItems.map(item => (
          <Link 
            to={item.link} // Dynamically set the link
            key={item.id}
            className={`flex items-center justify-between py-2 ${collapsed ? 'px-2' : 'px-3'} my-1 rounded-lg cursor-pointer transition-all duration-200 ${
              activeItem === item.id 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            onClick={() => setActiveItem(item.id)}
            title={collapsed ? item.label : ''}
          >
            <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'space-x-3'}`}>
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </div>
          </Link>
        ))}
      </nav>

      {/* Logout section */}
      <div className={`p-2 border-t border-gray-200 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center p-2' : 'py-2 px-3'} rounded-lg cursor-pointer text-gray-600  hover:text-red-600 transition-all duration-200`}>
          <LogOut size={18} />
          {!collapsed && <span className="text-sm font-medium ml-3">Logout</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;






// import React, { useState } from 'react';
// import { Home, HelpCircle, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
// import { FaHome, FaFileAlt, FaMicrophone } from 'react-icons/fa'; 


// const Sidebar = ({ initialCollapsed = false }) => {
//   const [activeItem, setActiveItem] = useState('dashboard');
//   const [collapsed, setCollapsed] = useState(initialCollapsed);
  
//   const toggleCollapse = () => {
//     setCollapsed(!collapsed);
//   };
  
//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: <FaHome size={18} /> },
//     { id: 'resume-tailoring', label: 'Resume Tailoring', icon: <FaFileAlt size={18} /> },
//     { id: 'mock-interview', label: 'Mock Interview', icon: <FaMicrophone size={18} /> },
//     { id: 'help', label: 'Help & Support', icon: <HelpCircle size={18} /> },
//   ];

//   return (
//     <aside 
//       className={`h-full bg-white text-gray-700 shadow-md overflow-hidden flex flex-col transition-all duration-300 ${
//         collapsed ? 'w-16' : 'w-64'
//       }`} // Added border-r with dotted style
//     >
//       <div className="p-4 border-b h-16 border-gray-200 flex justify-end items-center">
//         <button 
//           onClick={toggleCollapse}
//           className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1 rounded-md transition-colors flex-shrink-0"
//         >
//           {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//         </button>
//       </div>
      
//       {/* User profile section */}
//       {collapsed && (
//         <div className="flex justify-center py-4 border-b border-gray-200">
//           <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
//             U
//           </div>
//         </div>
//       )}
      
//       {/* Navigation items */}
//       <nav className="flex-1 p-2 overflow-y-auto">
//         {!collapsed && (
//           <div className="mb-2 px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//             Main Menu
//           </div>
//         )}
        
//         {menuItems.map(item => (
//           <div 
//             key={item.id}
//             className={`flex items-center justify-between py-2 ${collapsed ? 'px-2' : 'px-3'} my-1 rounded-lg cursor-pointer transition-all duration-200 ${
//               activeItem === item.id 
//                 ? 'bg-blue-100 text-blue-600' 
//                 : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
//             }`}
//             onClick={() => setActiveItem(item.id)}
//             title={collapsed ? item.label : ''}
//           >
//             <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'space-x-3'}`}>
//               <span className="text-lg">{item.icon}</span>
//               {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
//             </div>
//             {!collapsed && item.badge && (
//               <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
//                 {item.badge}
//               </span>
//             )}
//             {collapsed && item.badge && (
//               <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
//                 {item.badge}
//               </span>
//             )}
//           </div>
//         ))}
//       </nav>
      
//       {/* Logout section */}
//       <div className={`p-2 border-t border-gray-200 ${collapsed ? 'flex justify-center' : ''}`}>
//         <div className={`flex items-center ${collapsed ? 'justify-center p-2' : 'py-2 px-3'} rounded-lg cursor-pointer text-gray-600  hover:text-red-600 transition-all duration-200`}>
//           <LogOut size={18} />
//           {!collapsed && <span className="text-sm font-medium ml-3">Logout</span>}
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;
