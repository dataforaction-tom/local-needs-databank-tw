import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FaRegHospital, FaHandsHelping, FaBookOpen, FaChartBar, FaPlusCircle } from 'react-icons/fa';

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Health & Social care', path: '/health', icon: <FaRegHospital className="mr-1" /> },
    { name: 'Advice and support', path: '/advice', icon: <FaHandsHelping className="mr-1" /> },
    { name: 'Charity sector', path: '/charity', icon: <FaBookOpen className="mr-1" /> },
    { name: 'Data Explorer', path: '/explore', icon: <FaChartBar className="mr-1" /> },
    { name: 'Contribute', path: '/contribute', icon: <FaPlusCircle className="mr-1" /> }
  ];

  return (
    <nav className="bg-[#662583] relative">
      <div className="flex justify-between items-center p-4">
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {/* SVG icon for menu */}
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M2.5 3a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v0a.5.5 0 0 1-.5.5H3.5A.5.5 0 0 1 3 8v0zm-.5 4.5A.5.5 0 0 1 3 12h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5v0z"/>
          </svg>
        </button>
        <ul className={`${
          isOpen ? 'flex' : 'hidden'
        } flex-col absolute top-full left-0 w-full bg-[#662583] z-20 md:flex md:flex-row md:static md:z-auto`}>
          {navItems.map((item, index) => (
            <li key={index} className="w-full text-center border-b-2 border-white md:border-b-0 md:border-r-2">
              <NavLink
                to={item.path}
                className={`flex items-center justify-center py-3 text-white transition-colors duration-300 text-lg font-bold ${
                  location.pathname === item.path
                    ? 'bg-[#C7215D]'
                    : 'hover:bg-[#C7215D]'
                }`}
                onClick={() => setIsOpen(false)}  // Close the menu on click
              >
                {item.icon}{item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
