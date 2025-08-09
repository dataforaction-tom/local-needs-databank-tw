import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaRegHospital, FaHandsHelping, FaBookOpen, FaChartBar, FaPlusCircle, FaMapMarked } from 'react-icons/fa';
import { MdOutlineSportsGymnastics } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Health & Social', path: '/health', icon: <FaRegHospital className="mr-1" /> },
    { name: 'Advice and support', path: '/advice', icon: <FaHandsHelping className="mr-1" /> },
    { name: 'Charity sector', path: '/charity', icon: <FaBookOpen className="mr-1" /> },
    { name: 'Youth', path: '/youth', icon: <MdOutlineSportsGymnastics className="mr-1" /> },
    { name: 'Data Explorer', path: '/explore', icon: <FaChartBar className="mr-1" /> },
    { name: 'Areas of need', path: '/top-areas', icon: <FaMapMarked className="mr-1" /> },
    { name: 'Contribute', path: '/contribute', icon: <FaPlusCircle className="mr-1" /> },
  ];

  return (
    <nav className="bg-[#662583] relative" role="navigation" aria-label="Primary">
      <div className="flex justify-between items-center p-4">
        <button
          className="md:hidden inline-flex items-center justify-center rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          aria-controls="primary-menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path fillRule="evenodd" d="M2.5 3a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v0a.5.5 0 0 1-.5.5H3.5A.5.5 0 0 1 3 8v0zm-.5 4.5A.5.5 0 0 1 3 12h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5v0z" />
          </svg>
        </button>
        {/* Mobile menu (animated) */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.ul
              id="primary-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex flex-col absolute top-full left-0 w-full bg-[#662583] z-20 md:hidden"
            >
              {navItems.map((item, index) => (
                <li key={index} className="w-full text-center border-b-2 border-white last:border-b-0">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `flex items-center justify-center py-3 text-white transition-colors duration-200 text-base font-bold ${isActive ? 'bg-[#C7215D]' : 'hover:bg-[#C7215D]'}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-1">{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {/* Desktop menu (always visible) */}
        <ul className="hidden md:flex md:flex-row md:gap-0">
          {navItems.map((item, index) => (
            <li key={index} className="text-center md:border-r-2 border-white last:md:border-r-0">
              <NavLink
                to={item.path}
                className={({ isActive }) => `flex items-center justify-center px-4 py-2 text-white transition-colors duration-200 text-lg font-bold ${isActive ? 'bg-[#C7215D]' : 'hover:bg-[#C7215D]'}`}
              >
                {item.icon}
                <span className="ml-1">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
