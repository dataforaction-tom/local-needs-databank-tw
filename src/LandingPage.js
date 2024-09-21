import React from 'react';
import { Link } from 'react-router-dom';
import { FaRegHospital, FaHandsHelping, FaBookOpen, FaChartBar, FaPlusCircle } from 'react-icons/fa';
import { MdOutlineSportsGymnastics } from "react-icons/md";

const LandingPage = () => {
    const navItems = [
        { name: 'Health & Social Care', path: '/health', icon: <FaRegHospital size="3em" /> },
        { name: 'Advice and Support', path: '/advice', icon: <FaHandsHelping size="3em" /> },
        { name: 'Charity Sector', path: '/charity', icon: <FaBookOpen size="3em" /> },
        {name: 'Youth', path: '/youth', icon: <MdOutlineSportsGymnastics size="3em" />},
        { name: 'Data Explorer', path: '/explore', icon: <FaChartBar size="3em" /> },
        { name: 'Contribute', path: '/contribute', icon: <FaPlusCircle size="3em" /> }
    ];

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-4xl p-5 bg-[#662583] text-white rounded-lg shadow-md overflow-hidden">
                <h1 className="text-4xl font-semibold mb-4 text-center">Welcome to The Local Needs Databank</h1>
                <p className="text-xl text-center mt-4 mb-6">
                    Explore the data about local areas or contribute your own observations about your work.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                    {navItems.map(item => (
                        <Link to={item.path} key={item.name}
                            className="flex flex-col items-center justify-center p-4 bg-white text-[#662583] rounded-lg hover:bg-[#C7215D] transition-colors duration-300">
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
