import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Health & Social', path: '/health' },
    { name: 'Support', path: '/support' },
    { name: 'Context', path: '/context' },
    { name: 'Charity', path: '/charity' },
    { name: 'Explore', path: '/explore' },
    { name: 'Contribute', path: '/contribute'}
  ];

  return (
    <nav className="bg-[#662583]">
      <ul className="flex">
        {navItems.map((item, index) => (
          // "flex-grow" will make each link grow evenly to take up available space
          <li key={index} className="flex-grow text-center border-r-2 border-white">
            <NavLink
              to={item.path}
              className={`block py-4 text-white transition-colors duration-300 text-xl font-bold ${
                location.pathname === item.path
                  ? 'bg-[#C7215D]'
                  : 'hover:bg-[#C7215D]'
              }`}
              // Add "mx-1" for a slight gap between each item
              style={{ margin: '0 0.25rem' }}
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
