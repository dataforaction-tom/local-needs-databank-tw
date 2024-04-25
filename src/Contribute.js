import React from 'react';
import CSVUploadComponent from './components/CSVUploadComponent'; // adjust the path as necessary
import { FaRegHospital, FaHandsHelping, FaBookOpen, FaChartBar, FaPlusCircle } from 'react-icons/fa';

const Contribute = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="text-sm font-bold text-gray-800 mt-2 mb-3 flex items-end flex justify-end mr-5">
                <FaPlusCircle className="text-[#662583] mr-2" size="2em" />
                Contribute Dashboard
            </div>
      
        <div className="p-5">
          <h1 className="text-4xl font-semibold text-gray-800 mb-4 text-center">Contribute Data</h1>
          <p className="font-bold text-lg text-center mb-2">Welcome to the Local Needs Databank contribution page</p>
          <p className="font-bold text-lg text-center mb-6">Here you can contribute data to the databank using this tool following our data standard</p>
        </div>
        <div className="bg-gray-100 p-5">
          <CSVUploadComponent />
        </div>
      </div>
   
  );
};


export default Contribute;
