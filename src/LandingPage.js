import React from 'react';
import { Link } from 'react-router-dom';
import { FaRegHospital, FaHandsHelping, FaBookOpen, FaChartBar, FaPlusCircle, FaMapMarked } from 'react-icons/fa';
import { MdOutlineSportsGymnastics } from "react-icons/md";
import { motion } from 'framer-motion';

const LandingPage = () => {
    const navItems = [
        { name: 'Health & Social Care', path: '/health', icon: <FaRegHospital size="3em" /> },
        { name: 'Advice and Support', path: '/advice', icon: <FaHandsHelping size="3em" /> },
        { name: 'Charity Sector', path: '/charity', icon: <FaBookOpen size="3em" /> },
        {name: 'Youth', path: '/youth', icon: <MdOutlineSportsGymnastics size="3em" />},
        { name: 'Data Explorer', path: '/explore', icon: <FaChartBar size="3em" /> },
        { name: 'Areas of need', path: '/top-areas', icon: <FaMapMarked size="3em" /> },
        { name: 'Contribute', path: '/contribute', icon: <FaPlusCircle size="3em" /> }
    ];

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-5xl p-8 md:p-12 bg-[#662583] text-white rounded-2xl shadow-xl overflow-hidden"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-3xl md:text-5xl font-extrabold mb-3 text-center"
                >
                    The Local Needs Databank
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className="text-base md:text-xl text-center mt-2 mb-8 text-purple-100"
                >
                    Explore local data, understand community needs, and contribute insights from your work.
                </motion.p>

                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.08 } }
                    }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-4"
                >
                    {navItems.map((item, idx) => (
                        <motion.div
                            key={item.name}
                            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Link
                                to={item.path}
                                className="flex flex-col items-center justify-center p-5 md:p-6 bg-white text-[#662583] rounded-xl hover:bg-[#C7215D] hover:text-white transition-colors duration-300 shadow-sm"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 + idx * 0.05 }}
                                >
                                    {item.icon}
                                </motion.div>
                                <span className="mt-2 font-semibold text-center">{item.name}</span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
