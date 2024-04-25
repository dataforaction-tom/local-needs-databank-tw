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
      
            <div className="w-9/10 mx-auto bg-slate-50 p-6">
            <div className='text-2xl font-bold my-2'>
            <h2>Local Needs Databank Contribution page</h2>
            <div className='text-lg font-normal'>
            <p>Welcome to the Local Needs Databank contribution page. Here you can contribute data to the databank using this tool following our data standard. </p>
            <p>By contributing to the Databank you are sharing your data and observations openly.</p>
            <p>We have tried to make this process as easy and flexible as possible, allowing you to tell use which of you columns match our data structure.</p>
            </div>
            </div>
        <div className="bg-gray-100">
          <CSVUploadComponent />
        </div>
      </div>
      </div>
   
  );
};


export default Contribute;
